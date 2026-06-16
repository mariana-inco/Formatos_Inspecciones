import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { FileText, LayoutDashboard, Play, ShieldCheck } from "lucide-react";
import DashboardFiltros from "./components/DashboardFiltros";
import DistribucionFormatoDona from "./components/DistribucionFormatoDona";
import { calcularEstadoRecarga } from "./components/estadoRecarga";
import type { EstadoRecarga } from "./components/estadoRecarga";
import InspeccionesRecientes from "./components/InspeccionesRecientes";
import { formatos } from "./data";

export const metadata = {
  title: "Dashboard Módulo Inspecciones HSE",
};

export const dynamic = "force-dynamic";

export type RegistroModulo = {
  codigo: string;
  formato: string;
  ruta: string;
  detalleUrl: string;
  fecha: string;
  responsable: string;
  sedeArea: string;
  estado: "Conforme" | "Con novedad" | "Regular" | "Pendiente";
  novedades: number;
  busqueda: string;
  vencimiento?: "Vencido" | "Próximo" | "Vigente";
  recarga?: EstadoRecarga;
  detalles: DetalleRegistroModulo[];
};

export type DetalleRegistroModulo = {
  grupo: string;
  item: string;
  estado: "Conforme" | "Con novedad" | "Regular" | "Pendiente" | "No aplica";
  observaciones?: string;
};

const fuentes = [
  { codigo: "HSE-F006", dir: "inspeccion-contra-caidas", ruta: "/formatos/inspeccion-equipos-proteccion-contra-caidas" },
  { codigo: "HSE-F002", dir: "inspeccion-epp", ruta: "/formatos/inspeccion-epp" },
  { codigo: "HSE-F020", dir: "verificacion-alcohol-drogas", ruta: "/formatos/verificacion-alcohol-drogas" },
  { codigo: "HSE-F003", dir: "inspeccion-extintores", ruta: "/formatos/inspeccion-extintores" },
  { codigo: "HSE-F010", dir: "lista-chequeo-condiciones-seguridad", ruta: "/formatos/lista-chequeo-condiciones-seguridad" },
];
const coloresDistribucion = ["#006948", "#20A37A", "#8BD7BD", "#B7E4C7", "#CBD5E1"];

const nombreFormato = (codigo: string) => formatos.find((formato) => formato.codigo === codigo)?.nombre || codigo;

const contar = (items: string[]) =>
  Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const label = item || "Sin sede/área registrada";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));

type RespuestaJsonModulo = Record<string, any> & {
  __archivo: string;
};

const leerJson = async (dir: string): Promise<RespuestaJsonModulo[]> => {
  const carpeta = path.join(process.cwd(), "respuestas-json", dir);
  try {
    const archivos = await readdir(carpeta);
    return Promise.all(
      archivos
        .filter((archivo) => archivo.endsWith(".json"))
        .map(async (archivo) => ({ ...JSON.parse(await readFile(path.join(carpeta, archivo), "utf8")), __archivo: archivo }))
    );
  } catch {
    return [];
  }
};

const sedeAreaValida = (value?: string) => value?.trim() || "Sin sede/área registrada";
const normalizarBusqueda = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const normalizarBusquedaFlexible = (value: string) => normalizarBusqueda(value).replace(/[^a-z0-9]+/g, "");
const unirBusqueda = (items: Array<string | number | undefined | null>) =>
  items
    .filter(Boolean)
    .flatMap((item) => {
      const texto = normalizarBusqueda(String(item));
      const textoFlexible = normalizarBusquedaFlexible(texto);
      return textoFlexible && textoFlexible !== texto ? [texto, textoFlexible] : [texto];
    })
    .join(" ");

const textoSeguro = (value: unknown, fallback: string) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const detalleEstadoCondicion = (estadoId?: number | null): DetalleRegistroModulo["estado"] => {
  if (estadoId === 1) return "Conforme";
  if (estadoId === 2 || estadoId === 3) return "Con novedad";
  if (estadoId === 4) return "No aplica";
  return "Pendiente";
};

