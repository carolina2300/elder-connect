# Task 10 — Post List + Search (GET /api/v1/posts)

## Goal
`GET /api/v1/posts` with role-driven visibility, filters, sorting, and pagination.

## Business rules (from MSW handler)
- Authenticated user with role `CARE_GIVER` sees only `CARETAKER` posts.
- Authenticated user with role `CARE_TAKER` sees only `CAREGIVER` posts.
- Only `OPEN` posts are shown (add status filter or make it implicit).

## Query parameters
| Param | Type | Description |
|-------|------|-------------|
| `distrito` | string | Exact match |
| `concelho` | string | Exact match |
| `freguesia` | string | Exact match |
| `qualifications` | comma-separated enum list | Filter by required/offered qualifications (any match) |
| `availableOn` | ISO date (yyyy-MM-dd) | For CAREGIVER posts: at least one availability slot covers this day |
| `priceMinCents` | int | `priceRange.maxCents >= priceMinCents` |
| `priceMaxCents` | int | `priceRange.minCents <= priceMaxCents` |
| `durationMinMonths` | int | Duration in months >= this value |
| `durationMaxMonths` | int | Duration in months <= this value |
| `sort` | `recent` \| `price_asc` \| `price_desc` | Default: `recent` |
| `page` | int (1-based) | Default: 1 |
| `size` | int (1–50) | Default: 10 |

## Response `200`: `PageResponse<PostDto>`
```json
{
  "content": [...],
  "page": 1,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5
}
```

## Implementation approach: JPA Specifications

Use Spring Data's `JpaSpecificationExecutor<Post>` to build dynamic queries.

### `PostRepository`
```java
public interface PostRepository extends JpaRepository<Post, UUID>,
    JpaSpecificationExecutor<Post> {}
```

### `PostSpec` — `pt.lacosenior.backend.post.PostSpec`
Static factory methods returning `Specification<Post>`:
```java
public class PostSpec {
    public static Specification<Post> hasKind(PostKind kind) { ... }
    public static Specification<Post> hasStatus(PostStatus status) { ... }
    public static Specification<Post> inDistrito(String distrito) { ... }
    public static Specification<Post> inConcelho(String concelho) { ... }
    public static Specification<Post> inFreguesia(String freguesia) { ... }
    public static Specification<Post> hasQualification(List<Qualification> quals) { ... }
    public static Specification<Post> priceOverlaps(Integer minCents, Integer maxCents) { ... }
    // durationMinMonths/durationMaxMonths: convert duration to months first
    //   WEEK: amount * 0.25, MONTH: amount
}
```

Chain with `Specification.where(s1).and(s2).and(s3)` — skip null specs.

### `availableOn` filter
For CAREGIVER posts only. Given a date, compute the day-of-week (e.g., 2026-06-01 = MON).
Query: post has at least one `AvailabilitySlot` with `day = MON`.
This requires a subquery or `JOIN FETCH` — use a Specification with a subquery on `caregiver_availability`.

### Sorting
```java
Sort sort = switch (sortKey) {
    case "price_asc"  -> Sort.by("priceRange.minCents").ascending();
    case "price_desc" -> Sort.by("priceRange.maxCents").descending();
    default           -> Sort.by("createdAt").descending();
};
```

### Pagination
Spring uses 0-based pages internally. Frontend sends 1-based `page`.
```java
Pageable pageable = PageRequest.of(page - 1, size, sort);
Page<Post> result = postRepository.findAll(spec, pageable);
```

Map to `PageResponse`:
```java
new PageResponse<>(
    result.map(postMapper::toDto).getContent(),
    page,
    size,
    result.getTotalElements(),
    result.getTotalPages()
)
```

### `PageResponse` Java record
```java
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {}
```

## Controller addition
```java
@GetMapping  // GET /api/v1/posts
public ResponseEntity<PageResponse<PostDto>> list(
    @RequestParam(required = false) String distrito,
    @RequestParam(required = false) String concelho,
    @RequestParam(required = false) String freguesia,
    @RequestParam(required = false) String qualifications,
    @RequestParam(required = false) String availableOn,
    @RequestParam(required = false) Integer priceMinCents,
    @RequestParam(required = false) Integer priceMaxCents,
    @RequestParam(required = false) Integer durationMinMonths,
    @RequestParam(required = false) Integer durationMaxMonths,
    @RequestParam(defaultValue = "recent") String sort,
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "10") int size
) { ... }
```

## Acceptance Criteria
- `GET /api/v1/posts` (CARE_GIVER user) returns only CARETAKER posts.
- `GET /api/v1/posts?distrito=Lisboa` returns only Lisboa posts.
- `GET /api/v1/posts?qualifications=DEMENTIA_CARE,COMPANION` returns posts matching either.
- `GET /api/v1/posts?sort=price_asc` returns posts sorted by min price ascending.
- `GET /api/v1/posts?page=2&size=5` returns correct pagination metadata.
- Total pages and totalElements are accurate.
