"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { FORM_META, camposEpp, gruposTablaEpp, opcionesCondicion } from "./data";
import type { CampoEppKey, CondicionEpp } from "./data";

type OtroEpp = {
  cual: string;
  condicion: CondicionEpp;
};

type DatosFormulario = {
  email: string;
  fechaInspeccion: string;
  lugar: string;
  areaTrabajo: string;
  nombreColaborador: string;
  cargoTrabajador: string;
  otrosEpps: string;
  otrosEppsDetalle: OtroEpp[];
  observaciones: string;
} & Record<Exclude<CampoEppKey, "otrosEpps">, CondicionEpp>;

type RegistroEpp = DatosFormulario;

const datosIniciales: DatosFormulario = {
  email: "",
  fechaInspeccion: "",
  lugar: "",
  areaTrabajo: "",
  nombreColaborador: "",
  cargoTrabajador: "",
  casco: "",
  caretaEsmerilar: "",
  caretaSoldadura: "",
  monogafas: "",
  copa: "",
  insercion: "",
  guantePoliuretano: "",
  guanteCaucho: "",
  guanteNitrilo: "",
  guanteVaqueta: "",
  mangaCarnaza: "",
  guantesSoldador: "",
  mascarillaPolvoM10: "",
  respiradorMediaCara: "",
  petoCarnaza: "",
  botaCaucho: "",
  botasSeguridad: "",
  botaSoldador: "",
  otrosEpps: "",
  otrosEppsDetalle: [],
  observaciones: "",
};

const dateInputClassName =
  "date-input mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none [color-scheme:light] focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const fieldClassName =
  "mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const selectClassName =
  "mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const requiredMark = <span className="text-red-600">*</span>;
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const camposSinNumeros = new Set<keyof DatosFormulario>(["nombreColaborador", "cargoTrabajador"]);
const opcionesCantidadOtrosEpps = Array.from({ length: 9 }, (_, index) => String(index + 1));
const crearDetalleOtrosEpps = (cantidad: number, detalleActual: OtroEpp[] = []) =>
  Array.from({ length: cantidad }, (_, index) => detalleActual[index] ?? { cual: "", condicion: "" });

