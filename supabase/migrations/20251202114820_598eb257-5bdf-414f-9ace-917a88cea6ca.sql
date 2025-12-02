-- Drop existing RLS policies to recreate with proper auth
DROP POLICY IF EXISTS "Anyone can create movies" ON public.movies;
DROP POLICY IF EXISTS "Anyone can view movies" ON public.movies;
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can create users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;

-- Movies RLS policies
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create movies" ON public.movies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update movies" ON public.movies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete movies" ON public.movies FOR DELETE TO authenticated USING (true);

-- Reviews RLS policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (user_id IN (SELECT user_id FROM public.users WHERE email = auth.email()));
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (user_id IN (SELECT user_id FROM public.users WHERE email = auth.email()));

-- Users RLS policies
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can create their profile" ON public.users FOR INSERT TO authenticated WITH CHECK (email = auth.email());
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (email = auth.email());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (email) DO UPDATE SET user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();