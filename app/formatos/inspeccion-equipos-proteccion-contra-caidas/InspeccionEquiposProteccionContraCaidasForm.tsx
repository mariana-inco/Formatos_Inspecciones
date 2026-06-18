"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Signature from "@uiw/react-signature";
import type { SignatureRef } from "@uiw/react-signature";
import {
  CalendarDays,
  Check,
  ClipboardList,
  HardHat,
  ImageUp,
  Settings,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { enfocarYMostrarCampoFaltante } from "../components/campoFaltante";
import {
  limpiarFirmaParaJson,
  limpiarImagenParaJson,
  mapConceptoToId,
  registrarJsonFinalFormulario,
} from "../components/jsonFormulario";
import {
  inspectionTypeKeys as clavesTiposInspeccion,
  inspectionTypes as tiposInspeccion,
} from "./data";
import type { ChecklistItem as ItemListaChequeo, InspectionTypeKey as ClaveTipoInspeccion } from "./data";

const datosGeneralesIniciales = {
  email: "",
  fechaInspeccion: "",
  fabricante: "",
  modelo: "",
  numeroSerie: "",
  numeroInterno: "",
  periodicidad: "",
  fechaFabricacion: "",
  certificado: "",
  fechaCompra: "",
  numeroLote: "",
  tipoFreno: "",
  fechaPrimeraUtilizacion: "",
  antecedentesEquipo: "",
};

const METADATOS_FORMATO = {
  codigo: "HSE-F006",
  fecha: "2025-09-18",
  version: "04",
};

const perfilRocaActual = {
  nombre: "KATHERIN MARIANA GOMEZ CEPEDA",
  cargo: "DESARROLLADOR JUNIOR",
  proceso: "GESTION DE TECNOLOGIA",
  compania: "INCOMINERIA S.A.S.",
};

const claseCampoFecha =
  "date-input mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none [color-scheme:light] focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const claseCampoTexto =
  "mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const claseCampoSeleccion =
  "mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const tarjetaSeccion = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/70";
const encabezadoSeccion = "flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-5 py-5";
const iconoSeccion = "grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white";
const marcaObligatorio = <span className="text-red-600">*</span>;

type ConceptoRevision = "" | "ACEPTADO" | "RECHAZADO";

type RespuestaListaChequeo = {
  concepto: ConceptoRevision;
  comentario: string;
};

type DatosFirma = {
  inspectorIdentificacion: string;
  inspectorNombre: string;
  inspectorCargo: string;
  inspectorFirma: string;
  inspectorFirmado: boolean;
  responsableNombre: string;
  responsableIdentificacion: string;
  responsableCargo: string;
  responsableFirma: string;
  responsableFirmado: boolean;
};

const firmasIniciales: DatosFirma = {
  inspectorIdentificacion: "",
  inspectorNombre: "",
  inspectorCargo: "",
  inspectorFirma: "",
  inspectorFirmado: false,
  responsableNombre: "",
  responsableIdentificacion: "",
  responsableCargo: "",
  responsableFirma: "",
  responsableFirmado: false,
};

const soloNumeros = (value: string) => value.replace(/\D/g, "");
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const enfocarCampoFaltante = (id: string) => {
  enfocarYMostrarCampoFaltante(id);
};
const camposFirmaNumericos = new Set<keyof DatosFirma>(["inspectorIdentificacion", "responsableIdentificacion"]);
const camposFirmaSinNumeros = new Set<keyof DatosFirma>([
  "inspectorNombre",
  "inspectorCargo",
  "responsableNombre",
  "responsableCargo",
]);
const camposDatosEquipoNumericos = new Set(["numeroSerie", "numeroInterno"]);

const etiquetasBotonesInspeccion: Record<ClaveTipoInspeccion, string> = {
  arnes: "INSPECCIÓN ARNÉS",
  eslingas: "INSPECCIÓN ESLINGAS",
  descendedor: "INSPECCIÓN DESCENDEDOR",
  mosqueton: "INSPECCIÓN MOSQUETÓN",
  autoretracto: "INSPECCIÓN AUTORETRACT",
  freno: "INSPECCIÓN FRENO",
  tieoff: "INSPECCIÓN TIE-OFF",
  "linea-vida": "LÍNEA DE VIDA",
};

const imagenesBotonesInspeccion: Record<ClaveTipoInspeccion, string> = {
  arnes: "/Iconos/arnes-de-seguridad.png",
  eslingas: "/Iconos/eslingas-de-cinta.png",
  descendedor: "/Iconos/rappel.png",
  mosqueton: "/Iconos/mosqueton.png",
  autoretracto: "/Iconos/autoretract.png",
  freno: "/Iconos/frenos.png",
  tieoff: "/Iconos/tie-off.png",
  "linea-vida": "/Iconos/lineadevida.png",
};
const normalizarTexto = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const obtenerMesesPeriodicidad = (periodicidad: string) => {
  const valor = normalizarTexto(periodicidad);
  if (valor.includes("mensual")) return 1;
  if (valor.includes("trimestral")) return 3;
  if (valor.includes("semestral")) return 6;
  if (valor.includes("anual")) return 12;
  const meses = valor.match(/(\d+)\s*mes/);
  if (meses?.[1]) return Number(meses[1]);
  return null;
};
const sumarMeses = (fecha: string, meses: number) => {
  const base = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(base.getTime())) return "";
  base.setMonth(base.getMonth() + meses);
  return base.toISOString().slice(0, 10);
};
const calcularProximaInspeccion = (fechaInspeccion: string, periodicidad: string) => {
  const meses = obtenerMesesPeriodicidad(periodicidad);
  if (!fechaInspeccion || !meses) return "";
  return sumarMeses(fechaInspeccion, meses);
};
const obtenerEstadoVigencia = (proximaInspeccion: string) => {
  if (!proximaInspeccion) return "Sin fecha";
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(`${proximaInspeccion}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";
  const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / 86400000);
  if (dias < 0) return "Vencida";
  if (dias <= 30) return "Próxima a vencer";
  return "Vigente";
};
const mostrarFecha = (fecha: string) => fecha || "-";
export default function InspeccionEquiposProteccionContraCaidasForm() {
  const router = useRouter();
  const [datosGenerales, setDatosGenerales] = useState(datosGeneralesIniciales);
  const [urlVistaPreviaImagen, setUrlVistaPreviaImagen] = useState("");
  const [imagenDataUrl, setImagenDataUrl] = useState("");
  const [nombreImagen, setNombreImagen] = useState("");
  const [imagenInputKey, setImagenInputKey] = useState(0);
  const [datosRegistrados, setDatosRegistrados] = useState(false);
  const [tipoInspeccionSeleccionado, setTipoInspeccionSeleccionado] = useState(clavesTiposInspeccion[0]);
  const [selectorInspeccionContraido, setSelectorInspeccionContraido] = useState(false);
  const [decisionFinal, setDecisionFinal] = useState("");
  const [comentariosFinales, setComentariosFinales] = useState("");
  const [respuestasListaChequeo, setRespuestasListaChequeo] = useState<Record<string, RespuestaListaChequeo>>({});
  const [mostrarDatosAdicionales, setMostrarDatosAdicionales] = useState(false);
  const [rolModalFirma, setRolModalFirma] = useState<"inspector" | "responsable" | null>(null);
  const [firmaTieneTrazo, setFirmaTieneTrazo] = useState(false);
  const referenciaFirma = useRef<SignatureRef>(null);
  const [firmas, setFirmas] = useState<DatosFirma>(firmasIniciales);

  const listaChequeoActual = useMemo(() => tiposInspeccion[tipoInspeccionSeleccionado].checklist || [], [tipoInspeccionSeleccionado]);
  const esInspeccionArnes = tipoInspeccionSeleccionado === "arnes";
  const esInspeccionEslingas = tipoInspeccionSeleccionado === "eslingas";
  const esInspeccionDescendedor = tipoInspeccionSeleccionado === "descendedor";
  const esInspeccionMosqueton = tipoInspeccionSeleccionado === "mosqueton";
  const esInspeccionAutoretracto = tipoInspeccionSeleccionado === "autoretracto";
  const esInspeccionFreno = tipoInspeccionSeleccionado === "freno";
  const esInspeccionTieOff = tipoInspeccionSeleccionado === "tieoff";
  const esInspeccionLineaVida = tipoInspeccionSeleccionado === "linea-vida";
  const usaMaterialEquipo =
    esInspeccionArnes ||
    esInspeccionEslingas ||
    esInspeccionDescendedor ||
    esInspeccionMosqueton ||
    esInspeccionAutoretracto ||
    esInspeccionFreno ||
    esInspeccionTieOff ||
    esInspeccionLineaVida;
  const etiquetaCaracteristicaTecnica = esInspeccionArnes
    ? "Tipo de material del arnés"
    : esInspeccionEslingas
      ? "Tipo de material de la eslinga"
      : esInspeccionDescendedor
        ? "Material del equipo"
        : esInspeccionMosqueton
          ? "Tipo de material del equipo"
          : esInspeccionAutoretracto
            ? "Tipo de polea - autoretráctil"
            : esInspeccionTieOff
              ? "Tipo de Tie - Off"
              : esInspeccionLineaVida
                ? "Longitud de línea de vida"
                : "Tipo de freno";
  const primeraTablaCompleta = useMemo(
    () => listaChequeoActual.length > 0 && listaChequeoActual.every((item) => Boolean(respuestasListaChequeo[item.key]?.concepto)),
    [listaChequeoActual, respuestasListaChequeo]
  );
  const resumenRegistros = useMemo(() => {
    const total = listaChequeoActual.length;
    const aceptados = listaChequeoActual.filter((item) => respuestasListaChequeo[item.key]?.concepto === "ACEPTADO").length;
    const rechazados = listaChequeoActual.filter((item) => respuestasListaChequeo[item.key]?.concepto === "RECHAZADO").length;
    return {
      total,
      aceptados,
      rechazados,
      pendientes: Math.max(total - aceptados - rechazados, 0),
      firmasCompletas: firmas.inspectorFirmado && firmas.responsableFirmado,
    };
  }, [firmas.inspectorFirmado, firmas.responsableFirmado, listaChequeoActual, respuestasListaChequeo]);
  const analiticaRegistros = useMemo(() => {
    const proximaInspeccion = calcularProximaInspeccion(datosGenerales.fechaInspeccion, datosGenerales.periodicidad);
    const estadoVigencia = obtenerEstadoVigencia(proximaInspeccion);
    const factoresRechazados = listaChequeoActual.filter((item) => respuestasListaChequeo[item.key]?.concepto === "RECHAZADO");
    const factoresAceptados = listaChequeoActual.filter((item) => respuestasListaChequeo[item.key]?.concepto === "ACEPTADO");
    const factoresPendientes = listaChequeoActual.filter((item) => !respuestasListaChequeo[item.key]?.concepto);
    const totalEvaluado = factoresAceptados.length + factoresRechazados.length;
    const porcentajeRechazo = totalEvaluado > 0 ? Math.round((factoresRechazados.length / totalEvaluado) * 100) : 0;
    const decisionAprobada = decisionFinal === "apto";
    const decisionRechazada = decisionFinal === "no-apto";
    const tieneAntecedentes = Boolean(datosGenerales.antecedentesEquipo.trim());
    const tieneEvidencia = Boolean(nombreImagen);
    const camposDocumentales = [
      { key: "datosEquipo", label: "Datos del equipo", completo: datosRegistrados },
      { key: "fechaInspeccion", label: "Fecha de inspección", completo: Boolean(datosGenerales.fechaInspeccion) },
      { key: "numeroInterno", label: "Número interno", completo: Boolean(datosGenerales.numeroInterno) },
      { key: "numeroSerie", label: "Número de serie", completo: Boolean(datosGenerales.numeroSerie) },
      { key: "certificado", label: "Certificado", completo: Boolean(datosGenerales.certificado) },
      { key: "evidencia", label: "Evidencia fotográfica", completo: tieneEvidencia },
      { key: "decisionFinal", label: "Decisión final", completo: Boolean(decisionFinal) },
      { key: "firmaInspector", label: "Firma inspector", completo: firmas.inspectorFirmado },
      { key: "firmaResponsable", label: "Firma responsable", completo: firmas.responsableFirmado },
    ];
    const pendientesDocumentales = camposDocumentales.filter((campo) => !campo.completo);
    const avanceDocumental = Math.round(((camposDocumentales.length - pendientesDocumentales.length) / camposDocumentales.length) * 100);
    const avanceTecnico = resumenRegistros.total > 0 ? Math.round(((resumenRegistros.aceptados + resumenRegistros.rechazados) / resumenRegistros.total) * 100) : 0;
    const estadoDecision =
      decisionFinal === "apto" ? "Apto" : decisionFinal === "no-apto" ? "No apto" : "Pendiente";

    return {
      proximaInspeccion,
      estadoVigencia,
      factoresRechazados,
      factoresAceptados,
      factoresPendientes,
      porcentajeRechazo,
      decisionAprobada,
      decisionRechazada,
      tieneAntecedentes,
      tieneEvidencia,
      camposDocumentales,
      pendientesDocumentales,
      avanceDocumental,
      avanceTecnico,
      estadoDecision,
      registroCompleto: pendientesDocumentales.length === 0 && resumenRegistros.pendientes === 0,
    };
  }, [
    datosGenerales.antecedentesEquipo,
    datosGenerales.certificado,
    datosGenerales.fechaInspeccion,
    datosGenerales.numeroInterno,
    datosGenerales.numeroSerie,
    datosGenerales.periodicidad,
    datosRegistrados,
    decisionFinal,
    firmas.inspectorFirmado,
    firmas.responsableFirmado,
    listaChequeoActual,
    nombreImagen,
    respuestasListaChequeo,
    resumenRegistros.pendientes,
  ]);

  const manejarCambioCampo = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    const siguienteValor = camposDatosEquipoNumericos.has(name) ? soloNumeros(value) : value;
    setDatosGenerales((prev) => ({ ...prev, [name]: siguienteValor }));
    if (name === "decisionFinal") setDecisionFinal(value);
  };

  const manejarCargaImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      const dataUrl = String(lector.result || "");
      setNombreImagen(archivo.name);
      setImagenDataUrl(dataUrl);
      setUrlVistaPreviaImagen(dataUrl);
    };
    lector.readAsDataURL(archivo);
  };

  const obtenerCamposFaltantesDatosEquipo = () => {
    const camposFaltantes: string[] = [];

    if (!datosGenerales.email) camposFaltantes.push("Correo electrónico");
    if (!datosGenerales.fechaInspeccion) camposFaltantes.push("Fecha de inspección");
    if (!datosGenerales.fabricante) camposFaltantes.push("Fabricante");
    if (!datosGenerales.modelo) camposFaltantes.push("Modelo");
    if (!datosGenerales.numeroSerie) camposFaltantes.push("Número de serie");
    if (!datosGenerales.numeroInterno) camposFaltantes.push("Número interno");
    if (!datosGenerales.periodicidad) camposFaltantes.push("Periodicidad de la inspección");
    if (!datosGenerales.fechaFabricacion) camposFaltantes.push("Fecha de fabricación");
    if (!datosGenerales.certificado) camposFaltantes.push("Certificado");
    if (!datosGenerales.fechaCompra) camposFaltantes.push("Fecha de compra");
    if (!datosGenerales.numeroLote) camposFaltantes.push("Número de lote");
    if (!datosGenerales.tipoFreno) camposFaltantes.push(etiquetaCaracteristicaTecnica);
    if (!datosGenerales.fechaPrimeraUtilizacion) camposFaltantes.push("Fecha primera utilización");

    return camposFaltantes;
  };

  const registrarDatosEquipo = () => {
    const camposFaltantes = obtenerCamposFaltantesDatosEquipo();

    if (camposFaltantes.length > 0) {
      enfocarCampoFaltante(camposFaltantes[0]);
      return;
    }

    setDatosRegistrados(true);
  };

  const limpiarFirma = () => {
    referenciaFirma.current?.clear();
    setFirmaTieneTrazo(false);
  };

  const guardarFirma = () => {
    const svg = referenciaFirma.current?.svg;
    if (!svg || !rolModalFirma) return;
    if (!firmaTieneTrazo) {
      const campoFirma = svg as unknown as HTMLElement;
      campoFirma.scrollIntoView({ behavior: "smooth", block: "center" });
      campoFirma.focus?.({ preventScroll: true });
      return;
    }
    const firmaSerializada = new XMLSerializer().serializeToString(svg);
    const firmaComoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(firmaSerializada)}`;
    if (rolModalFirma === "inspector") {
      setFirmas((s) => ({ ...s, inspectorFirma: firmaComoUrl, inspectorFirmado: true }));
    } else {
      setFirmas((s) => ({ ...s, responsableFirma: firmaComoUrl, responsableFirmado: true }));
    }
    setRolModalFirma(null);
    setFirmaTieneTrazo(false);
  };

  const manejarCambioConcepto = (key: string, concepto: ConceptoRevision) => {
    setRespuestasListaChequeo((prev) => ({
      ...prev,
      [key]: { concepto, comentario: concepto === "RECHAZADO" ? prev[key]?.comentario || "" : "" },
    }));
  };

  const manejarCambioComentario = (key: string, comentario: string) => {
    setRespuestasListaChequeo((prev) => ({
      ...prev,
      [key]: { concepto: prev[key]?.concepto || "", comentario },
    }));
  };

  const seleccionarTipoInspeccion = (tipo: ClaveTipoInspeccion) => {
    setTipoInspeccionSeleccionado(tipo);
    setRespuestasListaChequeo({});
    setMostrarDatosAdicionales(false);
    setComentariosFinales("");
    setDecisionFinal("");
  };

  const manejarSeleccionTipoInspeccion = (tipo: ClaveTipoInspeccion) => {
    if (selectorInspeccionContraido && tipo === tipoInspeccionSeleccionado) {
      setSelectorInspeccionContraido(false);
      return;
    }

    seleccionarTipoInspeccion(tipo);
    setSelectorInspeccionContraido(true);
  };

  const agregarDatosAdicionales = () => {
    if (!primeraTablaCompleta) {
      const conceptosFaltantes = listaChequeoActual
        .filter((item) => !respuestasListaChequeo[item.key]?.concepto)
        .map((item) => `concepto-${item.key}`);
      enfocarCampoFaltante(conceptosFaltantes[0]);
      return;
    }

    setMostrarDatosAdicionales(true);
  };

  const abrirModalFirma = (role: "inspector" | "responsable") => {
    setFirmaTieneTrazo(false);
    setRolModalFirma(role);
  };

  const cerrarModalFirma = () => {
    setFirmaTieneTrazo(false);
    setRolModalFirma(null);
  };

  const manejarCambioCampoFirma = (campo: keyof DatosFirma, value: string) => {
    let siguienteValor = value;
    if (camposFirmaNumericos.has(campo)) siguienteValor = soloNumeros(value);
    if (camposFirmaSinNumeros.has(campo)) siguienteValor = quitarNumeros(value);
    setFirmas((prev) => ({ ...prev, [campo]: siguienteValor }));
  };

  const limpiarFormularioParaNuevoRegistro = () => {
    setDatosGenerales(datosGeneralesIniciales);
    setUrlVistaPreviaImagen("");
    setImagenDataUrl("");
    setNombreImagen("");
    setImagenInputKey((prev) => prev + 1);
    setDatosRegistrados(false);
    setTipoInspeccionSeleccionado(clavesTiposInspeccion[0]);
    setSelectorInspeccionContraido(false);
    setDecisionFinal("");
    setComentariosFinales("");
    setRespuestasListaChequeo({});
    setMostrarDatosAdicionales(false);
    setFirmas(firmasIniciales);
    setFirmaTieneTrazo(false);
    setRolModalFirma(null);
    referenciaFirma.current?.clear();
  };

  const construirRespuestaJson = () => {
    const { email, ...datosEquipo } = datosGenerales;

    return {
      formato: {
        nombre: "Inspección de equipos de protección contra caídas",
        codigo: METADATOS_FORMATO.codigo,
        fecha: METADATOS_FORMATO.fecha,
        version: METADATOS_FORMATO.version,
        area: "Gestión HSE",
      },
      registro: {
        fechaRegistro: new Date().toISOString(),
        usuarioEmail: email,
      },
      inspeccion: {
        tipo: tipoInspeccionSeleccionado,
        nombre: tiposInspeccion[tipoInspeccionSeleccionado].label,
      },
      datosEquipo: {
        ...datosEquipo,
        imagenEquipo: limpiarImagenParaJson({
          nombreArchivo: nombreImagen,
          dataUrl: imagenDataUrl,
          carpeta: "evidencias",
          prefijo: `equipo-${tipoInspeccionSeleccionado}`,
        }),
      },
      respuestasChecklist: listaChequeoActual.map((item) => {
        const respuesta = respuestasListaChequeo[item.key];
        const concepto = respuesta?.concepto || "";

        return {
          key: item.key,
          factor: item.factor,
          instrucciones: item.instrucciones,
          concepto,
          conceptoId: mapConceptoToId(concepto),
          comentario: respuesta?.comentario || "",
        };
      }),
      datosAdicionalesChecklist: mostrarDatosAdicionales
        ? listaChequeoActual.map((item) => {
            const respuesta = respuestasListaChequeo[item.key];
            const concepto = respuesta?.concepto || "";

            return {
              key: item.key,
              factor: item.factor,
              instrucciones: item.instrucciones,
              concepto,
              conceptoId: mapConceptoToId(concepto),
              detalleApoyo: respuesta?.comentario || "",
            };
          })
        : [],
      cierreInspeccion: {
        comentariosFinales,
        decisionFinalId: decisionFinal === "apto" ? 1 : decisionFinal === "no-apto" ? 2 : null,
      },
      firmas: {
        firmaInspector: limpiarFirmaParaJson(firmas.inspectorFirma, "firma-inspector"),
        firmaResponsable: limpiarFirmaParaJson(firmas.responsableFirma, "firma-responsable"),
      },
    };
  };

  const obtenerCamposFaltantesEnvio = () => {
    const camposFaltantes = obtenerCamposFaltantesDatosEquipo();

    if (!datosRegistrados) camposFaltantes.push("agregarDatosEquipo");
    listaChequeoActual.forEach((item) => {
      if (!respuestasListaChequeo[item.key]?.concepto) camposFaltantes.push(`concepto-${item.key}`);
    });
    if (!decisionFinal) camposFaltantes.push("decisionFinal");
    if (!firmas.inspectorIdentificacion) camposFaltantes.push("inspectorIdentificacion");
    if (!firmas.inspectorNombre) camposFaltantes.push("inspectorNombre");
    if (!firmas.inspectorCargo) camposFaltantes.push("inspectorCargo");
    if (!firmas.inspectorFirmado) camposFaltantes.push("inspectorFirma");
    if (!firmas.responsableIdentificacion) camposFaltantes.push("responsableIdentificacion");
    if (!firmas.responsableNombre) camposFaltantes.push("responsableNombre");
    if (!firmas.responsableCargo) camposFaltantes.push("responsableCargo");
    if (!firmas.responsableFirmado) camposFaltantes.push("responsableFirma");

    return camposFaltantes;
  };

  const enviarFormulario = async () => {
    const camposFaltantes = obtenerCamposFaltantesEnvio();

    if (camposFaltantes.length > 0) {
      enfocarCampoFaltante(camposFaltantes[0]);
      return;
    }

    if (!confirm("¿Confirmas el envío del formulario HSE-F006?")) return;
    const respuestaJson = construirRespuestaJson();
    registrarJsonFinalFormulario(respuestaJson);

    try {
      const respuestaHttp = await fetch("/api/formatos/inspeccion-contra-caidas/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestaJson),
      });

      if (!respuestaHttp.ok) {
        throw new Error("No se pudo guardar la respuesta en JSON.");
      }

      await respuestaHttp.json();
      limpiarFormularioParaNuevoRegistro();
      router.refresh();
      router.push("/formatos");
    } catch (error) {
      console.error("Error guardando la respuesta en JSON:", error);
      alert("No se pudo guardar el archivo JSON. Revise la consola para más detalles.");
    }
  };

  const renderSelectorConcepto = (key: string, concepto: ConceptoRevision) => {
    const opciones: Array<{ value: ConceptoRevision; label: string; icon: typeof Check }> = [
      { value: "ACEPTADO", label: "Aceptado", icon: Check },
      { value: "RECHAZADO", label: "Rechazado", icon: XCircle },
    ];

    const opcionesVisibles = concepto ? opciones.filter((opcion) => opcion.value === concepto) : opciones;

    return (
      <div data-required-id={`concepto-${key}`} className="grid gap-2 rounded-2xl bg-slate-100 p-1.5 sm:grid-cols-2 md:grid-cols-1" tabIndex={-1}>
        {opcionesVisibles.map((opcion) => {
          const seleccionado = concepto === opcion.value;
          const Icono = opcion.icon;
          const claseSeleccionada =
            opcion.value === "ACEPTADO"
              ? "border-emerald-300 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200"
              : "border-red-300 bg-red-100 text-red-800 ring-2 ring-red-200";

          return (
            <button
              key={`${key}-${opcion.value}`}
              type="button"
              aria-pressed={seleccionado}
              onClick={() => manejarCambioConcepto(key, seleccionado ? "" : opcion.value)}
              className={`inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-[11px] font-bold uppercase leading-tight tracking-normal shadow-sm transition ${
                seleccionado ? claseSeleccionada : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-white"
              }`}
            >
              <Icono className="size-4" aria-hidden="true" />
              {opcion.label}
            </button>
          );
        })}
      </div>
    );
  };

  const renderSelectorDecisionFinal = () => {
    const opciones: Array<{ value: string; label: string; icon: typeof Check }> = [
      { value: "apto", label: "Apto para ser utilizado", icon: ShieldCheck },
      { value: "no-apto", label: "No apto para ser utilizado", icon: XCircle },
    ];
    const opcionesVisibles = decisionFinal ? opciones.filter((opcion) => opcion.value === decisionFinal) : opciones;

    return (
      <div data-required-id="decisionFinal" className="mt-2 grid gap-2 rounded-2xl bg-slate-100 p-1.5" tabIndex={-1}>
        {opcionesVisibles.map((opcion) => {
          const seleccionado = decisionFinal === opcion.value;
          const Icono = opcion.icon;
          const claseSeleccionada =
            opcion.value === "apto"
              ? "border-emerald-300 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200"
              : "border-red-300 bg-red-100 text-red-800 ring-2 ring-red-200";

          return (
            <button
              key={opcion.value}
              type="button"
              aria-pressed={seleccionado}
              onClick={() => setDecisionFinal(seleccionado ? "" : opcion.value)}
              className={`inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-center text-xs font-bold uppercase leading-tight shadow-sm transition ${
                seleccionado ? claseSeleccionada : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-white"
              }`}
            >
              <Icono className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{opcion.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderizarTablaListaChequeo = (opciones: {
    items: ItemListaChequeo[];
    mode: "principal" | "adicional";
    detailTitle: string;
  }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-4 p-4 md:hidden">
        {opciones.items.map((item) => {
          const concepto = respuestasListaChequeo[item.key]?.concepto || "";

          return (
            <article key={`mobile-${opciones.mode}-${item.key}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-bold leading-5 text-slate-950">{item.factor}</div>
              {Array.isArray(item.instrucciones) ? (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-5 text-slate-700">
                  {item.instrucciones.map((instruccion) => (
                    <li key={instruccion}>{instruccion}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-700">{item.instrucciones}</p>
              )}

              <div className="mt-4">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-950">CONCEPTO</label>
                {opciones.mode === "principal" ? (
                  <div className="mt-2">{renderSelectorConcepto(item.key, concepto)}</div>
                ) : (
                  <div className="mt-2 flex h-11 w-full items-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-950 shadow-sm">
                    {concepto || "-"}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-950">{opciones.detailTitle}</label>
                {opciones.mode === "principal" ? (
                  <input
                    value={respuestasListaChequeo[item.key]?.comentario || ""}
                    onChange={(e) => manejarCambioComentario(item.key, e.target.value)}
                    disabled={concepto !== "RECHAZADO"}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="Solo si aplica"
                  />
                ) : (
                  <div className="mt-2 flex min-h-11 w-full items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm">
                    {respuestasListaChequeo[item.key]?.comentario || ""}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] table-fixed border-separate border-spacing-0 text-sm">
          <colgroup>
            <col className="w-[54%]" />
            <col className="w-[17%]" />
            <col className="w-[29%]" />
          </colgroup>
          <thead className="bg-emerald-900 text-left text-white">
            <tr>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">FACTORES GENERALES</th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">CONCEPTO</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide">{opciones.detailTitle}</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {opciones.items.map((item) => {
              const concepto = respuestasListaChequeo[item.key]?.concepto || "";

              return (
                <tr key={`${opciones.mode}-${item.key}`} className="border-b border-slate-200 transition hover:bg-emerald-50/40">
                  <td className="border-b border-slate-200 px-5 py-4 align-top">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-sm font-bold leading-5 text-slate-950">{item.factor}</div>
                      {Array.isArray(item.instrucciones) ? (
                        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-5 text-slate-700">
                          {item.instrucciones.map((instruccion) => (
                            <li key={instruccion}>{instruccion}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-slate-700">{item.instrucciones}</p>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-slate-200 px-4 py-4 align-top">
                    {opciones.mode === "principal" ? (
                      renderSelectorConcepto(item.key, concepto)
                    ) : (
                      <div className="mx-auto flex h-11 w-full items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-950 shadow-sm">
                        {concepto || "-"}
                      </div>
                    )}
                  </td>
                  <td className="border-b border-slate-200 px-5 py-4 align-top">
                    {opciones.mode === "principal" ? (
                      <input
                        value={respuestasListaChequeo[item.key]?.comentario || ""}
                        onChange={(e) => manejarCambioComentario(item.key, e.target.value)}
                        disabled={concepto !== "RECHAZADO"}
                        className="block h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="Solo si aplica"
                      />
                    ) : (
                      <div className="flex min-h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm">
                        {respuestasListaChequeo[item.key]?.comentario || ""}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 lg:px-10">
      <div className="w-full max-w-full">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
            <div>
              <div className="flex gap-3 sm:items-start">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm sm:size-14">
                  <HardHat className="size-7 sm:size-8" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start gap-2">
                    <h1 className="text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
                      Inspección de equipos de protección contra caídas
                    </h1>
                    <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-white">{METADATOS_FORMATO.codigo}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    Integrado en ROCA con ejecutantes firmantes y responsables de aprobación.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Compañía</p>
                  <p className="mt-2 text-sm font-bold uppercase text-slate-950">{perfilRocaActual.compania}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Versión</p>
                  <p className="mt-2 text-sm font-bold uppercase text-slate-950">{METADATOS_FORMATO.version}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Estado</p>
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {datosRegistrados && primeraTablaCompleta && decisionFinal && resumenRegistros.firmasCompletas ? "Listo para radicar" : "En diligenciamiento"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/75 p-3 shadow-sm sm:p-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Solicitante</p>
                  <p className="mt-2 text-sm font-bold uppercase text-slate-950">{perfilRocaActual.nombre}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Cargo</p>
                  <p className="mt-2 text-sm font-bold uppercase text-slate-950">{perfilRocaActual.cargo}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Proceso</p>
                  <p className="mt-2 text-sm font-bold uppercase text-slate-950">{perfilRocaActual.proceso}</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <div
          className={`mb-6 ${
            selectorInspeccionContraido ? "flex justify-center" : "grid grid-cols-2 gap-3 md:grid-cols-4"
          }`}
        >
          {(selectorInspeccionContraido ? [tipoInspeccionSeleccionado] : clavesTiposInspeccion).map((tipo) => {
            const estaSeleccionado = tipoInspeccionSeleccionado === tipo;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => manejarSeleccionTipoInspeccion(tipo)}
                aria-pressed={estaSeleccionado}
                className={`relative flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border px-2.3 py-3 text-center text-[14px] font-bold uppercase text-white shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 md:min-h-[80px] md:px-3 ${
                  selectorInspeccionContraido ? "w-full max-w-xs" : ""
                } ${
                  estaSeleccionado
                    ? "border-emerald-500 bg-emerald-800 text-white ring-2 ring-emerald-300"
                    : "border-slate-800 bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {estaSeleccionado ? (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-white text-emerald-800 shadow-sm" aria-hidden="true">
                    <Check className="size-3.5" />
                  </span>
                ) : null}
                <span
                  aria-hidden="true"
                  className={`grid size-11 shrink-0 place-items-center rounded-full text-2xl leading-none ${
                    estaSeleccionado ? "bg-white/15" : "bg-slate-950/25"
                  }`}
                >
                  <Image src={imagenesBotonesInspeccion[tipo]} alt="" width={28} height={28} className="size-7 object-contain" />
                </span>
                <span className="line-clamp-2 max-w-full leading-4 [text-wrap:balance]">{etiquetasBotonesInspeccion[tipo]}</span>
              </button>
            );
          })}
        </div>

        {!datosRegistrados ? (
          <>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Registro del equipo</h2>
                <p className="mt-1 text-sm text-slate-600">Complete la información básica antes de iniciar la inspección técnica.</p>
              </div>

              <section className={tarjetaSeccion}>
                <div className={encabezadoSeccion}>
                  <div className={iconoSeccion}>
                    <ShieldCheck className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Datos generales</h3>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Correo electrónico {marcaObligatorio}</label>
                    <input name="email" type="email" value={datosGenerales.email} onChange={manejarCambioCampo} placeholder="usuario@empresa.com" className={claseCampoTexto} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha de inspección {marcaObligatorio}</label>
                    <input name="fechaInspeccion" type="date" value={datosGenerales.fechaInspeccion} onChange={manejarCambioCampo} aria-label="Seleccione una fecha de inspección" className={claseCampoFecha} />
                  </div>
                </div>
              </section>

              <section className={`${tarjetaSeccion} mt-5`}>
                <div className={encabezadoSeccion}>
                  <div className={iconoSeccion}>
                    <ClipboardList className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Identificación del equipo</h3>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fabricante {marcaObligatorio}</label>
                    <input name="fabricante" value={datosGenerales.fabricante} onChange={manejarCambioCampo} placeholder="Ej: 3M SERIE ARSEG" className={claseCampoTexto} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Modelo {marcaObligatorio}</label>
                    <input name="modelo" value={datosGenerales.modelo} onChange={manejarCambioCampo} placeholder="Ej: 1170121" className={claseCampoTexto} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Número de serie {marcaObligatorio}</label>
                    <input name="numeroSerie" value={datosGenerales.numeroSerie} onChange={manejarCambioCampo} placeholder="Ej: 454580104" inputMode="numeric" pattern="[0-9]*" className={claseCampoTexto} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Número interno {marcaObligatorio}</label>
                    <input name="numeroInterno" value={datosGenerales.numeroInterno} onChange={manejarCambioCampo} placeholder="Ej: 100245" inputMode="numeric" pattern="[0-9]*" className={claseCampoTexto} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Certificado</label>
                    <input name="certificado" value={datosGenerales.certificado} onChange={manejarCambioCampo} placeholder="Ej: CERT-2026-001" className={claseCampoTexto} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Número de lote</label>
                    <input name="numeroLote" value={datosGenerales.numeroLote} onChange={manejarCambioCampo} placeholder="Ej: 454580104" className={claseCampoTexto} />
                  </div>
                </div>
              </section>

              <section className={`${tarjetaSeccion} mt-5`}>
                <div className={encabezadoSeccion}>
                  <div className={iconoSeccion}>
                    <CalendarDays className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Fechas del equipo</h3>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha de fabricación</label>
                    <input name="fechaFabricacion" type="date" value={datosGenerales.fechaFabricacion} onChange={manejarCambioCampo} aria-label="Seleccione una fecha de fabricación" className={claseCampoFecha} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha de compra</label>
                    <input name="fechaCompra" type="date" value={datosGenerales.fechaCompra} onChange={manejarCambioCampo} aria-label="Seleccione una fecha de compra" className={claseCampoFecha} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha primera utilización</label>
                    <input name="fechaPrimeraUtilizacion" type="date" value={datosGenerales.fechaPrimeraUtilizacion} onChange={manejarCambioCampo} aria-label="Seleccione una fecha de primera utilización" className={claseCampoFecha} />
                  </div>
                </div>
              </section>

              <section className={`${tarjetaSeccion} mt-5`}>
                <div className={encabezadoSeccion}>
                  <div className={iconoSeccion}>
                    <Settings className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Características técnicas</h3>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Periodicidad de la inspección {marcaObligatorio}</label>
                    {usaMaterialEquipo ? (
                      <input name="periodicidad" value={datosGenerales.periodicidad} onChange={manejarCambioCampo} className={claseCampoTexto} />
                    ) : (
                      <select name="periodicidad" value={datosGenerales.periodicidad} onChange={manejarCambioCampo} className={claseCampoSeleccion}>
                        <option value="">Seleccione una periodicidad</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">{etiquetaCaracteristicaTecnica}</label>
                    {usaMaterialEquipo ? (
                      <input name="tipoFreno" value={datosGenerales.tipoFreno} onChange={manejarCambioCampo} className={claseCampoTexto} />
                    ) : (
                      <select name="tipoFreno" value={datosGenerales.tipoFreno} onChange={manejarCambioCampo} className={claseCampoSeleccion}>
                        <option value="">Seleccione el tipo de freno</option>
                        <option value="Manual">Manual</option>
                        <option value="Automático">Automático</option>
                        <option value="Autoretráctil">Autoretráctil</option>
                        <option value="No aplica">No aplica</option>
                      </select>
                    )}
                  </div>
                </div>
              </section>

              <section className={`${tarjetaSeccion} mt-5`}>
                <div className={encabezadoSeccion}>
                  <div className={iconoSeccion}>
                    <ImageUp className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Evidencia fotográfica</h3>
                </div>
                <div className="p-5">
                  <label className="text-sm font-semibold text-slate-700">Adjuntar imagen del equipo</label>
                  <label className="mt-2 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-600 bg-white px-4 py-6 text-center transition hover:bg-emerald-50">
                    <input key={imagenInputKey} type="file" accept="image/*" onChange={manejarCargaImagen} className="sr-only" />
                    <span className="text-sm font-bold text-emerald-900">Arrastra una imagen aquí o haz clic para seleccionar</span>
                    <span className="mt-1 text-xs text-slate-600">Formatos permitidos: JPG, PNG o WEBP</span>
                    <span className="mt-3 max-w-full truncate rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                      {nombreImagen || "Ningún archivo seleccionado"}
                    </span>
                  </label>
                  {urlVistaPreviaImagen ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <img src={urlVistaPreviaImagen} alt="Imagen del equipo seleccionada" className="mx-auto max-h-40 object-contain" />
                    </div>
                  ) : null}
                </div>
              </section>

              <div className="mt-6 flex justify-start">
                <button type="button" onClick={registrarDatosEquipo} data-required-id="agregarDatosEquipo" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white">Agregar Datos</button>
              </div>
            </div>

            <div className="mt-12">
              <label className="text-xs font-semibold italic text-slate-950">
                ANTECEDENTES DEL EQUIPO Condiciones de uso o acontecimiento excepcional durante la utilización (ejemplos: caída o detención de una caída, utilización o almacenamiento a temperaturas extremas, modificación fuera de los talleres del fabricante)
              </label>
              <textarea name="antecedentesEquipo" value={datosGenerales.antecedentesEquipo} onChange={manejarCambioCampo} rows={2} className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-md outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" />
            </div>

            <div className="mt-5 space-y-6 text-center italic">
              <p className="text-sm font-bold text-slate-950">
                En las casilla de CONCEPTO, escriba "ACEPTADO" o "RECHAZADO" y en la casilla COMENTARIOS haga las anotaciones específicas necesarias.
              </p>
              <p className="text-xs font-bold text-red-600">
                IMPORTANTE: Antes de agregar datos, verifique cuidadosamente la información, ya que una vez ingresada no podrá ser modificada.
              </p>
            </div>
          </>
        ) : (
          <div>
            <div className="mt-6 overflow-hidden rounded-lg border bg-slate-50 p-4">
              <div className="grid gap-4 bg-emerald-900 px-4 py-3 text-white sm:grid-cols-[2fr_1fr]">
                <div className="font-semibold uppercase">ELEMENTO O EQUIPO A INSPECCIONAR</div>
                <div className="font-semibold uppercase">FOTO</div>
              </div>
              <div className="grid gap-4 px-4 py-6 sm:grid-cols-[2fr_1fr]">
                <div className="space-y-3">
                  {[
                    ["Fecha inspección", datosGenerales.fechaInspeccion],
                    ["Fabricante", datosGenerales.fabricante],
                    ["Modelo", datosGenerales.modelo],
                    ["Número de serie", datosGenerales.numeroSerie],
                    ["Número interno", datosGenerales.numeroInterno],
                    ["Periodicidad", datosGenerales.periodicidad],
                    ["Fecha de fabricación", datosGenerales.fechaFabricacion],
                    ["Certificado", datosGenerales.certificado],
                    ["Fecha de compra", datosGenerales.fechaCompra],
                    ["Número de lote", datosGenerales.numeroLote],
                    [etiquetaCaracteristicaTecnica, datosGenerales.tipoFreno],
                    ["Fecha primera utilización", datosGenerales.fechaPrimeraUtilizacion],
                  ].map((item) => (
                    <div key={String(item[0])} className="grid grid-cols-[1fr_1fr] gap-3 rounded bg-white px-4 py-3">
                      <div className="text-xs font-semibold text-slate-500">{item[0]}</div>
                      <div className="text-sm text-slate-700">{item[1] || "-"}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded border bg-white p-4">
                  {urlVistaPreviaImagen ? <img src={urlVistaPreviaImagen} alt="Foto" className="w-full object-contain" /> : <div className="min-h-[180px] flex items-center justify-center text-sm text-slate-400">Foto del equipo</div>}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold italic text-slate-950">
                ANTECEDENTES DEL EQUIPO Condiciones de uso o acontecimiento excepcional durante la utilización (ejemplos: caída o detención de una caída, utilización o almacenamiento a temperaturas extremas, modificación fuera de los talleres del fabricante)
              </label>
              <textarea
                name="antecedentesEquipo"
                value={datosGenerales.antecedentesEquipo}
                onChange={manejarCambioCampo}
                rows={3}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                placeholder="Ingrese los antecedentes del equipo"
              />
            </div>

            <div className="mt-5 space-y-6 text-center italic">
              <p className="text-sm font-bold text-slate-950">
                En las casilla de CONCEPTO, escriba "ACEPTADO" o "RECHAZADO" y en la casilla COMENTARIOS haga las anotaciones específicas necesarias.
              </p>
              <p className="text-xs font-bold text-red-600">
                IMPORTANTE: Antes de agregar datos, verifique cuidadosamente la información, ya que una vez ingresada no podrá ser modificada.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 bg-slate-100 px-3 py-5 sm:px-6 sm:py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 border-l-4 border-emerald-700 pl-4">
              <h2 className="text-lg font-bold uppercase tracking-wide text-slate-950 sm:text-xl">{tiposInspeccion[tipoInspeccionSeleccionado].label}</h2>
            </div>

            {!mostrarDatosAdicionales ? (
              <>
                {renderizarTablaListaChequeo({
                  items: listaChequeoActual,
                  mode: "principal",
                  detailTitle: "DETALLES DE APOYO / COMENTARIOS",
                })}

                <div className="mt-6 rounded-2xl border border-emerald-100 bg-slate-50 p-4 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-950">COMENTARIOS</label>
                      <input
                        value={comentariosFinales}
                        onChange={(e) => setComentariosFinales(e.target.value)}
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-950">DECISIÓN FINAL</label>
                      {renderSelectorDecisionFinal()}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={agregarDatosAdicionales}
                    disabled={!primeraTablaCompleta}
                    className={`rounded-full px-8 py-3 text-xs font-bold uppercase tracking-wide shadow-sm transition ${
                      primeraTablaCompleta
                        ? "bg-emerald-700 text-white shadow-emerald-900/10 hover:bg-emerald-800"
                        : "cursor-not-allowed border border-slate-300 bg-slate-200 text-slate-500"
                    }`}
                  >
                    Agregar datos
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-2">
                {renderizarTablaListaChequeo({
                  items: listaChequeoActual,
                  mode: "adicional",
                  detailTitle: "DETALLES DE APOYO",
                })}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex justify-center">
                <p className="rounded-md border border-emerald-700 bg-emerald-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-emerald-900 shadow-sm">
                  INSPECCIÓN REALIZADA POR
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold italic uppercase text-slate-900">Número de identificación {marcaObligatorio}</label>
                  <input
                    data-required-id="inspectorIdentificacion"
                    value={firmas.inspectorIdentificacion}
                    onChange={(e) => manejarCambioCampoFirma("inspectorIdentificacion", e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold italic uppercase text-slate-900">Nombre {marcaObligatorio}</label>
                  <input
                    data-required-id="inspectorNombre"
                    value={firmas.inspectorNombre}
                    onChange={(e) => manejarCambioCampoFirma("inspectorNombre", e.target.value)}
                    required
                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold italic uppercase text-slate-900">Cargo {marcaObligatorio}</label>
                  <input
                    data-required-id="inspectorCargo"
                    value={firmas.inspectorCargo}
                    onChange={(e) => manejarCambioCampoFirma("inspectorCargo", e.target.value)}
                    required
                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold italic uppercase text-slate-900">Firma {marcaObligatorio}</p>
                    <p className="mt-1 text-sm text-slate-600">{firmas.inspectorFirmado ? "Firma registrada" : "Pendiente de firma"}</p>
                  </div>
                  <button type="button" onClick={() => abrirModalFirma("inspector")} data-required-id="inspectorFirma" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                    Clic para firmar
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex justify-center">
                <p className="rounded-md border border-emerald-700 bg-emerald-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-emerald-900 shadow-sm">
                  COLABORADOR RESPONSABLE DEL ELEMENTO O EQUIPO
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold italic uppercase text-slate-900">Número de identificación {marcaObligatorio}</label>
                  <input
                    data-required-id="responsableIdentificacion"
                    value={firmas.responsableIdentificacion}
                    onChange={(e) => manejarCambioCampoFirma("responsableIdentificacion", e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold italic uppercase text-slate-900">Nombre {marcaObligatorio}</label>
                  <input
                    data-required-id="responsableNombre"
                    value={firmas.responsableNombre}
                    onChange={(e) => manejarCambioCampoFirma("responsableNombre", e.target.value)}
                    required
                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold italic uppercase text-slate-900">Cargo {marcaObligatorio}</label>
                  <input
                    data-required-id="responsableCargo"
                    value={firmas.responsableCargo}
                    onChange={(e) => manejarCambioCampoFirma("responsableCargo", e.target.value)}
                    required
                    className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold italic uppercase text-slate-900">Firma {marcaObligatorio}</p>
                    <p className="mt-1 text-sm text-slate-600">{firmas.responsableFirmado ? "Firma registrada" : "Pendiente de firma"}</p>
                  </div>
                  <button type="button" onClick={() => abrirModalFirma("responsable")} data-required-id="responsableFirma" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                    Clic para firmar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-start">
            <button onClick={enviarFormulario} className="rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
              Enviar formulario
            </button>
          </div>
        </div>
      </div>

      {rolModalFirma ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Firma digital</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  {rolModalFirma === "inspector" ? "Inspección realizada por" : "Colaborador responsable"}
                </h3>
              </div>
              <button type="button" onClick={cerrarModalFirma} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Cerrar
              </button>
            </div>

            <div className="mt-5">
              <label className="text-xs font-bold italic uppercase text-slate-900">Firma</label>
              <Signature
                ref={referenciaFirma}
                fill="#0f172a"
                onPointer={(points) => {
                  if (points.length > 0) setFirmaTieneTrazo(true);
                }}
                options={{
                  size: 5,
                  thinning: 0.45,
                  smoothing: 0.5,
                  streamline: 0.5,
                }}
                className="mt-2 h-[220px] w-full rounded-lg border border-dashed border-slate-400 bg-white"
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={limpiarFirma} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
                Limpiar
              </button>
              <button type="button" onClick={cerrarModalFirma} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
                Cancelar
              </button>
              <button type="button" onClick={guardarFirma} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">
                Guardar firma
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}



