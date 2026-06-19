"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";

type ImagenAdjuntaModalProps = {
  url: string;
  nombre: string;
  etiquetaBoton?: string;
};

export default function ImagenAdjuntaModal({ url, nombre, etiquetaBoton = "Ver evidencia" }: ImagenAdjuntaModalProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        <Eye className="size-4" aria-hidden="true" />
        {etiquetaBoton}
      </button>

      {abierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="flex max-h-[86dvh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Evidencia</p>
                <h3 className="mt-1 break-words text-lg font-semibold text-slate-950">{nombre}</h3>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="size-4" aria-hidden="true" />
                Cerrar
              </button>
            </div>
            <div className="flex min-h-[240px] flex-1 items-center justify-center overflow-auto bg-slate-50 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={nombre} className="h-auto max-h-[58dvh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