export default function InspeccionEppForm() {
  const [datos, setDatos] = useState<DatosFormulario>(datosIniciales);
  const [registros, setRegistros] = useState<RegistroEpp[]>([]);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof DatosFormulario;
    const nextValue = camposSinNumeros.has(fieldName) ? quitarNumeros(value) : value;

    if (fieldName === "otrosEpps") {
      const cantidad = Number(nextValue || 0);
      setDatos((prev) => ({
        ...prev,
        otrosEpps: nextValue,
        otrosEppsDetalle: crearDetalleOtrosEpps(cantidad, prev.otrosEppsDetalle),
      }));
      return;
    }

    setDatos((prev) => ({ ...prev, [fieldName]: nextValue }));
  };

  const handleOtroEppChange = (index: number, field: keyof OtroEpp, value: string) => {
    setDatos((prev) => ({
      ...prev,
      otrosEppsDetalle: prev.otrosEppsDetalle.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const limpiarCalificacion = () => {
    setDatos((prev) => ({
      ...datosIniciales,
      email: prev.email,
      fechaInspeccion: prev.fechaInspeccion,
      lugar: prev.lugar,
      areaTrabajo: prev.areaTrabajo,
    }));
    setIndiceEdicion(null);
  };

  const handleAgregarRegistro = () => {
    if (!datos.email || !datos.fechaInspeccion || !datos.lugar || !datos.areaTrabajo || !datos.nombreColaborador || !datos.cargoTrabajador) {
      alert("Complete los campos obligatorios antes de agregar el registro.");
      return;
    }

    if (indiceEdicion !== null) {
      setRegistros((prev) => prev.map((registro, index) => (index === indiceEdicion ? { ...datos } : registro)));
    } else {
      setRegistros((prev) => [...prev, { ...datos }]);
    }

    limpiarCalificacion();
  };

  const handleEditarRegistro = (index: number) => {
    setDatos(registros[index]);
    setIndiceEdicion(index);
  };

  const handleEliminarRegistro = (index: number) => {
    setRegistros((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    if (indiceEdicion === index) limpiarCalificacion();
  };

  const buildRespuestaJson = () => ({
    formato: {
      nombre: FORM_META.titulo,
      codigo: FORM_META.codigo,
      fecha: FORM_META.fecha,
      version: FORM_META.version,
      area: FORM_META.area,
    },
    fechaRegistro: new Date().toISOString(),
    datosGenerales: {
      email: registros[0]?.email || datos.email,
      fechaInspeccion: registros[0]?.fechaInspeccion || datos.fechaInspeccion,
      lugar: registros[0]?.lugar || datos.lugar,
      areaTrabajo: registros[0]?.areaTrabajo || datos.areaTrabajo,
    },
    totalRegistros: registros.length,
    registros: registros.map((registro, index) => ({
      numeroRegistro: index + 1,
      colaborador: {
        nombre: registro.nombreColaborador,
        cargo: registro.cargoTrabajador,
      },
      condicionesEpp: camposEpp.map((campo) => ({
        key: campo.key,
        epp: campo.label,
        condicion: registro[campo.key] || "",
      })),
      otrosEpps: {
        cantidad: registro.otrosEpps || "0",
        detalle: registro.otrosEppsDetalle,
      },
      observaciones: registro.observaciones,
    })),
  });

  const handleEnviarFormulario = async () => {
    if (registros.length === 0) {
      alert("Agregue al menos un registro de EPP antes de enviar el formulario.");
      return;
    }

    if (!confirm("¿Confirmas el envío del formulario HSE-F002?")) return;
    const respuestaJson = buildRespuestaJson();

    try {
      const response = await fetch("/api/formatos/inspeccion-epp/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestaJson),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la respuesta en JSON.");
      }

      const result = (await response.json()) as { fileName: string; filePath: string };
      console.log("Respuesta guardada en JSON:", result);
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
              <div className="border-b border-slate-400 py-1 text-center font-bold uppercase">{FORM_META.area}</div>
              <div className="flex min-h-[88px] items-start justify-center px-4 pt-3 text-center font-bold uppercase">
                {FORM_META.titulo}
              </div>
            </div>

            <div className="grid grid-rows-[24px_1fr_24px]">
              <div className="border-b border-slate-400 px-2 py-1">
                <span className="font-bold italic">Codigo:</span> {FORM_META.codigo}
              </div>
              <div className="border-b border-slate-400 px-2 py-1">
                <span className="font-bold italic">Fecha:</span> {FORM_META.fecha}
              </div>
              <div className="px-2 py-1">
                <span className="font-bold italic">Version:</span> {FORM_META.version}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-blue-500 pt-8">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Registro de inspección EPP</h2>
              <p className="mt-1 text-sm text-slate-600">Complete los datos generales y califique la condición de los elementos de protección personal.</p>
            </div>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Datos generales</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Correo electrónico {requiredMark}</label>
                  <input name="email" type="email" value={datos.email} onChange={handleChange} placeholder="usuario@empresa.com" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Fecha de inspección {requiredMark}</label>
                  <input name="fechaInspeccion" type="date" value={datos.fechaInspeccion} onChange={handleChange} aria-label="Seleccione una fecha de inspección" className={dateInputClassName} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Lugar {requiredMark}</label>
                  <input name="lugar" value={datos.lugar} onChange={handleChange} placeholder="Ej: Mina principal" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Área de trabajo {requiredMark}</label>
                  <input name="areaTrabajo" value={datos.areaTrabajo} onChange={handleChange} placeholder="Ej: Operaciones" className={fieldClassName} />
                </div>
              </div>
            </section>

            <section className="mt-5 rounded-lg border border-slate-200 bg-white p-0 shadow-sm">
              <div className="border-t-4 border-emerald-800 px-4 py-5 text-center">
                <h3 className="text-lg font-bold uppercase tracking-wide text-slate-800">Información general de los EPPs calificados</h3>
                <div className="mx-auto mt-3 h-2 w-12 rounded-full bg-emerald-800" />
              </div>
            </section>

            <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Califique la condición del EPP</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nombre del colaborador {requiredMark}</label>
                  <input name="nombreColaborador" value={datos.nombreColaborador} onChange={handleChange} placeholder="Nombre completo" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Cargo del trabajador {requiredMark}</label>
                  <input name="cargoTrabajador" value={datos.cargoTrabajador} onChange={handleChange} placeholder="Ej: Operador" className={fieldClassName} />
                </div>

                {camposEpp.map((campo) =>
                  campo.key === "otrosEpps" ? (
                    <div key={campo.key} className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">{campo.label}</label>
                      <select name={campo.key} value={datos.otrosEpps} onChange={handleChange} className={selectClassName}>
                        <option value="">Seleccione una opción</option>
                        {opcionesCantidadOtrosEpps.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>

                      {datos.otrosEppsDetalle.length > 0 ? (
                        <div className="mt-5 grid gap-4">
                          {datos.otrosEppsDetalle.map((otroEpp, index) => (
                            <div key={`otro-epp-${index}`} className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="text-sm font-semibold italic text-slate-700">¿Cuál?</label>
                                <input
                                  value={otroEpp.cual}
                                  onChange={(event) => handleOtroEppChange(index, "cual", event.target.value)}
                                  placeholder={`Otro EPP ${index + 1}`}
                                  className={fieldClassName}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-slate-700">Condición</label>
                                <select
                                  value={otroEpp.condicion}
                                  onChange={(event) => handleOtroEppChange(index, "condicion", event.target.value)}
                                  className={selectClassName}
                                >
                                  <option value="">Seleccione una opción</option>
                                  {opcionesCondicion.map((opcion) => (
                                    <option key={opcion} value={opcion}>
                                      {opcion}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div key={campo.key}>
                      <label className="text-sm font-semibold text-slate-700">{campo.label}</label>
                      <select name={campo.key} value={datos[campo.key]} onChange={handleChange} className={selectClassName}>
                        <option value="">Seleccione una opción</option>
                        {opcionesCondicion.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Observaciones</label>
                  <textarea name="observaciones" value={datos.observaciones} onChange={handleChange} rows={3} placeholder="Registre observaciones si aplica" className={fieldClassName} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={handleAgregarRegistro} className="rounded-full bg-emerald-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                  {indiceEdicion !== null ? "Actualizar registro" : "Agregar"}
                </button>
                {indiceEdicion !== null ? (
                  <button type="button" onClick={limpiarCalificacion} className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    Cancelar edición
                  </button>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Resumen de EPPs calificados</h2>
              <p className="mt-1 text-sm text-slate-600">Revise los registros agregados antes de enviar el formulario.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase text-emerald-800">
              {registros.length} registro{registros.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-[1800px] w-full border-collapse text-xs">
              <thead className="bg-emerald-900 text-white">
                <tr>
                  <th rowSpan={2} className="w-[260px] border border-white/40 px-3 py-4 text-center uppercase">
                    Nombre y cargo del trabajador
                  </th>
                  {gruposTablaEpp.map((grupo) => (
                    <th key={grupo.label} colSpan={grupo.fields.length} className="border border-white/40 px-3 py-3 text-center uppercase">
                      {grupo.label}
                    </th>
                  ))}
                  <th rowSpan={2} className="w-[220px] border border-white/40 px-3 py-4 text-center uppercase">
                    Observaciones
                  </th>
                  <th rowSpan={2} className="w-[110px] border border-white/40 px-3 py-4 text-center uppercase">
                    Acción
                  </th>
                </tr>
                <tr>
                  {gruposTablaEpp.flatMap((grupo) =>
                    grupo.fields.map((campo) => (
                      <th key={campo.key} className="h-32 border border-white/40 px-2 py-3 text-center align-bottom uppercase">
                        <span className="inline-block max-h-28 [writing-mode:vertical-rl] rotate-180 leading-tight">{campo.label}</span>
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={camposEpp.length + 3} className="px-4 py-8 text-center text-sm text-slate-500">
                      Aún no hay registros agregados.
                    </td>
                  </tr>
                ) : (
                  registros.map((registro, index) => (
                    <tr key={`${registro.nombreColaborador}-${index}`} className="hover:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-3 align-top">
                        <div className="font-bold uppercase text-slate-900">{registro.nombreColaborador}</div>
                        <div className="mt-1 text-slate-600">{registro.cargoTrabajador}</div>
                      </td>
                      {gruposTablaEpp.flatMap((grupo) =>
                        grupo.fields.map((campo) => {
                          const valorOtrosEpps =
                            registro.otrosEppsDetalle.length > 0
                              ? registro.otrosEppsDetalle
                                  .map((item, itemIndex) => `${itemIndex + 1}. ${item.cual || "Sin nombre"} (${item.condicion || "Sin calificar"})`)
                                  .join(" | ")
                              : registro.otrosEpps || "-";

                          return (
                            <td key={`${index}-${campo.key}`} className="border border-slate-200 px-2 py-3 text-center font-semibold">
                              {campo.key === "otrosEpps" ? valorOtrosEpps : registro[campo.key] || "-"}
                            </td>
                          );
                        })
                      )}
                      <td className="border border-slate-200 px-3 py-3 align-top">{registro.observaciones || "-"}</td>
                      <td className="border border-slate-200 px-3 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button type="button" onClick={() => handleEditarRegistro(index)} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                            Editar
                          </button>
                          <button type="button" onClick={() => handleEliminarRegistro(index)} className="rounded-full bg-red-600 px-3 py-2 text-xs font-bold text-white">
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex justify-start">
          <button onClick={handleEnviarFormulario} className="rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
            Enviar formulario
          </button>
        </div>

      </div>
    </div>
  );
}
