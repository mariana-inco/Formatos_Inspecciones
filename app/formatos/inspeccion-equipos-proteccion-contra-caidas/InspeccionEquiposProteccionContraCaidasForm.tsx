"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Signature from "@uiw/react-signature";
import type { SignatureRef } from "@uiw/react-signature";
import {
  decisionOptions as opcionesDecision,
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

const claseCampoFecha =
  "date-input mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none [color-scheme:light] focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const claseCampoTexto =
  "mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const claseCampoSeleccion =
  "mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
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

const soloNumeros = (value: string) => value.replace(/\D/g, "");
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const enfocarCampoFaltante = (id: string) => {
  const campo = document.querySelector<HTMLElement>(`[name="${id}"], [data-required-id="${id}"]`);
  campo?.scrollIntoView({ behavior: "smooth", block: "center" });
  campo?.focus({ preventScroll: true });
};
const camposFirmaNumericos = new Set<keyof DatosFirma>(["inspectorIdentificacion", "responsableIdentificacion"]);
const camposFirmaSinNumeros = new Set<keyof DatosFirma>([
  "inspectorNombre",
  "inspectorCargo",
  "responsableNombre",
  "responsableCargo",
]);

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

export default function InspeccionEquiposProteccionContraCaidasForm() {
  const [datosGenerales, setDatosGenerales] = useState(datosGeneralesIniciales);
  const [urlVistaPreviaImagen, setUrlVistaPreviaImagen] = useState("");
  const [nombreImagen, setNombreImagen] = useState("");
  const [datosRegistrados, setDatosRegistrados] = useState(false);
  const [tipoInspeccionSeleccionado, setTipoInspeccionSeleccionado] = useState(clavesTiposInspeccion[0]);
  const [decisionFinal, setDecisionFinal] = useState("");
  const [comentariosFinales, setComentariosFinales] = useState("");
  const [respuestasListaChequeo, setRespuestasListaChequeo] = useState<Record<string, RespuestaListaChequeo>>({});
  const [mostrarDatosAdicionales, setMostrarDatosAdicionales] = useState(false);
  const [rolModalFirma, setRolModalFirma] = useState<"inspector" | "responsable" | null>(null);
  const [firmaTieneTrazo, setFirmaTieneTrazo] = useState(false);
  const referenciaFirma = useRef<SignatureRef>(null);
  const [firmas, setFirmas] = useState<DatosFirma>({
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
  });

  const listaChequeoActual = useMemo(() => tiposInspeccion[tipoInspeccionSeleccionado].checklist || [], [tipoInspeccionSeleccionado]);
  const primeraTablaCompleta = useMemo(
    () => listaChequeoActual.length > 0 && listaChequeoActual.every((item) => Boolean(respuestasListaChequeo[item.key]?.concepto)),
    [listaChequeoActual, respuestasListaChequeo]
  );

  const manejarCambioCampo = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setDatosGenerales((prev) => ({ ...prev, [name]: value }));
    if (name === "decisionFinal") setDecisionFinal(value);
  };

  const manejarCargaImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setNombreImagen(archivo.name);
    setUrlVistaPreviaImagen(URL.createObjectURL(archivo));
  };

  const obtenerCamposFaltantesDatosEquipo = () => {
    const camposFaltantes: string[] = [];

    if (!datosGenerales.email) camposFaltantes.push("Correo electrónico");
    if (!datosGenerales.fechaInspeccion) camposFaltantes.push("Fecha de inspección");
    if (!datosGenerales.fabricante) camposFaltantes.push("Fabricante");
    if (!datosGenerales.modelo) camposFaltantes.push("Modelo");
    if (!datosGenerales.numeroSerie) camposFaltantes.push("Número de serie");
    if (!datosGenerales.numeroInterno) camposFaltantes.push("Número interno");
    if (!datosGenerales.periodicidad) camposFaltantes.push("Periodicidad");
    if (!datosGenerales.fechaFabricacion) camposFaltantes.push("Fecha de fabricación");
    if (!datosGenerales.certificado) camposFaltantes.push("Certificado");
    if (!datosGenerales.fechaCompra) camposFaltantes.push("Fecha de compra");
    if (!datosGenerales.numeroLote) camposFaltantes.push("Número de lote");
    if (!datosGenerales.tipoFreno) camposFaltantes.push("Tipo de freno");
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
      [key]: { concepto, comentario: prev[key]?.comentario || "" },
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

  const construirRespuestaJson = () => {
    const decisionFinalTexto = opcionesDecision.find((option) => option.value === decisionFinal)?.label || "";

    return {
      formato: {
        nombre: "Inspección de equipos de protección contra caídas",
        codigo: METADATOS_FORMATO.codigo,
        fecha: METADATOS_FORMATO.fecha,
        version: METADATOS_FORMATO.version,
        area: "Gestión HSE",
      },
      fechaRegistro: new Date().toISOString(),
      inspeccion: {
        tipo: tipoInspeccionSeleccionado,
        nombre: tiposInspeccion[tipoInspeccionSeleccionado].label,
      },
      datosEquipo: {
        ...datosGenerales,
        imagenEquipo: {
          nombreArchivo: nombreImagen || "",
          imagenAdjunta: Boolean(nombreImagen),
        },
      },
      respuestasChecklist: listaChequeoActual.map((item) => ({
        key: item.key,
        factor: item.factor,
        instrucciones: item.instrucciones,
        concepto: respuestasListaChequeo[item.key]?.concepto || "",
        comentario: respuestasListaChequeo[item.key]?.comentario || "",
      })),
      datosAdicionalesChecklist: mostrarDatosAdicionales
        ? listaChequeoActual.map((item) => ({
            key: item.key,
            factor: item.factor,
            instrucciones: item.instrucciones,
            concepto: respuestasListaChequeo[item.key]?.concepto || "",
            detalleApoyo: respuestasListaChequeo[item.key]?.comentario || "",
          }))
        : [],
      cierreInspeccion: {
        comentariosFinales,
        decisionFinal,
        decisionFinalTexto,
      },
      firmas: firmas,
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
    const respuestaJsonFormateada = JSON.stringify(respuestaJson, null, 2);
    console.log("JSON del formulario HSE-F006:", respuestaJsonFormateada);

    try {
      const respuestaHttp = await fetch("/api/formatos/inspeccion-contra-caidas/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestaJson),
      });

      if (!respuestaHttp.ok) {
        throw new Error("No se pudo guardar la respuesta en JSON.");
      }

      const resultadoGuardado = (await respuestaHttp.json()) as { fileName: string; filePath: string };
      console.log("Respuesta guardada en JSON:", resultadoGuardado);
      console.log("Registro completo del formulario:", respuestaJson);
    } catch (error) {
      console.error("Error guardando la respuesta en JSON:", error);
      alert("No se pudo guardar el archivo JSON. Revise la consola para más detalles.");
    }
  };

  const renderizarTablaListaChequeo = (opciones: {
    items: ItemListaChequeo[];
    mode: "principal" | "adicional";
    detailTitle: string;
  }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
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
                    <select
                      data-required-id={`concepto-${item.key}`}
                      value={concepto}
                      onChange={(e) => manejarCambioConcepto(item.key, e.target.value as ConceptoRevision)}
                      className="mx-auto block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-center text-xs font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">--Seleccione--</option>
                      <option value="ACEPTADO">ACEPTADO</option>
                      <option value="RECHAZADO">RECHAZADO</option>
                    </select>
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
                      className="block h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
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
    <div className="min-h-screen bg-slate-50 px-6 py-8 sm:px-12">
      <div className="w-full max-w-full">
        <div className="mb-6 overflow-x-auto bg-white">
          <div className="grid min-w-[900px] grid-cols-[20%_1fr_20%] border border-slate-400 text-xs text-slate-950">
            <div className="min-h-[112px] border-r border-slate-400 bg-white" aria-label="Espacio reservado para el logo" />

            <div className="border-r border-slate-400">
              <div className="border-b border-slate-400 py-1 text-center font-bold uppercase">Gestión HSE</div>
              <div className="flex min-h-[88px] items-start justify-center px-4 pt-3 text-center font-bold uppercase">
                Inspección de equipos de protección contra caídas
              </div>
            </div>

            <div className="grid grid-rows-[24px_1fr_24px]">
              <div className="border-b border-slate-400 px-2 py-1">
                <span className="font-bold italic">Codigo:</span> {METADATOS_FORMATO.codigo}
              </div>
              <div className="border-b border-slate-400 px-2 py-1">
                <span className="font-bold italic">Fecha:</span> {METADATOS_FORMATO.fecha}
              </div>
              <div className="px-2 py-1">
                <span className="font-bold italic">Version:</span> {METADATOS_FORMATO.version}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-3 border-t-2 border-blue-500 pt-8">
          {clavesTiposInspeccion.map((tipo) => {
            const estaSeleccionado = tipoInspeccionSeleccionado === tipo;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => seleccionarTipoInspeccion(tipo)}
                aria-pressed={estaSeleccionado}
                className={`flex min-h-[60px] w-[170px] items-center justify-center gap-3 rounded-lg border px-3 py-3 text-xs font-bold uppercase text-white shadow-sm transition ${
                  estaSeleccionado
                    ? "border-emerald-500 bg-emerald-800 ring-2 ring-emerald-300"
                    : "border-slate-800 bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-slate-950/20 text-2xl leading-none">
                  <Image src={imagenesBotonesInspeccion[tipo]} alt="" width={28} height={28} className="size-7 object-contain" />
                </span>
                <span className="leading-5">{etiquetasBotonesInspeccion[tipo]}</span>
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

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Datos generales</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
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

              <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Identificación del equipo</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    <input name="numeroSerie" value={datosGenerales.numeroSerie} onChange={manejarCambioCampo} placeholder="Ej: 454580104" className={claseCampoTexto} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Número interno {marcaObligatorio}</label>
                    <input name="numeroInterno" value={datosGenerales.numeroInterno} onChange={manejarCambioCampo} placeholder="Ej: N/A" className={claseCampoTexto} />
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

              <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Fechas del equipo</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
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

              <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Características técnicas</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Periodicidad {marcaObligatorio}</label>
                    <select name="periodicidad" value={datosGenerales.periodicidad} onChange={manejarCambioCampo} className={claseCampoSeleccion}>
                      <option value="">Seleccione una periodicidad</option>
                      <option value="Mensual">Mensual</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Tipo de freno</label>
                    <select name="tipoFreno" value={datosGenerales.tipoFreno} onChange={manejarCambioCampo} className={claseCampoSeleccion}>
                      <option value="">Seleccione el tipo de freno</option>
                      <option value="Manual">Manual</option>
                      <option value="Automático">Automático</option>
                      <option value="Autoretráctil">Autoretráctil</option>
                      <option value="No aplica">No aplica</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Evidencia fotográfica</h3>
                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-700">Adjuntar imagen del equipo</label>
                  <label className="mt-2 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-600 bg-white px-4 py-6 text-center transition hover:bg-emerald-50">
                    <input type="file" accept="image/*" onChange={manejarCargaImagen} className="sr-only" />
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
                    ["Tipo de freno", datosGenerales.tipoFreno],
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
                      <select
                        name="decisionFinal"
                        value={decisionFinal}
                        onChange={manejarCambioCampo}
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      >
                        {opcionesDecision.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
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

