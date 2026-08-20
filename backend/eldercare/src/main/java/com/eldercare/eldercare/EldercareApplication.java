package com.eldercare.eldercare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class EldercareApplication {

	public static void main(String[] args) {
		SpringApplication.run(EldercareApplication.class, args);
	}

}