const estadoRevisionId = (revision: any) => {
  if (typeof revision?.estadoId === "number") return revision.estadoId;
  const estado = String(revision?.estado || revision?.revision || "").toUpperCase();
  if (estado === "BUENO") return 1;
  if (estado === "REGULAR") return 2;
  if (estado === "MALO") return 3;
  if (estado === "NO APLICA" || estado === "N/A") return 4;
  return null;
};

const detalleEstadoChequeo = (estadoId?: number | null): DetalleRegistroModulo["estado"] => {
  if (estadoId === 1) return "Conforme";
  if (estadoId === 2) return "Con novedad";
  if (estadoId === 3) return "No aplica";
  return "Pendiente";
};

const detalleRegistroUrl = (codigo: string, archivo: string) => `/formatos/registros/${codigo}/${encodeURIComponent(archivo)}`;

const mapearRegistro = (codigo: string, ruta: string, registro: any): RegistroModulo[] => {
  if (codigo === "HSE-F006") {
    const decision = registro.cierreInspeccion?.decisionFinalId;
    const estado = decision === 1 ? "Conforme" : decision === 2 ? "Con novedad" : "Pendiente";
    const sedeArea = sedeAreaValida(registro.inspeccion?.nombre);
    const responsable = registro.registro?.usuarioEmail || "-";
    const fecha = registro.datosEquipo?.fechaInspeccion || registro.registro?.fechaRegistro?.slice(0, 10) || "-";
    return [
      {
        codigo,
        formato: nombreFormato(codigo),
        ruta,
        detalleUrl: detalleRegistroUrl(codigo, registro.__archivo),
        fecha,
        responsable,
        sedeArea,
        estado,
        novedades: decision === 2 ? 1 : 0,
        detalles: [
          {
            grupo: "Cierre de inspección",
            item: decision === 2 ? "Inspección cerrada con novedad" : decision === 1 ? "Inspección cerrada conforme" : "Inspección pendiente de cierre",
            estado,
            observaciones: registro.cierreInspeccion?.comentariosFinales,
          },
        ],
        busqueda: unirBusqueda([codigo, nombreFormato(codigo), sedeArea, responsable, registro.datosEquipo?.numeroInterno, registro.datosEquipo?.numeroSerie, registro.cierreInspeccion?.comentariosFinales]),
      },
    ];
  }

  if (codigo === "HSE-F002") {
    return (registro.registros || []).map((item: any) => {
      const condiciones = [...(item.condicionesEpp || []), ...(item.otrosEpps?.detalle || [])];
      const malos = condiciones.filter((condicion: any) => condicion.condicionId === 3).length;
      const regulares = condiciones.filter((condicion: any) => condicion.condicionId === 2).length;
      const sedeArea = sedeAreaValida(registro.datosGenerales?.areaTrabajo || registro.datosGenerales?.lugar);
      const responsable = item.trabajador?.nombre || registro.registro?.usuarioEmail || "-";
      const fecha = registro.datosGenerales?.fechaInspeccion || registro.registro?.fechaRegistro?.slice(0, 10) || "-";
      return {
        codigo,
        formato: nombreFormato(codigo),
        ruta,
        detalleUrl: detalleRegistroUrl(codigo, registro.__archivo),
        fecha,
        responsable,
        sedeArea,
        estado: malos > 0 ? "Con novedad" : regulares > 0 ? "Regular" : "Conforme",
        novedades: malos,
        detalles: condiciones.map((condicion: any, condicionIndex: number) => ({
          grupo: textoSeguro(condicion.categoria || condicion.tipoEpp || condicion.elemento, "Elementos EPP"),
          item: textoSeguro(condicion.nombre || condicion.epp || condicion.descripcion || condicion.cual, `Elemento ${condicionIndex + 1}`),
          estado: detalleEstadoCondicion(condicion.condicionId),
          observaciones: condicion.observaciones,
        })),
        busqueda: unirBusqueda([codigo, nombreFormato(codigo), sedeArea, responsable, item.trabajador?.cargo, registro.datosGenerales?.lugar]),
      };
    });
  }

  if (codigo === "HSE-F020") {
    return (registro.registros || []).map((item: any) => {
      const grado1 = Number(item.personaEvaluada?.gradoDetectadoMg100ml || 0);
      const grado2 = Number(item.personaEvaluada?.gradoDetectadoSegundaPruebaMg100ml || 0);
      const positivo = grado1 >= 20 || grado2 >= 20 || item.personaEvaluada?.resultadoPrimeraPruebaInicial === "Positivo" || item.personaEvaluada?.resultadoSegundaPruebaConfirmatoria === "Positivo";
      const sedeArea = sedeAreaValida(registro.datosGenerales?.sede);
      const responsable = registro.datosGenerales?.evaluador || registro.registro?.usuarioEmail || "-";
      const fecha = registro.datosGenerales?.fecha || registro.registro?.fechaRegistro?.slice(0, 10) || "-";
      return {
        codigo,
        formato: nombreFormato(codigo),
        ruta,
        detalleUrl: detalleRegistroUrl(codigo, registro.__archivo),
        fecha,
        responsable,
        sedeArea,
        estado: positivo ? "Con novedad" : "Conforme",
        novedades: positivo ? 1 : 0,
        detalles: [
          {
            grupo: "Resultado de pruebas",
            item: textoSeguro(item.personaEvaluada?.nombre, "Persona evaluada"),
            estado: positivo ? "Con novedad" : "Conforme",
            observaciones: positivo
              ? `Primera prueba: ${item.personaEvaluada?.resultadoPrimeraPruebaInicial || grado1 || "Sin dato"}. Segunda prueba: ${item.personaEvaluada?.resultadoSegundaPruebaConfirmatoria || grado2 || "Sin dato"}.`
              : "Resultados registrados como conformes.",
          },
        ],
        busqueda: unirBusqueda([codigo, nombreFormato(codigo), sedeArea, responsable, item.personaEvaluada?.nombre, registro.datosGenerales?.criterioTomaMuestra]),
      };
    });
  }

  if (codigo === "HSE-F003") {
    return (registro.registros || []).map((item: any) => {
      const verificacion = item.verificacion || [];
      const malos = verificacion.filter((revision: any) => estadoRevisionId(revision) === 3).length;
      const regulares = verificacion.filter((revision: any) => estadoRevisionId(revision) === 2).length;
      const fechaProximaRecarga = item.identificacionExtintor?.fechaProximaRecarga || "";
      const recarga = calcularEstadoRecarga(fechaProximaRecarga);
      const vencimiento = recarga.estado === "Vencido" ? "Vencido" : recarga.estado === "Regular" || recarga.estado === "Vence hoy" ? "Próximo" : "Vigente";
      const novedades = malos + (recarga.severidad === "malo" || recarga.severidad === "critico" ? 1 : 0);
      const sedeArea = sedeAreaValida(registro.datosInspeccion?.sedeCentroTrabajo || item.identificacionExtintor?.ubicacion);
      const responsable = registro.datosInspeccion?.responsableInspeccion || registro.registro?.usuarioEmail || "-";
      const fecha = registro.registro?.fechaRegistro?.slice(0, 10) || registro.fechaRegistro?.slice(0, 10) || "-";
      return {
        codigo,
        formato: nombreFormato(codigo),
        ruta,
        detalleUrl: detalleRegistroUrl(codigo, registro.__archivo),
        fecha,
        responsable,
        sedeArea,
        estado: novedades > 0 ? "Con novedad" : regulares > 0 || vencimiento === "Próximo" ? "Regular" : "Conforme",
        novedades,
        vencimiento,
        recarga,
        detalles: [
          ...verificacion.map((revision: any, revisionIndex: number) => ({
            grupo: "Verificación del extintor",
            item: textoSeguro(revision.criterio || revision.item || revision.descripcion, `Revisión ${revisionIndex + 1}`),
            estado: detalleEstadoCondicion(estadoRevisionId(revision)),
            observaciones: revision.observaciones,
          })),
          {
            grupo: "Vencimiento",
            item: fechaProximaRecarga ? `Fecha próxima recarga: ${fechaProximaRecarga}` : "Fecha próxima recarga",
            estado: recarga.severidad === "malo" || recarga.severidad === "critico" ? "Con novedad" : recarga.severidad === "regular" ? "Regular" : recarga.severidad === "pendiente" ? "Pendiente" : "Conforme",
            observaciones: recarga.mensaje,
          },
        ],
        busqueda: unirBusqueda([codigo, nombreFormato(codigo), sedeArea, responsable, item.identificacionExtintor?.numeroExtintor, item.identificacionExtintor?.ubicacion, fechaProximaRecarga, item.observaciones]),
      };
    });
  }

  if (codigo === "HSE-F010") {
    const items = [
      ...(registro.itemsInspeccion || []).flatMap((grupo: any) => grupo.items || []),
      ...(registro.otros?.detalle || []),
    ];
    const novedades = items.filter((item: any) => item.estadoId === 2).length;
    const sedeArea = sedeAreaValida(registro.datosGenerales?.areaInspeccionada);
    const responsable = registro.datosGenerales?.inspector || registro.registro?.usuarioEmail || "-";
    const fecha = registro.datosGenerales?.fecha || registro.registro?.fechaRegistro?.slice(0, 10) || "-";
    return [
      {
        codigo,
        formato: nombreFormato(codigo),
        ruta,
        detalleUrl: detalleRegistroUrl(codigo, registro.__archivo),
        fecha,
        responsable,
        sedeArea,
        estado: novedades > 0 ? "Con novedad" : "Conforme",
        novedades,
        detalles: items.map((item: any, itemIndex: number) => ({
          grupo: textoSeguro(item.grupoTitulo, "Condiciones de seguridad"),
          item: textoSeguro(item.criterio || item.cual, `Ítem ${itemIndex + 1}`),
          estado: detalleEstadoChequeo(item.estadoId),
          observaciones: item.observaciones,
        })),
        busqueda: unirBusqueda([codigo, nombreFormato(codigo), sedeArea, responsable, registro.observacionesGenerales, registro.recomendaciones, ...items.flatMap((item: any) => [item.criterio, item.cual, item.observaciones])]),
      },
    ];
  }

  return [];
};

