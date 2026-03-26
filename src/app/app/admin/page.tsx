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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getClients, getOrgMembers, createClient } from "./actions";

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

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  onboarding: "bg-blue-100 text-blue-700",
  offboarding: "bg-yellow-100 text-yellow-700",
  inactive: "bg-slate-100 text-slate-500",
};

export default function AdminPage() {
  const [tab, setTab] = useState<"clients" | "users">("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [showNewClient, setShowNewClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, membersRes] = await Promise.all([
        getClients(),
        getOrgMembers(),
      ]);
      if (clientsRes.data) setClients(clientsRes.data as Client[]);
      if (membersRes.data) setMembers(membersRes.data as OrgMember[]);
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
            Manage clients and user access
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setTab("clients")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            tab === "clients"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          Clients ({clients.length})
        </button>
        <button
          onClick={() => setTab("users")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            tab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Users ({members.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading...
        </div>
      ) : tab === "clients" ? (
        <ClientsTab
          clients={clients}
          showNewClient={showNewClient}
          setShowNewClient={setShowNewClient}
          onCreateClient={handleCreateClient}
        />
      ) : (
        <UsersTab members={members} />
      )}
    </div>
  );
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────

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

      {/* New Client Form */}
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

      {/* Client List */}
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
                  {client.industry && <span className="capitalize">{client.industry}</span>}
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

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ members }: { members: OrgMember[] }) {
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
