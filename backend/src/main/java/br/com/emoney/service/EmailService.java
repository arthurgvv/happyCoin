package br.com.emoney.service;

import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username:no-reply@happycoin.local}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendDirectMessage(Professor professor, Student student, String subject, String body) {
        send(student.getEmail(), subject, directMessageTemplate(professor, student, subject, body));
    }

    public void sendDirectMessage(Student student, Professor professor, String subject, String body) {
        send(professor.getEmail(), subject, directMessageFromStudentTemplate(student, professor, subject, body));
    }

    public void sendCoinTransferConfirmation(Professor professor, Student student, int quantidade, String motivo) {
        send(
                professor.getEmail(),
                "Confirmacao de envio de moedas - HappyCoin",
                professorTransferTemplate(professor, student, quantidade, motivo)
        );
    }

    public void sendCoinReceivedNotification(Professor professor, Student student, int quantidade, String motivo) {
        send(
                student.getEmail(),
                "Voce recebeu moedas - HappyCoin",
                studentReceivedTemplate(professor, student, quantidade, motivo)
        );
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email enviado para {}", to);
        } catch (MailException | MessagingException ex) {
            log.warn("Falha ao enviar email para {}: {}", to, ex.getMessage());
        }
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
                escapeHtml(subject),
                escapeHtml(subject),
                escapeHtml(student.getNome()),
                escapeHtml(professor.getNome()),
                escapeHtml(body)
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
                escapeHtml(subject),
                escapeHtml(subject),
                escapeHtml(professor.getNome()),
                escapeHtml(student.getNome()),
                escapeHtml(body)
        );
    }

    private String professorTransferTemplate(Professor professor, Student student, int quantidade, String motivo) {
        return baseTemplate(
                "Envio de moedas confirmado",
                "O envio foi registrado com sucesso no HappyCoin.",
                "Professor",
                professor.getNome(),
                "Aluno destinatario",
                student.getNome(),
                quantidade,
                motivo,
                professor.getSaldoMoedas(),
                "Seu saldo foi atualizado depois desta transferencia."
        );
    }

    private String studentReceivedTemplate(Professor professor, Student student, int quantidade, String motivo) {
        return baseTemplate(
                "Voce recebeu moedas",
                "Seu reconhecimento academico acabou de chegar.",
                "Aluno",
                student.getNome(),
                "Professor remetente",
                professor.getNome(),
                quantidade,
                motivo,
                student.getSaldoMoedas(),
                "As moedas ja estao disponiveis para resgate de vantagens."
        );
    }

    private String baseTemplate(
            String title,
            String subtitle,
            String primaryLabel,
            String primaryName,
            String secondaryLabel,
            String secondaryName,
            int quantidade,
            String motivo,
            int saldoAtual,
            String footerMessage
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

                          <!-- HEADER -->
                          <tr>
                            <td style="background:#201b11;border-radius:12px 12px 0 0;padding:20px 28px;text-align:center;">
                              <div style="display:inline-block;background:#f4b91f;border-radius:50%%;width:44px;height:44px;line-height:44px;font-size:22px;font-weight:900;color:#201b11;text-align:center;vertical-align:middle;">&#9733;</div>
                              <div style="margin-top:8px;font-size:22px;font-weight:900;color:#f4b91f;letter-spacing:.5px;">HappyCoin</div>
                            </td>
                          </tr>

                          <!-- TITLE BAND -->
                          <tr>
                            <td style="background:#f4b91f;padding:18px 28px;">
                              <h1 style="margin:0;font-size:22px;font-weight:900;color:#201b11;line-height:1.2;">%s</h1>
                              <p style="margin:6px 0 0;font-size:14px;color:#4a3c0a;line-height:1.5;">%s</p>
                            </td>
                          </tr>

                          <!-- BODY -->
                          <tr>
                            <td style="background:#ffffff;padding:28px;">

                              <!-- PEOPLE -->
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

                              <!-- COIN AMOUNT -->
                              <div style="background:#201b11;border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:20px;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#f4b91f;margin-bottom:4px;">Moedas transferidas</div>
                                <div style="font-size:40px;font-weight:900;color:#f4b91f;line-height:1;">%d</div>
                                <div style="font-size:14px;color:#c9a84c;margin-top:2px;">moedas</div>
                              </div>

                              <!-- MOTIVO -->
                              <div style="margin-bottom:20px;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a6e3a;margin-bottom:8px;">Mensagem</div>
                                <p style="margin:0;padding:14px 18px;border-left:4px solid #f4b91f;background:#fffbf0;border-radius:0 8px 8px 0;font-size:15px;line-height:1.6;color:#201b11;">%s</p>
                              </div>

                              <!-- BALANCE -->
                              <div style="background:#f9f5ed;border:1px solid #f0d9b5;border-radius:8px;padding:14px 18px;">
                                <span style="font-size:13px;color:#6b5528;">Saldo atual: </span>
                                <strong style="font-size:15px;color:#201b11;">%d moedas</strong>
                                <div style="font-size:13px;color:#8a7050;margin-top:4px;">%s</div>
                              </div>

                            </td>
                          </tr>

                          <!-- FOOTER -->
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
                escapeHtml(title),
                escapeHtml(title),
                escapeHtml(subtitle),
                escapeHtml(primaryLabel),
                escapeHtml(primaryName),
                escapeHtml(secondaryLabel),
                escapeHtml(secondaryName),
                quantidade,
                escapeHtml(motivo),
                saldoAtual,
                escapeHtml(footerMessage)
        );
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
