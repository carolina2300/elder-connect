# Task 06 — JWT: Issue, Validate + Security Filter

## Goal
Real JWT tokens. Every protected endpoint validates the Bearer token and populates Spring Security context.

## Classes to create

### `JwtService` — `pt.lacosenior.backend.auth.JwtService`

```java
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiry-hours}")
    private int expiryHours;

    public String issue(UUID userId) {
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(new Date())
            .expiration(Date.from(Instant.now().plusSeconds(expiryHours * 3600L)))
            .signWith(key())
            .compact();
    }

    public Optional<UUID> validate(String token) {
        try {
            String subject = Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
            return Optional.of(UUID.fromString(subject));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decodable.from(secret).decode());
        // or: Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))
        // Use a base64-encoded secret in .env for production safety.
    }
}
```

### `JwtAuthFilter` — `pt.lacosenior.backend.auth.JwtAuthFilter`

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // Extract "Bearer <token>" from Authorization header.
    // Call JwtService.validate() → get userId.
    // Load UserDetails from UserRepository (or use a lightweight stub).
    // Set UsernamePasswordAuthenticationToken in SecurityContextHolder.
    // On missing/invalid token: do nothing (endpoint security handles 401).

}
```

### `SecurityConfig` — `pt.lacosenior.backend.config.SecurityConfig`

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## Getting the current user in controllers

Create a helper to pull the authenticated `UUID` from the security context:

```java
public class SecurityUtils {
    public static UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString((String) auth.getPrincipal());
    }
}
```

Or inject `@AuthenticationPrincipal` directly if you wire `UserDetailsService`.

## JWT secret note
`JWT_SECRET` in `.env` must be ≥ 32 characters for HS256. Use a random base64 string:
```bash
openssl rand -base64 32
```

## Acceptance Criteria
- `GET /api/v1/auth/me` without token → `401`.
- Register → get token → `GET /api/v1/auth/me` with `Authorization: Bearer <token>` → `200` with user.
- Tampered token → `401`.
- Expired token (set short expiry to test) → `401`.
