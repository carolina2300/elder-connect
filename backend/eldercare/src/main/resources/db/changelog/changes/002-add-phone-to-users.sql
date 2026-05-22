--liquibase formatted sql

--changeset eldercare:002-add-phone-to-users
ALTER TABLE users ADD COLUMN phone_number VARCHAR(30);
--rollback ALTER TABLE users DROP COLUMN phone_number;
