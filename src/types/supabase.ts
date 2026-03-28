// Database schema types for RITHand

export type AppRole = "app_admin" | null;

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  app_role: AppRole;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: "admin" | "member";
  created_at: string;
};

export type License = {
  id: string;
  organization_id: string;
  vendor_id: string;
  license_key: string | null;
  expiry_date: string | null;
  created_at: string;
};

export type OrganizationVendor = {
  id: string;
  organization_id: string;
  vendor_id: string;
  added_at: string;
};

export type UserNewsState = {
  id: string;
  user_id: string;
  news_id: string;
  is_read: boolean;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
};

export type OrganizationFramework = {
  id: string;
  organization_id: string;
  framework_name: string; // e.g., "CIS", "NIST", "CMMC"
  created_at: string;
};

export type ComplianceItem = {
  id: string;
  framework_id: string;
  item_name: string;
  description: string | null;
  created_at: string;
};

export type OrganizationComplianceItem = {
  id: string;
  organization_id: string;
  compliance_item_id: string;
  is_checked: boolean;
  created_at: string;
};

export type EolItem = {
  id: string;
  organization_id: string;
  product_name: string;
  eol_date: string;
  vendor_id: string | null;
  created_at: string;
};

export type CveAlert = {
  id: string;
  organization_id: string;
  cve_id: string;
  vendor_id: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string | null;
  created_at: string;
};
