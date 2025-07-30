-- Create travel package bookings table
CREATE TABLE IF NOT EXISTS public.travel_package_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.travel_packages(id) ON DELETE SET NULL,
    package_name TEXT NOT NULL,
    package_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    travel_date DATE,
    number_of_travelers INTEGER DEFAULT 1,
    special_requests TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    booking_reference TEXT UNIQUE DEFAULT 'PKG-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_travel_package_bookings_user_id ON public.travel_package_bookings(user_id);
CREATE INDEX idx_travel_package_bookings_package_id ON public.travel_package_bookings(package_id);
CREATE INDEX idx_travel_package_bookings_status ON public.travel_package_bookings(status);
CREATE INDEX idx_travel_package_bookings_booking_reference ON public.travel_package_bookings(booking_reference);

-- Enable RLS
ALTER TABLE public.travel_package_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.travel_package_bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON public.travel_package_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (for cancellation)
CREATE POLICY "Users can update own bookings" ON public.travel_package_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for admin access through backend)
-- Admin access will be handled through service role in the application

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_travel_package_bookings_updated_at BEFORE UPDATE
    ON public.travel_package_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.travel_package_bookings TO authenticated;
GRANT ALL ON public.travel_package_bookings TO service_role;