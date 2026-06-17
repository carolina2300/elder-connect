package com.eldercare.eldercare.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostKind kind;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.OPEN;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private String description;

    @Embedded
    private GeoLocation location;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "minCents", column = @Column(name = "min_cents", nullable = false)),
            @AttributeOverride(name = "maxCents", column = @Column(name = "max_cents", nullable = false)),
            @AttributeOverride(name = "unit", column = @Column(name = "price_unit", nullable = false))
    })
    private PriceRange priceRange;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount", column = @Column(name = "duration_amount", nullable = false)),
            @AttributeOverride(name = "unit", column = @Column(name = "duration_unit", nullable = false))
    })
    private PostDuration duration;

    // CAREGIVER fields
    private LocalDate earliestStartDate;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "post_offered_qualifications", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "qualification")
    private List<Qualification> offeredQualifications = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvailabilitySlot> availabilitySlots = new ArrayList<>();

    // CARETAKER fields
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime dailyStartTime;
    private LocalTime dailyEndTime;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "post_required_qualifications", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "qualification")
    private List<Qualification> requiredQualifications = new ArrayList<>();
}
