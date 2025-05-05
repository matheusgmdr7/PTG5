/*
  # Check and update risk_settings table policies
  
  1. Updates
    - Checks if policies exist before creating them
*/

-- Check if the policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'risk_settings' 
    AND policyname = 'Users can view their own risk settings'
  ) THEN
    CREATE POLICY "Users can view their own risk settings"
      ON risk_settings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'risk_settings' 
    AND policyname = 'Users can update their own risk settings'
  ) THEN
    CREATE POLICY "Users can update their own risk settings"
      ON risk_settings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'risk_settings' 
    AND policyname = 'Users can insert their own risk settings'
  ) THEN
    CREATE POLICY "Users can insert their own risk settings"
      ON risk_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;