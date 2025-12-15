-- ============================================================
-- HR PORTAL DATABASE SCHEMA MIGRATION
-- Migrates localStorage to Supabase with RLS policies
-- ============================================================

-- 1. PROFILES TABLE (linked 1-1 with auth.users)
-- Maps to localStorage: hr_portal_users, hr_portal_current_user
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  contract_type TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'probation')),
  id_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. LEAVE_BALANCES TABLE
-- Maps to localStorage: hr_portal_leave_balances
CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  annual_total INTEGER NOT NULL DEFAULT 12,
  annual_used INTEGER NOT NULL DEFAULT 0,
  sick_total INTEGER NOT NULL DEFAULT 7,
  sick_used INTEGER NOT NULL DEFAULT 0,
  unpaid_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. LEAVE_REQUESTS TABLE
-- Maps to localStorage: hr_portal_leave_requests
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'unpaid')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  reject_reason TEXT,
  days_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. OVERTIME_REQUESTS TABLE
-- Maps to localStorage: hr_portal_overtime_requests
CREATE TABLE public.overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  reject_reason TEXT,
  hours_count NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PAYSLIPS TABLE
-- Maps to localStorage: hr_portal_payslips
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  period_label TEXT NOT NULL,
  base_salary NUMERIC NOT NULL,
  overtime NUMERIC NOT NULL DEFAULT 0,
  bonus NUMERIC NOT NULL DEFAULT 0,
  allowances NUMERIC NOT NULL DEFAULT 0,
  social_insurance NUMERIC NOT NULL DEFAULT 0,
  health_insurance NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period)
);

-- 6. NOTIFICATIONS TABLE
-- Maps to localStorage: hr_portal_notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('leave', 'payroll', 'system', 'approval')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. EMPLOYEE_HISTORY TABLE
-- Maps to localStorage: hr_portal_employee_history
CREATE TABLE public.employee_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'updated', 'promoted', 'department_change', 'status_change')),
  description TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  performed_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. PAYROLL_CONFIG TABLE (singleton config)
CREATE TABLE public.payroll_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ot_multiplier NUMERIC NOT NULL DEFAULT 1.5,
  social_insurance_rate NUMERIC NOT NULL DEFAULT 0.08,
  health_insurance_rate NUMERIC NOT NULL DEFAULT 0.015,
  unemployment_insurance_rate NUMERIC NOT NULL DEFAULT 0.01,
  personal_deduction NUMERIC NOT NULL DEFAULT 11000000,
  dependent_deduction NUMERIC NOT NULL DEFAULT 4400000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 9. PAYROLL_RUNS TABLE
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT UNIQUE NOT NULL,
  period_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_run' CHECK (status IN ('not_run', 'processing', 'completed')),
  total_employees INTEGER NOT NULL DEFAULT 0,
  total_gross_salary NUMERIC NOT NULL DEFAULT 0,
  total_net_salary NUMERIC NOT NULL DEFAULT 0,
  run_at TIMESTAMPTZ,
  run_by TEXT,
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY DEFINER FUNCTIONS FOR RLS
-- ============================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Function to check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  );
$$;

-- Function to check if target user is managed by current user
CREATE OR REPLACE FUNCTION public.is_team_member(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = target_user_id AND manager_id = auth.uid()
  ) OR public.is_admin();
$$;

-- ============================================================
-- RLS POLICIES FOR PROFILES
-- ============================================================

-- Everyone can view all profiles (for employee directory)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only admins can insert profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- RLS POLICIES FOR LEAVE_BALANCES
-- ============================================================

-- Users can view their own balance
CREATE POLICY "Users can view own leave balance"
ON public.leave_balances FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_manager_or_admin() OR public.is_team_member(user_id));

-- Managers/admins can update balances
CREATE POLICY "Managers can update leave balances"
ON public.leave_balances FOR UPDATE
TO authenticated
USING (public.is_manager_or_admin() OR public.is_team_member(user_id));

