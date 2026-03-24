// ─── Compliance Checklists ───────────────────────────────────────────────────

export interface ComplianceChecklistItem {
  id: string;
  label: string;
}

export interface ComplianceSection {
  id: string;
  name: string;
  items: ComplianceChecklistItem[];
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  sections: ComplianceSection[];
}

export const complianceFrameworkTemplates: ComplianceFramework[] = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    description: "Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy.",
    sections: [
      {
        id: "soc2-cc1",
        name: "CC1 – Control Environment",
        items: [
          { id: "soc2-cc1-1", label: "Board and management commitment to integrity and ethical values documented" },
          { id: "soc2-cc1-2", label: "Organizational structure and authority defined" },
          { id: "soc2-cc1-3", label: "HR policies address hiring, training, and termination" },
          { id: "soc2-cc1-4", label: "Accountability for internal control performance established" },
        ],
      },
      {
        id: "soc2-cc2",
        name: "CC2 – Communication & Information",
        items: [
          { id: "soc2-cc2-1", label: "Internal communication of control responsibilities documented" },
          { id: "soc2-cc2-2", label: "External communication processes established" },
          { id: "soc2-cc2-3", label: "Information security policy communicated to all personnel" },
        ],
      },
      {
        id: "soc2-cc3",
        name: "CC3 – Risk Assessment",
        items: [
          { id: "soc2-cc3-1", label: "Risk assessment process documented and performed at least annually" },
          { id: "soc2-cc3-2", label: "Fraud risk factors identified and assessed" },
          { id: "soc2-cc3-3", label: "Changes in business, technology, and environment considered" },
        ],
      },
      {
        id: "soc2-cc6",
        name: "CC6 – Logical & Physical Access",
        items: [
          { id: "soc2-cc6-1", label: "Access provisioning process requires approval" },
          { id: "soc2-cc6-2", label: "Multi-factor authentication enforced for system access" },
          { id: "soc2-cc6-3", label: "Privileged access reviewed quarterly" },
          { id: "soc2-cc6-4", label: "Terminated employee access revoked within 24 hours" },
          { id: "soc2-cc6-5", label: "Physical access to data centers restricted and logged" },
        ],
      },
      {
        id: "soc2-cc7",
        name: "CC7 – System Operations",
        items: [
          { id: "soc2-cc7-1", label: "Security monitoring and alerting tools deployed" },
          { id: "soc2-cc7-2", label: "Vulnerability scans performed regularly" },
          { id: "soc2-cc7-3", label: "Incident response plan documented and tested" },
          { id: "soc2-cc7-4", label: "Security events logged and retained per policy" },
        ],
      },
      {
        id: "soc2-cc8",
        name: "CC8 – Change Management",
        items: [
          { id: "soc2-cc8-1", label: "Change management policy documented" },
          { id: "soc2-cc8-2", label: "Changes tested in non-production before deployment" },
          { id: "soc2-cc8-3", label: "Emergency change process defined and followed" },
        ],
      },
    ],
  },
  {
    id: "hipaa",
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act safeguards for protected health information.",
    sections: [
      {
        id: "hipaa-admin",
        name: "Administrative Safeguards",
        items: [
          { id: "hipaa-admin-1", label: "Security Officer designated" },
          { id: "hipaa-admin-2", label: "Risk analysis conducted and documented" },
          { id: "hipaa-admin-3", label: "Risk management plan implemented" },
          { id: "hipaa-admin-4", label: "Workforce security training completed annually" },
          { id: "hipaa-admin-5", label: "Sanction policy for violations documented" },
          { id: "hipaa-admin-6", label: "Contingency plan (backup, DR, emergency access) in place" },
        ],
      },
      {
        id: "hipaa-physical",
        name: "Physical Safeguards",
        items: [
          { id: "hipaa-physical-1", label: "Facility access controls documented" },
          { id: "hipaa-physical-2", label: "Workstation use and security policies enforced" },
          { id: "hipaa-physical-3", label: "Device and media controls (disposal, reuse) documented" },
        ],
      },
      {
        id: "hipaa-technical",
        name: "Technical Safeguards",
        items: [
          { id: "hipaa-tech-1", label: "Unique user identification enforced for all PHI systems" },
          { id: "hipaa-tech-2", label: "Automatic logoff configured on workstations" },
          { id: "hipaa-tech-3", label: "PHI encrypted at rest and in transit" },
          { id: "hipaa-tech-4", label: "Audit controls log access to PHI systems" },
          { id: "hipaa-tech-5", label: "Data integrity controls implemented" },
        ],
      },
      {
        id: "hipaa-breach",
        name: "Breach Notification",
        items: [
          { id: "hipaa-breach-1", label: "Breach notification procedures documented" },
          { id: "hipaa-breach-2", label: "HHS reporting process defined (60-day rule)" },
          { id: "hipaa-breach-3", label: "Business Associate Agreements (BAAs) in place for all relevant vendors" },
        ],
      },
    ],
  },
  {
    id: "nist-csf",
    name: "NIST CSF",
    description: "NIST Cybersecurity Framework for identifying, protecting, detecting, responding, and recovering.",
    sections: [
      {
        id: "nist-identify",
        name: "Identify",
        items: [
          { id: "nist-id-1", label: "Asset inventory (hardware and software) maintained" },
          { id: "nist-id-2", label: "Business environment and critical services documented" },
          { id: "nist-id-3", label: "Governance policies and risk management strategy defined" },
          { id: "nist-id-4", label: "Risk assessment performed and documented" },
        ],
      },
      {
        id: "nist-protect",
        name: "Protect",
        items: [
          { id: "nist-pr-1", label: "Access management controls implemented (least privilege)" },
          { id: "nist-pr-2", label: "Security awareness training program active" },
          { id: "nist-pr-3", label: "Data at rest and in transit encrypted" },
          { id: "nist-pr-4", label: "Patching and vulnerability management process in place" },
          { id: "nist-pr-5", label: "Protective technology deployed (firewalls, EDR, etc.)" },
        ],
      },
      {
        id: "nist-detect",
        name: "Detect",
        items: [
          { id: "nist-de-1", label: "Anomalous activity monitoring and alerting configured" },
          { id: "nist-de-2", label: "Security continuous monitoring processes implemented" },
          { id: "nist-de-3", label: "Detection processes tested regularly" },
        ],
      },
      {
        id: "nist-respond",
        name: "Respond",
        items: [
          { id: "nist-rs-1", label: "Incident response plan documented and communicated" },
          { id: "nist-rs-2", label: "Incident response plan tested (tabletop or full exercise)" },
          { id: "nist-rs-3", label: "External partners (legal, IR, PR) identified in advance" },
        ],
      },
      {
        id: "nist-recover",
        name: "Recover",
        items: [
          { id: "nist-rc-1", label: "Recovery plan documented and tested" },
          { id: "nist-rc-2", label: "Backup and restoration verified" },
          { id: "nist-rc-3", label: "Post-incident lessons learned process defined" },
        ],
      },
    ],
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    description: "International standard for information security management systems (ISMS).",
    sections: [
      {
        id: "iso-context",
        name: "Context & Scope",
        items: [
          { id: "iso-ctx-1", label: "Interested parties and their requirements identified" },
          { id: "iso-ctx-2", label: "ISMS scope documented and approved" },
          { id: "iso-ctx-3", label: "Information security policy approved by leadership" },
        ],
      },
      {
        id: "iso-risk",
        name: "Risk Treatment",
        items: [
          { id: "iso-risk-1", label: "Information security risk assessment completed" },
          { id: "iso-risk-2", label: "Risk treatment plan approved and implemented" },
          { id: "iso-risk-3", label: "Statement of Applicability (SoA) documented" },
        ],
      },
      {
        id: "iso-controls",
        name: "Annex A Controls",
        items: [
          { id: "iso-ctrl-1", label: "A.5 – Information security policies reviewed annually" },
          { id: "iso-ctrl-2", label: "A.6 – Organization of information security roles defined" },
          { id: "iso-ctrl-3", label: "A.8 – Asset management and classification in place" },
          { id: "iso-ctrl-4", label: "A.9 – Access control policy implemented" },
          { id: "iso-ctrl-5", label: "A.10 – Cryptography policy defined and enforced" },
          { id: "iso-ctrl-6", label: "A.12 – Operations security (logging, monitoring, patching)" },
          { id: "iso-ctrl-7", label: "A.16 – Information security incident management process active" },
          { id: "iso-ctrl-8", label: "A.17 – Business continuity plan tested" },
        ],
      },
      {
        id: "iso-audit",
        name: "Internal Audit & Review",
        items: [
          { id: "iso-audit-1", label: "Internal ISMS audit conducted at planned intervals" },
          { id: "iso-audit-2", label: "Management review of ISMS performed" },
          { id: "iso-audit-3", label: "Nonconformities and corrective actions tracked" },
        ],
      },
    ],
  },
  {
    id: "pci-dss",
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard for handling cardholder data.",
    sections: [
      {
        id: "pci-network",
        name: "Req 1-2 – Secure Network",
        items: [
          { id: "pci-net-1", label: "Firewalls installed and configured per policy" },
          { id: "pci-net-2", label: "Vendor-supplied default passwords changed on all systems" },
          { id: "pci-net-3", label: "Network segmentation between CDE and other networks" },
        ],
      },
      {
        id: "pci-data",
        name: "Req 3-4 – Protect Cardholder Data",
        items: [
          { id: "pci-data-1", label: "Stored cardholder data minimized and protected" },
          { id: "pci-data-2", label: "PAN masked when displayed" },
          { id: "pci-data-3", label: "Cardholder data encrypted in transit (TLS 1.2+)" },
        ],
      },
      {
        id: "pci-vuln",
        name: "Req 5-6 – Vulnerability Management",
        items: [
          { id: "pci-vuln-1", label: "Anti-malware deployed on all applicable systems" },
          { id: "pci-vuln-2", label: "Critical patches applied within one month" },
          { id: "pci-vuln-3", label: "Secure development practices followed" },
        ],
      },
      {
        id: "pci-access",
        name: "Req 7-9 – Access Control",
        items: [
          { id: "pci-acc-1", label: "Access to cardholder data restricted by business need" },
          { id: "pci-acc-2", label: "Unique IDs assigned to all users" },
          { id: "pci-acc-3", label: "Physical access to CDE restricted and logged" },
        ],
      },
      {
        id: "pci-monitor",
        name: "Req 10-11 – Monitor & Test",
        items: [
          { id: "pci-mon-1", label: "All access to CDE logged and audit logs retained 12 months" },
          { id: "pci-mon-2", label: "Log reviews performed daily" },
          { id: "pci-mon-3", label: "Quarterly internal vulnerability scans performed" },
          { id: "pci-mon-4", label: "Annual penetration test completed" },
        ],
      },
    ],
  },
  {
    id: "cmmc",
    name: "CMMC 2.0",
    description: "Cybersecurity Maturity Model Certification for DoD contractors handling CUI.",
    sections: [
      {
        id: "cmmc-ac",
        name: "Access Control (AC)",
        items: [
          { id: "cmmc-ac-1", label: "System access limited to authorized users" },
          { id: "cmmc-ac-2", label: "CUI access limited to authorized users and processes" },
          { id: "cmmc-ac-3", label: "External connections controlled" },
          { id: "cmmc-ac-4", label: "Mobile device use policy enforced" },
        ],
      },
      {
        id: "cmmc-ia",
        name: "Identification & Authentication (IA)",
        items: [
          { id: "cmmc-ia-1", label: "Unique user IDs enforced" },
          { id: "cmmc-ia-2", label: "MFA required for privileged and non-privileged accounts" },
          { id: "cmmc-ia-3", label: "Password complexity and rotation policy enforced" },
        ],
      },
      {
        id: "cmmc-ir",
        name: "Incident Response (IR)",
        items: [
          { id: "cmmc-ir-1", label: "Incident response capability established" },
          { id: "cmmc-ir-2", label: "Incidents tracked, documented, and reported" },
          { id: "cmmc-ir-3", label: "Incident response tested" },
        ],
      },
      {
        id: "cmmc-cm",
        name: "Configuration Management (CM)",
        items: [
          { id: "cmmc-cm-1", label: "Baseline configurations established and maintained" },
          { id: "cmmc-cm-2", label: "Security configuration settings enforced" },
          { id: "cmmc-cm-3", label: "Unnecessary programs and functions disabled" },
        ],
      },
      {
        id: "cmmc-si",
        name: "System & Information Integrity (SI)",
        items: [
          { id: "cmmc-si-1", label: "Malicious code protection deployed" },
          { id: "cmmc-si-2", label: "Security alerts monitored and acted upon" },
          { id: "cmmc-si-3", label: "System flaws identified and remediated promptly" },
        ],
      },
    ],
  },
  {
    id: "cis",
    name: "CIS Controls v8",
    description: "Center for Internet Security prioritized set of actions to defend against cyber threats.",
    sections: [
      {
        id: "cis-ig1",
        name: "IG1 – Basic Cyber Hygiene",
        items: [
          { id: "cis-ig1-1", label: "CIS Control 1: Enterprise asset inventory maintained" },
          { id: "cis-ig1-2", label: "CIS Control 2: Software asset inventory maintained" },
          { id: "cis-ig1-3", label: "CIS Control 3: Data protection policies in place" },
          { id: "cis-ig1-4", label: "CIS Control 4: Secure configuration baseline applied" },
          { id: "cis-ig1-5", label: "CIS Control 5: Account management enforced" },
          { id: "cis-ig1-6", label: "CIS Control 6: Access control management" },
        ],
      },
      {
        id: "cis-ig2",
        name: "IG2 – Foundational Controls",
        items: [
          { id: "cis-ig2-1", label: "CIS Control 7: Continuous vulnerability management active" },
          { id: "cis-ig2-2", label: "CIS Control 8: Audit log management implemented" },
          { id: "cis-ig2-3", label: "CIS Control 9: Email and web browser protections configured" },
          { id: "cis-ig2-4", label: "CIS Control 10: Malware defenses deployed" },
          { id: "cis-ig2-5", label: "CIS Control 11: Data recovery processes tested" },
          { id: "cis-ig2-6", label: "CIS Control 12: Network infrastructure management" },
        ],
      },
      {
        id: "cis-ig3",
        name: "IG3 – Organizational Controls",
        items: [
          { id: "cis-ig3-1", label: "CIS Control 14: Security awareness training program" },
          { id: "cis-ig3-2", label: "CIS Control 16: Application software security" },
          { id: "cis-ig3-3", label: "CIS Control 17: Incident response management" },
          { id: "cis-ig3-4", label: "CIS Control 18: Penetration testing performed" },
        ],
      },
    ],
  },
  {
    id: "gdpr",
    name: "GDPR",
    description: "EU General Data Protection Regulation for organizations handling personal data of EU residents.",
    sections: [
      {
        id: "gdpr-lawful",
        name: "Lawful Basis & Transparency",
        items: [
          { id: "gdpr-law-1", label: "Lawful basis for processing personal data documented" },
          { id: "gdpr-law-2", label: "Privacy notices updated and accessible" },
          { id: "gdpr-law-3", label: "Consent management processes implemented where required" },
        ],
      },
      {
        id: "gdpr-rights",
        name: "Data Subject Rights",
        items: [
          { id: "gdpr-rights-1", label: "Process to handle Subject Access Requests (30-day SLA)" },
          { id: "gdpr-rights-2", label: "Right to erasure (right to be forgotten) process in place" },
          { id: "gdpr-rights-3", label: "Data portability capability available" },
        ],
      },
      {
        id: "gdpr-security",
        name: "Data Security",
        items: [
          { id: "gdpr-sec-1", label: "Technical and organizational security measures documented" },
          { id: "gdpr-sec-2", label: "Data Processing Agreements (DPAs) with all processors" },
          { id: "gdpr-sec-3", label: "Data breach notification process (72-hour rule)" },
        ],
      },
      {
        id: "gdpr-dpia",
        name: "Accountability & Governance",
        items: [
          { id: "gdpr-dpia-1", label: "Records of processing activities (ROPA) maintained" },
          { id: "gdpr-dpia-2", label: "Data Protection Impact Assessments (DPIAs) performed for high-risk processing" },
          { id: "gdpr-dpia-3", label: "DPO appointed (if required)" },
        ],
      },
    ],
  },
];

