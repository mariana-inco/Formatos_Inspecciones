"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Signature from "@uiw/react-signature";
import type { SignatureRef } from "@uiw/react-signature";

const METADATOS_FORMATO = {
  codigo: "HSE-F003",
  fecha: "2025-07-15",
  version: "05",
  area: "GESTIÓN HSE",
  titulo: "INSPECCIÓN Y VERIFICACIÓN DE EXTINTORES",
};

type EstadoRevision = "" | "BUENO" | "REGULAR" | "MALO" | "NO APLICA";

type DatosInspeccion = {
  email: string;
  sedeCentroTrabajo: string;
  responsableInspeccion: string;
  cargoResponsable: string;
  equipoInterno: string;
  equipoExterno: string;
  firmaResponsable: string;
  firmaRegistrada: boolean;
};

type RegistroExtintor = {
  numeroExtintor: string;
  capacidad: string;
  agente: string;
  clase: string;
  ubicacion: string;
  fechaUltimaRecarga: string;
  fechaProximaRecarga: string;
  pintura: EstadoRevision;
  senalizacion: EstadoRevision;
  acceso: EstadoRevision;
  visibilidad: EstadoRevision;
  manometro: EstadoRevision;
  presion: EstadoRevision;
  pasador: EstadoRevision;
  manguera: EstadoRevision;
  boquilla: EstadoRevision;
  envase: EstadoRevision;
  manija: EstadoRevision;
  corrosion: EstadoRevision;
  observaciones: string;
};

const datosInspeccionIniciales: DatosInspeccion = {
  email: "",
  sedeCentroTrabajo: "",
  responsableInspeccion: "",
  cargoResponsable: "",
  equipoInterno: "",
  equipoExterno: "",
  firmaResponsable: "",
  firmaRegistrada: false,
};

const registroInicial: RegistroExtintor = {
  numeroExtintor: "",
  capacidad: "",
  agente: "",
  clase: "",
  ubicacion: "",
  fechaUltimaRecarga: "",
  fechaProximaRecarga: "",
  pintura: "",
  senalizacion: "",
  acceso: "",
  visibilidad: "",
  manometro: "",
  presion: "",
  pasador: "",
  manguera: "",
  boquilla: "",
  envase: "",
  manija: "",
  corrosion: "",
  observaciones: "",
};

const campoTexto =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-md outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const campoFecha =
  "date-input mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-md outline-none [color-scheme:light] focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const campoSeleccion =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-md outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const etiquetaCampo = "text-xs font-bold italic uppercase text-slate-950";
const marcaObligatorio = <span className="text-red-600">*</span>;

const camposRevision: Array<{ key: keyof RegistroExtintor; label: string }> = [
  { key: "pintura", label: "Pintura" },
  { key: "senalizacion", label: "Señalización" },
  { key: "acceso", label: "Acceso" },
  { key: "visibilidad", label: "Visibilidad" },
  { key: "manometro", label: "Manometro" },
  { key: "presion", label: "Presión" },
  { key: "pasador", label: "Pasador" },
  { key: "manguera", label: "Manguera" },
  { key: "boquilla", label: "Boquilla" },
  { key: "envase", label: "Envase" },
  { key: "manija", label: "Manija" },
  { key: "corrosion", label: "Corrosión" },
];

const soloNumeros = (value: string) => value.replace(/\D/g, "");
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const mostrarValor = (value: string) => value || "N/A";
const mostrarEstado = (value: EstadoRevision) => (value === "NO APLICA" || !value ? "N/A" : value);
const claseEstadoComponente = (value: EstadoRevision) => {
  if (value === "BUENO") return "bg-emerald-500 text-white";
  if (value === "REGULAR") return "bg-amber-500 text-white";
  if (value === "MALO") return "bg-red-500 text-white";
  return "bg-slate-200 text-slate-700";
};

const serializarFirma = (svg: SVGSVGElement) => {
  const firmaClonada = svg.cloneNode(true) as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  const ancho = Math.max(Math.round(svg.clientWidth || rect.width || 600), 600);
  const alto = Math.max(Math.round(svg.clientHeight || rect.height || 220), 220);

  firmaClonada.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  firmaClonada.setAttribute("width", String(ancho));
  firmaClonada.setAttribute("height", String(alto));
  if (!firmaClonada.getAttribute("viewBox")) firmaClonada.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);

  return new XMLSerializer().serializeToString(firmaClonada);
};

