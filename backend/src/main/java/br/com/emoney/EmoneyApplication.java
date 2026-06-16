package br.com.emoney;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EmoneyApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmoneyApplication.class, args);
    }
}
