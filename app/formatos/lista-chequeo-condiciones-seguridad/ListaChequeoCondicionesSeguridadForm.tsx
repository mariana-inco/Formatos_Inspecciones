"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { ClipboardCheck, ClipboardList, FileText, ListChecks, Settings, UserCog } from "lucide-react";
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

const soloNumeros = (value: string) => value.replace(/\D/g, "");
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const enfocarCampoFaltante = (id: string) => {
  const campo = document.querySelector<HTMLElement>(`[name="${id}"], [data-required-id="${id}"]`);
  campo?.scrollIntoView({ behavior: "smooth", block: "center" });
  campo?.focus({ preventScroll: true });
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
    setRespuestas((prev) => ({ ...prev, [key]: { ...prev[key], estado } }));
  };

  const manejarObservacionItem = (key: string, observaciones: string) => {
    setRespuestas((prev) => ({ ...prev, [key]: { ...prev[key], observaciones } }));
  };

  const manejarCambioOtro = (index: number, campo: keyof OtroDetalle, value: string) => {
    setOtrosDetalle((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [campo]: value } : item
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
    fechaRegistro: new Date().toISOString(),
    datosGenerales: {
      email: datosGenerales.email,
      inspector: datosGenerales.inspector,
      areaInspeccionada: datosGenerales.areaInspeccionada,
      fecha: datosGenerales.fecha,
      maquinariaHerramientas: datosGenerales.maquinariaHerramientas,
      numeroTrabajadoresArea: datosGenerales.numeroTrabajadoresArea,
      puestosTrabajo: datosGenerales.puestosTrabajo,
      sustanciasUtilizadas: datosGenerales.sustanciasUtilizadas,
    },
    itemsInspeccion: seccionesChequeo.map((seccion) => ({
      titulo: seccion.titulo,
      items: seccion.items.map((item) => ({
        key: item.key,
        criterio: item.label,
        estado: respuestas[item.key]?.estado || "",
        observaciones: respuestas[item.key]?.observaciones || "",
      })),
    })),
    otros: {
      cantidad: datosGenerales.cantidadOtros,
      detalle: otrosDetalle.map((otro, index) => ({
        numeroRegistro: index + 1,
        cual: otro.cual,
        estado: otro.estado,
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
    const respuestaJsonFormateada = JSON.stringify(respuestaJson, null, 2);
    console.log("JSON del formulario HSE-F010:", respuestaJsonFormateada);

    try {
      const respuestaHttp = await fetch("/api/formatos/lista-chequeo-condiciones-seguridad/respuestas", {
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
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-6 overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
          <div className="grid min-w-[860px] grid-cols-[20%_1fr_22%] text-xs text-slate-950">
            <div className="flex min-h-[112px] items-center justify-center border-r border-slate-400 bg-white px-5" aria-label="Espacio reservado para el logo">
              <span className="text-2xl font-bold lowercase tracking-tight text-emerald-800">incomineria</span>
            </div>

            <div className="border-r border-slate-400">
              <div className="border-b border-slate-400 py-1 text-center font-bold uppercase">{FORM_META.area}</div>
              <div className="flex min-h-[88px] items-start justify-center px-4 pt-3 text-center font-bold uppercase">
                {FORM_META.titulo}
              </div>
            </div>

            <div className="grid grid-rows-[32px_1fr_32px]">
              <div className="border-b border-slate-400 px-2 py-2">
                <span className="font-bold italic">Codigo:</span> {FORM_META.codigo}
              </div>
              <div className="border-b border-slate-400 px-2 py-2">
                <span className="font-bold italic">Fecha:</span> {FORM_META.fecha}
              </div>
              <div className="px-2 py-2">
                <span className="font-bold italic">Version:</span> {FORM_META.version}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-blue-500 pt-6">
          <section className={tarjetaSeccion}>
            <div className={encabezadoSeccion}>
              <div className={iconoSeccion}>
                <UserCog className="size-6" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-950">I. DATOS GENERALES DE LA INSPECCIÓN</h2>
            </div>
            <div className="p-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className={etiquetaCampo}>Email {marcaObligatorio}</label>
              <input name="email" type="email" value={datosGenerales.email} onChange={manejarCambioDatos} placeholder="nombre@empresa.co" className={campoTexto} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className={etiquetaCampo}>INSPECTOR {marcaObligatorio}</label>
                <input name="inspector" value={datosGenerales.inspector} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className={etiquetaCampo}>ÁREA INSPECCIONADA {marcaObligatorio}</label>
                <input name="areaInspeccionada" value={datosGenerales.areaInspeccionada} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className={etiquetaCampo}>Maquinaria - Herramientas {marcaObligatorio}</label>
                <input name="maquinariaHerramientas" value={datosGenerales.maquinariaHerramientas} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className={etiquetaCampo}>Numero de trabajadores del área {marcaObligatorio}</label>
                <input name="numeroTrabajadoresArea" value={datosGenerales.numeroTrabajadoresArea} onChange={manejarCambioDatos} inputMode="numeric" pattern="[0-9]*" className={campoTexto} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className={etiquetaCampo}>Puestos de trabajo {marcaObligatorio}</label>
                <input name="puestosTrabajo" value={datosGenerales.puestosTrabajo} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className={etiquetaCampo}>Sustancias Utilizadas {marcaObligatorio}</label>
                <input name="sustanciasUtilizadas" value={datosGenerales.sustanciasUtilizadas} onChange={manejarCambioDatos} className={campoTexto} />
              </div>
            </div>
          </section>

          <div className="mt-6 space-y-5">
            {seccionesChequeo.map((seccion) => (
              <section key={seccion.titulo} className={tarjetaSeccion}>
                <div className={encabezadoSeccion}>
                  <div className={iconoSeccion}>
                    <ListChecks className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">{seccion.titulo}</h3>
                </div>

                <div className="grid gap-4 p-5">
                  {seccion.items.map((item) => (
                    <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(260px,360px)] lg:items-center">
                        <p className={etiquetaCampo}>{item.label}</p>
                        <div data-required-id={`estado-${item.key}`} className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" tabIndex={-1}>
                          {opcionesEstado.map((opcion) => (
                            <label key={`${item.key}-${opcion}`} className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name={`estado-${item.key}`}
                                checked={respuestas[item.key]?.estado === opcion}
                                onChange={() => manejarEstadoItem(item.key, opcion)}
                                className="size-4 accent-emerald-700"
                              />
                              {opcion}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className={etiquetaCampo}>Observaciones</label>
                        <input value={respuestas[item.key]?.observaciones || ""} onChange={(e) => manejarObservacionItem(item.key, e.target.value)} className={campoTexto} />
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

                        <div data-required-id={`otroEstado-${index}`} className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" tabIndex={-1}>
                          {opcionesEstado.map((opcion) => (
                            <label key={`otro-${index}-${opcion}`} className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name={`otroEstado-${index}`}
                                checked={otro.estado === opcion}
                                onChange={() => manejarCambioOtro(index, "estado", opcion)}
                                className="size-4 accent-emerald-700"
                              />
                              {opcion}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className={etiquetaCampo}>Observaciones</label>
                        <input
                          value={otro.observaciones}
                          onChange={(e) => manejarCambioOtro(index, "observaciones", e.target.value)}
                          className={campoTexto}
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
