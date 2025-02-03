-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    text TEXT NOT NULL,
    chat_type TEXT CHECK (chat_type IN ('staff', 'client')) NOT NULL,
    group_name TEXT DEFAULT 'General',
    user_id TEXT NOT NULL CHECK (user_id LIKE 'user_%')
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations temporarily
CREATE POLICY "Allow all operations temporarily"
    ON public.messages
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_chat_type ON public.messages(chat_type);
CREATE INDEX idx_messages_group_name ON public.messages(group_name);

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at(); 