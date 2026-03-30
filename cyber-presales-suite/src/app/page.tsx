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
