import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardCheck, FileText, LayoutDashboard, MapPin, Play, ShieldCheck, TriangleAlert } from "lucide-react";
import DashboardFiltros from "./components/DashboardFiltros";
import DistribucionFormatoDona from "./components/DistribucionFormatoDona";
import ExportarDashboardExcel from "./components/ExportarDashboardExcel";
import { calcularEstadoRecarga, calcularFechaProximaRecargaAnual } from "./components/estadoRecarga";
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
  fechaCreacion: string;
  fechaCreacionMs?: number;
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
  { codigo: "HSE-F006", dir: "inspeccion-equipos-proteccion-contra-caidas", ruta: "/formatos/inspeccion-equipos-proteccion-contra-caidas" },
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

const sumarPor = (items: RegistroModulo[], obtenerLabel: (item: RegistroModulo) => string, obtenerValor: (item: RegistroModulo) => number) =>
  Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const label = obtenerLabel(item) || "Sin dato";
      acc[label] = (acc[label] || 0) + obtenerValor(item);
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

const extraerFechaArchivo = (archivo?: string) => {
  const match = archivo?.match(/(\d{4}-\d{2}-\d{2}T[\d-]+)/);
  if (!match) return "";
  const [fecha, hora = ""] = match[1].split("T");
  return `${fecha}T${hora.replace(/-/g, ":")}`;
};

const obtenerFechaCreacion = (registro: RespuestaJsonModulo) =>
  registro.registro?.fechaRegistro || registro.fechaRegistro || extraerFechaArchivo(registro.__archivo);

const obtenerFechaCreacionMs = (registro: RespuestaJsonModulo) => {
  const tiempo = Date.parse(obtenerFechaCreacion(registro));
  return Number.isFinite(tiempo) ? tiempo : 0;
};

const datosBaseRegistro = (codigo: string, ruta: string, registro: RespuestaJsonModulo) => ({
  codigo,
  formato: nombreFormato(codigo),
  ruta,
  detalleUrl: detalleRegistroUrl(codigo, registro.__archivo),
  fechaCreacion: obtenerFechaCreacion(registro).slice(0, 10),
  fechaCreacionMs: obtenerFechaCreacionMs(registro),
});

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

type ResultadoAlcoholDrogas = {
  item: any;
  positivo: boolean;
};

