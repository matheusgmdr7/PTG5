/*
  # Update risk_settings function with error handling
  
  1. Updates
    - Modifies the handle_new_user_risk_settings function to include error handling
*/

-- Update the handle_new_user_risk_settings function with error handling
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
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error creating risk settings for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;