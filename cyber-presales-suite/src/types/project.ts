export interface ProjectInputs {
  endpoints: number;
  servers: number;
  firewalls: number;
  securityAppliances: number;
  adControllers: number;
  sites: number;
  vpnUsers: number;
  publishedApps: number;
  databases: number;
  mailServers: number;
  webServers: number;
  hasAws: boolean;
  hasAzure: boolean;
  hasGcp: boolean;
  cloudAccounts: number;
  hybridEnvironment: boolean;
  selectedServices: string[];
  operationMode: "8x5" | "16x5" | "24x7";
  requiresHA: boolean;
  requiresDR: boolean;
  multiSite: boolean;
  criticality: "Baja" | "Media" | "Alta" | "Critica";
  complianceTags: string[];
}

export interface EstimatedLicenses {
  siem?: string;
  edr?: string;
  waf?: string;
  pam?: string;
  vm?: string;
  ztna?: string;
  soc?: string;
}

export interface ProjectResults {
  complexityLevel: "Bajo" | "Medio" | "Alto" | "Critico";
  complexityScore: number;
  estimatedEPS: number;
  setupHours: number;
  supportHours: number;
  estimatedLicenses: EstimatedLicenses;
  architectureRecommendations: string[];
  assumptions: string[];
  risks: string[];
}

export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  country: string;
  industry: string;
  opportunityType: string;
  owner: string;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  inputs: ProjectInputs;
  results?: ProjectResults;
}

export const defaultProjectInputs: ProjectInputs = {
  endpoints: 0,
  servers: 0,
  firewalls: 0,
  securityAppliances: 0,
  adControllers: 0,
  sites: 0,
  vpnUsers: 0,
  publishedApps: 0,
  databases: 0,
  mailServers: 0,
  webServers: 0,
  hasAws: false,
  hasAzure: false,
  hasGcp: false,
  cloudAccounts: 0,
  hybridEnvironment: false,
  selectedServices: [],
  operationMode: "8x5",
  requiresHA: false,
  requiresDR: false,
  multiSite: false,
  criticality: "Media",
  complianceTags: [],
};
