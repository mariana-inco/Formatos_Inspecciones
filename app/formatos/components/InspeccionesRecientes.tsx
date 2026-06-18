"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, HardHat, X } from "lucide-react";
import type { DetalleRegistroModulo, RegistroModulo } from "../page";
import type { SeveridadRecarga } from "./estadoRecarga";

type Props = {
  registros: RegistroModulo[];
};

const claseEstado = (estado: string) => {
  if (estado === "Conforme") return "bg-[#E8F5E9] text-[#006948]";
  if (estado === "Con novedad") return "bg-[#FFEBEE] text-red-700";
  if (estado === "Pendiente") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber-700";
};

const claseRecarga = (severidad: SeveridadRecarga) => {
  if (severidad === "bueno") return "bg-[#E8F5E9] text-[#006948]";
  if (severidad === "regular") return "bg-amber-50 text-amber-700";
  if (severidad === "critico") return "bg-orange-100 text-orange-800";
  if (severidad === "malo") return "bg-[#FFEBEE] text-red-700";
  return "bg-slate-100 text-slate-700";
};

const detalleCortoRecarga = (registro: RegistroModulo) => {
  const recarga = registro.recarga;
  if (!recarga) return "";
  if (recarga.estado === "Regular" && recarga.dias !== null) return `Faltan ${recarga.dias} días`;
  if (recarga.estado === "Vencido" && recarga.dias !== null) return `Hace ${Math.abs(recarga.dias)} días`;
  if (recarga.estado === "Vence hoy") return "Requiere gestión";
  if (recarga.estado === "Pendiente") return "Sin fecha registrada";
  if (recarga.estado === "Bueno" && recarga.dias !== null) return `Faltan ${recarga.dias} días`;
  return recarga.mensaje;
};

const detalleConsultivoRecarga = (registro: RegistroModulo) => {
  const recarga = registro.recarga;
  if (!recarga) return null;
  if (recarga.estado === "Regular" && recarga.dias !== null) {
    return `Este extintor está próximo a vencer. Faltan ${recarga.dias} días para la próxima recarga.`;
  }
  if (recarga.estado === "Vencido" && recarga.dias !== null) {
    return `Este extintor está vencido. Han pasado ${Math.abs(recarga.dias)} días desde la fecha de próxima recarga.`;
  }
  if (recarga.estado === "Vence hoy") return "Este extintor vence hoy. Requiere gestión.";
  return recarga.mensaje;
};

const claseDetalle = (estado: string) => {
  if (estado === "Conforme") return "bg-[#E8F5E9] text-[#006948]";
  if (estado === "Con novedad") return "bg-[#FFEBEE] text-red-700";
  if (estado === "No aplica") return "bg-slate-100 text-slate-700";
  if (estado === "Pendiente") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber-700";
};

const obtenerDetallePrincipal = (registro: RegistroModulo) => {
  if (registro.codigo === "HSE-F003" && registro.recarga) {
    return {
      titulo: "Estado de próxima recarga",
      descripcion: detalleConsultivoRecarga(registro) || registro.recarga.mensaje,
      items: registro.detalles.filter((detalle) => detalle.grupo === "Vencimiento" || detalle.estado === "Regular" || detalle.estado === "Con novedad"),
    };
  }

  if (registro.estado === "Conforme") {
    return {
      titulo: "Elementos conformes",
      descripcion: "Este registro se cerró sin novedades. Se muestran los ítems que quedaron conformes.",
      items: registro.detalles.filter((detalle) => detalle.estado === "Conforme"),
    };
  }

  if (registro.estado === "Con novedad") {
    return {
      titulo: "Novedades encontradas",
      descripcion:
        registro.codigo === "HSE-F006"
          ? "Este registro requiere revisión. Se muestran los factores del checklist marcados como rechazados."
          : "Este registro requiere revisión. Se muestran únicamente los ítems marcados con novedad.",
      items: registro.detalles.filter((detalle) => detalle.estado === "Con novedad"),
    };
  }

  if (registro.estado === "Regular") {
    return {
      titulo: "Elementos a revisar",
      descripcion: "Este registro tiene condiciones regulares o próximas a vencer.",
      items: registro.detalles.filter((detalle) => detalle.estado === "Regular" || detalle.estado === "Con novedad"),
    };
  }

  return {
    titulo: "Elementos pendientes",
    descripcion: "Este registro aún tiene información pendiente por completar.",
    items: registro.detalles.filter((detalle) => detalle.estado === "Pendiente"),
  };
};

const agruparDetalles = (detalles: DetalleRegistroModulo[]) =>
  detalles.reduce<Record<string, DetalleRegistroModulo[]>>((acc, detalle) => {
    const grupo = detalle.grupo || "Detalle de inspección";
    acc[grupo] = [...(acc[grupo] || []), detalle];
    return acc;
  }, {});

const formatearHoraRegistro = (fechaCreacionMs?: number) => {
  if (!fechaCreacionMs) return "";
  const fecha = new Date(fechaCreacionMs);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(fecha)
    .toUpperCase();
};

