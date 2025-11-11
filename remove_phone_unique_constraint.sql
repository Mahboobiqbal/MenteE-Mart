-- Remove the unique constraint on the phone number field in the customers table
-- This allows multiple customers to have the same phone number

-- First, let's check if the constraint exists
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.customers'::regclass AND conname = 'customers_phone_key';

-- Now remove the constraint
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_phone_key;

-- Verify the constraint has been removed
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.customers'::regclass AND conname = 'customers_phone_key';