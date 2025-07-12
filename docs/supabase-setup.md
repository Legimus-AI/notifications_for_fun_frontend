# Supabase Authentication Setup and Usage

## Prerequisites
- Supabase project created with email/password authentication enabled
- The .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY configured
- Row Level Security (RLS) enabled for your tables

## Environment Setup
Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=https://zqvftxdndpksivcflfns.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdmZ0eGRuZHBrc2l2Y2ZsZm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MzQwMTQsImV4cCI6MjA2NjMxMDAxNH0.6Qoj_wo-oxV0drdsrAb7fg0Dvqk7Z9O0SbBWg1NBIYI
```

## Creating the Default Superadmin User

### Option 1: Using Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter:
   - Email: `vj5@gmail.com`
   - Password: `123456`
   - User Metadata: `{"role": "superadmin"}`
5. Click "Create User"
6. Confirm the user's email if required

### Option 2: Using SQL Editor
1. Go to SQL Editor in your Supabase Dashboard
2. Run the following SQL:
```sql
-- Create the superadmin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'vj5@gmail.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"role": "superadmin"}',
  NOW(),
  NOW()
);
```

## Authentication Features

### Email/Password Authentication
- Users can log in with email and password
- Pre-filled demo credentials: `vj5@gmail.com` / `123456`
- Toggle between password and magic link authentication

### Magic Link Authentication
- Passwordless authentication via email
- Users receive a magic link in their email
- Automatic redirect to `/auth/callback` after clicking the link

### Role-Based Access Control
- **User**: Basic access to the application
- **Admin**: Administrative privileges
- **Superadmin**: Full access including user management

## User Management (Superadmin Only)
- Navigate to `/management/users`
- Create new users with specific roles
- View all system users and their status
- Monitor user activity and confirmation status

## Starting with Supabase Auth
1. Start the development server (already running per project rules)
2. Navigate to `/login`
3. Use the toggle to switch between password and magic link authentication
4. For password auth: Enter email and password, click "Sign In"
5. For magic link: Enter email, click "Send Magic Link", check email and click the link
6. After authentication, you'll be redirected to the dashboard

## User Roles and Permissions
- Routes are protected based on authentication status
- Superadmin routes require `superadmin` role in user metadata
- Regular users have access to basic functionality
- Role information is stored in `user_metadata.role`

## Security Notes
- Row Level Security should be enabled for all tables
- The anonymous key is safe to use in the browser when RLS is properly configured
- For production, ensure proper policies are in place
- Consider using the service role key for admin operations server-side

## Troubleshooting
- If magic links don't work, check your email redirect URL configuration
- Ensure CORS is properly configured for your domain
- Verify that email confirmation is not required if using password auth
- Check browser console for any authentication errors 