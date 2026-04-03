-- SECURITY: Remove UPDATE and DELETE policies from quiz_responses to ensure immutability
DROP POLICY IF EXISTS "Users can update their own quiz responses" ON quiz_responses;
DROP POLICY IF EXISTS "Users can delete their own quiz answers" ON quiz_responses;

-- Add admin-only SELECT policy for profiles (admins can view all profiles)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin-only SELECT for quiz_responses
CREATE POLICY "Admins can view all quiz responses"
ON quiz_responses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));