"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Building2,
  Plus,
  ChevronRight,
  X,
  Globe,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAdminLevel,
  getAllOrganizations,
  createOrganizationAsAdmin,
  deleteOrganization,
  getAllUsers,
  assignUserToOrg,
} from "./actions";

type Organization = {
  id: string;
  name: string;
  created_at: string;
  organization_members: { count: number }[];
};

type AppUser = {
  id: string;
  full_name: string | null;
  app_role: string | null;
  onboarded: boolean;
  created_at: string;
};

type TabType = "organizations" | "all-users";

export default function AdminPage() {
  const router = useRouter();
  const [adminLevel, setAdminLevel] = useState<
    "app_admin" | "org_admin" | null
  >(null);
  const [tab, setTab] = useState<TabType>("organizations");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { level, orgId } = await getAdminLevel();
      setAdminLevel(level);

      // Org admins go directly to their org detail page
      if (level === "org_admin" && orgId) {
        router.replace(`/app/admin/organizations/${orgId}`);
        return;
      }

      if (level === "app_admin") {
        const [orgsRes, usersRes] = await Promise.all([
          getAllOrganizations(),
          getAllUsers(),
        ]);
        if (orgsRes.data) setOrganizations(orgsRes.data as Organization[]);
        if (usersRes.data) setAllUsers(usersRes.data as AppUser[]);
      }
    } catch {
      setError("Failed to load data");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Only app admins see this page — org admins are redirected above
  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Shield; count: number }[] = [
    {
      key: "organizations",
      label: "Organizations",
      icon: Globe,
      count: organizations.length,
    },
    {
      key: "all-users",
      label: "All Users",
      icon: Users,
      count: allUsers.length,
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Application administration — manage organizations and users
          </p>
        </div>
        <span className="ml-auto text-[10px] font-bold uppercase px-2 py-1 rounded bg-red-100 text-red-700">
          App Admin
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "organizations" ? (
        <OrganizationsTab
          organizations={organizations}
          showNewOrg={showNewOrg}
          setShowNewOrg={setShowNewOrg}
          onReload={loadData}
          setError={setError}
        />
      ) : (
        <AllUsersTab
          users={allUsers}
          organizations={organizations}
          onReload={loadData}
          setError={setError}
        />
      )}
    </div>
  );
}

// ─── Organizations Tab ───────────────────────────────────────────────────────

function OrganizationsTab({
  organizations,
  showNewOrg,
  setShowNewOrg,
  onReload,
  setError,
}: {
  organizations: Organization[];
  showNewOrg: boolean;
  setShowNewOrg: (v: boolean) => void;
  onReload: () => void;
  setError: (e: string | null) => void;
}) {
  const [newOrgName, setNewOrgName] = useState("");

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    try {
      const result = await createOrganizationAsAdmin(newOrgName.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setNewOrgName("");
        setShowNewOrg(false);
        onReload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    }
  }

  async function handleDeleteOrg(
    e: React.MouseEvent,
    orgId: string,
    orgName: string
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete organization "${orgName}"? This cannot be undone.`))
      return;
    try {
      const result = await deleteOrganization(orgId);
      if (result.error) setError(result.error);
      else onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete organization");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Click an organization to manage its users and clients
        </p>
        <button
          onClick={() => setShowNewOrg(!showNewOrg)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Organization
        </button>
      </div>

      {showNewOrg && (
        <form
          onSubmit={handleCreateOrg}
          className="mb-6 p-4 rounded-xl border border-border bg-card flex gap-3"
        >
          <input
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organization name..."
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowNewOrg(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted"
          >
            Cancel
          </button>
        </form>
      )}

      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No organizations yet. Create the first one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/app/admin/organizations/${org.id}`}
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {org.name}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteOrg(e, org.id, org.name)}
                  className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete organization"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {org.organization_members?.[0]?.count ?? 0} users
                </span>
                <span>
                  Created {new Date(org.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── All Users Tab ───────────────────────────────────────────────────────────

function AllUsersTab({
  users,
  organizations,
  onReload,
  setError,
}: {
  users: AppUser[];
  organizations: Organization[];
  onReload: () => void;
  setError: (e: string | null) => void;
}) {
  const [assigningUser, setAssigningUser] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member");

  async function handleAssign() {
    if (!assigningUser || !selectedOrg) return;
    try {
      const result = await assignUserToOrg(assigningUser, selectedOrg, selectedRole);
      if (result.error) {
        setError(result.error);
      } else {
        setAssigningUser(null);
        setSelectedOrg("");
        onReload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign user");
    }
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        All registered users across the application
      </p>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {user.full_name || "Unnamed User"}
                    </span>
                    {user.app_role === "app_admin" && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        App Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAssigningUser(assigningUser === user.id ? null : user.id)
                  }
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {assigningUser === user.id ? "Cancel" : "Assign to Org"}
                </button>
              </div>

              {assigningUser === user.id && (
                <div className="mt-3 flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Organization
                    </label>
                    <select
                      value={selectedOrg}
                      onChange={(e) => setSelectedOrg(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id} className="bg-card text-foreground">
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as "admin" | "member")
                      }
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="member" className="bg-card text-foreground">Member</option>
                      <option value="admin" className="bg-card text-foreground">Admin</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedOrg}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
