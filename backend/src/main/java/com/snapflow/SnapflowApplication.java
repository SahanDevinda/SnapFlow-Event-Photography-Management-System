package com.snapflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class  SnapflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(SnapflowApplication.class, args);
    }
}