export default function InspeccionExtintoresForm() {
  const [datosInspeccion, setDatosInspeccion] = useState<DatosInspeccion>(datosInspeccionIniciales);
  const [registro, setRegistro] = useState<RegistroExtintor>(registroInicial);
  const [registros, setRegistros] = useState<RegistroExtintor[]>([]);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);
  const [firmaTieneTrazo, setFirmaTieneTrazo] = useState(false);
  const referenciaFirma = useRef<SignatureRef>(null);

  const manejarCambioDatosInspeccion = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const campo = name as keyof DatosInspeccion;
    const siguienteValor = campo === "responsableInspeccion" || campo === "cargoResponsable" ? quitarNumeros(value) : value;
    setDatosInspeccion((prev) => ({ ...prev, [campo]: siguienteValor }));
  };

  const manejarCambioRegistro = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const campo = name as keyof RegistroExtintor;
    const siguienteValor = campo === "numeroExtintor" ? soloNumeros(value) : value;
    setRegistro((prev) => ({ ...prev, [campo]: siguienteValor }));
  };

  const limpiarFirma = () => {
    referenciaFirma.current?.clear();
    setFirmaTieneTrazo(false);
    setDatosInspeccion((prev) => ({ ...prev, firmaResponsable: "", firmaRegistrada: false }));
  };

  const guardarFirma = () => {
    const svg = referenciaFirma.current?.svg;
    if (!svg) return;
    if (!firmaTieneTrazo) {
      alert("Por favor registre la firma antes de guardar.");
      return;
    }

    const firmaSerializada = serializarFirma(svg);
    const firmaComoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(firmaSerializada)}`;
    setDatosInspeccion((prev) => ({ ...prev, firmaResponsable: firmaComoUrl, firmaRegistrada: true }));
    setModalFirmaAbierto(false);
    setFirmaTieneTrazo(false);
  };

  const limpiarRegistro = () => {
    setRegistro(registroInicial);
    setIndiceEdicion(null);
  };

  const agregarRegistro = () => {
    const datosCompletos =
      datosInspeccion.email &&
      datosInspeccion.sedeCentroTrabajo &&
      datosInspeccion.responsableInspeccion &&
      datosInspeccion.cargoResponsable &&
      (datosInspeccion.equipoInterno || datosInspeccion.equipoExterno) &&
      datosInspeccion.firmaRegistrada;

    const registroCompleto =
      registro.numeroExtintor &&
      registro.capacidad &&
      registro.agente &&
      registro.clase &&
      registro.ubicacion &&
      registro.fechaUltimaRecarga &&
      registro.fechaProximaRecarga &&
      camposRevision.every((campo) => Boolean(registro[campo.key]));

    if (!datosCompletos || !registroCompleto) {
      alert("Complete los datos obligatorios, registre la firma y diligencie la inspección del extintor antes de agregar.");
      return;
    }

    if (indiceEdicion !== null) {
      setRegistros((prev) => prev.map((item, index) => (index === indiceEdicion ? { ...registro } : item)));
    } else {
      setRegistros((prev) => [...prev, { ...registro }]);
    }

    limpiarRegistro();
  };

  const eliminarRegistro = (index: number) => {
    setRegistros((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    if (indiceEdicion === index) limpiarRegistro();
  };

  const construirRespuestaJson = () => ({
    formato: {
      nombre: METADATOS_FORMATO.titulo,
      codigo: METADATOS_FORMATO.codigo,
      fecha: METADATOS_FORMATO.fecha,
      version: METADATOS_FORMATO.version,
      area: METADATOS_FORMATO.area,
    },
    fechaRegistro: new Date().toISOString(),
    datosInspeccion: {
      email: datosInspeccion.email,
      sedeCentroTrabajo: datosInspeccion.sedeCentroTrabajo,
      responsableInspeccion: datosInspeccion.responsableInspeccion,
      cargoResponsable: datosInspeccion.cargoResponsable,
      equipoInterno: datosInspeccion.equipoInterno,
      equipoExterno: datosInspeccion.equipoExterno,
      firma: {
        registrada: datosInspeccion.firmaRegistrada,
        dataUrl: datosInspeccion.firmaResponsable,
      },
    },
    totalRegistros: registros.length,
    registros: registros.map((item, index) => ({
      numeroRegistro: index + 1,
      identificacionExtintor: {
        numeroExtintor: item.numeroExtintor,
        capacidad: item.capacidad,
        agente: item.agente,
        clase: item.clase,
        ubicacion: item.ubicacion,
        fechaUltimaRecarga: item.fechaUltimaRecarga,
        fechaProximaRecarga: item.fechaProximaRecarga,
      },
      verificacion: camposRevision.map((campo) => ({
        key: campo.key,
        criterio: campo.label,
        estado: item[campo.key],
      })),
      observaciones: item.observaciones,
    })),
  });

  const enviarFormulario = async () => {
    if (registros.length === 0) {
      alert("Agregue al menos un registro de extintor antes de enviar el formulario.");
      return;
    }

    if (!confirm("¿Confirmas el envío del formulario HSE-F003?")) return;
    const respuestaJson = construirRespuestaJson();
    const respuestaJsonFormateada = JSON.stringify(respuestaJson, null, 2);
    console.log("JSON del formulario HSE-F003:", respuestaJsonFormateada);

    try {
      const respuestaHttp = await fetch("/api/formatos/inspeccion-extintores/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestaJson),
      });

      if (!respuestaHttp.ok) throw new Error("No se pudo guardar la respuesta en JSON.");

      const resultadoGuardado = (await respuestaHttp.json()) as { fileName: string; filePath: string };
      console.log("Respuesta guardada en JSON:", resultadoGuardado);
      console.log("Registro completo del formulario:", respuestaJson);
    } catch (error) {
      console.error("Error guardando la respuesta en JSON:", error);
      alert("No se pudo guardar el archivo JSON. Revise la consola para más detalles.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 sm:px-12">
      <div className="w-full max-w-full">
        <div className="mb-6 overflow-x-auto bg-white">
          <div className="grid min-w-[900px] grid-cols-[20%_1fr_20%] border border-slate-400 text-xs text-slate-950">
            <div className="min-h-[112px] border-r border-slate-400 bg-white" aria-label="Espacio reservado para el logo" />
            <div className="border-r border-slate-400">
              <div className="border-b border-slate-400 py-1 text-center font-bold uppercase">{METADATOS_FORMATO.area}</div>
              <div className="flex min-h-[88px] items-start justify-center px-4 pt-3 text-center font-bold uppercase">
                {METADATOS_FORMATO.titulo}
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

        <div className="border-t-2 border-blue-500 pt-8">
          <section className="space-y-7 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <label className={etiquetaCampo}>Email {marcaObligatorio}</label>
              <input name="email" type="email" value={datosInspeccion.email} onChange={manejarCambioDatosInspeccion} placeholder="example1@domain.com,example2@domain.com..." className={campoTexto} />
            </div>

            <div className="border-t-4 border-emerald-900 bg-slate-50 px-4 py-5 text-center shadow-sm">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-800">Datos de la inspección</h2>
              <div className="mx-auto mt-3 h-2 w-11 rounded-full bg-emerald-900" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={etiquetaCampo}>Sede o centro de trabajo {marcaObligatorio}</label>
                <input name="sedeCentroTrabajo" value={datosInspeccion.sedeCentroTrabajo} onChange={manejarCambioDatosInspeccion} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Responsable inspección {marcaObligatorio}</label>
                <input name="responsableInspeccion" value={datosInspeccion.responsableInspeccion} onChange={manejarCambioDatosInspeccion} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Cargo {marcaObligatorio}</label>
                <input name="cargoResponsable" value={datosInspeccion.cargoResponsable} onChange={manejarCambioDatosInspeccion} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Equipo interno</label>
                <input name="equipoInterno" value={datosInspeccion.equipoInterno} onChange={manejarCambioDatosInspeccion} className={campoTexto} />
              </div>
              <div className="md:col-span-2">
                <label className={etiquetaCampo}>Equipo externo</label>
                <input name="equipoExterno" value={datosInspeccion.equipoExterno} onChange={manejarCambioDatosInspeccion} className={campoTexto} />
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold italic uppercase text-slate-900">Firma {marcaObligatorio}</p>
                <p className="mt-1 text-sm text-slate-600">{datosInspeccion.firmaRegistrada ? "Firma registrada" : "Pendiente de firma"}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFirmaTieneTrazo(false);
                  setModalFirmaAbierto(true);
                }}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Clic para firmar
              </button>
            </div>

            <div className="border-t-4 border-emerald-900 bg-slate-50 px-4 py-5 text-center shadow-sm">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-800">Registro de inspección de extintores</h2>
              <div className="mx-auto mt-3 h-2 w-11 rounded-full bg-emerald-900" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={etiquetaCampo}>N° del extintor {marcaObligatorio}</label>
                <input name="numeroExtintor" value={registro.numeroExtintor} onChange={manejarCambioRegistro} inputMode="numeric" pattern="[0-9]*" className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Ubicación {marcaObligatorio}</label>
                <input name="ubicacion" value={registro.ubicacion} onChange={manejarCambioRegistro} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Capacidad {marcaObligatorio}</label>
                <input name="capacidad" value={registro.capacidad} onChange={manejarCambioRegistro} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Agente {marcaObligatorio}</label>
                <input name="agente" value={registro.agente} onChange={manejarCambioRegistro} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Clase {marcaObligatorio}</label>
                <input name="clase" value={registro.clase} onChange={manejarCambioRegistro} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Fecha última recarga {marcaObligatorio}</label>
                <input name="fechaUltimaRecarga" type="date" value={registro.fechaUltimaRecarga} onChange={manejarCambioRegistro} className={campoFecha} />
              </div>
              <div>
                <label className={etiquetaCampo}>Fecha próxima recarga {marcaObligatorio}</label>
                <input name="fechaProximaRecarga" type="date" value={registro.fechaProximaRecarga} onChange={manejarCambioRegistro} className={campoFecha} />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {camposRevision.map((campo) => (
                <div key={campo.key}>
                  <label className={etiquetaCampo}>{campo.label} {marcaObligatorio}</label>
                  <select name={campo.key} value={registro[campo.key] as EstadoRevision} onChange={manejarCambioRegistro} className={campoSeleccion}>
                    <option value="">Seleccione una opcion</option>
                    <option value="BUENO">BUENO</option>
                    <option value="REGULAR">REGULAR</option>
                    <option value="MALO">MALO</option>
                    <option value="NO APLICA">NO APLICA</option>
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className={etiquetaCampo}>Observaciones</label>
              <textarea name="observaciones" value={registro.observaciones} onChange={manejarCambioRegistro} rows={2} className={campoTexto} />
            </div>

            <div className="flex justify-center py-4">
              <button type="button" onClick={agregarRegistro} className="rounded bg-emerald-900 px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-md transition hover:bg-emerald-800">
                {indiceEdicion !== null ? "Actualizar registro" : "Agregar registro"}
              </button>
            </div>
          </section>

          {registros.length > 0 ? (
            <section className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {registros.map((item, index) => (
                  <article key={`${item.numeroExtintor}-${index}`} className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-lg font-bold text-slate-950">Extintor #{mostrarValor(item.numeroExtintor)}</h2>
                      <button
                        type="button"
                        onClick={() => eliminarRegistro(index)}
                        className="rounded-lg bg-red-500 px-5 py-3 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="mt-4 rounded-lg bg-slate-50 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Capacidad</p>
                          <p className="mt-1 text-base font-bold text-slate-950">{mostrarValor(item.capacidad)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Agente</p>
                          <p className="mt-1 text-base font-bold text-slate-950">{mostrarValor(item.agente)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Clase</p>
                          <p className="mt-1 text-base font-bold text-slate-950">{mostrarValor(item.clase)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ubicación</p>
                          <p className="mt-1 text-base font-bold text-slate-950">{mostrarValor(item.ubicacion)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border-l-4 border-blue-500 bg-blue-200 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-900">Última recarga</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">{mostrarValor(item.fechaUltimaRecarga)}</p>
                      </div>
                      <div className="rounded-lg border-l-4 border-amber-500 bg-yellow-200 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-yellow-900">Próxima recarga</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">{mostrarValor(item.fechaProximaRecarga)}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-bold uppercase text-slate-950">Estado de componentes</h3>
                      <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-bold uppercase text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          <span className="size-3 rounded-sm bg-emerald-500" />
                          Bueno
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="size-3 rounded-sm bg-amber-500" />
                          Regular
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="size-3 rounded-sm bg-red-500" />
                          Malo
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {camposRevision.map((campo) => (
                          <div
                            key={`${item.numeroExtintor}-${campo.key}`}
                            className={`min-h-[50px] rounded-md px-2 py-2 text-center ${claseEstadoComponente(item[campo.key] as EstadoRevision)}`}
                          >
                            <p className="text-[10px] font-semibold uppercase opacity-90">{campo.label}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase">{mostrarEstado(item[campo.key] as EstadoRevision)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {item.observaciones ? (
                      <div className="mt-5 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="text-xs font-semibold uppercase text-slate-500">Observaciones</p>
                        <p className="mt-1 text-sm text-slate-800">{item.observaciones}</p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-8 flex justify-start">
            <button type="button" onClick={enviarFormulario} className="rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
              Enviar formulario
            </button>
          </div>
        </div>
      </div>

      {modalFirmaAbierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Firma digital</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">Inspección realizada por</h3>
              </div>
              <button type="button" onClick={() => setModalFirmaAbierto(false)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Cerrar
              </button>
            </div>

            <div className="mt-5">
              <label className={etiquetaCampo}>Firma</label>
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
              <button type="button" onClick={() => setModalFirmaAbierto(false)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
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
