/*
  # Add admin user

  1. Changes
    - Insert admin user into admins table
    - Add comment explaining the purpose
*/

-- Insert admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID by email (replace with your admin email)
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'seu-email@exemplo.com';

  -- Insert into admins table if user exists and not already admin
  IF admin_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM admins WHERE user_id = admin_user_id
  ) THEN
    INSERT INTO admins (user_id)
    VALUES (admin_user_id);
  END IF;
END $$;