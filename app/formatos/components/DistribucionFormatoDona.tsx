"use client";

import { useMemo, useState } from "react";

type SegmentoDistribucion = {
  codigo: string;
  nombreCorto: string;
  value: number;
  color: string;
  porcentaje: number;
  inicio: number;
  fin: number;
};

type Props = {
  segmentos: SegmentoDistribucion[];
  total: number;
};

const puntoPolar = (center: number, radius: number, angle: number) => {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
};

const trazoDona = (inicioPorcentaje: number, finPorcentaje: number) => {
  const center = 110;
  const radioExterior = 88;
  const radioInterior = 52;
  const inicio = inicioPorcentaje * 3.6;
  const fin = finPorcentaje * 3.6;
  const arcoLargo = fin - inicio > 180 ? 1 : 0;
  const inicioExterior = puntoPolar(center, radioExterior, fin);
  const finExterior = puntoPolar(center, radioExterior, inicio);
  const inicioInterior = puntoPolar(center, radioInterior, inicio);
  const finInterior = puntoPolar(center, radioInterior, fin);

  return [
    `M ${inicioExterior.x} ${inicioExterior.y}`,
    `A ${radioExterior} ${radioExterior} 0 ${arcoLargo} 0 ${finExterior.x} ${finExterior.y}`,
    `L ${inicioInterior.x} ${inicioInterior.y}`,
    `A ${radioInterior} ${radioInterior} 0 ${arcoLargo} 1 ${finInterior.x} ${finInterior.y}`,
    "Z",
  ].join(" ");
};

export default function DistribucionFormatoDona({ segmentos, total }: Props) {
  const segmentoPrincipal = useMemo(
    () => [...segmentos].sort((a, b) => b.value - a.value)[0] || null,
    [segmentos]
  );
  const [segmentoActivo, setSegmentoActivo] = useState<SegmentoDistribucion | null>(null);
  const detalle = segmentoActivo || segmentoPrincipal;

  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-4 sm:px-4">
      <div className="relative mx-auto size-44 sm:size-56">
        <svg viewBox="0 0 220 220" className="size-full" role="img" aria-label="Distribución de inspecciones por formato">
          {segmentos.map((item, index) => (
            <path
              key={`dona-${item.codigo}-${index}`}
              d={trazoDona(item.inicio, item.fin)}
              fill={item.color}
              tabIndex={0}
              aria-label={`${item.codigo} - ${item.nombreCorto}: ${item.value} registro${item.value === 1 ? "" : "s"} (${item.porcentaje}%)`}
              onMouseEnter={() => setSegmentoActivo(item)}
              onFocus={() => setSegmentoActivo(item)}
              onMouseLeave={() => setSegmentoActivo(null)}
              onBlur={() => setSegmentoActivo(null)}
              className="cursor-pointer outline-none transition duration-200 hover:brightness-95 hover:drop-shadow-md focus:brightness-95 focus:drop-shadow-md"
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="grid size-20 place-items-center rounded-full bg-white text-center shadow-sm ring-1 ring-slate-100 sm:size-24">
            <div>
              <p className="text-2xl font-bold text-slate-950 sm:text-3xl">{total}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Inspecciones</p>
            </div>
          </div>
        </div>
      </div>

      {detalle ? (
        <div className="mt-3 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: detalle.color }} />
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{detalle.codigo}</p>
          </div>
          <p className="mt-1 min-w-0 break-words text-sm font-bold leading-5 text-slate-950 [overflow-wrap:anywhere]">{detalle.nombreCorto}</p>
          <p className="mt-1 text-xs font-bold text-[#006948]">
            {detalle.value} registro{detalle.value === 1 ? "" : "s"} · {detalle.porcentaje}%
          </p>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs font-medium text-slate-500">Pasa el cursor sobre un color para ver el formato.</p>
      )}
    </div>
  );
}