const cargarRegistrosModulo = async () => {
  const registros = await Promise.all(
    fuentes.map(async (fuente) => {
      const respuestas = await leerJson(fuente.dir);
      return respuestas.flatMap((respuesta) => mapearRegistro(fuente.codigo, fuente.ruta, respuesta));
    })
  );
  return registros.flat().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
};

const claseEstado = (estado: string) => {
  if (estado === "Conforme") return "bg-[#E8F5E9] text-[#006948]";
  if (estado === "Con novedad") return "bg-[#FFEBEE] text-red-700";
  if (estado === "Pendiente") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber-700";
};

const obtenerParametro = (params: Record<string, string | string[] | undefined>, key: string) => {
  const value = params[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
};

const fechaIso = (fecha: Date) => fecha.toISOString().slice(0, 10);

const obtenerRangoPeriodo = (periodo: string, fechaDesde: string, fechaHasta: string) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (periodo === "hoy") {
    const fecha = fechaIso(hoy);
    return { desde: fecha, hasta: fecha };
  }

  if (periodo === "semana") {
    const inicio = new Date(hoy);
    const dia = inicio.getDay() || 7;
    inicio.setDate(inicio.getDate() - dia + 1);
    return { desde: fechaIso(inicio), hasta: fechaIso(hoy) };
  }

  if (periodo === "mes") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { desde: fechaIso(inicio), hasta: fechaIso(hoy) };
  }

  if (periodo === "3meses") {
    const inicio = new Date(hoy);
    inicio.setMonth(inicio.getMonth() - 3);
    return { desde: fechaIso(inicio), hasta: fechaIso(hoy) };
  }

  if (periodo === "personalizado") return { desde: fechaDesde, hasta: fechaHasta };

  return { desde: "", hasta: "" };
};

