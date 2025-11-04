-- Create demo_leads table to store email addresses from the landing page demo
CREATE TABLE IF NOT EXISTS public.demo_leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    website_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS demo_leads_email_idx ON public.demo_leads(email);

-- Add index for created_at for sorting/filtering
CREATE INDEX IF NOT EXISTS demo_leads_created_at_idx ON public.demo_leads(created_at DESC);

-- Enable RLS
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for the API to save leads)
CREATE POLICY "Allow public inserts" ON public.demo_leads
    FOR INSERT
    WITH CHECK (true);
