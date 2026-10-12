-- ============================================================
-- fix_admin_policies.sql
-- Repairs admin RLS policies: an authenticated admin session is
-- being denied on INSERT (HTTP 403) even though the session is
-- valid. Run ONCE in the Supabase SQL Editor (idempotent).
-- ============================================================

-- 1) Remove any RESTRICTIVE policies on app tables.
--    Restrictive policies must ALL pass and can silently block
--    inserts even when a permissive admin policy passes.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname::text AS tbl, p.polname
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND p.polpermissive = false
      AND c.relname IN (
        'stores','categories','products','orders',
        'order_items','areas','customers','payment_records'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.polname, r.tbl);
    RAISE NOTICE 'Dropped RESTRICTIVE policy % on %', r.polname, r.tbl;
  END LOOP;
END $$;

-- 2) Recreate the admin full-access policy on every app table.
--    FOR ALL covers SELECT/INSERT/UPDATE/DELETE for the signed-in
--    admin identity. Public read policies are untouched.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'stores','categories','products','orders',
    'order_items','areas','customers','payment_records'
  ] LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "Admin full access" ON %I', t);
    EXECUTE format(
      $p$
      CREATE POLICY "Admin full access" ON %I FOR ALL
      USING (
        auth.role() = 'authenticated'
        AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
      )
      WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.jwt() ->> 'email' = 'mahboobiqbal774@gmail.com'
      )
      $p$,
      t
    );
  END LOOP;
  RAISE NOTICE 'Admin full access policies recreated on 8 tables';
END $$;

-- ============================================================
-- DIAGNOSTIC: paste this result if inserts still return 403.
-- You should see "Admin full access" with USING/WITH CHECK
-- containing your email for every table.
-- ============================================================
SELECT
  c.relname AS table_name,
  p.polname AS policy_name,
  CASE WHEN p.polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS kind,
  p.polcmd::text AS cmd,
  pg_get_expr(p.polqual, p.polrelid) AS using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'stores','categories','products','orders',
    'order_items','areas','customers','payment_records'
  )
ORDER BY c.relname, p.polname;
