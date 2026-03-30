#!/usr/bin/env bash
set -e

PROJECT_NAME="cyber-presales-suite"

if [ ! -d "$PROJECT_NAME" ]; then
  npx create-next-app@latest "$PROJECT_NAME" \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --import-alias "@/*" \
    --use-npm
fi

cd "$PROJECT_NAME"

mkdir -p src/app/dashboard
mkdir -p src/app/projects/new
mkdir -p src/app/projects/[id]
mkdir -p src/app/projects/[id]/results
mkdir -p src/components/layout
mkdir -p src/components/dashboard
mkdir -p src/components/projects
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/services
mkdir -p src/firebase
mkdir -p public/images

cat > src/types/project.ts <<'EOF'
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
EOF

cat > src/lib/calculations.ts <<'EOF'
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
EOF

cat > src/app/page.tsx <<'EOF'
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Cyber PreSales Suite</h1>
        <p className="mt-4 text-lg text-gray-600">
          MVP inicial para dimensionamiento de oportunidades de ciberseguridad.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/dashboard" className="rounded-2xl bg-black px-5 py-3 text-white">
            Ir al dashboard
          </Link>
          <Link href="/projects/new" className="rounded-2xl border px-5 py-3">
            Nuevo proyecto
          </Link>
        </div>
      </div>
    </main>
  );
}
EOF

cat > src/app/dashboard/page.tsx <<'EOF'
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Proyectos recientes y accesos rápidos.</p>
          </div>
          <Link href="/projects/new" className="rounded-2xl bg-black px-5 py-3 text-white">
            Nuevo proyecto
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-5">Total proyectos: 0</div>
          <div className="rounded-2xl border p-5">Críticos: 0</div>
          <div className="rounded-2xl border p-5">Actualizados hoy: 0</div>
        </div>

        <div className="mt-8 rounded-2xl border p-5">
          <p className="text-gray-600">Aún no hay proyectos guardados.</p>
        </div>
      </div>
    </main>
  );
}
EOF

cat > src/app/projects/new/page.tsx <<'EOF'
"use client";

import { useMemo, useState } from "react";
import { calculateProject } from "@/lib/calculations";
import { defaultProjectInputs, ProjectInputs } from "@/types/project";

const serviceOptions = [
  "SIEM",
  "SOC",
  "EDR/XDR",
  "WAF",
  "PAM",
  "Gestión de vulnerabilidades",
  "ZTNA",
  "Seguridad de correo",
  "DLP",
  "CSPM / Cloud Security",
];

export default function NewProjectPage() {
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [country, setCountry] = useState("Chile");
  const [industry, setIndustry] = useState("");
  const [inputs, setInputs] = useState<ProjectInputs>(defaultProjectInputs);

  const results = useMemo(() => calculateProject(inputs), [inputs]);

  function updateField<K extends keyof ProjectInputs>(field: K, value: ProjectInputs[K]) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  function toggleService(service: string) {
    setInputs((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter((s) => s !== service)
        : [...prev.selectedServices, service],
    }));
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Nuevo proyecto</h1>
        <p className="mt-2 text-gray-600">Versión inicial con cálculo en tiempo real.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Datos generales</h2>
            <div className="mt-4 grid gap-4">
              <input className="rounded-xl border p-3" placeholder="Cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              <input className="rounded-xl border p-3" placeholder="Proyecto" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              <input className="rounded-xl border p-3" placeholder="País" value={country} onChange={(e) => setCountry(e.target.value)} />
              <input className="rounded-xl border p-3" placeholder="Industria" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>

            <h2 className="mt-8 text-xl font-semibold">Infraestructura</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <NumberInput label="Endpoints" value={inputs.endpoints} onChange={(v) => updateField("endpoints", v)} />
              <NumberInput label="Servidores" value={inputs.servers} onChange={(v) => updateField("servers", v)} />
              <NumberInput label="Firewalls" value={inputs.firewalls} onChange={(v) => updateField("firewalls", v)} />
              <NumberInput label="AD Controllers" value={inputs.adControllers} onChange={(v) => updateField("adControllers", v)} />
              <NumberInput label="Apps publicadas" value={inputs.publishedApps} onChange={(v) => updateField("publishedApps", v)} />
              <NumberInput label="Usuarios VPN" value={inputs.vpnUsers} onChange={(v) => updateField("vpnUsers", v)} />
            </div>

            <h2 className="mt-8 text-xl font-semibold">Cloud y operación</h2>
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <Check label="AWS" checked={inputs.hasAws} onChange={(v) => updateField("hasAws", v)} />
                <Check label="Azure" checked={inputs.hasAzure} onChange={(v) => updateField("hasAzure", v)} />
                <Check label="GCP" checked={inputs.hasGcp} onChange={(v) => updateField("hasGcp", v)} />
                <Check label="Híbrido" checked={inputs.hybridEnvironment} onChange={(v) => updateField("hybridEnvironment", v)} />
              </div>
              <NumberInput label="Cloud accounts" value={inputs.cloudAccounts} onChange={(v) => updateField("cloudAccounts", v)} />
              <div>
                <label className="mb-2 block text-sm font-medium">Cobertura</label>
                <select className="w-full rounded-xl border p-3" value={inputs.operationMode} onChange={(e) => updateField("operationMode", e.target.value as ProjectInputs["operationMode"])}>
                  <option value="8x5">8x5</option>
                  <option value="16x5">16x5</option>
                  <option value="24x7">24x7</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Criticidad</label>
                <select className="w-full rounded-xl border p-3" value={inputs.criticality} onChange={(e) => updateField("criticality", e.target.value as ProjectInputs["criticality"])}>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Critica">Crítica</option>
                </select>
              </div>
              <div className="flex gap-4">
                <Check label="HA" checked={inputs.requiresHA} onChange={(v) => updateField("requiresHA", v)} />
                <Check label="DR" checked={inputs.requiresDR} onChange={(v) => updateField("requiresDR", v)} />
                <Check label="Multisite" checked={inputs.multiSite} onChange={(v) => updateField("multiSite", v)} />
              </div>
            </div>

            <h2 className="mt-8 text-xl font-semibold">Servicios</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center gap-2 rounded-xl border p-3">
                  <input type="checkbox" checked={inputs.selectedServices.includes(service)} onChange={() => toggleService(service)} />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Resultados en tiempo real</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card title="EPS estimado" value={String(results.estimatedEPS)} />
              <Card title="Complejidad" value={results.complexityLevel} />
              <Card title="HH Setup" value={String(results.setupHours)} />
              <Card title="HH Soporte" value={String(results.supportHours)} />
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <h3 className="font-semibold">Licencias referenciales</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {Object.entries(results.estimatedLicenses)
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <li key={key}><strong>{key.toUpperCase()}:</strong> {value}</li>
                  ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <h3 className="font-semibold">Recomendaciones</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                {results.architectureRecommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <h3 className="font-semibold">Riesgos</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                {results.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border p-3"
      />
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
EOF

cat > README.md <<'EOF'
# Cyber PreSales Suite

MVP inicial para arquitectos y preventa de ciberseguridad.

## Incluye
- Estructura base en Next.js
- Tipos TypeScript
- Motor inicial de cálculo
- Dashboard simple
- Formulario de proyecto con resultados en tiempo real

## Ejecutar
```bash
npm install
npm run dev
```
EOF

echo "✅ Estructura base creada en $PROJECT_NAME"
echo "👉 Ahora entra con: cd $PROJECT_NAME && npm run dev"
