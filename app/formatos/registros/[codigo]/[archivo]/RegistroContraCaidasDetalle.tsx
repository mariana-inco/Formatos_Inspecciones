"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";

type Props = {
  registro: any;
};

const texto = (value: unknown, fallback = "Sin dato") => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const etiquetaDecision = (decisionId?: number | null) => {
  if (decisionId === 1) return { label: "Apto para ser utilizado", className: "bg-emerald-100 text-emerald-800", icon: ShieldCheck };
  if (decisionId === 2) return { label: "No apto para ser utilizado", className: "bg-red-100 text-red-800", icon: ShieldAlert };
  return { label: "Pendiente de decisión", className: "bg-amber-50 text-amber-800", icon: ShieldAlert };
};

const etiquetaConcepto = (conceptoId?: number | null) => {
  if (conceptoId === 1) return { label: "Aceptado", className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 };
  if (conceptoId === 2) return { label: "Rechazado", className: "bg-red-100 text-red-800", icon: XCircle };
  return { label: "Sin concepto", className: "bg-slate-100 text-slate-700", icon: ShieldAlert };
};

const iconosEquipoPorArchivo: Record<string, string> = {
  "arnes-de-seguridad.png": "/Iconos/arnes-de-seguridad.png",
  "autoretract.png": "/Iconos/autoretract.png",
  "eslingas-de-cinta.png": "/Iconos/eslingas-de-cinta.png",
  "frenos.png": "/Iconos/frenos.png",
  "lineadevida.png": "/Iconos/lineadevida.png",
  "mosqueton.png": "/Iconos/mosqueton.png",
  "rappel.png": "/Iconos/rappel.png",
  "tie-off.png": "/Iconos/tie-off.png",
};

const nombreArchivoAdjunto = (value: any) => {
  const nombre = value?.fileName || value?.nombreArchivo || value?.fileUrl?.split("/").pop();
  return typeof nombre === "string" ? nombre : "";
};

const imagenAdjunta = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.dataUrl) return value.dataUrl;
  return iconosEquipoPorArchivo[nombreArchivoAdjunto(value)] || "";
};

const decodificarSvgDataUrl = (dataUrl: string) => {
  const [, contenido = ""] = dataUrl.split(",", 2);
  if (!contenido) return "";
  if (dataUrl.includes(";base64,")) {
    try {
      return atob(contenido);
    } catch {
      return "";
    }
  }

  try {
    return decodeURIComponent(contenido);
  } catch {
    return contenido;
  }
};

