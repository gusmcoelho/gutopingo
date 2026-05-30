-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create payment_intents table
CREATE TABLE public.payment_intents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    price_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    provider TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Use GRANT to set permissions
GRANT SELECT ON public.payment_intents TO authenticated;
GRANT ALL ON public.payment_intents TO service_role;

-- Enable Row Level Security
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment intents" 
ON public.payment_intents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payment_intents_updated_at
BEFORE UPDATE ON public.payment_intents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
