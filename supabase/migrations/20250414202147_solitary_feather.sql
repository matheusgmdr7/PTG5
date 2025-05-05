/*
  # Check admin users

  1. Query
    - Select admin users with their email addresses
    - Show when they were added as admin
*/

-- Select admin users with their details
SELECT 
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  a.created_at as admin_since
FROM admins a
JOIN auth.users u ON u.id = a.user_id
ORDER BY a.created_at;