package com.eldercare.eldercare.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
@Embeddable
public class PostDuration {
    @Column(nullable = false) private int amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private DurationUnit unit;
}
