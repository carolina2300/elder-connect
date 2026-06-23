# Task 07 — Auth/Me + User Endpoints

## Goal
Implement the three user-facing endpoints that require authentication.

## Endpoints

### GET /api/v1/auth/me
Returns the currently authenticated user.

Response `200`: `UserDto`
- Pull `userId` from security context.
- Load from `UserRepository` → map to `UserDto`.
- `401` if no valid token (handled by filter — controller never reached).
- `401` if userId from token not found in DB (token for a deleted user).

### GET /api/v1/users/:id
Returns any user's public profile.

Response `200`: `UserDto`
- Auth required.
- `404` if user not found.

### PATCH /api/v1/users/me
Partially update the authenticated user's profile.

Request body (all fields optional):
```json
{
  "name": "Maria Nova",
  "description": "Updated bio",
  "photo": "https://..."
}
```

Response `200`: updated `UserDto`

Rules:
- Only update fields present in the body (null = clear field; absent = leave unchanged).
- `name`: if provided, must not be blank.
- `photo`: nullable — can be set to `null` to remove the photo.
- Role and email cannot be changed via this endpoint.

## Classes to create

### `UpdateMeRequest` record
```java
public record UpdateMeRequest(
    @Size(min = 1) String name,
    String description,
    String photo          // null is a valid value (clears the photo)
) {}
```

Use a `PATCH` semantic: distinguish "field absent" from "field = null". Options:
- Use `Optional<String>` fields in the request record.
- Or accept `Map<String, Object>` and merge manually.
- Simplest: accept `UpdateMeRequest` and treat any non-null string value as "update".

### `UserController` — `pt.eldercare.backend.user.UserController`
```java
@RestController
@RequestMapping("/api/v1")
public class UserController {
    @GetMapping("/auth/me")   // 200 UserDto
    @GetMapping("/users/{id}") // 200 UserDto
    @PatchMapping("/users/me") // 200 UserDto
}
```

### `UserService` — `pt.eldercare.backend.user.UserService`
- `getMe(UUID userId)` → UserDto
- `getUser(UUID id)` → UserDto (throws 404 if not found)
- `updateMe(UUID userId, UpdateMeRequest body)` → UserDto

## Notes
- `@GetMapping("/auth/me")` can live in `AuthController` or `UserController` — whichever keeps the package structure tidy.
- For the `PATCH`, Spring Boot's `@RequestBody` requires `Content-Type: application/json`. If a field is absent from the JSON body, it arrives as `null` in the record. Treat null as "no change" and only update non-null fields.
- Photo field: `null` in JSON clears the photo. Use `@JsonInclude` carefully or handle both cases explicitly.

## Acceptance Criteria
- `GET /auth/me` with valid token returns current user's `UserDto`.
- `GET /users/:id` returns any user; 404 for unknown id.
- `PATCH /users/me` with `{"name":"New Name"}` updates only name, leaves other fields unchanged.
- `PATCH /users/me` with `{"photo":null}` sets photo to null.
