/*
  # Add weekly_loss_limit column to risk_settings table

  1. Changes
    - Add weekly_loss_limit column to risk_settings table with default value of 10
    - Update existing records to set weekly_loss_limit based on risk_level
*/

-- Check if the column exists before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'risk_settings' 
    AND column_name = 'weekly_loss_limit'
  ) THEN
    -- Add the weekly_loss_limit column
    ALTER TABLE risk_settings ADD COLUMN weekly_loss_limit NUMERIC NOT NULL DEFAULT 10;
    
    -- Update existing records based on risk_level
    UPDATE risk_settings SET weekly_loss_limit = 
      CASE 
        WHEN risk_level = 'Conservative' THEN 10
        WHEN risk_level = 'Moderate' THEN 15
        WHEN risk_level = 'Aggressive' THEN 20
        ELSE 10
      END;
  END IF;
END $$;