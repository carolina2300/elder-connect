# LaçoSenior — Backend Task List

Spring Boot (Java) + Supabase (PostgreSQL). Tasks are ordered; each depends on the previous.

## Stack
- Spring Boot 4.x (Maven)
- Spring Security (JWT, stateless)
- Spring Data JPA + Hibernate
- Liquibase (DB migrations)
- PostgreSQL via Supabase
- Java 25

## API base path: `/api/v1`

## Task Order

| # | File | What |
|---|------|------|
| 01 | [01-project-scaffold.md](01-project-scaffold.md) | Spring Boot project, Maven dependencies |
| 02 | [02-database-connection.md](02-database-connection.md) | Supabase PostgreSQL connection |
| 03 | [03-database-schema.md](03-database-schema.md) | Flyway migrations for all tables |
| 04 | [04-user-entity.md](04-user-entity.md) | User JPA entity + repository |
| 05 | [05-auth-register-login.md](05-auth-register-login.md) | POST /auth/register and /auth/login |
| 06 | [06-jwt-security-filter.md](06-jwt-security-filter.md) | JWT issue + validate + Spring Security filter |
| 07 | [07-auth-me-user-endpoints.md](07-auth-me-user-endpoints.md) | GET /auth/me, GET /users/:id, PATCH /users/me |
| 08 | [08-post-entity.md](08-post-entity.md) | Post JPA entities (CAREGIVER + CARETAKER) |
| 09 | [09-post-create-get.md](09-post-create-get.md) | POST /posts, GET /posts/:id |
| 10 | [10-post-list-search.md](10-post-list-search.md) | GET /posts with filters, pagination, role visibility |
| 11 | [11-conversation-message-entities.md](11-conversation-message-entities.md) | Conversation + Message JPA entities |
| 12 | [12-conversation-endpoints.md](12-conversation-endpoints.md) | GET/POST /conversations |
| 13 | [13-message-endpoints.md](13-message-endpoints.md) | GET/POST /conversations/:id/messages, PATCH /conversations/:id/read |
| 14 | [14-cors-error-handling.md](14-cors-error-handling.md) | CORS config + RFC 7807 ProblemDetails errors |
| 15 | [15-post-manage.md](15-post-manage.md) | PATCH /posts/:id/status (close/reopen), DELETE /posts/:id |
