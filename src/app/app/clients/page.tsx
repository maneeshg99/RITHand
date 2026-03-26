"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FolderOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyClients } from "./actions";

type Client = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  primary_contact: string | null;
  contact_email: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  onboarding: "bg-blue-100 text-blue-700",
  offboarding: "bg-yellow-100 text-yellow-700",
  inactive: "bg-slate-100 text-slate-500",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyClients();
      if (result.error) {
        setError(result.error);
      } else {
        setClients(result.data as Client[]);
      }
    } catch {
      setError("Failed to load clients");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <FolderOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client workspaces
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading...
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            You don&apos;t have access to any clients yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/app/clients/${client.id}`}
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
