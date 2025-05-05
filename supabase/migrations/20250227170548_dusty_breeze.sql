/*
  # Create exchange connections table

  1. New Tables
    - `exchange_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users.id)
      - `exchange` (text)
      - `api_key` (text, encrypted)
      - `api_secret` (text, encrypted)
      - `connected` (boolean)
      - `last_synced` (timestamp with time zone)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `exchange_connections` table
    - Add policies for authenticated users to read, create, update, and delete their own connections
*/

-- Create exchange_connections table
CREATE TABLE IF NOT EXISTS exchange_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exchange TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  connected BOOLEAN DEFAULT true,
  last_synced TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE exchange_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own exchange connections"
  ON exchange_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exchange connections"
  ON exchange_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exchange connections"
  ON exchange_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exchange connections"
  ON exchange_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a trigger to set updated_at on update
CREATE OR REPLACE FUNCTION update_exchange_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exchange_connections_updated_at
BEFORE UPDATE ON exchange_connections
FOR EACH ROW
EXECUTE FUNCTION update_exchange_connections_updated_at();