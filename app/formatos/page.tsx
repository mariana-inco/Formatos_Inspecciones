import Link from "next/link";
import { formatos } from "./data";

export const metadata = {
  title: "Formatos de inspección",
};

export default function FormatosPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-900">
            INSPECCIONES
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Formatos de inspección
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Selecciona un formato para abrir la pantalla base. Esta estructura está pensada para un desarrollo ordenado dentro de un mismo repositorio.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {formatos.map((formato) => (
            <article
              key={formato.codigo}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">{formato.codigo}</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">{formato.nombre}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">Área: {formato.area}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">Responsable: {formato.responsable}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">Ruta disponible: {formato.ruta}</p>
                  <Link
                    href={formato.ruta}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Abrir formato
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