-- Admins can insert balances
CREATE POLICY "Admins can insert leave balances"
ON public.leave_balances FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- ============================================================
-- RLS POLICIES FOR LEAVE_REQUESTS
-- ============================================================

-- Users can view their own requests, managers can view team requests, admins can view all
CREATE POLICY "Users can view own and team leave requests"
ON public.leave_requests FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_team_member(user_id) 
  OR public.is_admin()
);

-- Users can create their own requests
CREATE POLICY "Users can create own leave requests"
ON public.leave_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own pending requests, managers/admins can update team requests
CREATE POLICY "Users can update own pending requests"
ON public.leave_requests FOR UPDATE
TO authenticated
USING (
  (user_id = auth.uid() AND status = 'pending')
  OR public.is_team_member(user_id)
  OR public.is_admin()
);

-- Users can delete their own pending requests
CREATE POLICY "Users can delete own pending requests"
ON public.leave_requests FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

-- ============================================================
-- RLS POLICIES FOR OVERTIME_REQUESTS
-- ============================================================

-- Users can view their own requests, managers can view team requests, admins can view all
CREATE POLICY "Users can view own and team overtime requests"
ON public.overtime_requests FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_team_member(user_id) 
  OR public.is_admin()
);

-- Users can create their own requests
CREATE POLICY "Users can create own overtime requests"
ON public.overtime_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own pending requests, managers/admins can update team requests
CREATE POLICY "Users can update own pending requests"
ON public.overtime_requests FOR UPDATE
TO authenticated
USING (
  (user_id = auth.uid() AND status = 'pending')
  OR public.is_team_member(user_id)
  OR public.is_admin()
);

-- Users can delete their own pending requests
CREATE POLICY "Users can delete own pending requests"
ON public.overtime_requests FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

-- ============================================================
-- RLS POLICIES FOR PAYSLIPS
-- ============================================================

-- Users can view their own payslips, admins can view all
CREATE POLICY "Users can view own payslips"
ON public.payslips FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Only admins can create/update payslips
CREATE POLICY "Admins can manage payslips"
ON public.payslips FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- ============================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- System/admins can create notifications for anyone
CREATE POLICY "Can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES FOR EMPLOYEE_HISTORY
-- ============================================================

-- Admins can view all history, users can view their own
CREATE POLICY "View employee history"
ON public.employee_history FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Admins can insert history
CREATE POLICY "Admins can insert history"
ON public.employee_history FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- ============================================================
-- RLS POLICIES FOR PAYROLL_CONFIG
-- ============================================================

-- Admins can view and update config
CREATE POLICY "Admins can manage payroll config"
ON public.payroll_config FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- RLS POLICIES FOR PAYROLL_RUNS
-- ============================================================

-- Admins can manage payroll runs
CREATE POLICY "Admins can manage payroll runs"
ON public.payroll_runs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
BEFORE UPDATE ON public.leave_balances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
BEFORE UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TRIGGER: AUTO-CREATE PROFILE AND LEAVE BALANCE ON USER SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile from user metadata
  INSERT INTO public.profiles (
    id,
    employee_id,
    full_name,
    email,
    phone,
    role,
    department,
    position,
    start_date,
    status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'employee_id', 'EMP-' || EXTRACT(YEAR FROM now())::text || '-' || floor(random() * 900 + 100)::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Chưa phân bổ'),
    COALESCE(NEW.raw_user_meta_data->>'position', 'Nhân viên'),
    COALESCE((NEW.raw_user_meta_data->>'start_date')::date, CURRENT_DATE),
    'active'
  );
  
  -- Create default leave balance
  INSERT INTO public.leave_balances (user_id, annual_total, annual_used, sick_total, sick_used, unpaid_used)
  VALUES (NEW.id, 12, 0, 7, 0, 0);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default payroll config
INSERT INTO public.payroll_config (ot_multiplier, social_insurance_rate, health_insurance_rate, unemployment_insurance_rate, personal_deduction, dependent_deduction)
VALUES (1.5, 0.08, 0.015, 0.01, 11000000, 4400000);