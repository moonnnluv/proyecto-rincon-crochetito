package com.crochet.crochet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@OpenAPIDefinition(
	info = @Info(
		title = "Crochet API",
		version = "1.0",
		description = "API para la gestión de productos y usuarios de crochet"
)
)

@SpringBootApplication
public class CrochetApplication {

	public static void main(String[] args) {
		SpringApplication.run(CrochetApplication.class, args);
	}

}