// ─── EOL Tracker ─────────────────────────────────────────────────────────────

export interface EolRemediation {
  type: "replacement" | "eol-support";
  title: string;
  description: string;
  url?: string;
}

export interface EolProduct {
  id: string;
  vendorId: string;
  product: string;
  eolDate: string; // ISO date
  eosDate: string; // end-of-support date
  affectedAssets: number;
  remediationOptions: EolRemediation[];
}

export const eolProducts: EolProduct[] = [
  {
    id: "eol-1",
    vendorId: "watchguard",
    product: "Firebox T35/T55 Series",
    eolDate: "2026-12-31",
    eosDate: "2027-06-30",
    affectedAssets: 8,
    remediationOptions: [
      {
        type: "replacement",
        title: "Upgrade to Firebox T45/T85 Series",
        description: "The T45 and T85 provide direct replacements with improved throughput, updated security services, and extended support timelines through 2030+.",
        url: "https://www.watchguard.com/wgrd-products/network-security/tabletop-firewalls",
      },
      {
        type: "eol-support",
        title: "Purchase Extended Support",
        description: "WatchGuard offers optional extended support agreements for EOL hardware. Coverage continues for limited security updates but no new features.",
        url: "https://www.watchguard.com/wgrd-support/overview",
      },
    ],
  },
  {
    id: "eol-2",
    vendorId: "okta",
    product: "Okta Classic Engine",
    eolDate: "2026-09-30",
    eosDate: "2026-12-31",
    affectedAssets: 350,
    remediationOptions: [
      {
        type: "replacement",
        title: "Migrate to Okta Identity Engine (OIE)",
        description: "OIE is Okta's next-generation platform with a policy framework, device assurance, enhanced MFA options, and improved app integrations. Migration tooling is available in the Okta Admin Console.",
        url: "https://help.okta.com/oie/en-us/content/topics/identity-engine/oie-index.htm",
      },
    ],
  },
  {
    id: "eol-3",
    vendorId: "microsoft",
    product: "Windows Server 2016",
    eolDate: "2027-01-12",
    eosDate: "2027-01-12",
    affectedAssets: 14,
    remediationOptions: [
      {
        type: "replacement",
        title: "Upgrade to Windows Server 2025",
        description: "Windows Server 2025 provides improved security baselines, Azure hybrid integration, and support through 2034. In-place upgrade is supported from Server 2016.",
        url: "https://www.microsoft.com/en-us/windows-server",
      },
      {
        type: "eol-support",
        title: "Extended Security Updates (ESU)",
        description: "Microsoft offers paid Extended Security Updates for up to 3 years post-EOL covering critical and important security patches only. Available per-server or via Azure Arc.",
        url: "https://learn.microsoft.com/en-us/windows-server/get-started/extended-security-updates-overview",
      },
    ],
  },
  {
    id: "eol-4",
    vendorId: "cisco",
    product: "Catalyst 3650 Series",
    eolDate: "2026-10-31",
    eosDate: "2027-10-31",
    affectedAssets: 22,
    remediationOptions: [
      {
        type: "replacement",
        title: "Replace with Catalyst 9300 Series",
        description: "The Catalyst 9300 is the direct successor with full Cisco IOS XE, StackWise-480 stacking, enhanced UADP ASIC, and Cisco DNA Center support.",
        url: "https://www.cisco.com/c/en/us/products/switches/catalyst-9300-series-switches/index.html",
      },
      {
        type: "eol-support",
        title: "Purchase Cisco SMARTnet Extended Support",
        description: "Cisco SMARTnet can provide continued TAC support and hardware replacement beyond official EOL. Pricing varies by device quantity and coverage level.",
        url: "https://www.cisco.com/c/en/us/products/services/smartnet/index.html",
      },
    ],
  },
];

