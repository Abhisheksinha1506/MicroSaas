-- SQL Script to set up the votes table in Supabase

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_index INTEGER NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow anyone to cast a vote (Anons can insert)
CREATE POLICY "Enable insert for authenticated users only" ON public.votes
    FOR INSERT WITH CHECK (true);

-- Allow everyone to see the votes (Anons can read)
CREATE POLICY "Enable read access for all users" ON public.votes
    FOR SELECT USING (true);

-- 4. Instruction for checking counts per idea:
-- SELECT idea_index, count(*) FROM votes GROUP BY idea_index;
