"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type DashboardFiltrosProps = {
  busqueda: string;
  periodo: string;
  formato: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  formatos: Array<{ codigo: string }>;
  sinResultadosPorFiltro: boolean;
};

const PERIODO_POR_DEFECTO = "hoy";
const OPCIONES_PERIODO = [
  { value: "todos", label: "Todos" },
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "3meses", label: "Últimos 3 meses" },
  { value: "personalizado", label: "Rango personalizado" },
];
const OPCIONES_ESTADO = [
  { value: "", label: "Todos los estados" },
  { value: "Conforme", label: "Conforme" },
  { value: "Con novedad", label: "Con novedad" },
  { value: "Regular", label: "Regular" },
  { value: "Pendiente", label: "Pendiente" },
];

type OpcionFiltro = {
  value: string;
  label: string;
};

type SelectFiltroProps = {
  label: string;
  value: string;
  fallbackLabel: string;
  options: OpcionFiltro[];
  onChange: (value: string) => void;
};

function SelectFiltro({ label, value, fallbackLabel, options, onChange }: SelectFiltroProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const etiquetaSeleccionada = options.find((opcion) => opcion.value === value)?.label || fallbackLabel;

  useEffect(() => {
    if (!abierto) return;

    const cerrarSiClickAfuera = (event: PointerEvent) => {
      if (contenedorRef.current?.contains(event.target as Node)) return;
      setAbierto(false);
    };

    document.addEventListener("pointerdown", cerrarSiClickAfuera);
    return () => document.removeEventListener("pointerdown", cerrarSiClickAfuera);
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative grid min-w-0 gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        onClick={() => setAbierto((estadoActual) => !estadoActual)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setAbierto(false);
        }}
        className="flex min-w-0 items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 outline-none transition focus:border-[#006948]"
      >
        <span className="min-w-0 truncate">{etiquetaSeleccionada}</span>
        <span className="shrink-0 text-base leading-none text-slate-500" aria-hidden="true">
          {abierto ? "⌃" : "⌄"}
        </span>
      </button>
      {abierto ? (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm font-medium text-slate-800 shadow-lg"
        >
          {options.map((opcion) => (
            <button
              key={opcion.value || opcion.label}
              type="button"
              role="option"
              aria-selected={value === opcion.value}
              onClick={() => {
                onChange(opcion.value);
                setAbierto(false);
              }}
              className={`block w-full px-4 py-2.5 text-left transition ${
                value === opcion.value ? "bg-emerald-100 text-[#006948]" : "hover:bg-slate-50"
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardFiltros({
  busqueda,
  periodo,
  formato,
  estado,
  fechaDesde,
  fechaHasta,
  formatos,
  sinResultadosPorFiltro,
}: DashboardFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const periodoSeleccionado = periodo || PERIODO_POR_DEFECTO;
  const opcionesFormato = [{ value: "", label: "Todos los formatos" }, ...formatos.map((fuente) => ({ value: fuente.codigo, label: fuente.codigo }))];
  const hayFiltrosActivos = Boolean(busqueda || formato || estado || periodoSeleccionado !== PERIODO_POR_DEFECTO || fechaDesde || fechaHasta);

  const actualizarFiltro = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === "periodo") {
      if (value !== "personalizado") {
        params.delete("desde");
        params.delete("hasta");
      }
    }

    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_minmax(160px,0.8fr)_minmax(190px,1fr)_minmax(190px,1fr)_auto]">
        <label className="grid min-w-0 gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Buscar registro</span>
          <input
            value={busqueda}
            onChange={(event) => actualizarFiltro("q", event.target.value)}
            placeholder="Código, formato, sede, responsable u observación"
            className="min-w-0 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#006948]"
          />
        </label>

        <SelectFiltro label="Periodo" value={periodoSeleccionado} fallbackLabel="Hoy" options={OPCIONES_PERIODO} onChange={(value) => actualizarFiltro("periodo", value)} />

        <SelectFiltro label="Formato" value={formato} fallbackLabel="Todos los formatos" options={opcionesFormato} onChange={(value) => actualizarFiltro("formato", value)} />

        <SelectFiltro label="Estado" value={estado} fallbackLabel="Todos los estados" options={OPCIONES_ESTADO} onChange={(value) => actualizarFiltro("estado", value)} />

        {hayFiltrosActivos ? (
          <div className="flex items-end">
            <Link href="/formatos" className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              Limpiar filtros
            </Link>
          </div>
        ) : null}
      </div>

      {periodoSeleccionado === "personalizado" ? (
        <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
          <label className="grid min-w-0 gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Fecha inicial</span>
            <input value={fechaDesde} onChange={(event) => actualizarFiltro("desde", event.target.value)} type="date" className="min-w-0 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#006948]" />
          </label>
          <label className="grid min-w-0 gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Fecha final</span>
            <input value={fechaHasta} onChange={(event) => actualizarFiltro("hasta", event.target.value)} type="date" className="min-w-0 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#006948]" />
          </label>
        </div>
      ) : null}

      {sinResultadosPorFiltro ? (
        <p className="mt-3 rounded-lg bg-[#FFEBEE] px-4 py-3 text-sm font-medium text-red-700">
          No hay registros para los filtros seleccionados.
        </p>
      ) : null}
    </section>
  );
}
