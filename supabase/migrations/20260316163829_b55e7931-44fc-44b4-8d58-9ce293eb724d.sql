
-- Allow reading other users' interactions for user profiles
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.user_interactions;
CREATE POLICY "Interactions are publicly readable"
  ON public.user_interactions FOR SELECT
  TO authenticated
  USING (true);
