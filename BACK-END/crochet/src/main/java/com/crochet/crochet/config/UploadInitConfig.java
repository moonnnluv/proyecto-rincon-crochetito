// src/main/java/com/crochet/crochet/config/UploadInitConfig.java
package com.crochet.crochet.config;

import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UploadInitConfig {

    @Bean
    CommandLineRunner ensureUploadDir(@Value("${app.upload.dir}") String dir) {
        return args -> Files.createDirectories(Paths.get(dir).toAbsolutePath().normalize());
    }
}
