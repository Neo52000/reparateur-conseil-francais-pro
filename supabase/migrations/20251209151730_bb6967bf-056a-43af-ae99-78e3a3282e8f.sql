-- Add department_code column to scraping_logs table
ALTER TABLE public.scraping_logs 
ADD COLUMN IF NOT EXISTS department_code TEXT;