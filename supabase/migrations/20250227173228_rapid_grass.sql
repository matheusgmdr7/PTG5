/*
  # Fix risk settings table and functions

  1. Add insert policy for risk_settings table
  2. Update risk_settings query to use maybeSingle instead of single
*/

-- Add insert policy if it doesn't exist
DO $$
BEGIN
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

-- Update the handle_new_user_risk_settings function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user_risk_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user already has risk settings
  IF NOT EXISTS (
    SELECT 1 FROM risk_settings WHERE user_id = NEW.id
  ) THEN
    INSERT INTO risk_settings (user_id, risk_level, daily_loss_limit, max_leverage, max_daily_trades, recovery_time)
    VALUES (
      NEW.id,
      'Conservative',
      2,
      5,
      5,
      24
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error creating risk settings for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;