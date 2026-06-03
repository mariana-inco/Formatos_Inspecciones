import Link from "next/link";

type FormatDetailProps = {
  codigo: string;
  nombre: string;
  area: string;
  responsable: string;
};

export function FormatDetail({ codigo, nombre, area, responsable }: FormatDetailProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-emerald-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-900">{codigo}</p>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950 sm:text-3xl">{nombre}</h1>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-700 sm:flex-row sm:flex-wrap">
              <span className="rounded-full bg-slate-100 px-3 py-1.5">Área: {area}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">Responsable: {responsable}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-950">Formulario en construcción</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Esta pantalla base muestra la información principal del formato. La estructura está lista para desarrollar el formulario de inspección.
            </p>
          </div>

          <div className="flex justify-start">
            <Link
              href="/formatos"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Volver al listado de formatos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
