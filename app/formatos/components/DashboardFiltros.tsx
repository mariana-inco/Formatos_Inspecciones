"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(periodo || PERIODO_POR_DEFECTO);
  const hayFiltrosActivos = Boolean(busqueda || formato || estado || periodoSeleccionado !== PERIODO_POR_DEFECTO || fechaDesde || fechaHasta);

  useEffect(() => {
    setPeriodoSeleccionado(periodo || PERIODO_POR_DEFECTO);
  }, [periodo]);

  const actualizarFiltro = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === "periodo") {
      setPeriodoSeleccionado(value || PERIODO_POR_DEFECTO);
      if (value !== "personalizado") {
        params.delete("desde");
        params.delete("hasta");
      }
    }

    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_minmax(160px,0.8fr)_minmax(190px,1fr)_minmax(190px,1fr)_auto]">
        <label className="grid gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Buscar registro</span>
          <input
            value={busqueda}
            onChange={(event) => actualizarFiltro("q", event.target.value)}
            placeholder="Código, formato, sede, responsable u observación"
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#006948]"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Periodo</span>
          <select
            value={periodoSeleccionado}
            onChange={(event) => actualizarFiltro("periodo", event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#006948]"
          >
            <option value="todos">Todos</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="3meses">Últimos 3 meses</option>
            <option value="personalizado">Rango personalizado</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Formato</span>
          <select value={formato} onChange={(event) => actualizarFiltro("formato", event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#006948]">
            <option value="">Todos los formatos</option>
            {formatos.map((fuente) => (
              <option key={fuente.codigo} value={fuente.codigo}>
                {fuente.codigo}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Estado</span>
          <select value={estado} onChange={(event) => actualizarFiltro("estado", event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#006948]">
            <option value="">Todos los estados</option>
            <option value="Conforme">Conforme</option>
            <option value="Con novedad">Con novedad</option>
            <option value="Regular">Regular</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </label>

        {hayFiltrosActivos ? (
          <div className="flex items-end">
            <Link href="/formatos" className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              Limpiar filtros
            </Link>
          </div>
        ) : null}
      </div>

      {periodoSeleccionado === "personalizado" ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Fecha inicial</span>
            <input value={fechaDesde} onChange={(event) => actualizarFiltro("desde", event.target.value)} type="date" className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#006948]" />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Fecha final</span>
            <input value={fechaHasta} onChange={(event) => actualizarFiltro("hasta", event.target.value)} type="date" className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#006948]" />
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