// ─── Vendor Patch Schedules ───────────────────────────────────────────────────

export interface VendorPatchSchedule {
  vendorId: string;
  scheduleName: string;
  frequency: string;
  description: string;
  nextPatchDate: string; // ISO date
  notesUrl?: string;
}

export const vendorPatchSchedules: VendorPatchSchedule[] = [
  {
    vendorId: "microsoft",
    scheduleName: "Patch Tuesday",
    frequency: "Monthly – 2nd Tuesday",
    description: "Microsoft releases security updates, cumulative updates, and optional non-security updates on the second Tuesday of each month.",
    nextPatchDate: "2026-04-14",
    notesUrl: "https://msrc.microsoft.com/update-guide/releaseNote",
  },
  {
    vendorId: "cisco",
    scheduleName: "Semi-Annual Security Bundle",
    frequency: "Twice yearly (March & September)",
    description: "Cisco releases bundled security advisories for IOS/IOS XE twice per year, with out-of-band advisories for critical vulnerabilities as needed.",
    nextPatchDate: "2026-09-24",
    notesUrl: "https://tools.cisco.com/security/center/publicationListing.x",
  },
  {
    vendorId: "fortinet",
    scheduleName: "Monthly Security Advisories",
    frequency: "Monthly – 1st Tuesday",
    description: "Fortinet publishes security advisories for FortiOS, FortiGate, and other products on the first Tuesday of each month.",
    nextPatchDate: "2026-04-07",
    notesUrl: "https://www.fortiguard.com/psirt",
  },
  {
    vendorId: "palo-alto",
    scheduleName: "Monthly Security Advisories",
    frequency: "Monthly – 2nd Wednesday",
    description: "Palo Alto Networks releases PAN-OS and Panorama updates with accompanying security advisories on the second Wednesday of each month.",
    nextPatchDate: "2026-04-08",
    notesUrl: "https://security.paloaltonetworks.com/",
  },
  {
    vendorId: "crowdstrike",
    scheduleName: "Continuous Sensor Updates",
    frequency: "Weekly / On-demand",
    description: "CrowdStrike Falcon sensor updates are released continuously and deployed automatically via the Falcon cloud. Content updates (AI/ML models, detections) update in real-time.",
    nextPatchDate: "2026-03-28",
    notesUrl: "https://www.crowdstrike.com/blog/tech-center/falcon-sensor-release-notes/",
  },
  {
    vendorId: "sentinelone",
    scheduleName: "Agent Release Cycle",
    frequency: "Monthly",
    description: "SentinelOne releases agent updates monthly with security fixes and feature additions. GA, EA, and LTS branches available.",
    nextPatchDate: "2026-04-15",
    notesUrl: "https://community.sentinelone.com/s/topic/0TO69000000blfmGAA/release-notes",
  },
  {
    vendorId: "okta",
    scheduleName: "Weekly Production Releases",
    frequency: "Weekly – Saturday",
    description: "Okta deploys production releases every Saturday. Preview deployments occur the prior Saturday. Release notes cover bug fixes, new features, and security patches.",
    nextPatchDate: "2026-03-28",
    notesUrl: "https://help.okta.com/en-us/content/topics/releasenotes/release-notes.htm",
  },
  {
    vendorId: "veeam",
    scheduleName: "Quarterly Update Releases",
    frequency: "Quarterly",
    description: "Veeam releases cumulative update patches quarterly for Backup & Replication, ONE, and other products, with critical hotfixes released out-of-band.",
    nextPatchDate: "2026-05-20",
    notesUrl: "https://www.veeam.com/kb-all.html",
  },
  {
    vendorId: "watchguard",
    scheduleName: "Fireware OS Updates",
    frequency: "Quarterly / As needed",
    description: "WatchGuard releases Fireware OS updates quarterly, with out-of-band releases for critical security patches.",
    nextPatchDate: "2026-04-30",
    notesUrl: "https://www.watchguard.com/wgrd-support/fireware-os-software-downloads",
  },
  {
    vendorId: "sophos",
    scheduleName: "Automatic Firmware & Definition Updates",
    frequency: "Weekly / Real-time definitions",
    description: "Sophos XG/XGS firmware updates are released monthly. Threat intelligence and definitions update continuously in real-time via Sophos Labs.",
    nextPatchDate: "2026-04-01",
    notesUrl: "https://community.sophos.com/b/release-notes",
  },
  {
    vendorId: "connectwise",
    scheduleName: "Monthly Platform Updates",
    frequency: "Monthly",
    description: "ConnectWise releases updates for Automate, Manage, and Control on a monthly cadence, with security hotfixes as needed.",
    nextPatchDate: "2026-04-20",
    notesUrl: "https://docs.connectwise.com/ConnectWise_Automate_Documentation/Release_Notes",
  },
  {
    vendorId: "datto",
    scheduleName: "RMM Agent Updates",
    frequency: "Monthly / On-demand",
    description: "Datto RMM agent updates and platform patches are released monthly, with security-critical updates pushed out-of-band.",
    nextPatchDate: "2026-04-10",
    notesUrl: "https://rmm.datto.com/help/en/Content/0LANDING/releasenotes/releasenotes.htm",
  },
  {
    vendorId: "ninjaone",
    scheduleName: "Bi-weekly Platform Releases",
    frequency: "Every 2 weeks",
    description: "NinjaOne releases platform updates every two weeks covering the RMM agent, ticketing, and patching engine.",
    nextPatchDate: "2026-04-03",
    notesUrl: "https://ninjarmm.zendesk.com/hc/en-us/categories/4406489994893-Release-Notes",
  },
];

