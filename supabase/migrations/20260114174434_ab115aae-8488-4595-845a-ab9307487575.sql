-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'savings');

-- Create enum for expense categories
CREATE TYPE public.expense_category AS ENUM ('rachunki', 'kredyty', 'raty', 'jedzenie', 'inne');

-- Create enum for person
CREATE TYPE public.person_type AS ENUM ('Konki', 'Ania');

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type transaction_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'PLN',
    category expense_category,
    sub_category TEXT,
    person person_type NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    goal_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
    currency TEXT NOT NULL DEFAULT 'PLN',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for goal_id
ALTER TABLE public.transactions
ADD CONSTRAINT fk_transactions_goal
FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create user roles enum and table for whitelist
CREATE TYPE public.app_role AS ENUM ('owner', 'member');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has any role (is whitelisted)
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
$$;

-- RLS policies for transactions - only whitelisted users
CREATE POLICY "Whitelisted users can view all transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (public.is_whitelisted(auth.uid()));

CREATE POLICY "Whitelisted users can insert transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (public.is_whitelisted(auth.uid()));

CREATE POLICY "Whitelisted users can update transactions"
ON public.transactions FOR UPDATE
TO authenticated
USING (public.is_whitelisted(auth.uid()));

CREATE POLICY "Whitelisted users can delete transactions"
ON public.transactions FOR DELETE
TO authenticated
USING (public.is_whitelisted(auth.uid()));

-- RLS policies for goals - only whitelisted users
CREATE POLICY "Whitelisted users can view all goals"
ON public.goals FOR SELECT
TO authenticated
USING (public.is_whitelisted(auth.uid()));

CREATE POLICY "Whitelisted users can insert goals"
ON public.goals FOR INSERT
TO authenticated
WITH CHECK (public.is_whitelisted(auth.uid()));

CREATE POLICY "Whitelisted users can update goals"
ON public.goals FOR UPDATE
TO authenticated
USING (public.is_whitelisted(auth.uid()));

CREATE POLICY "Whitelisted users can delete goals"
ON public.goals FOR DELETE
TO authenticated
USING (public.is_whitelisted(auth.uid()));

-- RLS for user_roles - users can only see their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert starter goals
INSERT INTO public.goals (name, target_amount, currency) VALUES
('Wycieczka', 16000, 'PLN'),
('Nowa rogówka', 3500, 'PLN');