export default function InspeccionesRecientes({ registros }: Props) {
  const [registroActivo, setRegistroActivo] = useState<RegistroModulo | null>(null);
  const detallePrincipal = registroActivo ? obtenerDetallePrincipal(registroActivo) : null;
  const detallesAgrupados = detallePrincipal ? agruparDetalles(detallePrincipal.items) : {};

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-950">Inspecciones recientes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1320px] w-full text-sm">
          <thead className="bg-white text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="w-32 px-5 py-4">Código</th>
              <th className="w-36 px-5 py-4">Fecha</th>
              <th className="min-w-80 px-5 py-4">Formato</th>
              <th className="min-w-64 px-5 py-4">Sede / Área</th>
              <th className="min-w-80 px-5 py-4">Responsable / Inspector</th>
              <th className="min-w-36 px-5 py-4">Estado general</th>
              <th className="px-5 py-4">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registros.map((registro, index) => (
              <tr key={`${registro.codigo}-${registro.fecha}-${index}`} className="hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-950">{registro.codigo}</td>
                <td className="px-5 py-4">
                  <div className="inline-flex flex-col whitespace-nowrap">
                    <span className="font-medium text-slate-700">{registro.fecha}</span>
                    {formatearHoraRegistro(registro.fechaCreacionMs) ? (
                      <span className="mt-1 text-xs font-bold text-slate-500">{formatearHoraRegistro(registro.fechaCreacionMs)}</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-[#E8F5E9] text-[#006948]">
                      <HardHat className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-950">{registro.codigo}</p>
                      <p className="text-xs font-medium text-slate-500">{registro.formato}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-slate-600">
                  <span className="block min-w-0 break-words [overflow-wrap:anywhere]">{registro.sedeArea}</span>
                </td>
                <td className="min-w-0 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {registro.responsable.slice(0, 1).toUpperCase() || "H"}
                    </div>
                    <span className="min-w-0 break-words font-medium text-slate-700 [overflow-wrap:anywhere]">{registro.responsable}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  {registro.codigo === "HSE-F003" && registro.recarga ? (
                    <div className="inline-flex min-w-36 flex-col items-center gap-1">
                      <span className={`inline-flex min-w-20 justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${claseRecarga(registro.recarga.severidad)}`}>
                        {registro.recarga.estado}
                      </span>
                      <span className="text-center text-[11px] font-semibold leading-tight text-slate-500">{detalleCortoRecarga(registro)}</span>
                    </div>
                  ) : (
                    <span className={`inline-flex min-w-28 justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${claseEstado(registro.estado)}`}>
                      {registro.estado}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setRegistroActivo(registro)}
                    className="inline-flex min-w-[80px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#006948] hover:bg-[#E8F5E9] hover:text-[#006948]"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {registros.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm font-medium text-slate-500">
                  Sin registros guardados
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {registroActivo && detallePrincipal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{registroActivo.codigo}</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-950">{registroActivo.formato}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistroActivo(null)}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:text-slate-950"
                  aria-label="Cerrar detalle de inspección"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fecha", registroActivo.fecha],
                  ["Sede / Área", registroActivo.sedeArea],
                  ["Responsable", registroActivo.responsable],
                  ["Estado", registroActivo.codigo === "HSE-F003" && registroActivo.recarga ? registroActivo.recarga.estado : registroActivo.estado],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-2 min-w-0 break-words text-sm font-bold text-slate-950 [overflow-wrap:anywhere]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-950">{detallePrincipal.titulo}</h4>
                      <p className="mt-1 text-sm font-medium text-slate-500">{detallePrincipal.descripcion}</p>
                    </div>
                    {registroActivo.codigo === "HSE-F003" && registroActivo.recarga ? (
                      <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${claseRecarga(registroActivo.recarga.severidad)}`}>
                        {detalleCortoRecarga(registroActivo)}
                      </span>
                    ) : (
                      <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${claseEstado(registroActivo.estado)}`}>
                        {registroActivo.novedades} novedad{registroActivo.novedades === 1 ? "" : "es"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {Object.entries(detallesAgrupados).map(([grupo, detalles]) => (
                    <div key={grupo} className="px-4 py-4">
                      <h5 className="text-sm font-bold text-slate-950">{grupo}</h5>
                      <div className="mt-3 space-y-2">
                        {detalles.map((detalle, index) => (
                          <div key={`${grupo}-${detalle.item}-${index}`} className="rounded-lg bg-slate-50 px-4 py-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <p className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{detalle.item}</p>
                              <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${claseDetalle(detalle.estado)}`}>
                                {detalle.estado}
                              </span>
                            </div>
                            {detalle.observaciones ? (
                              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{detalle.observaciones}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {detallePrincipal.items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                      No hay ítems específicos para este estado.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setRegistroActivo(null)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400"
              >
                Cerrar
              </button>
              <Link
                href={registroActivo.detalleUrl}
                className="rounded-full bg-[#006948] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#00543a]"
              >
                Abrir en pantalla completa
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
