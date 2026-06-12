"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  ClipboardCheck,
  ClipboardList,
  FileText,
  HardHat,
  Settings,
  UserCog,
} from "lucide-react";
import { enfocarYMostrarCampoFaltante } from "../components/campoFaltante";
import { mapEstadoToId, registrarJsonFinalFormulario } from "../components/jsonFormulario";
import { FORM_META, opcionesCantidadOtros, opcionesEstado, seccionesChequeo } from "./data";
import type { EstadoChequeo } from "./data";

type DatosGenerales = {
  email: string;
  inspector: string;
  areaInspeccionada: string;
  fecha: string;
  maquinariaHerramientas: string;
  numeroTrabajadoresArea: string;
  puestosTrabajo: string;
  sustanciasUtilizadas: string;
  cantidadOtros: string;
  observacionesGenerales: string;
  recomendaciones: string;
};

type RespuestaItem = {
  estado: EstadoChequeo;
  observaciones: string;
};

type OtroDetalle = {
  cual: string;
  estado: EstadoChequeo;
  observaciones: string;
};

const perfilRocaActual = {
  nombre: "KATHERIN MARIANA GOMEZ CEPEDA",
  cargo: "DESARROLLADOR JUNIOR",
  proceso: "GESTION DE TECNOLOGIA",
  compania: "INCOMINERIA S.A.S.",
};

const datosGeneralesIniciales: DatosGenerales = {
  email: "",
  inspector: "",
  areaInspeccionada: "",
  fecha: "",
  maquinariaHerramientas: "",
  numeroTrabajadoresArea: "",
  puestosTrabajo: "",
  sustanciasUtilizadas: "",
  cantidadOtros: "",
  observacionesGenerales: "",
  recomendaciones: "",
};

const campoTexto =
  "mt-2 block h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const campoFecha =
  "date-input mt-2 block h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition [color-scheme:light] focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const campoSeleccion =
  "mt-2 block h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const etiquetaCampo = "text-xs font-bold uppercase tracking-wide text-slate-600";
const tarjetaSeccion = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/70";
const encabezadoSeccion = "flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-5 py-5";
const iconoSeccion = "grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white";
const marcaObligatorio = <span className="text-red-600">*</span>;
const claseBotonEstado = (opcion: EstadoChequeo, seleccionado: boolean) => {
  if (opcion === "Cumple") {
    return seleccionado
      ? "border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200"
      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-slate-50";
  }
  if (opcion === "No Cumple") {
    return seleccionado
      ? "border-red-400 bg-red-100 text-red-800 ring-2 ring-red-200"
      : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-slate-50";
  }
  return seleccionado
    ? "border-slate-700 bg-slate-700 text-white ring-2 ring-slate-400"
    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50";
};
const opcionesEstadoVisibles = (estadoSeleccionado: EstadoChequeo) =>
  estadoSeleccionado ? [estadoSeleccionado] : opcionesEstado;

const soloNumeros = (value: string) => value.replace(/\D/g, "");
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const enfocarCampoFaltante = (id: string) => {
  enfocarYMostrarCampoFaltante(id);
};

const crearRespuestasIniciales = () => {
  const respuestas: Record<string, RespuestaItem> = {};
  seccionesChequeo.forEach((seccion) => {
    seccion.items.forEach((item) => {
      respuestas[item.key] = { estado: "", observaciones: "" };
    });
  });
  return respuestas;
};
const crearDetalleOtros = (cantidad: number, detalleActual: OtroDetalle[] = []) =>
  Array.from(
    { length: cantidad },
    (_, index) => detalleActual[index] ?? { cual: "", estado: "", observaciones: "" }
  );
