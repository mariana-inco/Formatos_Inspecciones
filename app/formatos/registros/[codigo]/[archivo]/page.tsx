import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    codigo: string;
    archivo: string;
  }>;
};

type FuenteRegistro = {
  dir: string;
  nombre: string;
};

const fuentesPorCodigo: Record<string, FuenteRegistro> = {
  "HSE-F006": { dir: "inspeccion-equipos-proteccion-contra-caidas", nombre: "Inspección de equipos de protección contra caídas" },
  "HSE-F002": { dir: "inspeccion-epp", nombre: "Inspección de elementos de protección personal" },
  "HSE-F020": { dir: "verificacion-alcohol-drogas", nombre: "Verificación en sitio de alcohol y drogas" },
  "HSE-F003": { dir: "inspeccion-extintores", nombre: "Inspección de extintores" },
  "HSE-F010": { dir: "lista-chequeo-condiciones-seguridad", nombre: "Lista de chequeo de las condiciones de seguridad" },
};

const estadoChequeo = (estadoId?: number | null) => {
  if (estadoId === 1) return { label: "Cumple", className: "bg-emerald-100 text-emerald-800" };
  if (estadoId === 2) return { label: "Con novedad", className: "bg-red-100 text-red-800" };
  if (estadoId === 3) return { label: "N.A", className: "bg-slate-100 text-slate-700" };
  return { label: "Sin evaluar", className: "bg-amber-50 text-amber-700" };
};

const etiquetaCampo = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const valorVacio = (value: unknown) => value === null || value === undefined || value === "";
const esImagenBase64 = (value: unknown): value is string => typeof value === "string" && value.startsWith("data:image/");

const mostrarValor = (value: unknown): React.ReactNode => {
  if (valorVacio(value)) return <span className="text-slate-400">Sin dato</span>;
  if (esImagenBase64(value)) {
    return (
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-white px-3 py-2">
        <img src={value} alt="Evidencia registrada" className="h-full w-full object-contain" />
      </div>
    );
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value);
};

const renderCampo = (label: string, value: unknown) => (
  <div key={label} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">{mostrarValor(value)}</div>
  </div>
);

const renderGenerico = (value: unknown, keyPath = "root"): React.ReactNode => {
  if (valorVacio(value)) return <span className="text-slate-400">Sin dato</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-400">Sin registros</span>;
    return (
      <div className="space-y-4">
        {value.map((item, index) => (
          <section key={`${keyPath}-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Registro {index + 1}</p>
            <div className="mt-3">{renderGenerico(item, `${keyPath}-${index}`)}</div>
          </section>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([key, item]) => key !== "__archivo" && !valorVacio(item));
    if (entries.length === 0) return <span className="text-slate-400">Sin datos</span>;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map(([key, item]) => (
          <div key={`${keyPath}-${key}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{etiquetaCampo(key)}</p>
            <div className="mt-3 text-sm font-semibold leading-6 text-slate-900">{renderGenerico(item, `${keyPath}-${key}`)}</div>
          </div>
        ))}
      </div>
    );
  }
  return mostrarValor(value);
};

const renderListaChequeo = (registro: any) => {
  const grupos = registro.itemsInspeccion || [];
  const items = grupos.flatMap((grupo: any) => grupo.items || []);
  const cumplen = items.filter((item: any) => item.estadoId === 1).length;
  const novedades = items.filter((item: any) => item.estadoId === 2).length;
  const noAplica = items.filter((item: any) => item.estadoId === 3).length;
  const total = items.length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total ítems", total, "bg-slate-100 text-slate-700"],
          ["Cumplen", cumplen, "bg-emerald-100 text-emerald-800"],
          ["Con novedad", novedades, "bg-red-100 text-red-800"],
          ["No aplica", noAplica, "bg-slate-100 text-slate-700"],
        ].map(([label, value, className]) => (
          <article key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-3 inline-flex rounded-full px-4 py-2 text-2xl font-bold ${className}`}>{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Datos generales</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(registro.datosGenerales || {}).map(([key, value]) => renderCampo(etiquetaCampo(key), value))}
        </div>
      </section>

      <section className="space-y-4">
        {grupos.map((grupo: any) => (
          <article key={grupo.grupoTitulo} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-950">{grupo.grupoTitulo}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {(grupo.items || []).map((item: any) => {
                const estado = estadoChequeo(item.estadoId);
                return (
                  <div key={item.key || item.criterio} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_150px_minmax(220px,0.7fr)] lg:items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.criterio || "Ítem sin criterio"}</p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${estado.className}`}>{estado.label}</span>
                    <p className="text-sm font-medium leading-6 text-slate-600">{item.observaciones || "Sin observaciones"}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      {registro.otros?.detalle?.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Otros</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {registro.otros.detalle.map((item: any) => {
              const estado = estadoChequeo(item.estadoId);
              return (
                <div key={item.numeroRegistro} className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-950">{item.cual || `Otro ${item.numeroRegistro}`}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado.className}`}>{estado.label}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-600">{item.observaciones || "Sin observaciones"}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {renderCampo("Observaciones generales", registro.observacionesGenerales)}
        {renderCampo("Recomendaciones", registro.recomendaciones)}
      </section>
    </div>
  );
};

const leerRegistro = async (codigo: string, archivo: string) => {
  const fuente = fuentesPorCodigo[codigo];
  if (!fuente || !archivo.endsWith(".json") || archivo.includes("/") || archivo.includes("\\") || archivo.includes("..")) notFound();

  try {
    const contenido = await readFile(path.join(process.cwd(), "respuestas-json", fuente.dir, archivo), "utf8");
    return { fuente, registro: JSON.parse(contenido) };
  } catch {
    notFound();
  }
};

export default async function RegistroDiligenciadoPage({ params }: PageProps) {
  const { codigo, archivo } = await params;
  const { fuente, registro } = await leerRegistro(codigo, archivo);
  const formato = registro.formato || {};
  const titulo = formato.nombre || fuente.nombre;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#006948] text-white">
              <ClipboardCheck className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{codigo}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">{titulo}</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">{archivo}</p>
            </div>
          </div>
          <Link href="/formatos" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#006948] hover:text-[#006948]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Código", formato.codigo || codigo],
            ["Versión", formato.version],
            ["Fecha formato", formato.fecha],
            ["Área", formato.area],
          ].map(([label, value]) => renderCampo(String(label), value))}
        </section>

        {codigo === "HSE-F010" ? (
          renderListaChequeo(registro)
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="size-5 text-[#006948]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-950">Formato diligenciado</h2>
            </div>
            {renderGenerico(registro)}
          </section>
        )}
      </main>
    </div>
  );
}
