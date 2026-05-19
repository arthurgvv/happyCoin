package br.com.emoney.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PURCHASE_QUEUE    = "purchase.queue";
    public static final String PURCHASE_EXCHANGE = "purchase.exchange";
    public static final String PURCHASE_ROUTING  = "purchase.routing";

    @Bean
    public Queue purchaseQueue() {
        return new Queue(PURCHASE_QUEUE, true);
    }

    @Bean
    public DirectExchange purchaseExchange() {
        return new DirectExchange(PURCHASE_EXCHANGE);
    }

    @Bean
    public Binding purchaseBinding(Queue purchaseQueue, DirectExchange purchaseExchange) {
        return BindingBuilder.bind(purchaseQueue).to(purchaseExchange).with(PURCHASE_ROUTING);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