export default function ListaChequeoCondicionesSeguridadForm() {
  const [datosGenerales, setDatosGenerales] = useState<DatosGenerales>(datosGeneralesIniciales);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaItem>>(crearRespuestasIniciales);
  const [otrosDetalle, setOtrosDetalle] = useState<OtroDetalle[]>([]);

  const manejarCambioDatos = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const campo = name as keyof DatosGenerales;
    let siguienteValor = value;
    if (campo === "inspector") siguienteValor = quitarNumeros(value);
    if (campo === "numeroTrabajadoresArea") siguienteValor = soloNumeros(value);

    if (campo === "cantidadOtros") {
      const cantidad = Number(siguienteValor || 0);
      setDatosGenerales((prev) => ({ ...prev, cantidadOtros: siguienteValor }));
      setOtrosDetalle((prev) => crearDetalleOtros(cantidad, prev));
      return;
    }

    setDatosGenerales((prev) => ({ ...prev, [campo]: siguienteValor }));
  };

  const manejarEstadoItem = (key: string, estado: EstadoChequeo) => {
    setRespuestas((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        estado: prev[key]?.estado === estado ? "" : estado,
        observaciones: estado === "Cumple" && prev[key]?.estado !== estado ? "" : prev[key]?.observaciones || "",
      },
    }));
  };

  const manejarObservacionItem = (key: string, observaciones: string) => {
    setRespuestas((prev) => ({ ...prev, [key]: { ...prev[key], observaciones } }));
  };

  const manejarCambioOtro = (index: number, campo: keyof OtroDetalle, value: string) => {
    setOtrosDetalle((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [campo]: campo === "estado" && item.estado === value ? "" : value,
              observaciones: campo === "estado" && value === "Cumple" && item.estado !== value ? "" : item.observaciones,
            }
          : item
      )
    );
  };

  const obtenerCamposFaltantes = () => {
    const camposFaltantes: string[] = [];

    if (!datosGenerales.email) camposFaltantes.push("email");
    if (!datosGenerales.inspector) camposFaltantes.push("inspector");
    if (!datosGenerales.areaInspeccionada) camposFaltantes.push("areaInspeccionada");
    if (!datosGenerales.fecha) camposFaltantes.push("fecha");
    if (!datosGenerales.maquinariaHerramientas) camposFaltantes.push("maquinariaHerramientas");
    if (!datosGenerales.numeroTrabajadoresArea) camposFaltantes.push("numeroTrabajadoresArea");
    if (!datosGenerales.puestosTrabajo) camposFaltantes.push("puestosTrabajo");
    if (!datosGenerales.sustanciasUtilizadas) camposFaltantes.push("sustanciasUtilizadas");
    seccionesChequeo.forEach((seccion) => {
      seccion.items.forEach((item) => {
        if (!respuestas[item.key]?.estado) camposFaltantes.push(`estado-${item.key}`);
      });
    });
    otrosDetalle.forEach((otro, index) => {
      if (!otro.cual) camposFaltantes.push(`otroCual-${index}`);
      if (!otro.estado) camposFaltantes.push(`otroEstado-${index}`);
    });
    return camposFaltantes;
  };

  const construirRespuestaJson = () => ({
    formato: {
      nombre: FORM_META.titulo,
      codigo: FORM_META.codigo,
      fecha: FORM_META.fecha,
      version: FORM_META.version,
      area: FORM_META.area,
    },
    registro: {
      fechaRegistro: new Date().toISOString(),
      usuarioEmail: datosGenerales.email,
    },
    datosGenerales: {
      inspector: datosGenerales.inspector,
      areaInspeccionada: datosGenerales.areaInspeccionada,
      fecha: datosGenerales.fecha,
      maquinariaHerramientas: datosGenerales.maquinariaHerramientas,
      numeroTrabajadoresArea: Number(datosGenerales.numeroTrabajadoresArea),
      puestosTrabajo: Number(datosGenerales.puestosTrabajo),
      sustanciasUtilizadas: datosGenerales.sustanciasUtilizadas,
    },
    itemsInspeccion: seccionesChequeo.map((seccion, index) => ({
      grupoId: index + 1,
      grupoTitulo: seccion.titulo,
      items: seccion.items.map((item) => ({
        key: item.key,
        criterio: item.label,
        estadoId: mapEstadoToId(respuestas[item.key]?.estado || ""),
        observaciones: respuestas[item.key]?.observaciones || "",
      })),
    })),
    otros: {
      cantidad: datosGenerales.cantidadOtros,
      detalle: otrosDetalle.map((otro, index) => ({
        numeroRegistro: index + 1,
        cual: otro.cual,
        estadoId: mapEstadoToId(otro.estado),
        observaciones: otro.observaciones,
      })),
    },
    observacionesGenerales: datosGenerales.observacionesGenerales,
    recomendaciones: datosGenerales.recomendaciones,
  });

  const enviarFormulario = async () => {
    const camposFaltantes = obtenerCamposFaltantes();

    if (camposFaltantes.length > 0) {
      enfocarCampoFaltante(camposFaltantes[0]);
      return;
    }

    if (!confirm("¿Confirmas el envío del formulario HSE-F010?")) return;
    const respuestaJson = construirRespuestaJson();
    registrarJsonFinalFormulario(respuestaJson);

    try {
      const respuestaHttp = await fetch("/api/formatos/lista-chequeo-condiciones-seguridad/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestaJson),
      });

      if (!respuestaHttp.ok) throw new Error("No se pudo guardar la respuesta en JSON.");

      await respuestaHttp.json();
      setDatosGenerales(datosGeneralesIniciales);
      setRespuestas(crearRespuestasIniciales());
      setOtrosDetalle([]);
    } catch (error) {
      console.error("Error guardando la respuesta en JSON:", error);
      alert("No se pudo guardar el archivo JSON. Revise la consola para más detalles.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
            <div>
              <div className="flex gap-3 sm:items-start">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm sm:size-14">
                <HardHat className="size-7 sm:size-8" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-start gap-2">
                  <h1 className="text-xl font-bold leading-tight text-slate-950 sm:text-2xl">Lista de chequeo de condiciones de seguridad</h1>
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-white">{FORM_META.codigo}</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Integrado en ROCA con ejecutantes firmantes y responsables de aprobación.
                </p>
              </div>
              </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Compañía", perfilRocaActual.compania],
                    ["Versión", FORM_META.version],
                    ["Estado", "En diligenciamiento"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                      <p className="mt-2 text-sm font-bold uppercase text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/75 p-3 shadow-sm sm:p-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Solicitante", perfilRocaActual.nombre],
                ["Cargo", perfilRocaActual.cargo],
                ["Proceso", perfilRocaActual.proceso],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-bold uppercase text-slate-950">{value}</p>
                </div>
              ))}
              </div>
            </div>
          </div>
        </header>

        <div className="border-t-2 border-blue-500 pt-6">
          <section className={tarjetaSeccion}>
            <div className={encabezadoSeccion}>
              <div className={iconoSeccion}>
                <UserCog className="size-6" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-950">I. DATOS GENERALES DE LA INSPECCIÓN</h2>
            </div>
            <div className="p-5">
            <div>
              <label className={etiquetaCampo}>Email {marcaObligatorio}</label>
              <input name="email" type="email" value={datosGenerales.email} onChange={manejarCambioDatos} placeholder="nombre@empresa.co" className={campoTexto} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className={etiquetaCampo}>INSPECTOR {marcaObligatorio}</label>
                <input name="inspector" value={datosGenerales.inspector} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>ÁREA INSPECCIONADA {marcaObligatorio}</label>
                <input name="areaInspeccionada" value={datosGenerales.areaInspeccionada} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>FECHA {marcaObligatorio}</label>
                <input name="fecha" type="date" value={datosGenerales.fecha} onChange={manejarCambioDatos} className={campoFecha} />
              </div>
            </div>

            </div>
          </section>

          <section className={`${tarjetaSeccion} mt-6`}>
            <div className={encabezadoSeccion}>
              <div className={iconoSeccion}>
                <Settings className="size-6" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-950">II. ITEMS DE LA INSPECCIÓN</h2>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div>
                <label className={etiquetaCampo}>Maquinaria - Herramientas {marcaObligatorio}</label>
                <input name="maquinariaHerramientas" value={datosGenerales.maquinariaHerramientas} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Numero de trabajadores del área {marcaObligatorio}</label>
                <input name="numeroTrabajadoresArea" value={datosGenerales.numeroTrabajadoresArea} onChange={manejarCambioDatos} inputMode="numeric" pattern="[0-9]*" className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Puestos de trabajo {marcaObligatorio}</label>
                <input name="puestosTrabajo" value={datosGenerales.puestosTrabajo} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div>
                <label className={etiquetaCampo}>Sustancias Utilizadas {marcaObligatorio}</label>
                <input name="sustanciasUtilizadas" value={datosGenerales.sustanciasUtilizadas} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
            </div>
          </section>

          <div className="mt-6 space-y-5">
            {seccionesChequeo.map((seccion) => (
              <section key={seccion.titulo} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-emerald-800 px-5 py-4 sm:px-6">
                  <h3 className="text-base font-bold uppercase tracking-wide text-white sm:text-lg">{seccion.titulo}</h3>
                </div>

                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
                  {seccion.items.map((item) => (
                    <div key={item.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                      <div className="grid gap-4 xl:grid-cols-[minmax(160px,1fr)_auto] xl:items-center">
                        <p className="text-sm font-bold uppercase text-slate-950">{item.label}</p>
                        <div data-required-id={`estado-${item.key}`} className="flex w-full flex-wrap gap-2 rounded-xl bg-slate-50 p-2 text-sm font-semibold text-slate-700 xl:w-auto" tabIndex={-1}>
                          {opcionesEstadoVisibles(respuestas[item.key]?.estado || "").map((opcion) => (
                            <button
                              key={`${item.key}-${opcion}`}
                              type="button"
                              aria-pressed={respuestas[item.key]?.estado === opcion}
                              onClick={() => manejarEstadoItem(item.key, opcion)}
                              className={`inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-xs font-bold shadow-sm transition sm:text-sm xl:flex-none ${
                                claseBotonEstado(opcion, respuestas[item.key]?.estado === opcion)
                              }`}
                            >
                              {opcion}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <label className={etiquetaCampo}>Observaciones</label>
                        <input
                          value={respuestas[item.key]?.observaciones || ""}
                          onChange={(e) => manejarObservacionItem(item.key, e.target.value)}
                          disabled={respuestas[item.key]?.estado === "Cumple"}
                          className={`${campoTexto} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section className={tarjetaSeccion}>
              <div className={encabezadoSeccion}>
                <div className={iconoSeccion}>
                  <ClipboardList className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">10. Otros</h3>
              </div>
              <div className="m-5 max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className={etiquetaCampo}>¿Cuántos?</label>
                <select name="cantidadOtros" value={datosGenerales.cantidadOtros} onChange={manejarCambioDatos} className={campoSeleccion}>
                  <option value="">Seleccione una opcion</option>
                  {opcionesCantidadOtros.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              {otrosDetalle.length > 0 ? (
                <div className="grid gap-4 p-5 pt-0">
                  {otrosDetalle.map((otro, index) => (
                    <div key={`otro-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(260px,360px)] lg:items-end">
                        <div>
                          <label className={etiquetaCampo}>{index + 1}. ¿Cual?</label>
                          <input
                            data-required-id={`otroCual-${index}`}
                            value={otro.cual}
                            onChange={(e) => manejarCambioOtro(index, "cual", e.target.value)}
                            className={campoTexto}
                          />
                        </div>

                        <div data-required-id={`otroEstado-${index}`} className="flex w-full flex-wrap gap-2 rounded-xl bg-slate-50 p-2 text-sm font-semibold text-slate-700 lg:w-auto" tabIndex={-1}>
                          {opcionesEstadoVisibles(otro.estado).map((opcion) => (
                            <button
                              key={`otro-${index}-${opcion}`}
                              type="button"
                              aria-pressed={otro.estado === opcion}
                              onClick={() => manejarCambioOtro(index, "estado", opcion)}
                              className={`inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-xs font-bold shadow-sm transition sm:text-sm lg:flex-none ${
                                claseBotonEstado(opcion, otro.estado === opcion)
                              }`}
                            >
                              {opcion}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className={etiquetaCampo}>Observaciones</label>
                        <input
                          value={otro.observaciones}
                          onChange={(e) => manejarCambioOtro(index, "observaciones", e.target.value)}
                          disabled={otro.estado === "Cumple"}
                          className={`${campoTexto} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className={tarjetaSeccion}>
              <div className={encabezadoSeccion}>
                <div className={iconoSeccion}>
                  <FileText className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">III. OBSERVACIONES GENERALES</h3>
              </div>
              <div className="p-5">
              <textarea name="observacionesGenerales" value={datosGenerales.observacionesGenerales} onChange={manejarCambioDatos} rows={6} className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" />
              </div>

              <div className={encabezadoSeccion}>
                <div className={iconoSeccion}>
                  <ClipboardCheck className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">IV. RECOMENDACIONES</h3>
              </div>
              <div className="p-5">
              <textarea name="recomendaciones" value={datosGenerales.recomendaciones} onChange={manejarCambioDatos} rows={6} className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" />
              </div>
            </section>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <button type="button" onClick={enviarFormulario} className="rounded-full bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                Enviar formulario
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

