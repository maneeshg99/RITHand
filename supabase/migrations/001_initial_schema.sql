-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Profiles table (auto-created from auth.users) ────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── Organizations table ────────────────────────────────────────────────────

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
-- Members of org can read organization
CREATE POLICY "Org members can read organization" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = id AND user_id = auth.uid()
    )
  );

-- ─── Organization Members table ─────────────────────────────────────────────

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_members
-- Members can read members in their org
CREATE POLICY "Members can read org members" ON organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Only admins can insert/update/delete members
CREATE POLICY "Admins can insert members" ON organization_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    )
  );

CREATE POLICY "Admins can update members" ON organization_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete members" ON organization_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    )
  );

-- ─── Licenses table ─────────────────────────────────────────────────────────

CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,
  license_key TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for licenses
-- Org members can read licenses
CREATE POLICY "Org members can read licenses" ON licenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = licenses.organization_id
      AND user_id = auth.uid()
    )
  );

-- Org admins can insert/update/delete licenses
CREATE POLICY "Org admins can insert licenses" ON licenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = licenses.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Org admins can update licenses" ON licenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = licenses.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Org admins can delete licenses" ON licenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = licenses.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ─── Organization Vendors table ─────────────────────────────────────────────

CREATE TABLE organization_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, vendor_id)
);

ALTER TABLE organization_vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_vendors
-- Org members can read vendors
CREATE POLICY "Org members can read vendors" ON organization_vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_vendors.organization_id
      AND user_id = auth.uid()
    )
  );

-- Org admins can insert/update/delete vendors
CREATE POLICY "Org admins can insert vendors" ON organization_vendors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_vendors.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Org admins can update vendors" ON organization_vendors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_vendors.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Org admins can delete vendors" ON organization_vendors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_vendors.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ─── User News State table ──────────────────────────────────────────────────

CREATE TABLE user_news_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  news_id TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, news_id)
);

ALTER TABLE user_news_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_news_state
-- Users can read/write only their own news state
CREATE POLICY "Users can read own news state" ON user_news_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own news state" ON user_news_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own news state" ON user_news_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own news state" ON user_news_state
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Organization Frameworks table ──────────────────────────────────────────

CREATE TABLE organization_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  framework_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, framework_name)
);

ALTER TABLE organization_frameworks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_frameworks
-- Org members can read frameworks
CREATE POLICY "Org members can read frameworks" ON organization_frameworks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_frameworks.organization_id
      AND user_id = auth.uid()
    )
  );

-- Org admins can insert/update/delete frameworks
CREATE POLICY "Org admins can insert frameworks" ON organization_frameworks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_frameworks.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Org admins can update frameworks" ON organization_frameworks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_frameworks.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Org admins can delete frameworks" ON organization_frameworks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_frameworks.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ─── Organization Compliance Items table ────────────────────────────────────

CREATE TABLE organization_compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  framework_id UUID NOT NULL REFERENCES organization_frameworks ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE organization_compliance_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_compliance_items
-- Org members can read items
CREATE POLICY "Org members can read compliance items" ON organization_compliance_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_compliance_items.organization_id
      AND user_id = auth.uid()
    )
  );

-- Org members can update their own checks, admins can manage
CREATE POLICY "Org members can update compliance items" ON organization_compliance_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_compliance_items.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can insert compliance items" ON organization_compliance_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_compliance_items.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Org admins can delete compliance items" ON organization_compliance_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_compliance_items.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ─── EOL Items table ────────────────────────────────────────────────────────

CREATE TABLE organization_eol_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  eol_date DATE NOT NULL,
  vendor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE organization_eol_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_eol_items
-- Org members can read EOL items
CREATE POLICY "Org members can read EOL items" ON organization_eol_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_eol_items.organization_id
      AND user_id = auth.uid()
    )
  );

-- Org members can insert/update/delete
CREATE POLICY "Org members can insert EOL items" ON organization_eol_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_eol_items.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can update EOL items" ON organization_eol_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_eol_items.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can delete EOL items" ON organization_eol_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_eol_items.organization_id
      AND user_id = auth.uid()
    )
  );

-- ─── CVE Alerts table ───────────────────────────────────────────────────────

CREATE TABLE organization_cve_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  cve_id TEXT NOT NULL,
  vendor_id TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, cve_id)
);

ALTER TABLE organization_cve_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_cve_alerts
-- Org members can read CVE alerts
CREATE POLICY "Org members can read CVE alerts" ON organization_cve_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_cve_alerts.organization_id
      AND user_id = auth.uid()
    )
  );

-- Org members can insert/update/delete
CREATE POLICY "Org members can insert CVE alerts" ON organization_cve_alerts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_cve_alerts.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can update CVE alerts" ON organization_cve_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_cve_alerts.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can delete CVE alerts" ON organization_cve_alerts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_cve_alerts.organization_id
      AND user_id = auth.uid()
    )
  );

-- ─── Trigger to auto-create profile on signup ──────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
