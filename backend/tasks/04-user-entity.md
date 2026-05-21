# Task 04 — User JPA Entity + Repository

## Goal
Map the `users` table to a JPA entity. No endpoints yet.

Also create the UserDTO. For example the DTO does not contain password, but the entity does.

## Notes
- Use Lombok `@Data` or generate getters/setters — whichever fits the team style.
- `password` field must never appear in `UserDto`.
- `createdAt` stored as `Instant`; Jackson serializes to ISO-8601 string (matches frontend `User.createdAt: string`).
- Add `spring.jpa.hibernate.ddl-auto: validate` — Liquibase owns the schema, Hibernate only validates.

## Acceptance Criteria
- App starts with no Hibernate mapping errors.
