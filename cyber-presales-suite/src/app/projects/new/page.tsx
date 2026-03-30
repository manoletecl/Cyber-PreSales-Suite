"use client";

import { useMemo, useState } from "react";
import { calculateProject } from "@/lib/calculations";
import { defaultProjectInputs, ProjectInputs, Project } from "@/types/project";
import { saveProject } from "@/services/project-service";

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

  async function handleSave() {
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

      // 🚀 REDIRECCIÓN AUTOMÁTICA
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
        {/* BOTÓN VOLVER */}
        <a href="/dashboard" className="mb-4 inline-block text-sm text-blue-600 underline">
          ← Volver al dashboard
        </a>

        <h1 className="text-3xl font-bold">Nuevo proyecto</h1>
        <p className="text-gray-600 mb-6">
          Versión inicial con cálculo en tiempo real.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* FORM */}
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Datos generales</h2>

            <input
              className="w-full border rounded-xl p-3 mb-3"
              placeholder="Cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3 mb-3"
              placeholder="Proyecto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3 mb-3"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3 mb-3"
              placeholder="Industria"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          {/* RESULTADOS */}
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Resultados en tiempo real
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Card title="EPS estimado" value={results.estimatedEPS} />
              <Card title="Complejidad" value={results.complexityLevel} />
              <Card title="HH Setup" value={results.setupHours} />
              <Card title="HH Soporte" value={results.supportHours} />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Riesgos</h3>
              <ul className="text-sm text-gray-600 mt-2 list-disc pl-5">
                {results.risks.map((r: string) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            {/* BOTÓN GUARDAR */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-6 w-full bg-black text-white py-3 rounded-xl"
            >
              {loading ? "Guardando..." : "Guardar proyecto"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
