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

-- Create