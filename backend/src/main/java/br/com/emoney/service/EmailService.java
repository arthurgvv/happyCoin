package br.com.emoney.service;

import br.com.emoney.model.Professor;
import br.com.emoney.model.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    public void sendCoinTransferConfirmation(Professor professor, Student student, int quantidade, String motivo) {
        send(
                professor.getEmail(),
                "Confirmacao de envio de moedas - HappyCoin",
                """
                Ola, %s.

                Confirmamos o envio de %d moedas para %s.

                Motivo informado:
                %s

                Saldo atual: %d moedas.

                Atenciosamente,
                Equipe HappyCoin
                """.formatted(professor.getNome(), quantidade, student.getNome(), motivo, professor.getSaldoMoedas())
        );
    }

    public void sendCoinReceivedNotification(Professor professor, Student student, int quantidade, String motivo) {
        send(
                student.getEmail(),
                "Voce recebeu moedas - HappyCoin",
                """
                Ola, %s.

                Voce recebeu %d moedas de %s.

                Mensagem de reconhecimento:
                %s

                Saldo atual: %d moedas.

                Atenciosamente,
                Equipe HappyCoin
                """.formatted(student.getNome(), quantidade, professor.getNome(), motivo, student.getSaldoMoedas())
        );
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email enviado para {}", to);
        } catch (MailException ex) {
            log.warn("Falha ao enviar email para {}: {}", to, ex.getMessage());
        }
    }
}
