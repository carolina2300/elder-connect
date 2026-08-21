package com.eldercare.eldercare.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "features")
public class FeatureFlags {
    private boolean useKafkaForEmails = false;
    private boolean useAwsLambda = false;
}
