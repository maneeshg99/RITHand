"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  UserPlus,
  Trash2,
  Save,
  X,
  Shield,
  Eye,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getClient,
  getClientMembers,
  getOrgMembers,
  updateClient,
  deleteClient,
  assignUserToClient,
  updateClientMemberRole,
  removeUserFromClient,
} from "../../actions";

type Client = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  primary_contact: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
};

type ClientMember = {
  client_id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
  } | null;
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

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  onboarding: "bg-blue-100 text-blue-700",
  offboarding: "bg-yellow-100 text-yellow-700",
  inactive: "bg-slate-100 text-slate-500",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [clientMembers, setClientMembers] = useState<ClientMember[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [tab, setTab] = useState<"details" | "access">("details");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignRole, setAssignRole] = useState<"editor" | "viewer">("viewer");
  const [assignUserId, setAssignUserId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientRes, membersRes, orgRes] = await Promise.all([
        getClient(clientId),
        getClientMembers(clientId),
        getOrgMembers(),
      ]);
      if (clientRes.data) setClient(clientRes.data as Client);
      if (membersRes.data) setClientMembers(membersRes.data as ClientMember[]);
      if (orgRes.data) setOrgMembers(orgRes.data as OrgMember[]);
      if (clientRes.error) setError(clientRes.error);
    } catch {
      setError("Failed to load client data");
    }
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUpdateClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await updateClient(clientId, formData);
    if (result.error) {
      setError(result.error);
    } else {
      setEditing(false);
      loadData();
    }
  }

  async function handleDeleteClient() {
    if (
      !confirm(
        `Are you sure you want to delete "${client?.name}"? This will remove all associated data.`
      )
    )
      return;
    const result = await deleteClient(clientId);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/app/admin");
    }
  }

  async function handleAssignUser(e: React.FormEvent) {
    e.preventDefault();
    if (!assignUserId) return;
    setError(null);
    const result = await assignUserToClient(clientId, assignUserId, assignRole);
    if (result.error) {
      setError(result.error);
    } else {
      setShowAssign(false);
      setAssignUserId("");
      setAssignRole("viewer");
      loadData();
    }
  }

  async function handleRoleChange(userId: string, newRole: "editor" | "viewer") {
    setError(null);
    const result = await updateClientMemberRole(clientId, userId, newRole);
    if (result.error) setError(result.error);
    else loadData();
  }

  async function handleRemoveUser(userId: string, name: string) {
    if (!confirm(`Remove ${name} from this client?`)) return;
    setError(null);
    const result = await removeUserFromClient(clientId, userId);
    if (result.error) setError(result.error);
    else loadData();
  }

  // Users available to assign (org members not already assigned to this client)
  const assignedUserIds = new Set(clientMembers.map((m) => m.user_id));
  const availableToAssign = orgMembers.filter(
    (m) => !assignedUserIds.has(m.user_id)
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto text-center py-12 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Client not found.</p>
        <Link href="/app/admin" className="text-primary text-sm hover:underline mt-2 inline-block">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/app/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {client.name}
            </h1>
            <span
              className={cn(
                "text-xs font-bold uppercase px-2 py-0.5 rounded",
                statusColors[client.status] || statusColors.inactive
              )}
            >
              {client.status}
            </span>
          </div>
          {client.industry && (
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {client.industry}
            </p>
          )}
        </div>
        <button
          onClick={handleDeleteClient}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
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
        <button
          onClick={() => setTab("details")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            tab === "details"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          Details
        </button>
        <button
          onClick={() => setTab("access")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            tab === "access"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Access ({clientMembers.length})
        </button>
      </div>

      {tab === "details" ? (
        <DetailsTab
          client={client}
          editing={editing}
          setEditing={setEditing}
          onSubmit={handleUpdateClient}
        />
      ) : (
        <AccessTab
          clientMembers={clientMembers}
          availableToAssign={availableToAssign}
          showAssign={showAssign}
          setShowAssign={setShowAssign}
          assignUserId={assignUserId}
          setAssignUserId={setAssignUserId}
          assignRole={assignRole}
          setAssignRole={setAssignRole}
          onAssign={handleAssignUser}
          onRoleChange={handleRoleChange}
          onRemove={handleRemoveUser}
        />
      )}
    </div>
  );
}

// ─── Details Tab ──────────────────────────────────────────────────────────────

function DetailsTab({
  client,
  editing,
  setEditing,
  onSubmit,
}: {
  client: Client;
  editing: boolean;
  setEditing: (v: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  if (editing) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Client Name *
            </label>
            <input
              name="name"
              required
              defaultValue={client.name}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Industry
            </label>
            <select
              name="industry"
              defaultValue={client.industry || ""}
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
              defaultValue={client.primary_contact || ""}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Contact Email
            </label>
            <input
              name="contact_email"
              type="email"
              defaultValue={client.contact_email || ""}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={client.status}
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
            rows={3}
            defaultValue={client.notes || ""}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">
          Client Information
        </h2>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="Primary Contact" value={client.primary_contact} />
        <InfoField label="Contact Email" value={client.contact_email} />
        <InfoField
          label="Industry"
          value={client.industry}
          className="capitalize"
        />
        <InfoField label="Status" value={client.status} className="capitalize" />
        <div className="md:col-span-2">
          <InfoField label="Notes" value={client.notes} />
        </div>
        <InfoField
          label="Created"
          value={new Date(client.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        />
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className={cn("text-sm text-foreground", className)}>
        {value || <span className="text-muted-foreground italic">Not set</span>}
      </p>
    </div>
  );
}

// ─── Access Tab ───────────────────────────────────────────────────────────────

function AccessTab({
  clientMembers,
  availableToAssign,
  showAssign,
  setShowAssign,
  assignUserId,
  setAssignUserId,
  assignRole,
  setAssignRole,
  onAssign,
  onRoleChange,
  onRemove,
}: {
  clientMembers: ClientMember[];
  availableToAssign: OrgMember[];
  showAssign: boolean;
  setShowAssign: (v: boolean) => void;
  assignUserId: string;
  setAssignUserId: (v: string) => void;
  assignRole: "editor" | "viewer";
  setAssignRole: (v: "editor" | "viewer") => void;
  onAssign: (e: React.FormEvent) => void;
  onRoleChange: (userId: string, role: "editor" | "viewer") => void;
  onRemove: (userId: string, name: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Users with access to this client
        </p>
        <button
          onClick={() => setShowAssign(!showAssign)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Assign User Form */}
      {showAssign && (
        <form
          onSubmit={onAssign}
          className="mb-6 p-4 rounded-xl border border-border bg-card space-y-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            Assign User to Client
          </h3>
          {availableToAssign.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All org members are already assigned to this client.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  User
                </label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select user...</option>
                  {availableToAssign.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profiles?.full_name || m.profiles?.username || "Unknown"}{" "}
                      {m.profiles?.username ? `(@${m.profiles.username})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Role
                </label>
                <select
                  value={assignRole}
                  onChange={(e) =>
                    setAssignRole(e.target.value as "editor" | "viewer")
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="viewer">Viewer (read-only)</option>
                  <option value="editor">Editor (read + write)</option>
                </select>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {availableToAssign.length > 0 && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Assign
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAssign(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Member List */}
      {clientMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No users assigned yet. Add users to grant them access to this
            client&apos;s data.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientMembers.map((member) => {
            const displayName =
              member.profiles?.full_name ||
              member.profiles?.username ||
              "Unknown User";
            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {displayName}
                    </span>
                    {member.profiles?.username && (
                      <span className="text-xs text-muted-foreground">
                        @{member.profiles.username}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assigned{" "}
                    {new Date(member.assigned_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Role toggle */}
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() =>
                        member.role !== "viewer" &&
                        onRoleChange(member.user_id, "viewer")
                      }
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors",
                        member.role === "viewer"
                          ? "bg-blue-100 text-blue-700"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      title="View only"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        member.role !== "editor" &&
                        onRoleChange(member.user_id, "editor")
                      }
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors border-l border-border",
                        member.role === "editor"
                          ? "bg-green-100 text-green-700"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      title="Can edit"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => onRemove(member.user_id, displayName)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove access"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