const mapearRegistro = (codigo: string, ruta: string, registro: RespuestaJsonModulo): RegistroModulo[] => {
  const base = datosBaseRegistro(codigo, ruta, registro);

  if (codigo === "HSE-F006") {
    const decision = registro.cierreInspeccion?.decisionFinalId;
    const detallesChecklist: DetalleRegistroModulo[] = (registro.respuestasChecklist || []).map((item: any, itemIndex: number) => ({
      grupo: textoSeguro(registro.inspeccion?.nombre, "Checklist contra caídas"),
      item: textoSeguro(item.factor, `Factor ${itemIndex + 1}`),
      estado: item.conceptoId === 2 ? "Con novedad" : item.conceptoId === 1 ? "Conforme" : "Pendiente",
      observaciones: item.comentario || item.detalleApoyo || item.instrucciones,
    }));
    const novedadesChecklist = detallesChecklist.filter((detalle) => detalle.estado === "Con novedad").length;
    const estado = novedadesChecklist > 0 || decision === 2 ? "Con novedad" : decision === 1 ? "Conforme" : "Pendiente";
    const detallesFallback: DetalleRegistroModulo[] = [
      {
        grupo: "Decisión final",
        item: decision === 2 ? "Equipo no apto para ser utilizado" : decision === 1 ? "Equipo apto para ser utilizado" : "Inspección pendiente de cierre",
        estado,
        observaciones: registro.cierreInspeccion?.comentariosFinales,
      },
    ];
    const sedeArea = sedeAreaValida(registro.inspeccion?.nombre);
    const responsable = registro.registro?.usuarioEmail || "-";
    const fecha = registro.datosEquipo?.fechaInspeccion || registro.registro?.fechaRegistro?.slice(0, 10) || "-";
    const detalles = detallesChecklist.length > 0 ? detallesChecklist : detallesFallback;
    return [
      {
        ...base,
        fecha,
        responsable,
        sedeArea,
        estado,
        novedades: novedadesChecklist || (decision === 2 ? 1 : 0),
        detalles,
        busqueda: unirBusqueda([
          codigo,
          nombreFormato(codigo),
          sedeArea,
          responsable,
          registro.datosEquipo?.numeroInterno,
          registro.datosEquipo?.numeroSerie,
          registro.cierreInspeccion?.comentariosFinales,
          ...(registro.respuestasChecklist || []).flatMap((item: any) => [item.factor, item.comentario, item.concepto]),
        ]),
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
        ...base,
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
    const evaluados = registro.registros || [];
    const resultados: ResultadoAlcoholDrogas[] = evaluados.map((item: any) => {
      const grado1 = Number(item.personaEvaluada?.gradoDetectadoMg100ml || 0);
      const grado2 = Number(item.personaEvaluada?.gradoDetectadoSegundaPruebaMg100ml || 0);
      const resultado1 = String(item.personaEvaluada?.resultadoPrimeraPruebaInicial || "").toUpperCase();
      const resultado2 = String(item.personaEvaluada?.resultadoSegundaPruebaConfirmatoria || "").toUpperCase();
      const positivo = grado1 >= 20 || grado2 >= 20 || resultado1 === "POSITIVO" || resultado2 === "POSITIVO";

      return { item, positivo };
    });
    const totalConNovedad = resultados.filter((resultado: ResultadoAlcoholDrogas) => resultado.positivo).length;
    const totalConforme = resultados.length - totalConNovedad;
    const estadoGeneral: RegistroModulo["estado"] =
      resultados.length === 0 ? "Pendiente" : totalConNovedad > totalConforme ? "Con novedad" : "Conforme";
    const sedeArea = sedeAreaValida(registro.datosGenerales?.centroTrabajoSede || registro.datosGenerales?.sede);
    const responsable =
      registro.datosGenerales?.realizadoPor?.nombre ||
      registro.datosGenerales?.evaluador ||
      registro.registro?.usuarioEmail ||
      "-";
    const fecha =
      registro.datosGenerales?.fecha ||
      registro.registro?.fechaRegistro?.slice(0, 10) ||
      registro.fechaRegistro?.slice(0, 10) ||
      "-";

    return [
      {
        ...base,
        fecha,
        responsable,
        sedeArea,
        estado: estadoGeneral,
        novedades: totalConNovedad,
        detalles: resultados.map(({ item, positivo }) => ({
          grupo: "Resultado de pruebas",
          item: textoSeguro(item.personaEvaluada?.nombre, "Persona evaluada"),
          estado: positivo ? "Con novedad" : "Conforme",
          observaciones: positivo
            ? `Primera prueba: ${
                item.personaEvaluada?.resultadoPrimeraPruebaInicial ||
                item.personaEvaluada?.gradoDetectadoMg100ml ||
                "Sin dato"
              }. Segunda prueba: ${
                item.personaEvaluada?.resultadoSegundaPruebaConfirmatoria ||
                item.personaEvaluada?.gradoDetectadoSegundaPruebaMg100ml ||
                "Sin dato"
              }.`
            : "Resultados registrados como conformes.",
        })),
        busqueda: unirBusqueda([
          codigo,
          nombreFormato(codigo),
          sedeArea,
          responsable,
          registro.datosGenerales?.criteriosTomaMuestra || registro.datosGenerales?.criterioTomaMuestra,
          ...resultados.flatMap(({ item }) => [
            item.personaEvaluada?.nombre,
            item.personaEvaluada?.identificacion,
            item.personaEvaluada?.resultadoPrimeraPruebaInicial,
            item.personaEvaluada?.resultadoSegundaPruebaConfirmatoria,
          ]),
        ]),
      },
    ];
  }

  if (codigo === "HSE-F003") {
    return (registro.registros || []).map((item: any) => {
      const verificacion = item.verificacion || [];
      const malos = verificacion.filter((revision: any) => estadoRevisionId(revision) === 3).length;
      const regulares = verificacion.filter((revision: any) => estadoRevisionId(revision) === 2).length;
      const fechaUltimaRecarga = item.identificacionExtintor?.fechaUltimaRecarga || "";
      const fechaProximaRecarga =
        item.identificacionExtintor?.fechaProximaRecarga || calcularFechaProximaRecargaAnual(fechaUltimaRecarga);
      const recarga = calcularEstadoRecarga({ fechaUltimaRecarga, fechaProximaRecarga });
      const vencimiento =
        recarga.estado === "Vencido" ? "Vencido" : recarga.estado === "Próximo a vencer" || recarga.estado === "Vence hoy" ? "Próximo" : "Vigente";
      const novedades = malos + (recarga.severidad === "malo" || recarga.severidad === "critico" ? 1 : 0);
      const sedeArea = sedeAreaValida(registro.datosInspeccion?.sedeCentroTrabajo || item.identificacionExtintor?.ubicacion);
      const responsable = registro.datosInspeccion?.responsableInspeccion || registro.registro?.usuarioEmail || "-";
      const fecha = registro.registro?.fechaRegistro?.slice(0, 10) || registro.fechaRegistro?.slice(0, 10) || "-";
      return {
        ...base,
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
        ...base,
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
  return registros.flat().sort((a, b) => (b.fechaCreacionMs || 0) - (a.fechaCreacionMs || 0) || String(b.fecha).localeCompare(String(a.fecha)));
};

const prioridadEstado: Record<RegistroModulo["estado"], number> = {
  "Con novedad": 4,
  Regular: 3,
  Pendiente: 2,
  Conforme: 1,
};

const prioridadRecarga: Record<EstadoRecarga["severidad"], number> = {
  malo: 5,
  critico: 4,
  regular: 3,
  pendiente: 2,
  bueno: 1,
};

const consolidarInspeccionesMetricas = (registros: RegistroModulo[]) =>
  Array.from(
    registros
      .reduce<Map<string, RegistroModulo>>((acc, registro) => {
        const existente = acc.get(registro.detalleUrl);
        if (!existente) {
          acc.set(registro.detalleUrl, registro);
          return acc;
        }

        const estado = prioridadEstado[registro.estado] > prioridadEstado[existente.estado] ? registro.estado : existente.estado;
        const recarga =
          registro.recarga && (!existente.recarga || prioridadRecarga[registro.recarga.severidad] > prioridadRecarga[existente.recarga.severidad])
            ? registro.recarga
            : existente.recarga;

        acc.set(registro.detalleUrl, {
          ...existente,
          estado,
          recarga,
          novedades: existente.novedades + registro.novedades,
          busqueda: `${existente.busqueda} ${registro.busqueda}`,
          detalles: [...existente.detalles, ...registro.detalles],
        });
        return acc;
      }, new Map())
      .values()
  ).sort((a, b) => (b.fechaCreacionMs || 0) - (a.fechaCreacionMs || 0) || String(b.fecha).localeCompare(String(a.fecha)));

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
  const inspecciones = consolidarInspeccionesMetricas(registros);
  const filtroBusqueda = obtenerParametro(params, "q");
  const filtroPeriodo = obtenerParametro(params, "periodo");
  const filtroFormato = obtenerParametro(params, "formato");
  const filtroEstado = obtenerParametro(params, "estado");
  const vistaActiva = obtenerParametro(params, "vista") === "formatos" ? "formatos" : "dashboard";
  const fechaDesde = obtenerParametro(params, "desde");
  const fechaHasta = obtenerParametro(params, "hasta");
  const periodo = filtroPeriodo || "hoy";
  const rangoPeriodo = obtenerRangoPeriodo(periodo, fechaDesde, fechaHasta);
  const busquedaNormalizada = unirBusqueda([filtroBusqueda]);
  const busquedaFlexible = normalizarBusquedaFlexible(filtroBusqueda);
  const filtrarRegistro = (registro: RegistroModulo) => {
    const coincideBusqueda =
      !busquedaNormalizada ||
      registro.busqueda.includes(busquedaNormalizada) ||
      (busquedaFlexible.length > 0 && registro.busqueda.includes(busquedaFlexible));
    const coincideFormato = !filtroFormato || registro.codigo === filtroFormato;
    const coincideEstado = !filtroEstado || registro.estado === filtroEstado;
    const coincideDesde = !rangoPeriodo.desde || registro.fechaCreacion >= rangoPeriodo.desde;
    const coincideHasta = !rangoPeriodo.hasta || registro.fechaCreacion <= rangoPeriodo.hasta;
    return coincideBusqueda && coincideFormato && coincideEstado && coincideDesde && coincideHasta;
  };
  const registrosFiltrados = registros.filter(filtrarRegistro);
  const inspeccionesMetricas = inspecciones.filter(filtrarRegistro);
  const registrosRecientes = registrosFiltrados.slice(0, 10);
  const mesActual = new Date().toISOString().slice(0, 7);
  const totalInspecciones = inspecciones.length;
  const inspeccionesMes = inspeccionesMetricas.filter((registro) => registro.fechaCreacion.startsWith(mesActual)).length;
  const conformes = inspeccionesMetricas.filter((registro) => registro.estado === "Conforme").length;
  const inspeccionesConNovedad = inspeccionesMetricas.filter((registro) => registro.estado === "Con novedad").length;
  const novedadesDetectadas = inspeccionesMetricas.reduce((acc, registro) => acc + registro.novedades, 0);
  const hayFiltrosActivos = Boolean(filtroBusqueda || filtroFormato || filtroEstado || periodo !== "hoy");
  const sinResultadosPorFiltro = inspecciones.length > 0 && inspeccionesMetricas.length === 0 && hayFiltrosActivos;
  const porFormatoCompleto = contar(inspeccionesMetricas.map((registro) => registro.codigo));
  const novedadesPorFormatoCompleto = sumarPor(
    inspeccionesMetricas.filter((registro) => registro.novedades > 0),
    (registro) => registro.codigo,
    (registro) => registro.novedades
  );
  const porSedeAreaCompleto = contar(inspeccionesMetricas.map((registro) => registro.sedeArea));
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
    const registrosMes = inspeccionesMetricas.filter((registro) => registro.fechaCreacion.startsWith(mes.key));
    return { mes: mes.label, realizadas: registrosMes.length, novedades: registrosMes.reduce((acc, registro) => acc + registro.novedades, 0) };
  });
  const maxTendencia = Math.max(...tendencia.flatMap((item) => [item.realizadas, item.novedades]), 1);
  const alturaMaximaBarra = 84;
  const alturaBarraSinDatos = 13;
  const tendenciaVisual = tendencia.map((item) => ({
    ...item,
    sinRegistros: item.realizadas === 0 && item.novedades === 0,
    alturaRealizadas: item.realizadas > 0 ? Math.max(16, Math.round((item.realizadas / maxTendencia) * alturaMaximaBarra)) : alturaBarraSinDatos,
    alturaNovedades: item.novedades > 0 ? Math.max(16, Math.round((item.novedades / maxTendencia) * alturaMaximaBarra)) : alturaBarraSinDatos,
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
      value: inspeccionesMetricas.filter((registro) => registro.codigo === fuente.codigo).length,
      color: coloresDistribucion[index % coloresDistribucion.length],
    };
  });
  const formatosConDistribucion = distribucionFormato.filter((item) => item.value > 0);
  const totalDistribucion = formatosConDistribucion.reduce((acc, item) => acc + item.value, 0);
  const segmentosDistribucion = formatosConDistribucion.reduce<Array<(typeof formatosConDistribucion)[number] & { porcentaje: number; inicio: number; fin: number }>>((acc, item) => {
    const inicio = acc[acc.length - 1]?.fin || 0;
    const fin = inicio + (item.value / Math.max(totalDistribucion, 1)) * 100;
    return [
      ...acc,
      {
      ...item,
      porcentaje: Math.round((item.value / Math.max(totalDistribucion, 1)) * 100),
      inicio,
      fin,
      },
    ];
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F9FF] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-8 lg:px-10">
          <Link href="/formatos" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#006948] text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 text-sm font-bold leading-tight text-slate-950 sm:text-base">Inspecciones HSE</span>
          </Link>
          <nav className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto text-xs font-bold sm:gap-2 sm:text-sm">
            {[
              { href: "/formatos", label: "Dashboard", active: vistaActiva === "dashboard", icon: LayoutDashboard },
              { href: "/formatos?vista=formatos", label: "Formatos", active: vistaActiva === "formatos", icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2 py-3 transition sm:gap-2 sm:px-4 ${
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

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-6 sm:px-8 lg:px-10">
        {vistaActiva === "dashboard" ? (
          <>
          <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Módulo de Inspecciones</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Dashboard Inspecciones HSE</h1>
            </div>
            <ExportarDashboardExcel registros={inspeccionesMetricas} />
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
              {
                title: "Total inspecciones",
                value: totalInspecciones,
                meta: "",
                icon: ClipboardCheck,
                iconBox: "bg-emerald-200 text-emerald-900",
                accent: "",
                valueClass: "text-[#006948]",
              },
              {
                title: "Inspecciones del mes",
                value: sinResultadosPorFiltro ? "Sin datos" : inspeccionesMes,
                meta: "Mes actual",
                icon: CalendarDays,
                iconBox: "bg-blue-100 text-slate-900",
                accent: "",
                valueClass: "text-[#006948]",
              },
              {
                title: "Inspecciones conformes",
                value: sinResultadosPorFiltro ? "Sin datos" : conformes,
                meta: "",
                icon: CheckCircle2,
                iconBox: "bg-emerald-200 text-[#006948]",
                accent: "border-l-4 border-l-[#006948]",
                valueClass: "text-[#006948]",
              },
              {
                title: "Con novedades",
                value: sinResultadosPorFiltro ? "Sin datos" : inspeccionesConNovedad,
                meta: sinResultadosPorFiltro ? "" : `${novedadesDetectadas} ${novedadesDetectadas === 1 ? "hallazgo" : "hallazgos"}`,
                icon: TriangleAlert,
                iconBox: "bg-red-100 text-red-900",
                accent: "border-l-4 border-l-red-900",
                valueClass: "text-red-900",
              },
            ].map((item) => (
              <article key={item.title} className={`min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${item.accent}`}>
                <div className="flex items-center gap-4">
                  <div className={`grid size-12 shrink-0 place-items-center rounded-lg ${item.iconBox}`}>
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">{item.title}</p>
                    <div className="mt-1 flex flex-wrap items-end gap-2">
                      <p className={`text-3xl font-bold leading-none ${item.valueClass}`}>{item.value}</p>
                      {item.meta ? <span className="pb-1 text-[10px] font-bold text-[#006948]">{item.meta}</span> : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="grid min-w-0 items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <article className="flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Inspecciones por mes</h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">Últimos 6 meses según filtros activos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                  <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#006948]" />Realizadas</span>
                  <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#F87171]" />Hallazgos</span>
                  <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-slate-300" />Sin inspecciones</span>
                </div>
              </div>
              {inspeccionesMetricas.length > 0 ? (
                <div className="mt-4 flex-1 overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/60 px-4 pb-4 pt-5 sm:px-5">
                  <div className="flex h-full min-h-72 min-w-[520px] items-end justify-between gap-4 border-b border-slate-200">
                    {tendenciaVisual.map((item) => (
                      <div key={item.mes} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                        <div className="flex flex-1 items-end justify-center gap-2">
                          {item.sinRegistros ? (
                            <div className="mb-0 flex w-full max-w-20 items-end justify-center rounded-t-lg bg-slate-200/80" style={{ height: `${alturaBarraSinDatos}%` }}>
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
                <div className="mt-4 grid min-h-64 flex-1 place-items-center rounded-lg border border-slate-100 bg-slate-50 text-sm font-medium text-slate-500">
                  Sin datos para el periodo seleccionado
                </div>
              )}
            </article>

            <article className="flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Distribución por formato</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Participación de inspecciones creadas según filtros activos.</p>
              </div>
              <div className="mt-5 flex-1">
                {totalDistribucion > 0 ? (
                  <DistribucionFormatoDona segmentos={segmentosDistribucion} total={totalDistribucion} />
                ) : (
                  <p className="rounded-lg bg-slate-50 px-4 py-6 text-sm font-medium text-slate-500">Sin inspecciones</p>
                )}
              </div>
            </article>
          </section>

          <section className="grid min-w-0 gap-6 xl:grid-cols-3">
            {[
              {
                title: "Inspecciones por formato",
                items: porFormato,
                max: maxFormato,
                allItems: porFormatoCompleto,
                icon: ClipboardCheck,
                iconBox: "bg-emerald-100 text-[#006948]",
                pill: "bg-emerald-50 text-[#006948]",
                bar: "bg-[#20A37A]",
                totalLabel: `${porFormatoCompleto.reduce((acc, item) => acc + item.value, 0)} total`,
              },
              {
                title: "Hallazgos por formato",
                items: novedadesPorFormato,
                max: maxNovedades,
                allItems: novedadesPorFormatoCompleto,
                icon: TriangleAlert,
                iconBox: "bg-red-50 text-red-800",
                pill: "bg-red-50 text-red-800",
                bar: "bg-orange-600",
                totalLabel: `${novedadesPorFormatoCompleto.reduce((acc, item) => acc + item.value, 0)} total`,
              },
              {
                title: "Inspecciones por sede o área",
                items: porSedeArea,
                max: maxSedeArea,
                allItems: porSedeAreaCompleto,
                icon: MapPin,
                iconBox: "bg-blue-50 text-blue-700",
                pill: "bg-blue-50 text-blue-700",
                bar: "bg-blue-500",
                totalLabel: `${porSedeAreaCompleto.length} ${porSedeAreaCompleto.length === 1 ? "sede" : "sedes"}`,
              },
            ].map((config) => {
              const visibles = config.items;
              const completos = config.allItems;
              const Icon = config.icon;
              return (
                <article key={config.title} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${config.iconBox}`}>
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <h2 className="min-w-0 text-base font-bold uppercase leading-tight tracking-wide text-slate-700">{config.title}</h2>
                  </div>

                  <span className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${config.pill}`}>
                    {config.totalLabel}
                  </span>

                  <div className="mt-4 space-y-3">
                    {visibles.map((item) => (
                      <div key={`${config.title}-${item.label}`} className="grid grid-cols-[minmax(0,1fr)_112px_20px] items-center gap-3">
                        <span className="min-w-0 truncate text-sm font-bold text-slate-800" title={item.label}>{item.label}</span>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${config.bar}`} style={{ width: `${Math.max(8, Math.round((item.value / Number(config.max)) * 100))}%` }} />
                        </div>
                        <span className={`text-right text-sm font-bold ${config.bar === "bg-blue-500" ? "text-blue-600" : config.bar === "bg-orange-600" ? "text-orange-700" : "text-[#006948]"}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                    {visibles.length === 0 ? (
                      <p className="rounded-lg bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">Sin inspecciones</p>
                    ) : null}
                  </div>
                  {completos.length > visibles.length ? (
                    <details className="mt-4 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                      <summary className="cursor-pointer font-bold text-slate-700">Ver más</summary>
                      <div className="mt-3 space-y-2">
                        {completos.slice(visibles.length).map((item) => (
                          <div key={`extra-${config.title}-${item.label}`} className="flex items-center justify-between gap-3">
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

          <InspeccionesRecientes registros={registrosRecientes} />

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
