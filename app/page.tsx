import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-900">
          INSPECCIONES HSE
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Bienvenidos a los formatos de inspección
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          En este repositorio se agrupan varios formatos de inspección. Navega al listado para seleccionar el formato que necesitas.
        </p>
        <div className="mt-8">
          <Link
            href="/formatos"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Ver formatos de inspección
          </Link>
        </div>
      </div>
    </div>
  );
}
