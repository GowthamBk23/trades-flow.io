-- Drop existing table and policies
DROP TABLE IF EXISTS public.invoices CASCADE;

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id TEXT NOT NULL CHECK (user_id LIKE 'user_%'),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue')) NOT NULL DEFAULT 'draft',
    amount DECIMAL(10,2) NOT NULL,
    due_date TIMESTAMPTZ,
    client_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for invoices table
CREATE POLICY "Enable all access for authenticated users"
    ON public.invoices
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at(); 