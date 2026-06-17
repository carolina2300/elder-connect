package com.eldercare.eldercare.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_a", nullable = false)
    private User participantA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_b", nullable = false)
    private User participantB;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
