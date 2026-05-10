
-- ============================================================
-- 1. PROFILES TABLE (linked to Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'Agent' CHECK (role IN ('Agent', 'Client')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CLIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive')),
  login_email TEXT,
  login_password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster search
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients (phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients (status);
CREATE INDEX IF NOT EXISTS idx_clients_agent ON public.clients (agent_id);

-- ============================================================
-- 3. FAMILY MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_client ON public.family_members (client_id);

-- ============================================================
-- 4. DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL DEFAULT '',
  file_type TEXT NOT NULL DEFAULT 'FILE',
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_client ON public.documents (client_id);
CREATE INDEX IF NOT EXISTS idx_documents_family ON public.documents (family_member_id);

-- ============================================================
-- 5. BIRTHDAY WISHES TABLE (optional tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.birthday_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('client', 'family_member')),
  recipient_id UUID NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT,
  sent_by TEXT
);

-- ============================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_wishes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS POLICIES
-- ============================================================

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clients: Agents can do everything, Clients can only view their own
CREATE POLICY "Agents can manage all clients" ON public.clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Agent')
  );

CREATE POLICY "Clients can view own record" ON public.clients
  FOR SELECT USING (
    login_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Family Members: Agents can manage all, follows client access
CREATE POLICY "Agents can manage all family members" ON public.family_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Agent')
  );

CREATE POLICY "Clients can view own family" ON public.family_members
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE login_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Documents: Agents can manage all, Clients can view own
CREATE POLICY "Agents can manage all documents" ON public.documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Agent')
  );

CREATE POLICY "Clients can view own documents" ON public.documents
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE login_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Birthday wishes: Agents only
CREATE POLICY "Agents can manage birthday wishes" ON public.birthday_wishes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Agent')
  );

-- ============================================================
-- 8. ENABLE TRIGRAM EXTENSION (for text search)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 9. STORAGE BUCKET for Documents
-- ============================================================
-- Run this SEPARATELY in Supabase Dashboard > Storage > New Bucket
-- Bucket name: documents
-- Public: false (private)
--
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload/read
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- ============================================================
-- 10. SEED DATA (Optional — for testing)
-- ============================================================
-- Uncomment below to insert sample data for testing

/*
INSERT INTO public.clients (name, phone, email, date_of_birth, address, status) VALUES
  ('Anil Kapoor', '+91 98765 43210', 'anil.kapoor@email.com', '1985-05-12', '12, MG Road, Bangalore - 560001', 'Active'),
  ('Sunita Reddy', '+91 91234 56789', 'sunita.reddy@email.com', '1990-11-22', '45, Jubilee Hills, Hyderabad - 500033', 'Pending'),
  ('Vikram Malhotra', '+91 99887 76655', 'vikram.m@email.com', '1978-02-05', '78, Anna Nagar, Chennai - 600040', 'Active'),
  ('Priya Das', '+91 94455 66778', 'priya.das@email.com', '1992-09-18', '23, Salt Lake, Kolkata - 700091', 'Active'),
  ('Rohan Sharma', '+91 98877 11223', 'rohan.sharma@email.com', '1988-01-30', '56, Banjara Hills, Hyderabad - 500034', 'Active');
*/

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
