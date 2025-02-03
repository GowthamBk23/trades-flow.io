-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS public.tasks CASCADE;

-- Create tasks table with proper structure
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    -- Store Clerk's user ID as TEXT (e.g., "user_2x...")
    user_id TEXT NOT NULL CHECK (user_id LIKE 'user_%')
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (disable RLS temporarily)
CREATE POLICY "Allow all operations temporarily"
    ON public.tasks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at(); 