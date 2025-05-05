/*
  # Create admin tables

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users.id)
      - `created_at` (timestamp with time zone)
    - `blocked_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users.id)
      - `blocked_at` (timestamp with time zone)
      - `blocked_by` (uuid, references auth.users.id)
      - `reason` (text)
  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admins table
CREATE POLICY "Only super admins can view admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
  );

CREATE POLICY "Only super admins can insert admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
  );

-- Create policies for blocked_users table
CREATE POLICY "Admins can view blocked users"
  ON blocked_users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
  );

CREATE POLICY "Admins can block/unblock users"
  ON blocked_users
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
  );

-- Insert initial super admin (replace with actual admin user ID)
-- INSERT INTO admins (user_id) VALUES ('your-admin-user-id-here');