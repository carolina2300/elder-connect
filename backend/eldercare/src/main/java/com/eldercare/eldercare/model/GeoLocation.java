package com.eldercare.eldercare.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class GeoLocation {
    @Column(nullable = false) private String distrito;
    @Column(nullable = false) private String concelho;
    @Column(nullable = false) private String freguesia;
    private String postalCode;
}