const centrarFirmaSvg = (dataUrl: string) => {
  if (!dataUrl.startsWith("data:image/svg+xml")) return dataUrl;

  const svg = decodificarSvgDataUrl(dataUrl);
  const pathMatches = Array.from(svg.matchAll(/<path\b[^>]*\bd=["']([^"']+)["'][^>]*>/gi));
  const puntos = pathMatches.flatMap((match) => {
    const numeros = Array.from(match[1].matchAll(/-?\d+(?:\.\d+)?/g)).map(([numero]) => Number(numero));
    const pares: Array<[number, number]> = [];
    for (let index = 0; index < numeros.length - 1; index += 2) {
      pares.push([numeros[index], numeros[index + 1]]);
    }
    return pares;
  });

  if (puntos.length === 0) return dataUrl;

  const xs = puntos.map(([x]) => x);
  const ys = puntos.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padding = 18;
  const x = Math.max(0, minX - padding);
  const y = Math.max(0, minY - padding);
  const width = Math.max(maxX - minX + padding * 2, 80);
  const height = Math.max(maxY - minY + padding * 2, 48);
  const siguienteSvg = svg.includes("viewBox=")
    ? svg.replace(/viewBox=["'][^"']*["']/, `viewBox="${x} ${y} ${width} ${height}"`)
    : svg.replace("<svg", `<svg viewBox="${x} ${y} ${width} ${height}"`);

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(siguienteSvg)}`;
};

const renderImagen = (value: any, tipo: "evidencia" | "firma" = "evidencia") => {
  const url = tipo === "firma" ? centrarFirmaSvg(imagenAdjunta(value)) : imagenAdjunta(value);
  const esFirma = tipo === "firma";
  if (!url) {
    const nombreArchivo = nombreArchivoAdjunto(value);
    if (nombreArchivo) {
      return (
        <div className={`${esFirma ? "min-h-32" : "min-h-40"} grid place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500`}>
          <span>
            {esFirma ? "Firma no disponible" : "Evidencia no disponible"}
            <span className="mt-1 block break-all text-xs text-slate-400">{nombreArchivo}</span>
          </span>
        </div>
      );
    }
    return (
      <div className={`${esFirma ? "min-h-32" : "min-h-40"} grid place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500`}>
        {esFirma ? "Sin firma registrada" : "Sin evidencia fotográfica"}
      </div>
    );
  }

  return (
    <div className={`${esFirma ? "h-28 px-4 py-3" : "min-h-40 p-3"} flex items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white`}>
      <img
        src={url}
        alt={esFirma ? "Firma registrada" : "Evidencia del equipo"}
        className={esFirma ? "mx-auto h-full max-h-20 w-full object-contain object-center" : "max-h-80 w-full object-contain object-center"}
      />
    </div>
  );
};

const CampoDato = ({ label, value }: { label: string; value: unknown }) => (
  <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3">
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 min-w-0 break-words text-sm font-bold leading-6 text-slate-950 [overflow-wrap:anywhere]">{texto(value)}</p>
  </div>
);

const normalizarInstrucciones = (value: unknown) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

export default function RegistroContraCaidasDetalle({ registro }: Props) {
  const datosEquipo = registro.datosEquipo || {};
  const checklist = registro.respuestasChecklist || [];
  const adicionales = registro.datosAdicionalesChecklist || [];
  const firmas = registro.firmas || {};
  const decision = etiquetaDecision(registro.cierreInspeccion?.decisionFinalId);
  const DecisionIcon = decision.icon;
  const [indiceActivo, setIndiceActivo] = useState(0);

  const items = useMemo(
    () =>
      checklist.map((item: any, index: number) => {
        const apoyo = adicionales.find((adicional: any) => adicional.key === item.key) || {};
        return {
          ...item,
          detalleApoyo: apoyo.detalleApoyo || item.comentario || "",
          instrucciones: normalizarInstrucciones(item.instrucciones),
          numero: index + 1,
        };
      }),
    [adicionales, checklist]
  );

  const activo = items[indiceActivo] || items[0];
  const conceptoActivo = etiquetaConcepto(activo?.conceptoId);
  const ConceptoIcon = conceptoActivo.icon;
  const aceptados = items.filter((item: any) => item.conceptoId === 1).length;
  const rechazados = items.filter((item: any) => item.conceptoId === 2).length;
  const pendientes = Math.max(items.length - aceptados - rechazados, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Fecha inspección", datosEquipo.fechaInspeccion],
          ["Tipo de inspección", registro.inspeccion?.nombre],
          ["Número interno", datosEquipo.numeroInterno],
          ["Número serie", datosEquipo.numeroSerie],
        ].map(([label, value]) => (
          <CampoDato key={String(label)} label={String(label)} value={value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Equipo inspeccionado</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{texto(registro.inspeccion?.nombre, "Inspección contra caídas")}</h2>
            </div>
            <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${decision.className}`}>
              <DecisionIcon className="size-4" aria-hidden="true" />
              {decision.label}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["Fabricante", datosEquipo.fabricante],
              ["Modelo", datosEquipo.modelo],
              ["Periodicidad", datosEquipo.periodicidad],
              ["Fecha fabricación", datosEquipo.fechaFabricacion],
              ["Certificado", datosEquipo.certificado],
              ["Fecha compra", datosEquipo.fechaCompra],
              ["Número lote", datosEquipo.numeroLote],
              ["Característica técnica", datosEquipo.tipoFreno],
              ["Primera utilización", datosEquipo.fechaPrimeraUtilizacion],
            ].map(([label, value]) => (
              <CampoDato key={String(label)} label={String(label)} value={value} />
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Antecedentes del equipo</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{texto(datosEquipo.antecedentesEquipo, "Sin antecedentes registrados")}</p>
          </div>
        </article>

        <aside className="space-y-4">
          {renderImagen(datosEquipo.imagenEquipo)}
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Aceptados", aceptados, "bg-emerald-100 text-emerald-800"],
              ["Rechazados", rechazados, "bg-red-100 text-red-800"],
              ["Pendientes", pendientes, "bg-slate-100 text-slate-700"],
            ].map(([label, value, className]) => (
              <div key={String(label)} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-center">
                <p className={`mx-auto inline-flex whitespace-nowrap rounded-full px-3 py-1 text-lg font-bold ${className}`}>{value}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Checklist de inspección</h2>
        </div>

        {items.length > 0 ? (
          <div className="grid min-h-[520px] xl:grid-cols-[340px_minmax(0,1fr)]">
            <nav className="border-b border-slate-200 bg-white p-4 xl:border-b-0 xl:border-r">
              <div className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
                {items.map((item: any, index: number) => {
                  const estado = etiquetaConcepto(item.conceptoId);
                  const seleccionado = index === indiceActivo;
                  return (
                    <button
                      key={item.key || index}
                      type="button"
                      onClick={() => setIndiceActivo(index)}
                      className={`min-w-[240px] rounded-lg border px-4 py-3 text-left transition xl:min-w-0 xl:w-full ${
                        seleccionado ? "border-[#006948] bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Registro {item.numero}</p>
                          <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-950">{item.factor}</p>
                        </div>
                        <span className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${estado.className}`}>{estado.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>

            <article className="flex min-w-0 flex-col">
              <div className="border-b border-slate-200 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Registro {activo.numero} de {items.length}</p>
                    <h3 className="mt-1 text-2xl font-bold leading-tight text-slate-950">{activo.factor}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold ${conceptoActivo.className}`}>
                    <ConceptoIcon className="size-4" aria-hidden="true" />
                    {conceptoActivo.label}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-5 p-5">
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-600">Puntos revisados</h4>
                  <div className="mt-3 space-y-3">
                    {activo.instrucciones.length > 0 ? (
                      activo.instrucciones.map((instruccion: string, index: number) => (
                        <div key={`${activo.key}-instruccion-${index}`} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-[#006948]">{index + 1}</span>
                          <p className="min-w-0 text-sm font-semibold leading-6 text-slate-800">{instruccion}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">Sin instrucciones registradas.</p>
                    )}
                  </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Comentario</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{texto(activo.comentario, "Sin comentario")}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Detalle de apoyo</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{texto(activo.detalleApoyo, "Sin detalle adicional")}</p>
                  </div>
                </section>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setIndiceActivo((prev) => Math.max(prev - 1, 0))}
                  disabled={indiceActivo === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#006948] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setIndiceActivo((prev) => Math.min(prev + 1, items.length - 1))}
                  disabled={indiceActivo >= items.length - 1}
                  className="inline-flex items-center gap-2 rounded-full bg-[#006948] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#00543a] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          </div>
        ) : (
          <p className="px-5 py-6 text-sm font-semibold text-slate-500">No hay checklist registrado.</p>
        )}
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.7fr)]">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Comentarios finales</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase text-slate-500">Cierre</span>
          </div>
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-800">
            {texto(registro.cierreInspeccion?.comentariosFinales, "Sin comentarios finales")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Firmas registradas</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Inspector</p>
              {renderImagen(firmas.firmaInspector, "firma")}
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Responsable</p>
              {renderImagen(firmas.firmaResponsable, "firma")}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
