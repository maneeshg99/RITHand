"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Building2,
  Plus,
  ChevronRight,
  X,
  Globe,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getClients,
  getOrgMembers,
  createClient,
  getAdminLevel,
  getAllOrganizations,
  createOrganizationAsAdmin,
  deleteOrganization,
  getAllUsers,
  assignUserToOrg,
} from "./actions";

type Client = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  primary_contact: string | null;
  contact_email: string | null;
  created_at: string;
};

type OrgMember = {
  user_id: string;
  role: string;
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
  } | null;
};

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

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  onboarding: "bg-blue-100 text-blue-700",
  offboarding: "bg-yellow-100 text-yellow-700",
  inactive: "bg-slate-100 text-slate-500",
};

type TabType = "organizations" | "all-users" | "clients" | "users";

export default function AdminPage() {
  const [adminLevel, setAdminLevel] = useState<
    "app_admin" | "org_admin" | null
  >(null);
  const [hasOrg, setHasOrg] = useState(false);
  const [tab, setTab] = useState<TabType>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { level, hasOrg: userHasOrg } = await getAdminLevel();
      setAdminLevel(level);
      setHasOrg(userHasOrg);

      if (level === "app_admin") {
        setTab("organizations");
        const promises: Promise<unknown>[] = [
          getAllOrganizations(),
          getAllUsers(),
        ];
        // Only fetch org-scoped data if the app admin has an org
        if (userHasOrg) {
          promises.push(getClients(), getOrgMembers());
        }
        const results = await Promise.all(promises);
        const orgsRes = results[0] as { data?: Organization[] };
        const usersRes = results[1] as { data?: AppUser[] };
        if (orgsRes.data) setOrganizations(orgsRes.data);
        if (usersRes.data) setAllUsers(usersRes.data);
        if (userHasOrg) {
          const clientsRes = results[2] as { data?: Client[] };
          const membersRes = results[3] as { data?: OrgMember[] };
          if (clientsRes?.data) setClients(clientsRes.data);
          if (membersRes?.data) setMembers(membersRes.data);
        }
      } else {
        const [clientsRes, membersRes] = await Promise.all([
          getClients(),
          getOrgMembers(),
        ]);
        if (clientsRes.data) setClients(clientsRes.data as Client[]);
        if (membersRes.data) setMembers(membersRes.data as OrgMember[]);
      }
    } catch {
      setError("Failed to load data");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreateClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createClient(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setShowNewClient(false);
      loadData();
    }
  }

  const tabs: { key: TabType; label: string; icon: typeof Shield; count: number }[] =
    adminLevel === "app_admin"
      ? [
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
          {
            key: "clients",
            label: "Clients",
            icon: Building2,
            count: clients.length,
          },
          {
            key: "users",
            label: "Org Users",
            icon: Users,
            count: members.length,
          },
        ]
      : [
          {
            key: "clients",
            label: "Clients",
            icon: Building2,
            count: clients.length,
          },
          {
            key: "users",
            label: "Users",
            icon: Users,
            count: members.length,
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
            {adminLevel === "app_admin"
              ? "Application administration — manage organizations, users, and clients"
              : "Manage clients and user access for your organization"}
          </p>
        </div>
        {adminLevel && (
          <span
            className={cn(
              "ml-auto text-[10px] font-bold uppercase px-2 py-1 rounded",
              adminLevel === "app_admin"
                ? "bg-red-100 text-red-700"
                : "bg-purple-100 text-purple-700"
            )}
          >
            {adminLevel === "app_admin" ? "App Admin" : "Org Admin"}
          </span>
        )}
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
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
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

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading...
        </div>
      ) : tab === "organizations" && adminLevel === "app_admin" ? (
        <OrganizationsTab
          organizations={organizations}
          showNewOrg={showNewOrg}
          setShowNewOrg={setShowNewOrg}
          onReload={loadData}
          setError={setError}
        />
      ) : tab === "all-users" && adminLevel === "app_admin" ? (
        <AllUsersTab
          users={allUsers}
          organizations={organizations}
          onReload={loadData}
          setError={setError}
        />
      ) : tab === "clients" ? (
        !hasOrg && adminLevel === "app_admin" ? (
          <NoOrgMessage />
        ) : (
          <ClientsTab
            clients={clients}
            showNewClient={showNewClient}
            setShowNewClient={setShowNewClient}
            onCreateClient={handleCreateClient}
          />
        )
      ) : (
        !hasOrg && adminLevel === "app_admin" ? (
          <NoOrgMessage />
        ) : (
          <OrgUsersTab members={members} />
        )
      )}
    </div>
  );
}

