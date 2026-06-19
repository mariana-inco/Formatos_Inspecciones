"use client";

import { Download } from "lucide-react";
import type { RegistroModulo } from "../page";

type Props = {
  registros: RegistroModulo[];
};

const escaparHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fechaArchivo = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  const hour = String(fecha.getHours()).padStart(2, "0");
  const minute = String(fecha.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}${minute}`;
};

const formatearFechaHora = (fechaMs?: number) => {
  if (!fechaMs) return "";
  const fecha = new Date(fechaMs);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(fecha);
};

const construirTabla = (headers: string[], rows: Array<Array<unknown>>) => `
  <table>
    <thead>
      <tr>${headers.map((header) => `<th>${escaparHtml(header)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${
        rows.length > 0
          ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escaparHtml(cell)}</td>`).join("")}</tr>`).join("")
          : `<tr><td colspan="${headers.length}">Sin datos para exportar</td></tr>`
      }
    </tbody>
  </table>
`;

const agruparPorFormato = (registros: RegistroModulo[]) =>
  registros.reduce<Record<string, RegistroModulo[]>>((acc, registro) => {
    const key = `${registro.codigo} - ${registro.formato}`;
    acc[key] = [...(acc[key] || []), registro];
    return acc;
  }, {});

const obtenerAlcance = (registros: RegistroModulo[]) => {
  const formatos = Array.from(new Set(registros.map((registro) => `${registro.codigo} - ${registro.formato}`)));
  if (formatos.length === 0) return "Sin registros para exportar";
  if (formatos.length === 1) return `Formato exportado: ${formatos[0]}`;
  return `Reporte general: ${formatos.length} formatos incluidos`;
};

const construirFilaRegistro = (registro: RegistroModulo, incluirFormato: boolean) => [
  ...(incluirFormato ? [registro.codigo, registro.formato] : []),
  registro.fecha,
  formatearFechaHora(registro.fechaCreacionMs),
  registro.sedeArea,
  registro.responsable,
  registro.estado,
  registro.novedades,
  registro.recarga ? `${registro.recarga.estado} - ${registro.recarga.mensaje}` : "",
];

const construirFilaDetalle = (registro: RegistroModulo, detalle: RegistroModulo["detalles"][number], incluirFormato: boolean) => [
  ...(incluirFormato ? [registro.codigo, registro.formato] : []),
  registro.fecha,
  registro.responsable,
  registro.estado,
  detalle.grupo,
  detalle.item,
  detalle.estado,
  detalle.observaciones || "",
];

const construirExcelHtml = (registros: RegistroModulo[]) => {
  const totalRegistros = registros.length;
  const conformes = registros.filter((registro) => registro.estado === "Conforme").length;
  const conNovedad = registros.filter((registro) => registro.estado === "Con novedad").length;
  const hallazgos = registros.reduce((acc, registro) => acc + registro.novedades, 0);
  const gruposFormato = agruparPorFormato(registros);
  const esUnSoloFormato = Object.keys(gruposFormato).length === 1;
  const headersRegistros = [
    ...(esUnSoloFormato ? [] : ["Código", "Formato"]),
    "Fecha inspección",
    "Fecha creación",
    "Sede / Área",
    "Responsable / Inspector",
    "Estado general",
    "Hallazgos",
    "Estado recarga",
  ];
  const headersDetalles = [
    ...(esUnSoloFormato ? [] : ["Código", "Formato"]),
    "Fecha",
    "Responsable",
    "Estado registro",
    "Grupo",
    "Ítem",
    "Estado ítem",
    "Observaciones",
  ];
  const detallesPorAtender = registros.flatMap((registro) =>
    registro.detalles
      .filter((detalle) => detalle.estado === "Con novedad" || detalle.estado === "Regular" || detalle.estado === "Pendiente")
      .map((detalle) => construirFilaDetalle(registro, detalle, !esUnSoloFormato))
  );
  const detalleCompleto = registros.flatMap((registro) =>
    registro.detalles.map((detalle) => construirFilaDetalle(registro, detalle, !esUnSoloFormato))
  );
  const registrosPorFormato = Object.entries(gruposFormato)
    .map(([formato, items]) => `
      <h2>${escaparHtml(formato)}</h2>
      ${construirTabla(headersRegistros, items.map((registro) => construirFilaRegistro(registro, !esUnSoloFormato)))}
    `)
    .join("");

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; }
          h1 { color: #006948; font-size: 22px; margin-bottom: 4px; }
          h2 { color: #0f172a; font-size: 16px; margin-top: 24px; }
          h3 { color: #006948; font-size: 13px; margin-top: 18px; }
          p { color: #475569; font-size: 12px; margin-top: 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th { background: #006948; color: #ffffff; font-weight: bold; text-align: left; border: 1px solid #d9e2ec; padding: 8px; }
          td { border: 1px solid #d9e2ec; padding: 7px; vertical-align: top; }
          .summary th { background: #0f172a; }
          .summary td { font-size: 16px; font-weight: bold; }
          .cover td { font-size: 13px; }
          .note { background: #e8f5e9; color: #006948; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${esUnSoloFormato ? "Reporte de formato HSE" : "Reporte general de inspecciones HSE"}</h1>
        <p>Exportado el ${escaparHtml(formatearFechaHora(Date.now()))}</p>

        <h2>Alcance del archivo</h2>
        <table class="cover">
          <tbody>
            <tr>
              <td class="note">Qué contiene este Excel</td>
              <td>${escaparHtml(obtenerAlcance(registros))}</td>
            </tr>
            <tr>
              <td class="note">Origen</td>
              <td>Vista actual del dashboard con los filtros aplicados al momento de exportar.</td>
            </tr>
            <tr>
              <td class="note">Cómo leerlo</td>
              <td>Primero revise el resumen, luego los hallazgos por atender y finalmente el detalle completo del registro.</td>
            </tr>
          </tbody>
        </table>

        <h2>Resumen general</h2>
        <table class="summary">
          <thead>
            <tr>
              <th>Total inspecciones</th>
              <th>Inspecciones conformes</th>
              <th>Inspecciones con novedades</th>
              <th>Hallazgos detectados</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${totalRegistros}</td>
              <td>${conformes}</td>
              <td>${conNovedad}</td>
              <td>${hallazgos}</td>
            </tr>
          </tbody>
        </table>

        <h2>Hallazgos por atender</h2>
        ${construirTabla(headersDetalles, detallesPorAtender)}

        <h2>Registros exportados ${esUnSoloFormato ? "del formato" : "por formato"}</h2>
        ${registrosPorFormato || construirTabla(headersRegistros, [])}

        <h2>Detalle completo</h2>
        ${construirTabla(headersDetalles, detalleCompleto)}
      </body>
    </html>
  `;
};

export default function ExportarDashboardExcel({ registros }: Props) {
  const exportar = () => {
    const html = construirExcelHtml(registros);
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    const codigos = Array.from(new Set(registros.map((registro) => registro.codigo)));
    const alcanceArchivo = codigos.length === 1 ? codigos[0].toLowerCase() : "dashboard";
    link.download = `${alcanceArchivo}-inspecciones-hse-${fechaArchivo()}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={exportar}
      disabled={registros.length === 0}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#006948] bg-white px-4 py-2.5 text-sm font-bold text-[#006948] shadow-sm transition hover:bg-[#E8F5E9] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white sm:w-auto"
    >
      <Download className="size-4" aria-hidden="true" />
      Exportar Excel
    </button>
  );
}
