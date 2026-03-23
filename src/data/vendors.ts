export type VendorCategory =
  | "Networking"
  | "Firewalls / Security"
  | "Cloud / Infrastructure"
  | "Endpoint Security"
  | "RMM / PSA"
  | "Backup & DR"
  | "Identity & Access";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  description: string;
  website: string;
}

export const vendors: Vendor[] = [
  // Networking
  {
    id: "cisco",
    name: "Cisco",
    category: "Networking",
    description: "Enterprise networking, switching, routing, and collaboration solutions.",
    website: "https://www.cisco.com",
  },
  {
    id: "cisco-meraki",
    name: "Cisco Meraki",
    category: "Networking",
    description: "Cloud-managed IT solutions including wireless, switching, and security.",
    website: "https://meraki.cisco.com",
  },
  {
    id: "ubiquiti",
    name: "Ubiquiti",
    category: "Networking",
    description: "Networking equipment for enterprise and SMB including UniFi and EdgeMax.",
    website: "https://www.ui.com",
  },
  {
    id: "aruba",
    name: "Aruba (HPE)",
    category: "Networking",
    description: "Wired and wireless LAN, SD-WAN, and network security solutions.",
    website: "https://www.arubanetworks.com",
  },
  {
    id: "juniper",
    name: "Juniper Networks",
    category: "Networking",
    description: "AI-driven enterprise networking, routing, and security.",
    website: "https://www.juniper.net",
  },

  // Firewalls / Security
  {
    id: "palo-alto",
    name: "Palo Alto Networks",
    category: "Firewalls / Security",
    description: "Next-generation firewalls, cloud security, and threat intelligence.",
    website: "https://www.paloaltonetworks.com",
  },
  {
    id: "fortinet",
    name: "Fortinet",
    category: "Firewalls / Security",
    description: "FortiGate firewalls, SD-WAN, and unified threat management.",
    website: "https://www.fortinet.com",
  },
  {
    id: "sonicwall",
    name: "SonicWall",
    category: "Firewalls / Security",
    description: "Firewalls, secure remote access, and email security solutions.",
    website: "https://www.sonicwall.com",
  },
  {
    id: "watchguard",
    name: "WatchGuard",
    category: "Firewalls / Security",
    description: "Network security appliances, Wi-Fi security, and MFA solutions.",
    website: "https://www.watchguard.com",
  },
  {
    id: "sophos",
    name: "Sophos",
    category: "Firewalls / Security",
    description: "Next-gen firewalls, endpoint protection, and managed threat response.",
    website: "https://www.sophos.com",
  },

  // Cloud / Infrastructure
  {
    id: "microsoft",
    name: "Microsoft",
    category: "Cloud / Infrastructure",
    description: "Azure cloud, Microsoft 365, Windows Server, and enterprise software.",
    website: "https://www.microsoft.com",
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    category: "Cloud / Infrastructure",
    description: "Cloud computing platform with compute, storage, database, and AI services.",
    website: "https://aws.amazon.com",
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    category: "Cloud / Infrastructure",
    description: "Cloud computing, data analytics, and machine learning services.",
    website: "https://cloud.google.com",
  },

  // Endpoint Security
  {
    id: "crowdstrike",
    name: "CrowdStrike",
    category: "Endpoint Security",
    description: "Cloud-native endpoint protection, threat intelligence, and incident response.",
    website: "https://www.crowdstrike.com",
  },
  {
    id: "sentinelone",
    name: "SentinelOne",
    category: "Endpoint Security",
    description: "AI-powered endpoint detection and response (EDR) platform.",
    website: "https://www.sentinelone.com",
  },
  {
    id: "carbon-black",
    name: "Carbon Black (VMware)",
    category: "Endpoint Security",
    description: "Cloud-native endpoint and workload protection.",
    website: "https://www.carbonblack.com",
  },
  {
    id: "microsoft-defender",
    name: "Microsoft Defender",
    category: "Endpoint Security",
    description: "Integrated endpoint security, threat detection, and response.",
    website: "https://www.microsoft.com/security/business/endpoint-security",
  },

  // RMM / PSA
  {
    id: "connectwise",
    name: "ConnectWise",
    category: "RMM / PSA",
    description: "IT management platform with RMM, PSA, and cybersecurity solutions.",
    website: "https://www.connectwise.com",
  },
  {
    id: "datto",
    name: "Datto (Kaseya)",
    category: "RMM / PSA",
    description: "MSP-focused RMM, backup, disaster recovery, and networking tools.",
    website: "https://www.datto.com",
  },
  {
    id: "ninjaone",
    name: "NinjaOne",
    category: "RMM / PSA",
    description: "Unified IT management with RMM, patch management, and remote access.",
    website: "https://www.ninjaone.com",
  },
  {
    id: "n-able",
    name: "N-able",
    category: "RMM / PSA",
    description: "IT management solutions including N-central and N-sight RMM.",
    website: "https://www.n-able.com",
  },

  // Backup & DR
  {
    id: "veeam",
    name: "Veeam",
    category: "Backup & DR",
    description: "Data backup, disaster recovery, and intelligent data management.",
    website: "https://www.veeam.com",
  },
  {
    id: "acronis",
    name: "Acronis",
    category: "Backup & DR",
    description: "Cyber protection combining backup, disaster recovery, and security.",
    website: "https://www.acronis.com",
  },
  {
    id: "druva",
    name: "Druva",
    category: "Backup & DR",
    description: "SaaS-based data protection and management across endpoints and cloud.",
    website: "https://www.druva.com",
  },

  // Identity & Access
  {
    id: "okta",
    name: "Okta",
    category: "Identity & Access",
    description: "Identity and access management, SSO, and multi-factor authentication.",
    website: "https://www.okta.com",
  },
  {
    id: "duo-security",
    name: "Duo Security (Cisco)",
    category: "Identity & Access",
    description: "Multi-factor authentication and zero-trust security platform.",
    website: "https://duo.com",
  },
  {
    id: "jumpcloud",
    name: "JumpCloud",
    category: "Identity & Access",
    description: "Open directory platform for identity, access, and device management.",
    website: "https://jumpcloud.com",
  },
];

export const vendorCategories: VendorCategory[] = [
  "Networking",
  "Firewalls / Security",
  "Cloud / Infrastructure",
  "Endpoint Security",
  "RMM / PSA",
  "Backup & DR",
  "Identity & Access",
];