// ─── Organizations Tab (App Admin only) ──────────────────────────────────────

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
    const result = await createOrganizationAsAdmin(newOrgName.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setNewOrgName("");
      setShowNewOrg(false);
      onReload();
    }
  }

  async function handleDeleteOrg(orgId: string, orgName: string) {
    if (!confirm(`Delete organization "${orgName}"? This cannot be undone.`))
      return;
    const result = await deleteOrganization(orgId);
    if (result.error) {
      setError(result.error);
    } else {
      onReload();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          All organizations in the application
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
        <div className="space-y-2">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
            >
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground">
                  {org.name}
                </span>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>
                    {org.organization_members?.[0]?.count ?? 0} member(s)
                  </span>
                  <span>
                    Created{" "}
                    {new Date(org.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteOrg(org.id, org.name)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete organization"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── All Users Tab (App Admin only) ──────────────────────────────────────────

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
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">(
    "member"
  );

  async function handleAssign() {
    if (!assigningUser || !selectedOrg) return;
    const result = await assignUserToOrg(
      assigningUser,
      selectedOrg,
      selectedRole
    );
    if (result.error) {
      setError(result.error);
    } else {
      setAssigningUser(null);
      setSelectedOrg("");
      onReload();
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
            <div
              key={user.id}
              className="p-4 rounded-xl border border-border bg-card"
            >
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
                    {user.onboarded && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        Onboarded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAssigningUser(
                      assigningUser === user.id ? null : user.id
                    )
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
                        <option key={org.id} value={org.id}>
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
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
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

// ─── No Org Message (for app admins without org membership) ──────────────────

function NoOrgMessage() {
  return (
    <div className="text-center py-12">
      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm font-medium text-foreground mb-1">
        No organization selected
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        To manage clients and users, first create an organization in the
        Organizations tab, then assign yourself to it in the All Users tab.
      </p>
    </div>
  );
}

// ─── Clients Tab ─────────────────────────────────────────────────────────────

function ClientsTab({
  clients,
  showNewClient,
  setShowNewClient,
  onCreateClient,
}: {
  clients: Client[];
  showNewClient: boolean;
  setShowNewClient: (v: boolean) => void;
  onCreateClient: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          All client accounts in your organization
        </p>
        <button
          onClick={() => setShowNewClient(!showNewClient)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      {showNewClient && (
        <form
          onSubmit={onCreateClient}
          className="mb-6 p-4 rounded-xl border border-border bg-card space-y-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            Create New Client
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Client Name *
              </label>
              <input
                name="name"
                required
                placeholder="Acme Corp"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Industry
              </label>
              <select
                name="industry"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select industry...</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="education">Education</option>
                <option value="government">Government</option>
                <option value="retail">Retail</option>
                <option value="technology">Technology</option>
                <option value="legal">Legal</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Primary Contact
              </label>
              <input
                name="primary_contact"
                placeholder="Jane Smith"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Contact Email
              </label>
              <input
                name="contact_email"
                type="email"
                placeholder="jane@acme.com"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue="active"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="offboarding">Offboarding</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Account notes..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Create Client
            </button>
            <button
              type="button"
              onClick={() => setShowNewClient(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No clients yet. Create your first client to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/app/admin/clients/${client.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {client.name}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                      statusColors[client.status] || statusColors.inactive
                    )}
                  >
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {client.industry && (
                    <span className="capitalize">{client.industry}</span>
                  )}
                  {client.primary_contact && (
                    <span>Contact: {client.primary_contact}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Org Users Tab ───────────────────────────────────────────────────────────

function OrgUsersTab({ members }: { members: OrgMember[] }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        All users in your organization
      </p>
      {members.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {member.profiles?.full_name || "Unnamed User"}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {member.role}
                  </span>
                </div>
                {member.profiles?.username && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    @{member.profiles.username}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
