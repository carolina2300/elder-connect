--liquibase formatted sql

--changeset eldercare:003-reviews
CREATE TABLE reviews (
    id          UUID PRIMARY KEY,
    reviewer_id UUID        NOT NULL REFERENCES users(id),
    reviewed_id UUID        NOT NULL REFERENCES users(id),
    rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_review_pair UNIQUE (reviewer_id, reviewed_id),
    CONSTRAINT chk_no_self_review CHECK (reviewer_id <> reviewed_id)
);
--rollback DROP TABLE reviews;
