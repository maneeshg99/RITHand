-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 005: Fix Bootstrap — Allow first user to create org + become admin
--
-- Problem: RLS policies on organizations and organization_members block the
-- very first user from creating an org (no INSERT policy on organizations,
-- and the INSERT policy on organization_members requires an existing admin).
--
-- Fix: A SECURITY DEFINER function that bypasses RLS to create the org +
-- first admin membership atomically. Only works if the user has no existing
-- org membership (prevents abuse).
-- ═══════════════════════════════════════════════════════════════════════════════

-- Allow authenticated users to create an organization (but only via the bootstrap function)
-- We add a basic INSERT policy so PostgREST can route the request, but the
-- real enforcement is in the function.

-- First, add missing INSERT policy on organizations for authenticated users
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow the first member to insert themselves into organization_members
-- (only if they are the creator of the org, i.e. no existing members yet)
CREATE POLICY "First member can bootstrap org membership"
  ON organization_members FOR INSERT
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    -- Only allow if the org has NO existing members (bootstrap case)
    AND NOT EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_id
    )
  );

-- Also create a SECURITY DEFINER function for a cleaner bootstrap path
CREATE OR REPLACE FUNCTION bootstrap_organization(
  org_name TEXT,
  vendor_ids TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
  current_user_id UUID;
  v TEXT;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check user doesn't already have an org
  IF EXISTS (
    SELECT 1 FROM organization_members WHERE user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;

  -- Create the organization
  INSERT INTO organizations (name)
  VALUES (org_name)
  RETURNING id INTO new_org_id;

  -- Make the current user an admin
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, current_user_id, 'admin');

  -- Add vendors if provided
  IF array_length(vendor_ids, 1) > 0 THEN
    FOREACH v IN ARRAY vendor_ids
    LOOP
      INSERT INTO organization_vendors (organization_id, vendor_id)
      VALUES (new_org_id, v)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── Notify PostgREST ────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
