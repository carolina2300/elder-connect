package com.eldercare.eldercare.config;

import com.eldercare.eldercare.model.EmailNotificationEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JacksonJsonDeserializer;

import java.util.HashMap;
import java.util.Map;

public class KafkaConsumerConfig {

    public ConsumerFactory<String, EmailNotificationEvent> consumerFactory() {

        Map<String, Object> props = new HashMap<>();

        props.put(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,
                "localhost:9092"
        );

        props.put(
                ConsumerConfig.GROUP_ID_CONFIG,
                "email-service"
        );

        props.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        props.put(
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                JacksonJsonDeserializer.class
        );

        JacksonJsonDeserializer<EmailNotificationEvent> deserializer =
                new JacksonJsonDeserializer<>(EmailNotificationEvent.class);

        deserializer.addTrustedPackages("com.eldercare.eldercare.model");

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                deserializer
        );
    }

    public ConcurrentKafkaListenerContainerFactory<String, EmailNotificationEvent>
    kafkaListenerContainerFactory(
            ConsumerFactory<String, EmailNotificationEvent> consumerFactory) {

        ConcurrentKafkaListenerContainerFactory<String, EmailNotificationEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory);

        return factory;
    }
}
