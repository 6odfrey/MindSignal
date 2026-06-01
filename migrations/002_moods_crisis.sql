-- Mind Signal MVP - Week 2: Moods & Crisis Resources

-- Mood entries
CREATE TABLE IF NOT EXISTS moods (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score         SMALLINT NOT NULL CHECK (score >= 1 AND score <= 10),
  note          TEXT,
  tags          TEXT[] DEFAULT '{}',
  crisis_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- UK crisis resources (seeded below)
CREATE TABLE IF NOT EXISTS crisis_resources (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  phone           VARCHAR(20),
  text_number     VARCHAR(20),
  url             VARCHAR(500),
  available_hours VARCHAR(100) DEFAULT '24/7',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER moods_no_update
  BEFORE UPDATE ON moods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_created_at ON moods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moods_user_created ON moods(user_id, created_at DESC);

-- Seed UK crisis resources
INSERT INTO crisis_resources (name, description, phone, text_number, url, available_hours) VALUES
(
  'Samaritans',
  'Free confidential support for people experiencing distress or despair.',
  '116 123',
  NULL,
  'https://www.samaritans.org',
  '24/7, 365 days a year'
),
(
  'Crisis Text Line UK',
  'Free, confidential crisis support over text message.',
  NULL,
  'Text SHOUT to 85258',
  'https://www.giveusashout.org',
  '24/7, 365 days a year'
),
(
  'Mind Infoline',
  'Information and support for people with mental health problems.',
  '0300 123 3393',
  NULL,
  'https://www.mind.org.uk',
  'Mon-Fri 9am-6pm'
),
(
  'Papyrus HOPELINEUK',
  'Confidential support for young people struggling with thoughts of suicide.',
  '0800 068 4141',
  'Text 07860 039967',
  'https://www.papyrus-uk.org',
  'Mon-Fri 10am-10pm, Weekends 2pm-10pm'
),
(
  'NHS 111',
  'Urgent medical help and advice — press option 2 for mental health support.',
  '111',
  NULL,
  'https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111',
  '24/7'
)
ON CONFLICT DO NOTHING;
