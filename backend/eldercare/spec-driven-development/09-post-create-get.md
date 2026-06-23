# Task 09 — Post: Create + Get by ID

## Goal
`POST /api/v1/posts` and `GET /api/v1/posts/:id`.

## Endpoints

### POST /api/v1/posts
Auth required. Creates a post owned by the authenticated user.

Request body (matches frontend `useCreatePost`):
```json
{
  "kind": "CAREGIVER",
  "location": { "distrito": "Lisboa", "concelho": "Lisboa", "freguesia": "Arroios" },
  "priceRange": { "minCents": 800, "maxCents": 1200, "currency": "EUR", "unit": "PER_HOUR" },
  "duration": { "amount": 3, "unit": "MONTH" },
  "description": "Cuidadora disponível...",
  "earliestStartDate": "2026-06-01",
  "offeredQualifications": ["COMPANION", "PERSONAL_HYGIENE"],
  "weeklyAvailability": {
    "MON": [{ "startTime": "09:00", "endTime": "13:00" }],
    "WED": [{ "startTime": "14:00", "endTime": "18:00" }]
  }
}
```

For CARETAKER:
```json
{
  "kind": "CARETAKER",
  "location": { ... },
  "priceRange": { ... },
  "duration": { ... },
  "startDate": "2026-06-01",
  "endDate": "2026-08-31",
  "dailyTimeWindow": { "startTime": "08:00", "endTime": "16:00" },
  "requiredQualifications": ["DEMENTIA_CARE"]
}
```

Response `201`: `PostDto`

### GET /api/v1/posts/:id
Auth required. Returns a single post by ID.

Response `200`: `PostDto`
Errors: `404` if not found.

## Classes to create

### `CreatePostRequest` record
```java
public record CreatePostRequest(
    @NotNull PostKind kind,
    @NotNull @Valid GeoLocationDto location,
    @NotNull @Valid PriceRangeDto priceRange,
    @NotNull @Valid DurationDto duration,
    String description,

    // CAREGIVER
    LocalDate earliestStartDate,
    List<Qualification> offeredQualifications,
    Map<DayOfWeek, List<TimeSlotDto>> weeklyAvailability,

    // CARETAKER
    LocalDate startDate,
    LocalDate endDate,
    TimeSlotDto dailyTimeWindow,
    List<Qualification> requiredQualifications
) {}
```

### DTO value objects
```java
public record GeoLocationDto(String distrito, String concelho, String freguesia, String postalCode) {}
public record PriceRangeDto(int minCents, int maxCents, String currency, PriceUnit unit) {}
public record DurationDto(int amount, DurationUnit unit) {}
public record TimeSlotDto(String startTime, String endTime) {}
```

### `PostService` — `pt.eldercare.backend.post.PostService`
- `create(UUID authorId, CreatePostRequest req)` → PostDto
  - Load `User` by authorId.
  - Build `Post` entity from request.
  - For CAREGIVER: expand `weeklyAvailability` map → `List<AvailabilitySlot>`.
  - Save via `PostRepository`.
  - Return `PostMapper.toDto(post)`.
- `getById(UUID id)` → PostDto (throws 404 if missing).

### `PostController` — `pt.eldercare.backend.post.PostController`
```java
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
    @PostMapping      // 201
    @GetMapping("/{id}") // 200
}
```

## Notes
- `weeklyAvailability` in the request is `Map<DayOfWeek, List<TimeSlotDto>>`. Jackson deserializes this naturally if `DayOfWeek` enum keys are registered.
- `PostMapper.toDto`: reverse the availability slots back to `Map<DayOfWeek, List<TimeSlotDto>>` keyed by day.
- `authorId` comes from `SecurityUtils.currentUserId()` — never from request body.

## Acceptance Criteria
- Authenticated POST with valid CAREGIVER body returns 201 with a populated PostDto.
- Authenticated POST with valid CARETAKER body returns 201.
- GET the returned id → 200 with same data.
- GET unknown id → 404.
- Unauthenticated POST → 401.
