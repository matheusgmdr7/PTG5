/*
  # Create risk settings table

  1. New Tables
    - `risk_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users.id)
      - `risk_level` (text)
      - `daily_loss_limit` (numeric)
      - `max_leverage` (numeric)
      - `max_daily_trades` (integer)
      - `recovery_time` (integer)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `risk_settings` table
    - Add policies for authenticated users to read and update their own risk settings
*/

-- Create risk_settings table
CREATE TABLE IF NOT EXISTS risk_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'Conservative',
  daily_loss_limit NUMERIC NOT NULL DEFAULT 2,
  max_leverage NUMERIC NOT NULL DEFAULT 5,
  max_daily_trades INTEGER NOT NULL DEFAULT 5,
  recovery_time INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('Conservative', 'Moderate', 'Aggressive'))
);

-- Enable Row Level Security
ALTER TABLE risk_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own risk settings"
  ON risk_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk settings"
  ON risk_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a trigger to set updated_at on update
CREATE OR REPLACE FUNCTION update_risk_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_settings_updated_at
BEFORE UPDATE ON risk_settings
FOR EACH ROW
EXECUTE FUNCTION update_risk_settings_updated_at();

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user_risk_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO risk_settings (user_id, risk_level, daily_loss_limit, max_leverage, max_daily_trades, recovery_time)
  VALUES (
    NEW.id,
    'Conservative',
    2,
    5,
    5,
    24
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created_risk_settings
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_risk_settings();