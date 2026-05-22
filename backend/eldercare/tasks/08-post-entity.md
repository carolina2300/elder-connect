# Task 08 — Post JPA Entities

## Goal
Map the `posts` and `caregiver_availability` tables to JPA entities. No endpoints yet.

## Domain types to represent (from `domain.ts`)

```
Post (CAREGIVER | CARETAKER)
  id, authorId, createdAt, status, location (distrito/concelho/freguesia/postalCode)
  priceRange (min, max, currency=EUR, unit)
  duration (amount, unit)
  description?

CAREGIVER adds: weeklyAvailability (day → timeslots[]), earliestStartDate, offeredQualifications[]
CARETAKER adds: startDate, endDate?, dailyTimeWindow (start/end), requiredQualifications[]
```

## Classes to create

### Embeddables

```java
@Embeddable
public class GeoLocation {
    @Column(nullable = false) private String distrito;
    @Column(nullable = false) private String concelho;
    @Column(nullable = false) private String freguesia;
    private String postalCode;
}

@Embeddable
public class PriceRange {
    @Column(nullable = false) private int minCents;
    @Column(nullable = false) private int maxCents;
    // currency always EUR — store as constant, not a DB column
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PriceUnit unit;
}

@Embeddable
public class Duration {
    @Column(nullable = false) private int amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private DurationUnit unit;
}
```

### `Post` entity — single table
```java
@Entity
@Table(name = "posts")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private PostKind kind;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private PostStatus status = PostStatus.OPEN;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private String description;

    @Embedded private GeoLocation location;
    @Embedded private PriceRange priceRange;
    @Embedded private Duration duration;

    // CAREGIVER fields
    private LocalDate earliestStartDate;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "post_offered_qualifications", joinColumns = @JoinColumn(name = "post_id"))
    private List<Qualification> offeredQualifications = new ArrayList<>();

    // CARETAKER fields
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime dailyStartTime;
    private LocalTime dailyEndTime;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "post_required_qualifications", joinColumns = @JoinColumn(name = "post_id"))
    private List<Qualification> requiredQualifications = new ArrayList<>();

    // CAREGIVER weekly availability (child table)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvailabilitySlot> availabilitySlots = new ArrayList<>();
}
```

**Note:** Since the schema uses PostgreSQL arrays for qualifications (not a join table), you have two options:
- Use a `@ElementCollection` with a separate join table (simpler JPA).
- Use `@Type(PostgreSQLEnumArrayType.class)` with `hibernate-types` library (maps to PG arrays directly).

Recommend the join table approach for simplicity unless you want to avoid extra tables.

### `AvailabilitySlot` entity
```java
@Entity
@Table(name = "caregiver_availability")
public class AvailabilitySlot {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private DayOfWeek day;

    @Column(nullable = false) private LocalTime startTime;
    @Column(nullable = false) private LocalTime endTime;
}
```

### Enums
```java
public enum PostKind { CAREGIVER, CARETAKER }
public enum PostStatus { OPEN, CLOSED }
public enum PriceUnit { PER_HOUR, PER_DAY, PER_WEEK, PER_MONTH }
public enum DurationUnit { WEEK, MONTH }
public enum DayOfWeek { MON, TUE, WED, THU, FRI, SAT, SUN }
public enum Qualification {
    HOUSE_CLEANING, PERSONAL_HYGIENE, COMPANION,
    DEMENTIA_CARE, SENIOR_TRANSPORTATION, ASSISTED_LIVING, POST_SURGERY
}
```

### `PostRepository`
```java
public interface PostRepository extends JpaRepository<Post, UUID> {}
```

### DTO design
The frontend expects a discriminated union:
```ts
{ kind: 'CAREGIVER', weeklyAvailability: WeeklyAvailability, ... }
{ kind: 'CARETAKER', dailyTimeWindow: TimeSlot, ... }
```

Plan to return a sealed hierarchy or a single flat DTO with `kind` discriminator. Simplest: flat DTO record with all fields (null for non-applicable kind).

**Create `PostDto` and `PostMapper` in this task** — mapper converts `Post` → `PostDto`, grouping `availabilitySlots` into `weeklyAvailability: Map<DayOfWeek, List<TimeSlot>>`.

## Acceptance Criteria
- App starts with no Hibernate mapping errors.
- `PostRepository` is injectable (Spring context loads).
