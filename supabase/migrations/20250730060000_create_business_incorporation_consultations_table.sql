-- Create business_incorporation_consultations table
CREATE TABLE IF NOT EXISTS public.business_incorporation_consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    message TEXT,
    service_type VARCHAR(50) DEFAULT 'business-incorporation',
    preferred_country VARCHAR(50), -- indonesia, malaysia, singapore, uk
    business_type VARCHAR(100), -- e.g., private limited, LLC, etc.
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
    notes TEXT, -- Internal notes for admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX idx_business_consultations_email ON public.business_incorporation_consultations(email);
CREATE INDEX idx_business_consultations_status ON public.business_incorporation_consultations(status);
CREATE INDEX idx_business_consultations_created_at ON public.business_incorporation_consultations(created_at DESC);

-- Enable RLS
ALTER TABLE public.business_incorporation_consultations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert (submit consultation request)
CREATE POLICY "Anyone can submit business consultation" ON public.business_incorporation_consultations
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated users to view all consultations (for admin)
CREATE POLICY "Authenticated users can view all business consultations" ON public.business_incorporation_consultations
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to update consultations (for admin)
CREATE POLICY "Authenticated users can update business consultations" ON public.business_incorporation_consultations
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete consultations (for admin)
CREATE POLICY "Authenticated users can delete business consultations" ON public.business_incorporation_consultations
    FOR DELETE TO authenticated
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_consultation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_business_consultation_updated_at_trigger
    BEFORE UPDATE ON public.business_incorporation_consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_business_consultation_updated_at();

-- Grant permissions
GRANT ALL ON public.business_incorporation_consultations TO authenticated;
GRANT INSERT ON public.business_incorporation_consultations TO anon;