# Task 03 — Database Schema (Liquibase Migrations)

## Goal
Liquibase is a database schema management.
Add liquibase dependency to Spring Boot and create the initial database schema. Each change to de DB is a new SQL file.
Create all tables via Liquibase versioned changesets. No JPA entities yet — just migration files.

## File structure

```
src/main/resources/db/changelog/
  db.changelog-master.yaml          ← master file, includes all changesets
  changes/
    001-initial-schema.sql          ← raw SQL changeset
```

## Master changelog
Create a master changelog that includes all changesets in the `changes/` folder. This allows Liquibase to track which changesets have been applied.

`db.changelog-master.yaml`:
```yaml
databaseChangeLog:
  - includeAll:
      path: db/changelog/changes/
      relativeToChangelogFile: false
```

## Liquibase rules
- **Never edit a deployed changeset.** Add new changesets (e.g. `002-add-column.sql`) for schema changes.
- Liquibase tracks applied changesets in `databasechangelog` table — Supabase will show this table; ignore it.
- Each changeset gets a unique `id` (the `lacosenior:001-...` string). Keep ids stable.
- The `--rollback` block documents how to undo manually; Liquibase uses it for `rollbackCount`.

## Acceptance Criteria
- `./mvnw spring-boot:run` starts and logs `Liquibase: Successfully acquired change log lock` then `Successfully released change log lock`.
- `databasechangelog` table in Supabase shows one row for `001-initial-schema`.
- All tables visible in Supabase table editor.