// ─── CVE Alerts ───────────────────────────────────────────────────────────────

export type CveSeverity = "critical" | "high" | "medium" | "low";

export interface CveAlert {
  id: string;
  vendorId: string;
  cveId: string;
  severity: CveSeverity;
  summary: string;
  affectedProducts: string;
  dateReported: string; // ISO date
  immediateAction: boolean;
  patchUrl: string;
  advisoryUrl: string;
}

export const cveAlerts: CveAlert[] = [
  {
    id: "cve-1",
    vendorId: "palo-alto",
    cveId: "CVE-2025-0108",
    severity: "critical",
    summary: "Authentication bypass in PAN-OS management interface allowing unauthenticated access.",
    affectedProducts: "PAN-OS 10.2, 11.0, 11.1 (management interface exposed)",
    dateReported: "2026-02-12",
    immediateAction: true,
    patchUrl: "https://security.paloaltonetworks.com/CVE-2025-0108",
    advisoryUrl: "https://security.paloaltonetworks.com/CVE-2025-0108",
  },
  {
    id: "cve-2",
    vendorId: "fortinet",
    cveId: "CVE-2024-55591",
    severity: "critical",
    summary: "Authentication bypass via crafted Node.js WebSocket messages in FortiOS and FortiProxy.",
    affectedProducts: "FortiOS 7.0.0–7.0.16, FortiProxy 7.0.0–7.0.19",
    dateReported: "2026-01-14",
    immediateAction: true,
    patchUrl: "https://www.fortiguard.com/psirt/FG-IR-24-535",
    advisoryUrl: "https://www.fortiguard.com/psirt/FG-IR-24-535",
  },
  {
    id: "cve-3",
    vendorId: "microsoft",
    cveId: "CVE-2025-29824",
    severity: "critical",
    summary: "Windows CLFS driver privilege escalation vulnerability allowing SYSTEM-level code execution.",
    affectedProducts: "Windows 10, Windows 11, Windows Server 2016/2019/2022",
    dateReported: "2026-04-08",
    immediateAction: true,
    patchUrl: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-29824",
    advisoryUrl: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-29824",
  },
  {
    id: "cve-4",
    vendorId: "cisco",
    cveId: "CVE-2024-20353",
    severity: "high",
    summary: "Denial-of-service vulnerability in Cisco ASA and FTD SSL/TLS handling.",
    affectedProducts: "Cisco ASA 9.x, FTD 7.x with remote access VPN enabled",
    dateReported: "2026-01-22",
    immediateAction: false,
    patchUrl: "https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-asaftd-persist-rce-wGmn3MpZ",
    advisoryUrl: "https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-asaftd-persist-rce-wGmn3MpZ",
  },
  {
    id: "cve-5",
    vendorId: "okta",
    cveId: "CVE-2024-9191",
    severity: "high",
    summary: "Okta Browser Plugin privilege escalation via malicious extension interaction.",
    affectedProducts: "Okta Browser Plugin < 6.36.0 on Windows",
    dateReported: "2026-02-05",
    immediateAction: false,
    patchUrl: "https://trust.okta.com/security-advisories/okta-browser-plugin-privilege-escalation-cve-2024-9191/",
    advisoryUrl: "https://trust.okta.com/security-advisories/okta-browser-plugin-privilege-escalation-cve-2024-9191/",
  },
];
