-- Mind Signal MVP - Week 5: Notifications & Reminders

CREATE TABLE IF NOT EXISTS device_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(500) NOT NULL,
  platform   VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT device_tokens_unique UNIQUE (user_id, token)
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_reminder       BOOLEAN NOT NULL DEFAULT true,
  reminder_time       TIME NOT NULL DEFAULT '20:00:00',
  crisis_alerts       BOOLEAN NOT NULL DEFAULT true,
  message_alerts      BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_preferences_user_unique UNIQUE (user_id)
);

CREATE TRIGGER device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
