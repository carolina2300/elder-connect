# Task 05 — Auth: Register + Login Endpoints

## Goal
Implement `POST /api/v1/auth/register` and `POST /api/v1/auth/login`. JWT issuing comes in Task 06 — for now return a placeholder token string so the endpoints are testable.

## Endpoints

### POST /api/v1/auth/register
Request body:
```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "secret123",
  "description": "Cuidadora experiente",
  "photo": null,
  "role": "CARE_GIVER"
}
```
Response `201`:
```json
{ "user": { ...UserDto }, "token": "<jwt>" }
```
Errors:
- `409` if email already registered (`title: "Email já registado"`)

### POST /api/v1/auth/login
Request body:
```json
{ "email": "maria@example.com", "password": "secret123" }
```
Response `200`:
```json
{ "user": { ...UserDto }, "token": "<jwt>" }
```
Errors:
- `401` if email not found or password wrong (`title: "Credenciais inválidas"`)

### POST /api/v1/auth/logout
- Auth header required (Bearer token).
- Stateless JWT — no server-side revocation for now.
- Return `204 No Content`.

## Classes to create

### `AuthRequest` records

### `AuthResponse` record
```java
public record AuthResponse(UserDto user, String token) {}
```

### `AuthService` — `pt.eldercare.backend.auth.AuthService`
- `register(RegisterRequest)`: check email unique, BCrypt hash password, save User, issue token, return AuthResponse.
- `login(LoginRequest)`: find user by email, `BCryptPasswordEncoder.matches()`, issue token, return AuthResponse.
- Inject `PasswordEncoder` bean (declare in a `@Configuration` class).
- For now, token = `JwtService.issue(userId)` — implement `JwtService` stub that returns `"todo-jwt"` until Task 06.

### `AuthController` — `pt.eldercare.backend.auth.AuthController`
```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @PostMapping("/register")  // 201
    @PostMapping("/login")     // 200
    @PostMapping("/logout")    // 204
}
```

## Notes
- BCrypt bean declaration:
  ```java
  @Bean
  public PasswordEncoder passwordEncoder() {
      return new BCryptPasswordEncoder();
  }
  ```
- Error format matches `ProblemDetails` (`type`, `title`, `status`, `detail`). Use `@ExceptionHandler` or Spring's built-in `ProblemDetail` (Spring 6+).
- Disable Spring Security's default form login in this task (configure a minimal `SecurityFilterChain` that permits `/api/v1/auth/**`).

## Acceptance Criteria
- `curl -X POST localhost:8080/api/v1/auth/register -H 'Content-Type: application/json' -d '{"name":"Test","email":"t@t.com","password":"123456","role":"CARE_GIVER"}'` returns 201 with a user object.
- Second call with same email returns 409.
- Login with correct credentials returns 200 with token.
- Login with wrong password returns 401.
