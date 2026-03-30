"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProjects } from "@/services/project-read";
export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getProjects();
      setProjects(data);
    }
    load();
  }, []);
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
         {projects.length === 0 ? (
  <p className="text-gray-600">Aún no hay proyectos guardados.</p>
) : (
  <ul className="space-y-3">
    {projects.map((p) => (
      <li key={p.id} className="rounded-xl border p-4">
        <strong>{p.projectName || "Sin nombre"}</strong> - {p.clientName || "Sin cliente"}
      </li>
    ))}
  </ul>
)}
        </div>
      </div>
    </main>
  );
}
