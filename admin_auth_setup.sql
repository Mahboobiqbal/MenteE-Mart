-- ============================================================
-- admin_auth_setup.sql
-- Creates (or updates) the Supabase Auth user for the admin and
-- sets its password. Required for silent admin sign-in, which is
-- what lets the admin panel write to RLS-protected tables and
-- upload product images.
--
-- BEFORE RUNNING:
--   1. Edit the password on the line marked  <<< EDIT THIS
--   2. Run this file in the Supabase SQL Editor
--   3. Put the SAME password in .env:
--        VITE_ADMIN_PASSWORD=<the password you chose>
--      then restart the dev server (and set the same variable
--      in Vercel for production).
-- ============================================================

DO $$
DECLARE
  admin_email   text := 'mahboobiqbal774@gmail.com';
  admin_pw      text := 'admin123';  -- <<< EDIT THIS
  user_id       uuid;
  hash          text;
  crypto_schema text;
BEGIN
  -- Locate pgcrypto (installed schema varies: extensions vs public)
  SELECT n.nspname INTO crypto_schema
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE e.extname = 'pgcrypto';

  IF crypto_schema IS NULL THEN
    EXECUTE 'CREATE EXTENSION pgcrypto WITH SCHEMA public';
    crypto_schema := 'public';
  END IF;

  IF admin_pw = 'CHANGE_ME_admin_pass_2026' THEN
    RAISE EXCEPTION 'Set a real password first: edit the admin_pw value (line marked EDIT THIS) before running this script.';
  END IF;

  EXECUTE format(
    'SELECT %I.crypt(%L, %I.gen_salt(''bf'', 10))',
    crypto_schema, admin_pw, crypto_schema
  ) INTO hash;

  SELECT id INTO user_id
  FROM auth.users
  WHERE lower(email) = lower(admin_email);

  IF user_id IS NULL THEN
    INSERT INTO auth.users (
      id, aud, role, email, encrypted_password,
      email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(), 'authenticated', 'authenticated', admin_email, hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now()
    );
    RAISE NOTICE 'Created admin auth user %', admin_email;
  ELSE
    UPDATE auth.users
    SET encrypted_password = hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = user_id;
    RAISE NOTICE 'Updated password for admin auth user %', admin_email;
  END IF;
END $$;

-- ============================================================
-- Verify: this should return 1 row (email, confirmed, provider)
--   SELECT email, email_confirmed_at IS NOT NULL AS confirmed,
--          raw_app_meta_data
--   FROM auth.users
--   WHERE email = 'mahboobiqbal774@gmail.com';
-- ============================================================
