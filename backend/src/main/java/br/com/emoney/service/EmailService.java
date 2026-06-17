package br.com.emoney.service;

import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate http = new RestTemplate();
    private final String apiKey;
    private final String fromEmail;
    private final String fromName;

    public EmailService(
            @Value("${brevo.api.key}") String apiKey,
            @Value("${brevo.from.email}") String fromEmail,
            @Value("${brevo.from.name:HappyCoin}") String fromName) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Async
    public void sendDirectMessage(Professor professor, Student student, String subject, String body) {
        send(student.getEmail(), subject, directMessageTemplate(professor, student, subject, body));
    }

    @Async
    public void sendDirectMessage(Student student, Professor professor, String subject, String body) {
        send(professor.getEmail(), subject, directMessageFromStudentTemplate(student, professor, subject, body));
    }

    @Async
    public void sendCoinTransferConfirmation(Professor professor, Student student, int quantidade, String motivo) {
        send(professor.getEmail(), "Confirmacao de envio de moedas - HappyCoin",
                professorTransferTemplate(professor, student, quantidade, motivo));
    }

    @Async
    public void sendCoinReceivedNotification(Professor professor, Student student, int quantidade, String motivo) {
        send(student.getEmail(), "Voce recebeu moedas - HappyCoin",
                studentReceivedTemplate(professor, student, quantidade, motivo));
    }

    @Async
    public void sendWelcomeProfessor(Professor professor, String rawPassword) {
        send(professor.getEmail(), "Bem-vindo ao HappyCoin - Suas credenciais de acesso",
                welcomeProfessorTemplate(professor, rawPassword));
    }

    @Async
    public void sendWelcomeStudent(Student student, String rawPassword) {
        send(student.getEmail(), "Bem-vindo ao HappyCoin - Suas credenciais de acesso",
                welcomeStudentTemplate(student, rawPassword));
    }

    @Async
    public void sendCouponEmailToStudent(String to, String studentName, String productName,
                                         UUID purchaseId, int custoMoedas, LocalDateTime dataResgate) {
        send(to, "Seu cupom de resgate - HappyCoin",
                couponToStudentTemplate(studentName, productName, purchaseId, custoMoedas, dataResgate));
    }

    @Async
    public void sendPurchaseNotificationToCompany(String to, String companyName, String studentName,
                                                   String productName, UUID purchaseId, int custoMoedas,
                                                   LocalDateTime dataResgate) {
        send(to, "Novo resgate realizado - HappyCoin",
                purchaseNotificationToCompanyTemplate(companyName, studentName, productName, purchaseId, custoMoedas, dataResgate));
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            log.info("Tentando enviar email para {} | assunto: {}", to, subject);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", fromName, "email", fromEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "htmlContent", htmlBody
            );

            http.postForEntity(BREVO_URL, new HttpEntity<>(body, headers), String.class);
            log.info("Email enviado com sucesso para {}", to);
        } catch (Exception ex) {
            log.warn("Falha ao enviar email para {} | {}: {}", to, ex.getClass().getSimpleName(), ex.getMessage());
        }
    }

    private String couponToStudentTemplate(String studentName, String productName,
                                            UUID purchaseId, int custoMoedas, LocalDateTime dataResgate) {
        String couponCode = purchaseId.toString().toUpperCase().replace("-", "");
        String data = dataResgate != null ? dataResgate.format(DATE_FMT) : "-";
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Seu cupom de resgate</title>
                </head>
                <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#201b11;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:32px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:580px;">
                          <tr>
                            <td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                              <div style="font-size:22px;font-weight:900;color:#f4b91f;letter-spacing:.5px;">HappyCoin</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f4b91f;padding:18px 28px;">
                              <h1 style="margin:0;font-size:20px;font-weight:900;color:#201b11;">Resgate confirmado!</h1>
                              <p style="margin:4px 0 0;font-size:13px;color:#4a3c0a;">Ola, %s. Seu cupom esta pronto para uso.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#ffffff;padding:28px;">
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Vantagem resgatada</p>
                              <p style="margin:0 0 20px;font-size:18px;font-weight:800;color:#201b11;">%s</p>
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Moedas utilizadas</p>
                              <p style="margin:0 0 20px;font-size:16px;font-weight:700;color:#201b11;">%d moedas</p>
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Data do resgate</p>
                              <p style="margin:0 0 24px;font-size:15px;color:#201b11;">%s</p>
                              <div style="background:#201b11;border-radius:10px;padding:20px 24px;text-align:center;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#f4b91f;margin-bottom:8px;">Codigo do cupom</div>
                                <div style="font-size:18px;font-weight:900;color:#f4b91f;letter-spacing:2px;word-break:break-all;">%s</div>
                              </div>
                              <p style="margin:20px 0 0;font-size:13px;color:#6b5528;line-height:1.6;">Apresente este codigo na empresa parceira para utilizar sua vantagem.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f5ebe0;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#8a7050;line-height:1.5;">Este e-mail foi enviado automaticamente pelo sistema HappyCoin.<br>Por favor, nao responda esta mensagem.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(studentName), escapeHtml(productName),
                custoMoedas, escapeHtml(data), escapeHtml(couponCode)
        );
    }

    private String purchaseNotificationToCompanyTemplate(String companyName, String studentName,
                                                          String productName, UUID purchaseId,
                                                          int custoMoedas, LocalDateTime dataResgate) {
        String couponCode = purchaseId.toString().toUpperCase().replace("-", "");
        String data = dataResgate != null ? dataResgate.format(DATE_FMT) : "-";
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Novo resgate realizado</title>
                </head>
                <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#201b11;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:32px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:580px;">
                          <tr>
                            <td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                              <div style="font-size:22px;font-weight:900;color:#f4b91f;letter-spacing:.5px;">HappyCoin</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f4b91f;padding:18px 28px;">
                              <h1 style="margin:0;font-size:20px;font-weight:900;color:#201b11;">Novo resgate realizado</h1>
                              <p style="margin:4px 0 0;font-size:13px;color:#4a3c0a;">%s recebeu uma notificacao de resgate.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#ffffff;padding:28px;">
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Aluno</p>
                              <p style="margin:0 0 20px;font-size:16px;font-weight:800;color:#201b11;">%s</p>
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Vantagem resgatada</p>
                              <p style="margin:0 0 20px;font-size:16px;font-weight:800;color:#201b11;">%s</p>
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Moedas utilizadas</p>
                              <p style="margin:0 0 20px;font-size:15px;color:#201b11;">%d moedas</p>
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Data do resgate</p>
                              <p style="margin:0 0 24px;font-size:15px;color:#201b11;">%s</p>
                              <div style="background:#201b11;border-radius:10px;padding:20px 24px;text-align:center;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#f4b91f;margin-bottom:8px;">Codigo do cupom</div>
                                <div style="font-size:18px;font-weight:900;color:#f4b91f;letter-spacing:2px;word-break:break-all;">%s</div>
                              </div>
                              <p style="margin:20px 0 0;font-size:13px;color:#6b5528;line-height:1.6;">Quando o aluno apresentar este codigo, confirme o resgate da vantagem.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f5ebe0;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#8a7050;line-height:1.5;">Este e-mail foi enviado automaticamente pelo sistema HappyCoin.<br>Por favor, nao responda esta mensagem.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(companyName), escapeHtml(studentName), escapeHtml(productName),
                custoMoedas, escapeHtml(data), escapeHtml(couponCode)
        );
    }

    private String directMessageFromStudentTemplate(Student student, Professor professor, String subject, String body) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#201b11;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:32px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:580px;">
                          <tr>
                            <td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                              <div style="font-size:22px;font-weight:900;color:#f4b91f;letter-spacing:.5px;">HappyCoin</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f4b91f;padding:18px 28px;">
                              <h1 style="margin:0;font-size:20px;font-weight:900;color:#201b11;">%s</h1>
                              <p style="margin:4px 0 0;font-size:13px;color:#4a3c0a;">Mensagem do aluno %s</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#ffffff;padding:28px;">
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Para</p>
                              <p style="margin:0 0 20px;font-size:16px;font-weight:800;color:#201b11;">%s</p>
                              <div style="border-top:1px solid #f0d9b5;padding-top:20px;">
                                <p style="margin:0;font-size:15px;line-height:1.7;color:#201b11;white-space:pre-wrap;">%s</p>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f5ebe0;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#8a7050;line-height:1.5;">Este e-mail foi enviado pelo sistema HappyCoin.<br>Por favor, nao responda esta mensagem.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(subject), escapeHtml(subject),
                escapeHtml(student.getNome()), escapeHtml(professor.getNome()), escapeHtml(body)
        );
    }

    private String directMessageTemplate(Professor professor, Student student, String subject, String body) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#201b11;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:32px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:580px;">
                          <tr>
                            <td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                              <div style="font-size:22px;font-weight:900;color:#f4b91f;letter-spacing:.5px;">HappyCoin</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f4b91f;padding:18px 28px;">
                              <h1 style="margin:0;font-size:20px;font-weight:900;color:#201b11;">%s</h1>
                              <p style="margin:4px 0 0;font-size:13px;color:#4a3c0a;">Mensagem do professor %s</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#ffffff;padding:28px;">
                              <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Para</p>
                              <p style="margin:0 0 20px;font-size:16px;font-weight:800;color:#201b11;">%s</p>
                              <div style="border-top:1px solid #f0d9b5;padding-top:20px;">
                                <p style="margin:0;font-size:15px;line-height:1.7;color:#201b11;white-space:pre-wrap;">%s</p>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f5ebe0;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#8a7050;line-height:1.5;">Este e-mail foi enviado pelo sistema HappyCoin.<br>Por favor, nao responda esta mensagem.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(subject), escapeHtml(subject),
                escapeHtml(professor.getNome()), escapeHtml(student.getNome()), escapeHtml(body)
        );
    }

    private String professorTransferTemplate(Professor professor, Student student, int quantidade, String motivo) {
        return baseTemplate(
                "Envio de moedas confirmado", "O envio foi registrado com sucesso no HappyCoin.",
                "Professor", professor.getNome(), "Aluno destinatario", student.getNome(),
                quantidade, motivo, professor.getSaldoMoedas(), "Seu saldo foi atualizado depois desta transferencia."
        );
    }

    private String studentReceivedTemplate(Professor professor, Student student, int quantidade, String motivo) {
        return baseTemplate(
                "Voce recebeu moedas", "Seu reconhecimento academico acabou de chegar.",
                "Aluno", student.getNome(), "Professor remetente", professor.getNome(),
                quantidade, motivo, student.getSaldoMoedas(), "As moedas ja estao disponiveis para resgate de vantagens."
        );
    }

    private String baseTemplate(
            String title, String subtitle,
            String primaryLabel, String primaryName,
            String secondaryLabel, String secondaryName,
            int quantidade, String motivo, int saldoAtual, String footerMessage
    ) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#201b11;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:32px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:580px;">
                          <tr>
                            <td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                              <div style="display:inline-block;background:#f4b91f;border-radius:50%%;width:44px;height:44px;line-height:44px;font-size:22px;font-weight:900;color:#201b11;text-align:center;vertical-align:middle;">&#9733;</div>
                              <div style="margin-top:8px;font-size:22px;font-weight:900;color:#f4b91f;letter-spacing:.5px;">HappyCoin</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f4b91f;padding:18px 28px;">
                              <h1 style="margin:0;font-size:22px;font-weight:900;color:#201b11;line-height:1.2;">%s</h1>
                              <p style="margin:6px 0 0;font-size:14px;color:#4a3c0a;line-height:1.5;">%s</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#ffffff;padding:28px;">
                              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                                <tr>
                                  <td style="width:50%%;padding:0 8px 0 0;">
                                    <div style="background:#fff8f2;border:1px solid #f0d9b5;border-radius:8px;padding:14px;">
                                      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a6e3a;margin-bottom:4px;">%s</div>
                                      <div style="font-size:16px;font-weight:800;color:#201b11;">%s</div>
                                    </div>
                                  </td>
                                  <td style="width:50%%;padding:0 0 0 8px;">
                                    <div style="background:#fff8f2;border:1px solid #f0d9b5;border-radius:8px;padding:14px;">
                                      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a6e3a;margin-bottom:4px;">%s</div>
                                      <div style="font-size:16px;font-weight:800;color:#201b11;">%s</div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <div style="background:#201b11;border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:20px;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#f4b91f;margin-bottom:4px;">Moedas transferidas</div>
                                <div style="font-size:40px;font-weight:900;color:#f4b91f;line-height:1;">%d</div>
                                <div style="font-size:14px;color:#c9a84c;margin-top:2px;">moedas</div>
                              </div>
                              <div style="margin-bottom:20px;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a6e3a;margin-bottom:8px;">Mensagem</div>
                                <p style="margin:0;padding:14px 18px;border-left:4px solid #f4b91f;background:#fffbf0;border-radius:0 8px 8px 0;font-size:15px;line-height:1.6;color:#201b11;">%s</p>
                              </div>
                              <div style="background:#f9f5ed;border:1px solid #f0d9b5;border-radius:8px;padding:14px 18px;">
                                <span style="font-size:13px;color:#6b5528;">Saldo atual: </span>
                                <strong style="font-size:15px;color:#201b11;">%d moedas</strong>
                                <div style="font-size:13px;color:#8a7050;margin-top:4px;">%s</div>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#f5ebe0;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#8a7050;line-height:1.5;">Este e-mail foi enviado automaticamente pelo sistema HappyCoin.<br>Por favor, nao responda esta mensagem.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(title), escapeHtml(title), escapeHtml(subtitle),
                escapeHtml(primaryLabel), escapeHtml(primaryName),
                escapeHtml(secondaryLabel), escapeHtml(secondaryName),
                quantidade, escapeHtml(motivo), saldoAtual, escapeHtml(footerMessage)
        );
    }

    private String welcomeProfessorTemplate(Professor professor, String rawPassword) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head><meta charset="UTF-8"><title>Bem-vindo ao HappyCoin</title></head>
                <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#201b11;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:32px 12px;">
                    <tr><td align="center">
                      <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:580px;">
                        <tr><td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                          <div style="font-size:22px;font-weight:900;color:#f4b91f;">HappyCoin</div>
                        </td></tr>
                        <tr><td style="background:#f4b91f;padding:18px 28px;">
                          <h1 style="margin:0;font-size:20px;font-weight:900;color:#201b11;">Bem-vindo, %s!</h1>
                          <p style="margin:4px 0 0;font-size:13px;color:#4a3c0a;">Sua conta de professor foi criada com sucesso.</p>
                        </td></tr>
                        <tr><td style="background:#ffffff;padding:28px;">
                          <p style="margin:0 0 16px;font-size:15px;color:#201b11;">Suas credenciais de acesso ao HappyCoin:</p>
                          <div style="background:#fff8f2;border:1px solid #f0d9b5;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                            <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;">Email</p>
                            <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#201b11;">%s</p>
                            <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;">Senha provisória</p>
                            <p style="margin:0;font-size:15px;font-weight:700;color:#201b11;">%s</p>
                          </div>
                          <p style="margin:0;font-size:13px;color:#6b5528;line-height:1.6;">Recomendamos alterar sua senha após o primeiro acesso em Configurações do perfil.</p>
                        </td></tr>
                        <tr><td style="background:#f5ebe0;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
                          <p style="margin:0;font-size:12px;color:#8a7050;">Este e-mail foi enviado automaticamente pelo sistema HappyCoin.</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(escapeHtml(professor.getNome()), escapeHtml(professor.getEmail()), escapeHtml(rawPassword));
    }

    private String welcomeStudentTemplate(Student student, String rawPassword) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head><meta charset="UTF-8"><title>Bem-vindo ao HappyCoin</title></head>
                <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#201b11;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:32px 12px;">
                    <tr><td align="center">
                      <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:580px;">
                        <tr><td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                          <div style="font-size:22px;font-weight:900;color:#f4b91f;">HappyCoin</div>
                        </td></tr>
                        <tr><td style="background:#f4b91f;padding:18px 28px;">
                          <h1 style="margin:0;font-size:20px;font-weight:900;color:#201b11;">Bem-vindo, %s!</h1>
                          <p style="margin:4px 0 0;font-size:13px;color:#4a3c0a;">Sua conta de aluno foi criada com sucesso.</p>
                        </td></tr>
                        <tr><td style="background:#ffffff;padding:28px;">
                          <p style="margin:0 0 16px;font-size:15px;color:#201b11;">Suas credenciais de acesso ao HappyCoin:</p>
                          <div style="background:#fff8f2;border:1px solid #f0d9b5;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                            <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;">Email</p>
                            <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#201b11;">%s</p>
                            <p style="margin:0 0 8px;font-size:13px;color:#8a6e3a;font-weight:700;text-transform:uppercase;">Senha</p>
                            <p style="margin:0;font-size:15px;font-weight:700;color:#201b11;">%s</p>
                          </div>
                          <p style="margin:0;font-size:13px;color:#6b5528;line-height:1.6;">Acesse o sistema com suas credenciais e comece a acumular HappyCoins!</p>
                        </td></tr>
                        <tr><td style="background:#f5ebe0;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
                          <p style="margin:0;font-size:12px;color:#8a7050;">Este e-mail foi enviado automaticamente pelo sistema HappyCoin.</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(escapeHtml(student.getNome()), escapeHtml(student.getEmail()), escapeHtml(rawPassword));
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
