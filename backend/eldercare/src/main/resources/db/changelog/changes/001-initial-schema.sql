--liquibase formatted sql

--changeset eldercare:001-initial-schema
CREATE TABLE users (
    id          UUID PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    photo       VARCHAR(500),
    user_type   VARCHAR(20)  NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    id                  UUID PRIMARY KEY,
    author_id           UUID        NOT NULL REFERENCES users(id),
    kind                VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description         TEXT,
    distrito            VARCHAR(100) NOT NULL,
    concelho            VARCHAR(100) NOT NULL,
    freguesia           VARCHAR(100) NOT NULL,
    postal_code         VARCHAR(20),
    min_cents           INT         NOT NULL,
    max_cents           INT         NOT NULL,
    price_unit          VARCHAR(20) NOT NULL,
    duration_amount     INT         NOT NULL,
    duration_unit       VARCHAR(20) NOT NULL,
    earliest_start_date DATE,
    start_date          DATE,
    end_date            DATE,
    daily_start_time    TIME,
    daily_end_time      TIME
);

CREATE TABLE post_offered_qualifications (
    post_id       UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    qualification VARCHAR(50) NOT NULL
);

CREATE TABLE post_required_qualifications (
    post_id       UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    qualification VARCHAR(50) NOT NULL
);

CREATE TABLE caregiver_availability (
    id         UUID PRIMARY KEY,
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    day        VARCHAR(10) NOT NULL,
    start_time TIME        NOT NULL,
    end_time   TIME        NOT NULL
);

CREATE TABLE conversations (
    id            UUID PRIMARY KEY,
    participant_a UUID        NOT NULL REFERENCES users(id),
    participant_b UUID        NOT NULL REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY,
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID        NOT NULL REFERENCES users(id),
    body            TEXT        NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMPTZ
);
--rollback DROP TABLE messages;
--rollback DROP TABLE conversations;
--rollback DROP TABLE caregiver_availability;
--rollback DROP TABLE post_required_qualifications;
--rollback DROP TABLE post_offered_qualifications;
--rollback DROP TABLE posts;
--rollback DROP TABLE users;
