/*
  # Add specific user as admin
  
  1. Changes
    - Add a specific user as admin by their email
*/

-- Insert admin user by email
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID by email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@ptg.com';  -- Substitua por seu email real

  -- Insert into admins table if user exists and not already admin
  IF admin_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM admins WHERE user_id = admin_user_id
  ) THEN
    INSERT INTO admins (user_id)
    VALUES (admin_user_id);
    
    RAISE NOTICE 'Admin user added successfully';
  ELSE
    RAISE NOTICE 'User not found or already admin';
  END IF;
END $$;