export default async function FormatosPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const registros = await cargarRegistrosModulo();
  const filtroBusqueda = obtenerParametro(params, "q");
  const filtroPeriodo = obtenerParametro(params, "periodo");
  const filtroFormato = obtenerParametro(params, "formato");
  const filtroEstado = obtenerParametro(params, "estado");
  const vistaActiva = obtenerParametro(params, "vista") === "formatos" ? "formatos" : "dashboard";
  const fechaDesde = obtenerParametro(params, "desde");
  const fechaHasta = obtenerParametro(params, "hasta");
  const periodo = filtroPeriodo || "todos";
  const rangoPeriodo = obtenerRangoPeriodo(periodo, fechaDesde, fechaHasta);
  const busquedaNormalizada = unirBusqueda([filtroBusqueda]);
  const busquedaFlexible = normalizarBusquedaFlexible(filtroBusqueda);
  const registrosFiltrados = registros.filter((registro) => {
    const coincideBusqueda =
      !busquedaNormalizada ||
      registro.busqueda.includes(busquedaNormalizada) ||
      (busquedaFlexible.length > 0 && registro.busqueda.includes(busquedaFlexible));
    const coincideFormato = !filtroFormato || registro.codigo === filtroFormato;
    const coincideEstado = !filtroEstado || registro.estado === filtroEstado;
    const coincideDesde = !rangoPeriodo.desde || registro.fecha >= rangoPeriodo.desde;
    const coincideHasta = !rangoPeriodo.hasta || registro.fecha <= rangoPeriodo.hasta;
    return coincideBusqueda && coincideFormato && coincideEstado && coincideDesde && coincideHasta;
  });
  const mesActual = new Date().toISOString().slice(0, 7);
  const total = registrosFiltrados.length;
  const inspeccionesMes = registrosFiltrados.filter((registro) => registro.fecha.startsWith(mesActual)).length;
  const conformes = registrosFiltrados.filter((registro) => registro.estado === "Conforme").length;
  const novedades = registrosFiltrados.filter((registro) => registro.estado === "Con novedad").length;
  const hayFiltrosActivos = Boolean(filtroBusqueda || filtroFormato || filtroEstado || periodo !== "todos");
  const sinResultadosPorFiltro = registros.length > 0 && registrosFiltrados.length === 0 && hayFiltrosActivos;
  const porFormatoCompleto = contar(registrosFiltrados.map((registro) => registro.codigo));
  const novedadesPorFormatoCompleto = contar(registrosFiltrados.filter((registro) => registro.novedades > 0).map((registro) => registro.codigo));
  const porSedeAreaCompleto = contar(registrosFiltrados.map((registro) => registro.sedeArea));
  const porFormato = porFormatoCompleto.slice(0, 5);
  const novedadesPorFormato = novedadesPorFormatoCompleto.slice(0, 5);
  const porSedeArea = porSedeAreaCompleto.slice(0, 5);
  const maxFormato = Math.max(...porFormato.map((item) => item.value), 1);
  const maxNovedades = Math.max(...novedadesPorFormato.map((item) => item.value), 1);
  const maxSedeArea = Math.max(...porSedeArea.map((item) => item.value), 1);
  const meses = Array.from({ length: 6 }, (_, index) => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - (5 - index));
    const key = fecha.toISOString().slice(0, 7);
    const label = fecha.toLocaleDateString("es-CO", { month: "short" }).replace(".", "");
    return { key, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });
  const tendencia = meses.map((mes) => {
    const registrosMes = registrosFiltrados.filter((registro) => registro.fecha.startsWith(mes.key));
    return { mes: mes.label, realizadas: registrosMes.length, novedades: registrosMes.filter((registro) => registro.estado === "Con novedad").length };
  });
  const maxTendencia = Math.max(...tendencia.flatMap((item) => [item.realizadas, item.novedades]), 1);
  const tendenciaVisual = tendencia.map((item) => ({
    ...item,
    sinRegistros: item.realizadas === 0 && item.novedades === 0,
    alturaRealizadas: Math.max(18, Math.round((item.realizadas / maxTendencia) * 100)),
    alturaNovedades: Math.max(18, Math.round((item.novedades / maxTendencia) * 100)),
  }));
  const distribucionFormato = fuentes.map((fuente, index) => {
    const nombreCorto = nombreFormato(fuente.codigo)
      .replace("INSPECCIÓN DE ", "")
      .replace("INSPECCIÓN Y VERIFICACIÓN DE ", "")
      .replace("VERIFICACIÓN EN SITIO DE ", "")
      .replace("LISTA DE CHEQUEO DE LAS ", "");
    return {
      codigo: fuente.codigo,
      nombreCorto,
      value: registrosFiltrados.filter((registro) => registro.codigo === fuente.codigo).length,
      color: coloresDistribucion[index % coloresDistribucion.length],
    };
  });
  const formatosConDistribucion = distribucionFormato.filter((item) => item.value > 0);
  const totalDistribucion = formatosConDistribucion.reduce((acc, item) => acc + item.value, 0);
  let acumuladoDistribucion = 0;
  const segmentosDistribucion = formatosConDistribucion.map((item) => {
    const inicio = acumuladoDistribucion;
    const fin = inicio + (item.value / Math.max(totalDistribucion, 1)) * 100;
    acumuladoDistribucion = fin;
    return {
      ...item,
      porcentaje: Math.round((item.value / Math.max(totalDistribucion, 1)) * 100),
      inicio,
      fin,
    };
  });

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
          <Link href="/formatos" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-[#006948] text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold text-slate-950">Inspecciones HSE</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-bold">
            {[
              { href: "/formatos", label: "Dashboard", active: vistaActiva === "dashboard", icon: LayoutDashboard },
              { href: "/formatos?vista=formatos", label: "Formatos", active: vistaActiva === "formatos", icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 transition ${
                    item.active ? "border-[#006948] text-[#006948]" : "border-transparent text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10">
        {vistaActiva === "dashboard" ? (
          <>
          <section>
            <p className="text-sm font-medium text-slate-500">Módulo de Inspecciones</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Dashboard Inspecciones HSE</h1>
          </section>

          <DashboardFiltros
            busqueda={filtroBusqueda}
            periodo={periodo}
            formato={filtroFormato}
            estado={filtroEstado}
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            formatos={fuentes}
            sinResultadosPorFiltro={sinResultadosPorFiltro}
          />

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Total inspecciones", value: sinResultadosPorFiltro ? "Sin datos" : total, meta: "Módulo HSE", tone: "text-slate-700", bg: "bg-slate-100" },
              { title: "Inspecciones del mes", value: sinResultadosPorFiltro ? "Sin datos" : inspeccionesMes, meta: "Mes actual", tone: "text-slate-700", bg: "bg-slate-100" },
              { title: "Inspecciones conformes", value: sinResultadosPorFiltro ? "Sin datos" : conformes, meta: "Normalizadas", tone: "text-[#006948]", bg: "bg-[#E8F5E9]" },
              { title: "Inspecciones con novedades", value: sinResultadosPorFiltro ? "Sin datos" : novedades, meta: "Revisar", tone: "text-red-700", bg: "bg-[#FFEBEE]" },
            ].map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.title}</p>
                    <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.bg} ${item.tone}`}>{item.meta}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Inspecciones por mes</h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">Últimos 6 meses según filtros activos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                  <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#006948]" />Realizadas</span>
                  <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#F87171]" />Novedades</span>
                  <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-slate-300" />Sin registros</span>
                </div>
              </div>
              {total > 0 ? (
                <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/60 px-5 pb-4 pt-5">
                  <div className="flex h-64 items-end justify-between gap-4 border-b border-slate-200">
                    {tendenciaVisual.map((item) => (
                      <div key={item.mes} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                        <div className="flex flex-1 items-end justify-center gap-2">
                          {item.sinRegistros ? (
                            <div className="mb-0 flex h-[18%] w-full max-w-20 items-end justify-center rounded-t-lg bg-slate-200/80">
                              <span className="mb-2 text-[10px] font-bold text-slate-400">0</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex h-full w-9 flex-col justify-end">
                                <span className="mb-1 text-center text-[10px] font-bold text-[#006948]">{item.realizadas}</span>
                                <div className="rounded-t-lg bg-[#006948] shadow-sm" style={{ height: `${item.alturaRealizadas}%` }} />
                              </div>
                              <div className="flex h-full w-9 flex-col justify-end">
                                {item.novedades > 0 ? <span className="mb-1 text-center text-[10px] font-bold text-red-600">{item.novedades}</span> : <span className="mb-1 h-3" />}
                                <div className={item.novedades > 0 ? "rounded-t-lg bg-[#F87171] shadow-sm" : "rounded-t-lg bg-slate-200"} style={{ height: item.novedades > 0 ? `${item.alturaNovedades}%` : "18%" }} />
                              </div>
                            </>
                          )}
                        </div>
                        <p className={`mt-3 truncate text-center text-xs font-bold ${item.sinRegistros ? "text-slate-400" : "text-slate-600"}`}>{item.mes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid h-64 place-items-center rounded-lg border border-slate-100 bg-slate-50 text-sm font-medium text-slate-500">
                  Sin datos para el periodo seleccionado
                </div>
              )}
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Distribución por formato</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Participación de registros según filtros activos.</p>
              </div>
              <div className="mt-5">
                {totalDistribucion > 0 ? (
                  <DistribucionFormatoDona segmentos={segmentosDistribucion} total={totalDistribucion} />
                ) : (
                  <p className="rounded-lg bg-slate-50 px-4 py-6 text-sm font-medium text-slate-500">Sin registros</p>
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            {[
              ["Inspecciones por formato", porFormato, maxFormato, porFormatoCompleto],
              ["Novedades por formato", novedadesPorFormato, maxNovedades, novedadesPorFormatoCompleto],
              ["Inspecciones por sede o área", porSedeArea, maxSedeArea, porSedeAreaCompleto],
            ].map(([title, items, max, allItems]) => {
              const visibles = items as Array<{ label: string; value: number }>;
              const completos = allItems as Array<{ label: string; value: number }>;
              return (
                <article key={String(title)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-slate-950">{String(title)}</h2>
                  <div className="mt-4 space-y-3">
                    {visibles.map((item) => (
                      <div key={`${String(title)}-${item.label}`}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                          <span className="truncate">{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-[#006948]" style={{ width: `${Math.max(8, Math.round((item.value / Number(max)) * 100))}%` }} />
                        </div>
                      </div>
                    ))}
                    {visibles.length === 0 ? (
                      <p className="rounded-lg bg-slate-50 px-4 py-6 text-sm font-medium text-slate-500">Sin registros</p>
                    ) : null}
                  </div>
                  {completos.length > visibles.length ? (
                    <details className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                      <summary className="cursor-pointer font-bold text-[#006948]">Ver más</summary>
                      <div className="mt-3 space-y-2">
                        {completos.slice(visibles.length).map((item) => (
                          <div key={`extra-${String(title)}-${item.label}`} className="flex items-center justify-between gap-3">
                            <span className="truncate">{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </article>
              );
            })}
          </section>

          <InspeccionesRecientes registros={registrosFiltrados.slice(0, 10)} />

          </>
        ) : (
          <>
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Inspecciones / Formatos disponibles</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Formatos de inspección</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Seleccione el instrumento de inspección para iniciar un nuevo registro.
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {formatos.map((formato) => (
                <article key={formato.codigo} className="flex min-h-[230px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#006948] hover:shadow-md">
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <span className="rounded bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#006948]">{formato.codigo}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="min-h-14 text-lg font-bold leading-6 text-slate-950">{formato.nombre}</h2>
                    <Link href={formato.ruta} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#006948] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#00543a]">
                      <Play className="size-4 fill-current" aria-hidden="true" />
                      Iniciar inspección
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
