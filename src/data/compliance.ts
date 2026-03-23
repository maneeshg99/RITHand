export interface ComplianceFramework {
  id: string;
  name: string;
  score: number; // 0-100
  status: "compliant" | "at-risk" | "non-compliant";
  lastAudit: string; // ISO date
  nextAudit: string; // ISO date
}

export interface LicenseRenewal {
  id: string;
  vendorId: string;
  product: string;
  renewalDate: string; // ISO date
  annualCost: number;
  seats: number;
  status: "active" | "expiring-soon" | "expired";
}

export interface PatchCompliance {
  totalEndpoints: number;
  patchedWithinSLA: number;
  overdueCritical: number;
  overdueHigh: number;
  overdueMedium: number;
  slaTarget: number; // percentage
}

export interface EolProduct {
  id: string;
  vendorId: string;
  product: string;
  eolDate: string; // ISO date
  eosDate: string; // end-of-support date
  affectedAssets: number;
  replacementSuggestion: string;
}

export interface IncidentSummary {
  openIncidents: number;
  criticalOpen: number;
  avgResolutionHours: number;
  resolvedThisMonth: number;
  activeOutages: number;
}

export const complianceFrameworks: ComplianceFramework[] = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    score: 92,
    status: "compliant",
    lastAudit: "2025-11-15",
    nextAudit: "2026-05-15",
  },
  {
    id: "hipaa",
    name: "HIPAA",
    score: 88,
    status: "compliant",
    lastAudit: "2025-09-20",
    nextAudit: "2026-09-20",
  },
  {
    id: "nist",
    name: "NIST CSF",
    score: 76,
    status: "at-risk",
    lastAudit: "2025-12-01",
    nextAudit: "2026-06-01",
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    score: 95,
    status: "compliant",
    lastAudit: "2026-01-10",
    nextAudit: "2027-01-10",
  },
  {
    id: "pci",
    name: "PCI DSS",
    score: 61,
    status: "at-risk",
    lastAudit: "2025-08-05",
    nextAudit: "2026-08-05",
  },
];

export const licenseRenewals: LicenseRenewal[] = [
  {
    id: "lic-1",
    vendorId: "crowdstrike",
    product: "Falcon Enterprise",
    renewalDate: "2026-04-15",
    annualCost: 48000,
    seats: 250,
    status: "expiring-soon",
  },
  {
    id: "lic-2",
    vendorId: "microsoft",
    product: "Microsoft 365 E5",
    renewalDate: "2026-07-01",
    annualCost: 126000,
    seats: 350,
    status: "active",
  },
  {
    id: "lic-3",
    vendorId: "okta",
    product: "Okta Workforce Identity",
    renewalDate: "2026-03-30",
    annualCost: 32400,
    seats: 350,
    status: "expiring-soon",
  },
  {
    id: "lic-4",
    vendorId: "palo-alto",
    product: "Prisma Cloud",
    renewalDate: "2026-09-15",
    annualCost: 64000,
    seats: 1,
    status: "active",
  },
  {
    id: "lic-5",
    vendorId: "veeam",
    product: "Backup & Replication Enterprise",
    renewalDate: "2026-05-20",
    annualCost: 18500,
    seats: 50,
    status: "active",
  },
  {
    id: "lic-6",
    vendorId: "connectwise",
    product: "ConnectWise Automate",
    renewalDate: "2026-03-25",
    annualCost: 22000,
    seats: 500,
    status: "expiring-soon",
  },
];

export const patchCompliance: PatchCompliance = {
  totalEndpoints: 1247,
  patchedWithinSLA: 1148,
  overdueCritical: 12,
  overdueHigh: 34,
  overdueMedium: 53,
  slaTarget: 95,
};

export const eolProducts: EolProduct[] = [
  {
    id: "eol-1",
    vendorId: "watchguard",
    product: "Firebox T35/T55 Series",
    eolDate: "2026-12-31",
    eosDate: "2027-06-30",
    affectedAssets: 8,
    replacementSuggestion: "Firebox T45/T85 Series",
  },
  {
    id: "eol-2",
    vendorId: "okta",
    product: "Okta Classic Engine",
    eolDate: "2026-09-30",
    eosDate: "2026-12-31",
    affectedAssets: 350,
    replacementSuggestion: "Okta Identity Engine",
  },
  {
    id: "eol-3",
    vendorId: "microsoft",
    product: "Windows Server 2016",
    eolDate: "2027-01-12",
    eosDate: "2027-01-12",
    affectedAssets: 14,
    replacementSuggestion: "Windows Server 2025",
  },
  {
    id: "eol-4",
    vendorId: "cisco",
    product: "Catalyst 3650 Series",
    eolDate: "2026-10-31",
    eosDate: "2027-10-31",
    affectedAssets: 22,
    replacementSuggestion: "Catalyst 9300 Series",
  },
];

export const incidentSummary: IncidentSummary = {
  openIncidents: 7,
  criticalOpen: 2,
  avgResolutionHours: 4.2,
  resolvedThisMonth: 31,
  activeOutages: 1,
};
