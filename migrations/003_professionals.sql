-- Mind Signal MVP - Week 3: Professional Matching

CREATE TYPE profession_type AS ENUM (
  'therapist',
  'counsellor',
  'psychologist',
  'psychiatrist',
  'cbt_therapist',
  'life_coach'
);

CREATE TYPE delivery_method AS ENUM ('online', 'in_person', 'both');

CREATE TABLE IF NOT EXISTS professionals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(150) NOT NULL,
  bio               TEXT,
  profession_type   profession_type NOT NULL,
  specializations   TEXT[] NOT NULL DEFAULT '{}',
  delivery_method   delivery_method NOT NULL DEFAULT 'both',
  location          VARCHAR(150),
  nhs_funded        BOOLEAN NOT NULL DEFAULT false,
  languages         TEXT[] NOT NULL DEFAULT '{English}',
  accepting_clients BOOLEAN NOT NULL DEFAULT true,
  booking_url       VARCHAR(500),
  contact_email     VARCHAR(255),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_professionals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT saved_professionals_unique UNIQUE (user_id, professional_id)
);

CREATE TRIGGER professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_professionals_profession_type ON professionals(profession_type);
CREATE INDEX IF NOT EXISTS idx_professionals_delivery_method ON professionals(delivery_method);
CREATE INDEX IF NOT EXISTS idx_professionals_accepting ON professionals(accepting_clients) WHERE accepting_clients = true;
CREATE INDEX IF NOT EXISTS idx_saved_professionals_user ON saved_professionals(user_id);

-- Seed: fictional UK professionals for demo/testing
INSERT INTO professionals (name, bio, profession_type, specializations, delivery_method, location, nhs_funded, languages, accepting_clients, booking_url) VALUES
(
  'Dr. Sarah Okafor',
  'Chartered psychologist with 12 years'' experience supporting adults with anxiety, depression, and trauma. Warm, non-judgemental approach grounded in CBT and ACT.',
  'psychologist',
  ARRAY['anxiety', 'depression', 'trauma', 'ptsd'],
  'both',
  'London',
  false,
  ARRAY['English', 'Yoruba'],
  true,
  'https://example.com/book/sarah-okafor'
),
(
  'James Whitfield',
  'BACP-accredited counsellor specialising in grief, relationship difficulties, and low self-esteem. Available online across the UK.',
  'counsellor',
  ARRAY['bereavement', 'relationships', 'self_esteem', 'depression'],
  'online',
  'UK-wide',
  false,
  ARRAY['English'],
  true,
  'https://example.com/book/james-whitfield'
),
(
  'Dr. Priya Sharma',
  'NHS psychiatrist providing assessments and medication management for complex mental health conditions including bipolar disorder and schizophrenia.',
  'psychiatrist',
  ARRAY['bipolar', 'schizophrenia', 'psychosis', 'adhd'],
  'in_person',
  'Manchester',
  true,
  ARRAY['English', 'Hindi'],
  false,
  NULL
),
(
  'Chloe Delaney',
  'CBT therapist accredited by the BABCP. Specialises in OCD, health anxiety, and social anxiety. Friendly, structured sessions with practical tools you can use daily.',
  'cbt_therapist',
  ARRAY['ocd', 'anxiety', 'social_anxiety', 'health_anxiety'],
  'online',
  'UK-wide',
  false,
  ARRAY['English'],
  true,
  'https://example.com/book/chloe-delaney'
),
(
  'Marcus Thompson',
  'Integrative therapist with a focus on men''s mental health, stress, and work-life balance. UKCP registered. In-person in Bristol or online.',
  'therapist',
  ARRAY['stress', 'mens_health', 'burnout', 'relationships'],
  'both',
  'Bristol',
  false,
  ARRAY['English'],
  true,
  'https://example.com/book/marcus-thompson'
),
(
  'Dr. Fatima Al-Hassan',
  'Clinical psychologist offering trauma-focused therapy (EMDR and trauma-focused CBT). Works with refugees and asylum seekers pro bono on referral.',
  'psychologist',
  ARRAY['trauma', 'ptsd', 'refugee_support', 'depression'],
  'both',
  'Birmingham',
  false,
  ARRAY['English', 'Arabic'],
  true,
  'https://example.com/book/fatima-al-hassan'
),
(
  'Tom Greaves',
  'Life coach and former NHS mental health nurse. Helps clients build confidence, set goals, and recover from burnout. Not a clinical service.',
  'life_coach',
  ARRAY['burnout', 'confidence', 'goal_setting', 'stress'],
  'online',
  'UK-wide',
  false,
  ARRAY['English'],
  true,
  'https://example.com/book/tom-greaves'
),
(
  'Dr. Ananya Patel',
  'Consultant psychiatrist and psychotherapist. Specialises in eating disorders and body image. Leads an NHS eating disorder clinic in Leeds.',
  'psychiatrist',
  ARRAY['eating_disorders', 'body_image', 'anxiety', 'depression'],
  'both',
  'Leeds',
  true,
  ARRAY['English', 'Gujarati'],
  false,
  NULL
);
