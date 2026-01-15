-- Create function to auto-whitelist users on registration
CREATE OR REPLACE FUNCTION public.handle_new_user_whitelist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  -- Check if user email is in whitelist
  IF NEW.email = 'bartek.trunks@gmail.com' THEN
    user_role := 'owner';
  ELSIF NEW.email = 'aniaanisimowicz@gmail.com' THEN
    user_role := 'member';
  ELSE
    RETURN NEW;
  END IF;
  
  -- Insert role for whitelisted user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-whitelist on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_whitelist ON auth.users;
CREATE TRIGGER on_auth_user_created_whitelist
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_whitelist();