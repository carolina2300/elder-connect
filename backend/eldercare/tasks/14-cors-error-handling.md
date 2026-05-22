# Task 14 — CORS Config + Error Handling

## Goal
Frontend (Vite dev on `localhost:5173`) can call the backend. All errors return RFC 7807 `ProblemDetails` JSON matching the shape the frontend already expects.

## CORS

Add to `SecurityConfig` (or a `@Configuration` class):

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:5173",  // Vite dev
        "${app.cors.allowed-origin:}"  // production origin via env var
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

Wire into `SecurityFilterChain`:
```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

Add to `application.yml`:
```yaml
app:
  cors:
    allowed-origin: ${CORS_ORIGIN:http://localhost:5173}
```

## Error Handling

### Target shape (matches frontend `ProblemDetails` type)
```json
{
  "type": "about:blank",
  "title": "Credenciais inválidas",
  "status": 401,
  "detail": "optional extra info"
}
```

### Spring Boot 3 built-in `ProblemDetail`
Spring 6+ has `ProblemDetail` out of the box. Enable in `application.yml`:
```yaml
spring:
  mvc:
    problemdetails:
      enabled: true
```

This handles `@Valid` failures, `ResponseStatusException`, method not allowed, etc. automatically.

### Global `@RestControllerAdvice`
Create `GlobalExceptionHandler` for custom exceptions:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> handleStatus(ResponseStatusException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason());
        pd.setTitle(ex.getReason());
        pd.setType(URI.create("about:blank"));
        return ResponseEntity.status(ex.getStatusCode()).body(pd);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Dados inválidos");
        pd.setDetail(detail);
        pd.setType(URI.create("about:blank"));
        return ResponseEntity.badRequest().body(pd);
    }
}
```

### 401 on missing/invalid JWT
Spring Security's default 401 response is HTML. Override with a JSON handler:

```java
http.exceptionHandling(ex -> ex
    .authenticationEntryPoint((req, res, authEx) -> {
        res.setContentType("application/problem+json");
        res.setStatus(401);
        res.getWriter().write("""
            {"type":"about:blank","title":"Não autenticado","status":401}
        """);
    })
);
```

## Acceptance Criteria
- Vite dev server (`localhost:5173`) can call `localhost:8080/api/v1/...` without CORS errors.
- `POST /auth/login` with wrong password returns `Content-Type: application/problem+json` with `{"type":"about:blank","title":"...","status":401}`.
- `POST /auth/register` with missing `name` field returns 400 with validation detail.
- `GET /auth/me` without token returns 401 JSON (not HTML).
- `GET /api/v1/posts/nonexistent-id` returns 404 JSON.
