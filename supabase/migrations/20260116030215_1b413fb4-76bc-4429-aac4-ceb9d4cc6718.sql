-- Add length constraints for text fields in transactions table
ALTER TABLE public.transactions 
ADD CONSTRAINT note_length CHECK (note IS NULL OR length(note) <= 500);

ALTER TABLE public.transactions 
ADD CONSTRAINT sub_category_length CHECK (sub_category IS NULL OR length(sub_category) <= 100);

-- Add amount positive constraint if not exists (ensure amount > 0)
ALTER TABLE public.transactions 
ADD CONSTRAINT amount_positive CHECK (amount > 0);