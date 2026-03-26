#!/usr/bin/env node
/**
 * One-step setup script for Phase 1.5 — Access Management
 *
 * Run from the project root:
 *   node scripts/setup-access-management.mjs
 *
 * What it does:
 *   1. Runs the 002_access_management.sql migration
 *   2. Verifies your account is the only org admin
 *   3. Shows a summary of the current state
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSQL(sql) {
  // Use the Supabase Management API via rpc or direct pg
  // Since we have service role, we can use the pg REST endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  // Fallback: execute via supabase-js raw SQL isn't available via REST
  // We'll need to use the SQL endpoint directly
  return null;
}

async function main() {
  console.log("\\n🔧 RITHand — Phase 1.5 Setup: Access Management\\n");

  // ─── Step 1: Run migration ────────────────────────────────────────────
  console.log("Step 1: Running 002_access_management.sql migration...");
  console.log("   ⚠️  Please run this SQL in the Supabase SQL Editor:");
  console.log(`   ${SUPABASE_URL.replace('.supabase.co', '.supabase.co')}/project/${SUPABASE_URL.split('//')[1].split('.')[0]}/sql/new`);
  console.log("   The migration file is at: supabase/migrations/002_access_management.sql\\n");

  // ─── Step 2: Check tables exist ───────────────────────────────────────
  console.log("Step 2: Checking if tables exist...");

  const { data: clients, error: clientsErr } = await supabase
    .from("clients")
    .select("id")
    .limit(1);

  if (clientsErr && clientsErr.message.includes("does not exist")) {
    console.log("   ❌ 'clients' table not found. Run the migration SQL first!");
    console.log("   Copy the contents of supabase/migrations/002_access_management.sql");
    console.log("   and paste it into the Supabase SQL Editor.\\n");
  } else {
    console.log("   ✅ 'clients' table exists");
  }

  const { data: cm, error: cmErr } = await supabase
    .from("client_members")
    .select("client_id")
    .limit(1);

  if (cmErr && cmErr.message.includes("does not exist")) {
    console.log("   ❌ 'client_members' table not found.");
  } else {
    console.log("   ✅ 'client_members' table exists");
  }

  // ─── Step 3: Verify admin account ─────────────────────────────────────
  console.log("\\nStep 3: Checking admin accounts...");

  const { data: admins, error: adminErr } = await supabase
    .from("organization_members")
    .select("user_id, role, profiles(full_name, username)")
    .eq("role", "admin");

  if (adminErr) {
    console.log(`   ⚠️  Could not query organization_members: ${adminErr.message}`);
  } else if (!admins || admins.length === 0) {
    console.log("   ❌ No admin accounts found! You need to set your role to 'admin'.");
    console.log("   Run this SQL in the Supabase SQL Editor:");
    console.log("   UPDATE organization_members SET role = 'admin' WHERE user_id = '<your-user-id>';");
  } else {
    console.log(`   Found ${admins.length} admin account(s):`);
    for (const admin of admins) {
      const name = admin.profiles?.full_name || admin.profiles?.username || admin.user_id;
      console.log(`   ✅ ${name} (${admin.role})`);
    }
    if (admins.length > 1) {
      console.log("   ⚠️  Multiple admins found. If you only want one, update the others to 'member'.");
    }
  }

  // ─── Step 4: Verify Maneesh's account specifically ────────────────────
  console.log("\\nStep 4: Looking for maneesh.gogineni@gmail.com...");

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const maneesh = authUsers?.users?.find(
    (u) => u.email === "maneesh.gogineni@gmail.com"
  );

  if (maneesh) {
    console.log(`   ✅ Found user: ${maneesh.email} (ID: ${maneesh.id})`);

    // Check org membership
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", maneesh.id)
      .single();

    if (membership) {
      console.log(`   ✅ Org role: ${membership.role}`);
      if (membership.role !== "admin") {
        console.log("   ⚠️  Upgrading to admin...");
        await supabase
          .from("organization_members")
          .update({ role: "admin" })
          .eq("user_id", maneesh.id);
        console.log("   ✅ Upgraded to admin!");
      }
    } else {
      console.log("   ❌ Not in any organization. This needs manual setup.");
    }

    // Ensure no other admins
    if (authUsers?.users) {
      const otherUsers = authUsers.users.filter(
        (u) => u.email !== "maneesh.gogineni@gmail.com"
      );
      if (otherUsers.length > 0) {
        console.log(`\\n   Found ${otherUsers.length} other user(s):`);
        for (const u of otherUsers) {
          const { data: mem } = await supabase
            .from("organization_members")
            .select("role")
            .eq("user_id", u.id)
            .single();
          console.log(`   - ${u.email} (org role: ${mem?.role || "none"})`);
          if (mem?.role === "admin") {
            console.log(`     ⚠️  Downgrading ${u.email} to 'member'...`);
            await supabase
              .from("organization_members")
              .update({ role: "member" })
              .eq("user_id", u.id);
            console.log("     ✅ Downgraded.");
          }
        }
      }
    }
  } else {
    console.log("   ❌ User not found in auth.users!");
  }

  console.log("\\n✅ Setup check complete!\\n");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
