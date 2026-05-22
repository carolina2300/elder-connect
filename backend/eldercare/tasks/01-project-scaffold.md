# Task 01 — Project Scaffold

## Goal
Bootstrap the Spring Boot Maven project with all required dependencies. No business logic yet.

## Steps

1. Generate project at https://start.spring.io with:
   - **Project:** Maven
   - **Language:** Java 25
   - **Spring Boot:** 4.x (latest stable)
   - **Group:** `pt.lacosenior`
   - **Artifact:** `backend`
   - **Packaging:** Jar
   - **Dependencies:**
     - Spring Web
     - Spring Security
     - Spring Data JPA
     - PostgreSQL Driver
     - Validation (jakarta.validation)
     - Spring Boot Actuator

2. Place project in a `backend/` folder next to the frontend root.

3. Create `src/main/resources/application.yml` (leave values as placeholders):
   ```yaml
   spring:
     datasource:
       url: ${DB_URL}
       username: ${DB_USERNAME}
       password: ${DB_PASSWORD}
     jpa:
       hibernate:
         ddl-auto: validate
       show-sql: false
     liquibase:
       change-log: classpath:db/changelog/db.changelog-master.yaml
       enabled: true

   app:
     jwt:
       secret: ${JWT_SECRET}
       expiry-hours: 72

   server:
     port: 8080
   ```

## Acceptance Criteria
- start project without errors
- `GET http://localhost:8080/actuator/health` returns 200 once DB is connected.
