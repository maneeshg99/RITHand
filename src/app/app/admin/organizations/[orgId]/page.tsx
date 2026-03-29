"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  FolderOpen,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getOrganization,
  getOrgMembersForOrg,
  getClientsForOrg,
  createClientForOrg,
  getAllUsers,
  assignUserToOrg,
  removeMemberFromOrg,
  updateMemberRole,
  getAdminLevel,
} from "../../actions";

type OrgMember = {
  user_id: string;
  role: string;
  profiles: { id: string; full_name: string | null; username: string | null } | null;
};

type Client = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  primary_contact: string | null;
  contact_email: string | null;
};

type AppUser = {
  id: string;
  full_name: string | null;
  app_role: string | null;
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  onboarding: "bg-blue-100 text-blue-700",
  offboarding: "bg-yellow-100 text-yellow-700",
  inactive: "bg-slate-100 text-slate-500",
};

export default function OrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [orgName, setOrgName] = useState("");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orgRes, membersRes, clientsRes, levelRes] = await Promise.all([
        getOrganization(orgId),
        getOrgMembersForOrg(orgId),
        getClientsForOrg(orgId),
        getAdminLevel(),
      ]);

      if (orgRes.error) {
        setError(orgRes.error);
        setLoading(false);
        return;
      }

      setOrgName(orgRes.data?.name || "");
      setMembers((membersRes.data || []) as OrgMember[]);
      setClients((clientsRes.data || []) as Client[]);
      setIsAppAdmin(levelRes.level === "app_admin");

      if (levelRes.level === "app_admin") {
        const usersRes = await getAllUsers();
        setAllUsers((usersRes.data || []) as AppUser[]);
      }
    } catch {
      setError("Failed to load organization data");
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddUser = async () => {
    if (!selectedUserId) return;
    setError(null);
    const result = await assignUserToOrg(selectedUserId, orgId, selectedRole);
    if (result.error) {
      setError(result.error);
    } else {
      setShowAddUser(false);
      setSelectedUserId("");
      loadData();
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Remove this user from the organization?")) return;
    const result = await removeMemberFromOrg(orgId, userId);
    if (result.error) setError(result.error);
    else loadData();
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "member") => {
    const result = await updateMemberRole(orgId, userId, newRole);
    if (result.error) setError(result.error);
    else loadData();
  };

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createClientForOrg(orgId, formData);
    if (result.error) {
      setError(result.error);
    } else {
      setShowNewClient(false);
      loadData();
    }
  };

  // Users not already in this org (for the add-user dropdown)
  const availableUsers = allUsers.filter(
    (u) => !members.some((m) => m.user_id === u.id)
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/app/admin"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{orgName}</h1>
          <p className="text-sm text-muted-foreground">
            Organization management
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Users */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Users ({members.length})
              </h2>
            </div>
            {isAppAdmin && (
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" />
                Add User
              </button>
            )}
          </div>

          {/* Add user form */}
          {showAddUser && (
            <div className="p-4 border-b border-border bg-muted/30 space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select user...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-card text-foreground">
                      {u.full_name || "Unnamed"} {u.app_role === "app_admin" ? "(App Admin)" : ""}
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
                  onChange={(e) => setSelectedRole(e.target.value as "admin" | "member")}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="member" className="bg-card text-foreground">Member</option>
                  <option value="admin" className="bg-card text-foreground">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddUser}
                  disabled={!selectedUserId}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* User list */}
          <div className="divide-y divide-border">
            {members.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No users in this organization yet.
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {member.profiles?.full_name || "Unnamed"}
                      </span>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.user_id,
                            e.target.value as "admin" | "member"
                          )
                        }
                        className={cn(
                          "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border-0 cursor-pointer",
                          member.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        <option value="admin" className="bg-card text-foreground">Admin</option>
                        <option value="member" className="bg-card text-foreground">Member</option>
                      </select>
                    </div>
                    {member.profiles?.username && (
                      <p className="text-xs text-muted-foreground">
                        @{member.profiles.username}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveUser(member.user_id)}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove from organization"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right column: Clients */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Clients ({clients.length})
              </h2>
            </div>
            <button
              onClick={() => setShowNewClient(!showNewClient)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
              New Client
            </button>
          </div>

          {/* New client form */}
          {showNewClient && (
            <form
              onSubmit={handleCreateClient}
              className="p-4 border-b border-border bg-muted/30 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Name *
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Client name"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Industry
                  </label>
                  <select
                    name="industry"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select...</option>
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
                    Contact
                  </label>
                  <input
                    name="primary_contact"
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Active</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="offboarding">Offboarding</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Client list */}
          <div className="divide-y divide-border">
            {clients.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No clients yet. Create one to get started.
              </div>
            ) : (
              clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/app/admin/clients/${client.id}`}
                  className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
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
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      {client.industry && (
                        <span className="capitalize">{client.industry}</span>
                      )}
                      {client.primary_contact && (
                        <span>Contact: {client.primary_contact}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
