-- Insert admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID from admins table
  SELECT user_id INTO admin_user_id
  FROM admins
  LIMIT 1;

  -- If no admin exists, do nothing
  -- This ensures we keep only the actually registered admin
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found';
  END IF;
END $$;