-- Create user_analytics table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    location JSONB, -- {country, city, region, lat, lng}
    device_info JSONB, -- {type, os, browser}
    session_duration INTEGER DEFAULT 0, -- in seconds
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_analytics table for page view tracking
CREATE TABLE IF NOT EXISTS page_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page INTEGER DEFAULT 0, -- in seconds
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    exit_rate DECIMAL(5,2) DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_path, date)
);

-- Create system_logs table for logging
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level TEXT CHECK (level IN ('info', 'warning', 'error')) NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create funnel_analytics table for tracking user journey
CREATE TABLE IF NOT EXISTS funnel_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    funnel_name TEXT NOT NULL, -- e.g., 'visa_application', 'package_booking'
    stage TEXT NOT NULL,
    stage_order INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_events table for detailed event tracking
CREATE TABLE IF NOT EXISTS user_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    event_type TEXT NOT NULL, -- e.g., 'click', 'form_submit', 'page_view'
    event_name TEXT NOT NULL,
    event_data JSONB,
    page_path TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_last_activity ON user_analytics(last_activity);
CREATE INDEX idx_user_analytics_page_path ON user_analytics(page_path);
CREATE INDEX idx_page_analytics_page_path ON page_analytics(page_path);
CREATE INDEX idx_page_analytics_date ON page_analytics(date);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_funnel_analytics_user_id ON funnel_analytics(user_id);
CREATE INDEX idx_funnel_analytics_funnel_name ON funnel_analytics(funnel_name);
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_event_type ON user_events(event_type);

-- Create view for admin users with analytics data
CREATE OR REPLACE VIEW admin_users_analytics_view AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.is_active,
    p.created_at as joined_at,
    p.last_sign_in_at,
    COUNT(DISTINCT ua.session_id) as total_sessions,
    MAX(ua.last_activity) as last_activity,
    AVG(ua.session_duration) as avg_session_duration
FROM profiles p
LEFT JOIN user_analytics ua ON p.id = ua.user_id
GROUP BY p.id, p.email, p.full_name, p.role, p.is_active, p.created_at, p.last_sign_in_at;

-- Enable Row Level Security
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user_analytics
CREATE POLICY "Admin users can view all analytics" ON user_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert their own analytics" ON user_analytics
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "Users can update their own analytics" ON user_analytics
    FOR UPDATE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Create policies for page_analytics
CREATE POLICY "Admin users can manage page analytics" ON page_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Public can insert page analytics" ON page_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update page analytics" ON page_analytics
    FOR UPDATE USING (true);

-- Create policies for system_logs
CREATE POLICY "Admin users can view all logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert logs" ON system_logs
    FOR INSERT WITH CHECK (true);

-- Create policies for funnel_analytics
CREATE POLICY "Admin users can view all funnel analytics" ON funnel_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert their own funnel analytics" ON funnel_analytics
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Create policies for user_events
CREATE POLICY "Admin users can view all events" ON user_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert their own events" ON user_events
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Create function to update page analytics
CREATE OR REPLACE FUNCTION update_page_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO page_analytics (page_path, view_count, unique_visitors, date)
    VALUES (NEW.page_path, 1, 1, CURRENT_DATE)
    ON CONFLICT (page_path, date) 
    DO UPDATE SET 
        view_count = page_analytics.view_count + 1,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for page analytics
CREATE TRIGGER update_page_analytics_trigger
AFTER INSERT ON user_analytics
FOR EACH ROW
EXECUTE FUNCTION update_page_analytics();

-- Create function to log system events
CREATE OR REPLACE FUNCTION log_system_event(
    p_level TEXT,
    p_message TEXT,
    p_user_id UUID DEFAULT NULL,
    p_user_email TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO system_logs (level, message, user_id, user_email, metadata)
    VALUES (p_level, p_message, p_user_id, p_user_email, p_metadata)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to track funnel stage
CREATE OR REPLACE FUNCTION track_funnel_stage(
    p_user_id UUID,
    p_session_id UUID,
    p_funnel_name TEXT,
    p_stage TEXT,
    p_stage_order INTEGER,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_funnel_id UUID;
BEGIN
    INSERT INTO funnel_analytics (user_id, session_id, funnel_name, stage, stage_order, metadata)
    VALUES (p_user_id, p_session_id, p_funnel_name, p_stage, p_stage_order, p_metadata)
    RETURNING id INTO v_funnel_id;
    
    RETURN v_funnel_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get active users count
CREATE OR REPLACE FUNCTION get_active_users_count(p_minutes INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT user_id) INTO v_count
    FROM user_analytics
    WHERE last_activity >= NOW() - INTERVAL '1 minute' * p_minutes;
    
    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;