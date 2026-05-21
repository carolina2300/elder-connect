# Task 02 — Database Connection (Supabase)

## Goal
Connect the Spring Boot app to the Supabase PostgreSQL database.

## Steps

1. In Supabase dashboard → **Settings → Database → Connection string** → copy the JDBC URI (mode: JDBC).

2. Populate properties file:
   ```
   DB_URL=jdbc:postgresql://<project>.supabase.co:5432/postgres
   DB_USERNAME=postgres
   DB_PASSWORD=<your-db-password>
   JWT_SECRET=<random-32+-char-string>
   ```
   
We should use Docker for local developments connecting to postgres, but the purpose of this task is to connect to the remote Supabase instance.

## Supabase connection notes
- Supabase enforces SSL. Add `?sslmode=require` to the JDBC URL if connection is refused.

## Acceptance Criteria
- App starts without `Connection refused` errors.
- `GET /actuator/health` returns `{"status":"UP"}`.
