-- auth_sessions was created before created_at/expires_at were added to the entity.
-- Sessions are ephemeral; truncate lets us add NOT NULL columns without a backfill dance.
TRUNCATE TABLE auth_sessions;

ALTER TABLE auth_sessions
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '8 hours';

-- Remove the defaults so future inserts must supply explicit values (matches entity contract).
ALTER TABLE auth_sessions
    ALTER COLUMN created_at DROP DEFAULT,
    ALTER COLUMN expires_at DROP DEFAULT;
