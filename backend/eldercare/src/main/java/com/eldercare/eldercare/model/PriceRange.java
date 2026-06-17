package com.eldercare.eldercare.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
@Embeddable
public class PriceRange {
    @Column(nullable = false) private int minCents;
    @Column(nullable = false) private int maxCents;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PriceUnit unit;
}
