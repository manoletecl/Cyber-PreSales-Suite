import { ProjectInputs, ProjectResults } from "@/types/project";

export function calculateProject(inputs: ProjectInputs): ProjectResults {
  const estimatedEPS =
    inputs.endpoints * 0.1 +
    inputs.servers * 0.5 +
    inputs.firewalls * 5 +
    inputs.securityAppliances * 3 +
    inputs.adControllers * 10 +
    inputs.publishedApps * 2 +
    inputs.databases * 1.5 +
    inputs.mailServers * 2 +
    inputs.webServers * 1 +
    (inputs.hasAws || inputs.hasAzure || inputs.hasGcp ? 15 : 0) +
    inputs.cloudAccounts * 3;

  let complexityScore = 0;
  if (inputs.endpoints > 1000) complexityScore += 2;
  if (inputs.servers > 100) complexityScore += 2;
  if (inputs.firewalls > 10) complexityScore += 2;
  if (inputs.multiSite) complexityScore += 2;
  if (inputs.requiresHA) complexityScore += 2;
  if (inputs.requiresDR) complexityScore += 2;
  if (inputs.operationMode === "24x7") complexityScore += 3;
  if (inputs.hybridEnvironment) complexityScore += 2;
  if (inputs.selectedServices.length > 4) complexityScore += 2;
  if (inputs.criticality === "Alta") complexityScore += 2;
  if (inputs.criticality === "Critica") complexityScore += 3;
  if (inputs.complianceTags.length > 0) complexityScore += 2;

  let complexityLevel: ProjectResults["complexityLevel"] = "Bajo";
  if (complexityScore >= 13) complexityLevel = "Critico";
  else if (complexityScore >= 8) complexityLevel = "Alto";
  else if (complexityScore >= 4) complexityLevel = "Medio";

  const setupBase = {
    Bajo: 16,
    Medio: 40,
    Alto: 80,
    Critico: 160,
  }[complexityLevel];

  let setupHours = setupBase;
  if (inputs.requiresHA) setupHours *= 1.15;
  if (inputs.requiresDR) setupHours *= 1.15;
  if (inputs.operationMode === "24x7") setupHours *= 1.1;
  if (inputs.hybridEnvironment) setupHours *= 1.1;
  if (inputs.selectedServices.length > 1) setupHours *= 1.1;
  if (inputs.selectedServices.length > 3) setupHours *= 1.15;

  const supportBase = {
    Bajo: 4,
    Medio: 10,
    Alto: 20,
    Critico: 40,
  }[complexityLevel];

  let supportHours = supportBase;
  if (inputs.operationMode === "24x7") supportHours *= 1.25;
  if (inputs.multiSite) supportHours *= 1.1;
  if (inputs.requiresHA || inputs.requiresDR) supportHours *= 1.1;

  const recommendations: string[] = [];
  if (inputs.publishedApps > 0) recommendations.push("Considerar WAF para aplicaciones publicadas.");
  if (inputs.hasAws || inputs.hasAzure || inputs.hasGcp) recommendations.push("Considerar controles de seguridad cloud y visibilidad centralizada.");
  if (inputs.hybridEnvironment) recommendations.push("Considerar arquitectura híbrida con integración centralizada.");
  if (inputs.vpnUsers > 100) recommendations.push("Evaluar ZTNA o acceso remoto moderno.");
  if (inputs.endpoints > 500 || inputs.servers > 50) recommendations.push("Evaluar SIEM o XDR centralizado.");

  return {
    complexityLevel,
    complexityScore,
    estimatedEPS: Number(estimatedEPS.toFixed(1)),
    setupHours: Math.round(setupHours),
    supportHours: Math.round(supportHours),
    estimatedLicenses: {
      siem: inputs.selectedServices.includes("SIEM") ? `${Math.ceil(estimatedEPS)} EPS referenciales` : undefined,
      edr: inputs.selectedServices.includes("EDR/XDR") ? `${inputs.endpoints} endpoints referenciales` : undefined,
      waf: inputs.selectedServices.includes("WAF") ? `${inputs.publishedApps} aplicaciones publicadas` : undefined,
      pam: inputs.selectedServices.includes("PAM") ? "Dimensionamiento referencial pendiente de cuentas privilegiadas" : undefined,
      vm: inputs.selectedServices.includes("Gestión de vulnerabilidades") ? `${inputs.endpoints + inputs.servers} activos referenciales` : undefined,
      ztna: inputs.selectedServices.includes("ZTNA") ? `${inputs.vpnUsers} usuarios remotos referenciales` : undefined,
      soc: inputs.selectedServices.includes("SOC") ? `${Math.ceil(estimatedEPS)} EPS y cobertura ${inputs.operationMode}` : undefined,
    },
    architectureRecommendations: recommendations,
    assumptions: [
      "Cálculo referencial para preventa.",
      "No reemplaza un assessment técnico detallado.",
    ],
    risks: [
      "Falta confirmar retención de logs.",
      "Falta confirmar integraciones requeridas.",
      "Falta confirmar responsabilidades operacionales.",
    ],
  };
}
