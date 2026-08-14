-- Trackathon Supabase PostgreSQL Database Schema
-- Execute this script in your Supabase SQL Editor to set up tables, triggers, and Row Level Security (RLS) policies.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS sent_reminders CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS google_connections CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS hackathon_rounds CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS hackathons CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS verify_round_progression() CASCADE;


-- 1. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  college TEXT,
  department TEXT,
  academic_year TEXT,
  phone_number TEXT,
  github_profile TEXT,
  linkedin_profile TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Hackathons Table
CREATE TABLE hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  website_url TEXT,
  registration_link TEXT,
  registration_deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  mode TEXT NOT NULL CHECK (mode IN ('online', 'offline', 'hybrid')),
  location TEXT,
  meeting_link TEXT,
  participation_type TEXT NOT NULL CHECK (participation_type IN ('individual', 'team')),
  team_name TEXT,
  team_size INT,
  total_rounds INT DEFAULT 5,
  domain TEXT,
  technology TEXT,
  prize_info TEXT,
  eligibility TEXT,
  rules_guidelines TEXT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Team Members Table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  college TEXT,
  department TEXT,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Hackathon Rounds Table
CREATE TABLE hackathon_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  round_name TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  meeting_link TEXT,
  submission_link TEXT,
  instructions TEXT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed', 'qualified', 'not_qualified', 'skipped', 'cancelled')) DEFAULT 'upcoming',
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (hackathon_id, round_number)
);

-- 5. Achievements Table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL UNIQUE REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN ('winner', 'runner_up', 'finalist', 'participant', 'no_result', 'other')),
  certificate_url TEXT,
  proof_url TEXT,
  github_repo TEXT,
  project_url TEXT,
  demo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Google Connections Table (for OAuth access to Google Calendar API)
CREATE TABLE google_connections (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT, -- Milliseconds epoch timestamp when token expires
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Calendar Events Table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  round_id UUID REFERENCES hackathon_rounds(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('registration_deadline', 'hackathon_start', 'hackathon_end', 'round_date', 'round_submission')),
  google_event_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (hackathon_id, round_id, event_type)
);

-- 8. Notification Preferences Table
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  calendar_sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_offsets INT[] NOT NULL DEFAULT '{1440}', -- Default: 24 hours (1440 mins) before
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Push Subscriptions Table (for web push subscription details)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Sent Reminders Table (to prevent duplicate reminders)
CREATE TABLE sent_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  round_id UUID REFERENCES hackathon_rounds(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  offset_minutes INT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, hackathon_id, round_id, event_type, offset_minutes)
);

-- Indexes for performance queries
CREATE INDEX idx_hackathons_user ON hackathons(user_id);
CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_hackathon_rounds_hackathon ON hackathon_rounds(hackathon_id);
CREATE INDEX idx_team_members_hackathon ON team_members(hackathon_id);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_calendar_events_user ON calendar_events(user_id);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Enforce Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles Policies
CREATE POLICY "Profiles are viewable by owner" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles are insertable by owner" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Hackathons Policies
CREATE POLICY "Hackathons are manageable by owner" ON hackathons
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Team Members Policies
CREATE POLICY "Team members are manageable by owner of hackathon" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = team_members.hackathon_id
      AND hackathons.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = team_members.hackathon_id
      AND hackathons.user_id = auth.uid()
    )
  );

-- Hackathon Rounds Policies
CREATE POLICY "Hackathon rounds are manageable by owner of hackathon" ON hackathon_rounds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = hackathon_rounds.hackathon_id
      AND hackathons.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = hackathon_rounds.hackathon_id
      AND hackathons.user_id = auth.uid()
    )
  );

-- Achievements Policies
CREATE POLICY "Achievements are manageable by owner" ON achievements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Google Connections Policies
CREATE POLICY "Google connections are manageable by owner" ON google_connections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Calendar Events Policies
CREATE POLICY "Calendar events are manageable by owner" ON calendar_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notification Preferences Policies
CREATE POLICY "Notification preferences are manageable by owner" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Push Subscriptions Policies
CREATE POLICY "Push subscriptions are manageable by owner" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sent Reminders Policies
CREATE POLICY "Sent reminders are manageable by owner" ON sent_reminders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Postgres Trigger to Enforce Round Progression Business Rule
-- "Round N can only be added if Round N-1 exists (any status)."
CREATE OR REPLACE FUNCTION verify_round_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- If first round, always allow creation
  IF NEW.round_number = 1 THEN
    RETURN NEW;
  END IF;

  -- Verify previous round exists (any status is acceptable)
  IF NOT EXISTS (
    SELECT 1 FROM hackathon_rounds
    WHERE hackathon_id = NEW.hackathon_id
      AND round_number = NEW.round_number - 1
  ) THEN
    RAISE EXCEPTION 'Round progression restriction: Round % can only be added if Round % exists.', NEW.round_number, NEW.round_number - 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_round_progression
BEFORE INSERT OR UPDATE OF round_number, status ON hackathon_rounds
FOR EACH ROW
EXECUTE FUNCTION verify_round_progression();


-- Trigger to automatically create profile and default notification settings when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.notification_preferences (user_id, push_enabled, email_enabled, calendar_sync_enabled, reminder_offsets)
  VALUES (NEW.id, TRUE, TRUE, TRUE, '{1440}');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
