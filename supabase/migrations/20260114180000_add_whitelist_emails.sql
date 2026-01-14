-- Allow specific emails to bypass user_roles whitelist
CREATE OR REPLACE FUNCTION public.is_whitelisted(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
  OR EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND lower(email) IN (
        'bartek.trunks@gmail.com',
        'aniaanisimowicz@gmail.com'
      )
  );
$$;
