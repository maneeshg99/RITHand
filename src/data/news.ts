export type NewsSeverity = "critical" | "high" | "medium" | "low" | "info";
export type NewsType = "security" | "update" | "outage" | "eol" | "general" | "patch";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  vendorId: string;
  type: NewsType;
  severity: NewsSeverity;
  date: string; // ISO date
  sourceUrl: string;
  sourceName: string;
}

export const mockNews: NewsItem[] = [
  {
    id: "n1",
    title: "Critical Vulnerability in Cisco IOS XE - CVE-2026-1234",
    summary:
      "A critical remote code execution vulnerability has been discovered in Cisco IOS XE software. Immediate patching is recommended for all affected devices.",
    vendorId: "cisco",
    type: "security",
    severity: "critical",
    date: "2026-03-22",
    sourceUrl: "#",
    sourceName: "Cisco Security Advisory",
  },
  {
    id: "n2",
    title: "Palo Alto Networks Releases PAN-OS 11.3",
    summary:
      "PAN-OS 11.3 brings enhanced AI-powered threat prevention, improved SD-WAN capabilities, and new cloud-delivered security services.",
    vendorId: "palo-alto",
    type: "update",
    severity: "info",
    date: "2026-03-21",
    sourceUrl: "#",
    sourceName: "Palo Alto Networks Blog",
  },
  {
    id: "n3",
    title: "Microsoft Azure Multi-Region Outage Impacting Services",
    summary:
      "Microsoft is investigating a widespread Azure outage affecting multiple regions. Microsoft 365, Teams, and Azure AD services are intermittently unavailable.",
    vendorId: "microsoft",
    type: "outage",
    severity: "high",
    date: "2026-03-22",
    sourceUrl: "#",
    sourceName: "Azure Status",
  },
  {
    id: "n4",
    title: "FortiGate Firmware 7.8.1 Patch Released",
    summary:
      "Fortinet has released FortiOS 7.8.1 addressing three high-severity vulnerabilities in SSL-VPN and web management interface.",
    vendorId: "fortinet",
    type: "patch",
    severity: "high",
    date: "2026-03-20",
    sourceUrl: "#",
    sourceName: "Fortinet PSIRT",
  },
  {
    id: "n5",
    title: "CrowdStrike Falcon Platform Update - New XDR Features",
    summary:
      "CrowdStrike introduces enhanced XDR capabilities with automated threat hunting, improved identity protection, and new cloud workload integrations.",
    vendorId: "crowdstrike",
    type: "update",
    severity: "info",
    date: "2026-03-19",
    sourceUrl: "#",
    sourceName: "CrowdStrike Blog",
  },
  {
    id: "n6",
    title: "Ubiquiti UniFi Network Application 9.0 Released",
    summary:
      "Major update to UniFi Network Application with redesigned dashboard, improved traffic analytics, and new VLAN management features.",
    vendorId: "ubiquiti",
    type: "update",
    severity: "info",
    date: "2026-03-18",
    sourceUrl: "#",
    sourceName: "Ubiquiti Community",
  },
  {
    id: "n7",
    title: "ConnectWise ScreenConnect Vulnerability - Patch Immediately",
    summary:
      "ConnectWise has disclosed a critical authentication bypass vulnerability in ScreenConnect. All on-premises instances should be updated immediately.",
    vendorId: "connectwise",
    type: "security",
    severity: "critical",
    date: "2026-03-22",
    sourceUrl: "#",
    sourceName: "ConnectWise Security Bulletin",
  },
  {
    id: "n8",
    title: "Veeam Backup & Replication v13 Now Generally Available",
    summary:
      "Veeam v13 introduces inline malware scanning, immutable backup support for all storage types, and enhanced Kubernetes protection.",
    vendorId: "veeam",
    type: "update",
    severity: "info",
    date: "2026-03-17",
    sourceUrl: "#",
    sourceName: "Veeam Blog",
  },
  {
    id: "n9",
    title: "Okta Announces End-of-Life for Classic Engine",
    summary:
      "Okta will discontinue support for the Classic Engine identity platform on September 30, 2026. All customers should migrate to Okta Identity Engine.",
    vendorId: "okta",
    type: "eol",
    severity: "medium",
    date: "2026-03-16",
    sourceUrl: "#",
    sourceName: "Okta Announcements",
  },
  {
    id: "n10",
    title: "SentinelOne Singularity Platform - Q1 2026 Update",
    summary:
      "SentinelOne releases major platform update with Purple AI enhancements, new CNAPP features, and improved threat intelligence integration.",
    vendorId: "sentinelone",
    type: "update",
    severity: "info",
    date: "2026-03-15",
    sourceUrl: "#",
    sourceName: "SentinelOne Blog",
  },
  {
    id: "n11",
    title: "AWS Announces New Security Hub Findings Format",
    summary:
      "Amazon Web Services introduces updated AWS Security Hub findings format with improved OCSF compliance and automated remediation workflows.",
    vendorId: "aws",
    type: "update",
    severity: "low",
    date: "2026-03-20",
    sourceUrl: "#",
    sourceName: "AWS Blog",
  },
  {
    id: "n12",
    title: "Cisco Meraki MX Firmware 18.3 - Security Fixes",
    summary:
      "Meraki has released MX firmware 18.3 addressing multiple vulnerabilities in the VPN concentrator and content filtering engine.",
    vendorId: "cisco-meraki",
    type: "patch",
    severity: "high",
    date: "2026-03-21",
    sourceUrl: "#",
    sourceName: "Meraki Dashboard Announcements",
  },
  {
    id: "n13",
    title: "NinjaOne Introduces Automated Patch Compliance Reporting",
    summary:
      "NinjaOne adds new automated compliance reporting for patch management across Windows, macOS, and Linux endpoints.",
    vendorId: "ninjaone",
    type: "update",
    severity: "info",
    date: "2026-03-14",
    sourceUrl: "#",
    sourceName: "NinjaOne Blog",
  },
  {
    id: "n14",
    title: "Sophos Firewall OS v21 Released with AI-Powered Threat Response",
    summary:
      "Sophos Firewall v21 features AI-driven threat detection, enhanced SD-WAN orchestration, and new zero-trust network access capabilities.",
    vendorId: "sophos",
    type: "update",
    severity: "info",
    date: "2026-03-19",
    sourceUrl: "#",
    sourceName: "Sophos News",
  },
  {
    id: "n15",
    title: "Datto BCDR Platform Critical Maintenance Window",
    summary:
      "Datto has scheduled emergency maintenance for the BCDR cloud infrastructure on March 25, 2026. Backup jobs may be delayed during the maintenance window.",
    vendorId: "datto",
    type: "outage",
    severity: "medium",
    date: "2026-03-22",
    sourceUrl: "#",
    sourceName: "Datto Status Page",
  },
  {
    id: "n16",
    title: "Duo Security MFA Bypass Vulnerability Patched",
    summary:
      "Cisco Duo has patched a vulnerability that could allow MFA bypass under specific configurations. Review your Duo policies for affected settings.",
    vendorId: "duo-security",
    type: "security",
    severity: "high",
    date: "2026-03-21",
    sourceUrl: "#",
    sourceName: "Duo Security Advisory",
  },
  {
    id: "n17",
    title: "JumpCloud Adds SCIM Support for 50+ New Applications",
    summary:
      "JumpCloud expands its directory integration with SCIM provisioning support for over 50 new SaaS applications.",
    vendorId: "jumpcloud",
    type: "update",
    severity: "low",
    date: "2026-03-13",
    sourceUrl: "#",
    sourceName: "JumpCloud Blog",
  },
  {
    id: "n18",
    title: "Google Cloud Platform - BigQuery Pricing Changes",
    summary:
      "GCP announces pricing changes for BigQuery on-demand queries effective April 2026. Review your usage patterns to optimize costs.",
    vendorId: "gcp",
    type: "general",
    severity: "medium",
    date: "2026-03-18",
    sourceUrl: "#",
    sourceName: "Google Cloud Blog",
  },
  {
    id: "n19",
    title: "WatchGuard Firebox End-of-Life Announcement - T35/T55 Series",
    summary:
      "WatchGuard announces end-of-life for Firebox T35 and T55 series appliances. Last day of support is December 31, 2026.",
    vendorId: "watchguard",
    type: "eol",
    severity: "medium",
    date: "2026-03-17",
    sourceUrl: "#",
    sourceName: "WatchGuard Support",
  },
  {
    id: "n20",
    title: "Acronis Cyber Protect Cloud - Ransomware Recovery Enhancements",
    summary:
      "Acronis introduces enhanced ransomware recovery features with automated clean restore points and forensic analysis tools.",
    vendorId: "acronis",
    type: "update",
    severity: "info",
    date: "2026-03-16",
    sourceUrl: "#",
    sourceName: "Acronis Blog",
  },
];
