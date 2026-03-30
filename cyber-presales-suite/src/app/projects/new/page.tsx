"use client";

import { useMemo, useState } from "react";
import { calculateProject } from "@/lib/calculations";
import { defaultProjectInputs, ProjectInputs, Project } from "@/types/project";
import { saveProject } from "@/services/project-service";

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
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => calculateProject(inputs), [inputs]);

  function updateField<K extends keyof ProjectInputs>(
    field: K,
    value: ProjectInputs[K]
  ) {
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

  async function handleSaveProject() {
    try {
      setLoading(true);

      const project: Project = {
        id: "",
        clientName,
        projectName,
        country,
        industry,
        opportunityType: "Nuevo",
        owner: "Manuel",
        description: "",
        notes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputs,
        results,
      };

      const id = await saveProject(project);
      console.log("Proyecto guardado:", id);
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error guardando:", error);
      alert(`Error al guardar proyecto: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <a
          href="/dashboard"
          className="mb-4 inline-block text-sm text-blue-600 underline"
        >
          ← Volver al dashboard
        </a>

        <h1 className="text-3xl font-bold">Nuevo proyecto</h1>
        <p className="mt-2 text-gray-600">
          Versión inicial con cálculo en tiempo real.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Datos generales</h2>
            <div className="mt-4 grid gap-4">
              <input
                className="rounded-xl border p-3"
                placeholder="Cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <input
                className="rounded-xl border p-3"
                placeholder="Proyecto"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <input
                className="rounded-xl border p-3"
                placeholder="País"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              <input
                className="rounded-xl border p-3"
                placeholder="Industria"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <h2 className="mt-8 text-xl font-semibold">Infraestructura</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <NumberInput
                label="Endpoints"
                value={inputs.endpoints}
                onChange={(v) => updateField("endpoints", v)}
              />
              <NumberInput
                label="Servidores"
                value={inputs.servers}
                onChange={(v) => updateField("servers", v)}
              />
              <NumberInput
                label="Firewalls"
                value={inputs.firewalls}
                onChange={(v) => updateField("firewalls", v)}
              />
              <NumberInput
                label="AD Controllers"
                value={inputs.adControllers}
                onChange={(v) => updateField("adControllers", v)}
              />
              <NumberInput
                label="Apps publicadas"
                value={inputs.publishedApps}
                onChange={(v) => updateField("publishedApps", v)}
              />
              <NumberInput
                label="Usuarios VPN"
                value={inputs.vpnUsers}
                onChange={(v) => updateField("vpnUsers", v)}
              />
            </div>

            <h2 className="mt-8 text-xl font-semibold">Cloud y operación</h2>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-4">
                <Check
                  label="AWS"
                  checked={inputs.hasAws}
                  onChange={(v) => updateField("hasAws", v)}
                />
                <Check
                  label="Azure"
                  checked={inputs.hasAzure}
                  onChange={(v) => updateField("hasAzure", v)}
                />
                <Check
                  label="GCP"
                  checked={inputs.hasGcp}
                  onChange={(v) => updateField("hasGcp", v)}
                />
                <Check
                  label="Híbrido"
                  checked={inputs.hybridEnvironment}
                  onChange={(v) => updateField("hybridEnvironment", v)}
                />
              </div>

              <NumberInput
                label="Cloud accounts"
                value={inputs.cloudAccounts}
                onChange={(v) => updateField("cloudAccounts", v)}
              />

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cobertura
                </label>
                <select
                  className="w-full rounded-xl border p-3"
                  value={inputs.operationMode}
                  onChange={(e) =>
                    updateField(
                      "operationMode",
                      e.target.value as ProjectInputs["operationMode"]
                    )
                  }
                >
                  <option value="8x5">8x5</option>
                  <option value="16x5">16x5</option>
                  <option value="24x7">24x7</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Criticidad
                </label>
                <select
                  className="w-full rounded-xl border p-3"
                  value={inputs.criticality}
                  onChange={(e) =>
                    updateField(
                      "criticality",
                      e.target.value as ProjectInputs["criticality"]
                    )
                  }
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Critica">Crítica</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-4">
                <Check
                  label="HA"
                  checked={inputs.requiresHA}
                  onChange={(v) => updateField("requiresHA", v)}
                />
                <Check
                  label="DR"
                  checked={inputs.requiresDR}
                  onChange={(v) => updateField("requiresDR", v)}
                />
                <Check
                  label="Multisite"
                  checked={inputs.multiSite}
                  onChange={(v) => updateField("multiSite", v)}
                />
              </div>
            </div>

            <h2 className="mt-8 text-xl font-semibold">Servicios</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {serviceOptions.map((service) => (
                <label
                  key={service}
                  className="flex items-center gap-2 rounded-xl border p-3"
                >
                  <input
                    type="checkbox"
                    checked={inputs.selectedServices.includes(service)}
                    onChange={() => toggleService(service)}
                  />
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
                    <li key={key}>
                      <strong>{key.toUpperCase()}:</strong> {String(value)}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <h3 className="font-semibold">Recomendaciones</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                {results.architectureRecommendations.length === 0 ? (
                  <li>Sin recomendaciones por ahora.</li>
                ) : (
                  results.architectureRecommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))
                )}
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

            <button
              onClick={handleSaveProject}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar proyecto"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
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

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
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
