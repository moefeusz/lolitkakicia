-- Ensure user_roles is locked down and supports upsert by user_id

-- 1) Ensure RLS is enabled (idempotent)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) Prevent duplicate role rows per user (needed for upsert on user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'user_roles'
      AND c.contype = 'u'
      AND c.conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 3) Explicitly deny write operations from the client (service/admin bypasses RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_roles' AND policyname='Deny inserts to user_roles'
  ) THEN
    CREATE POLICY "Deny inserts to user_roles"
      ON public.user_roles
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_roles' AND policyname='Deny updates to user_roles'
  ) THEN
    CREATE POLICY "Deny updates to user_roles"
      ON public.user_roles
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (false)
      WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_roles' AND policyname='Deny deletes from user_roles'
  ) THEN
    CREATE POLICY "Deny deletes from user_roles"
      ON public.user_roles
      AS RESTRICTIVE
      FOR DELETE
      TO authenticated
      USING (false);
  END IF;
END $$;