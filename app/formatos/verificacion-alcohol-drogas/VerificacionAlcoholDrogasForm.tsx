"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Signature from "@uiw/react-signature";
import type { SignatureRef } from "@uiw/react-signature";

const METADATOS_FORMATO = {
  codigo: "HSE-F020",
  fecha: "2025-06-14",
  version: "05",
  area: "GESTIÓN HSE",
  titulo: "VERIFICACIÓN EN SITIO DE ALCOHOL Y DROGAS",
};

type TipoIdentificacion = "" | "CC - Cédula de Ciudadanía" | "CE - Cédula de Extranjería" | "TI - Tarjeta de Identidad" | "PAS - Pasaporte";
type EmpresaPersona = "" | "INCOMINERIA" | "OTRO";
type RespuestaSiNo = "" | "SI" | "NO";
type ResultadoPrueba = "" | "NEGATIVO" | "POSITIVO";

type DatosFormulario = {
  email: string;
  centroTrabajoSede: string;
  tipoPrueba: string;
  criteriosTomaMuestra: string;
  equipoUtiliza: string;
  tipoIdentificacionRealizaPrueba: TipoIdentificacion;
  identificacionRealizaPrueba: string;
  nombreRealizaPrueba: string;
  cargoRealizaPrueba: string;
  empresaPersonaEvaluada: EmpresaPersona;
  personaPrueba: string;
  numeroIdentificacionPersona: string;
  empresaContratistaPersona: string;
  cargoPersona: string;
  resultadoPrimeraPruebaInicial: ResultadoPrueba;
  gradoDetectado: string;
  imagenEvidenciaNombre: string;
  imagenEvidenciaUrl: string;
  firmaPersonaEvaluada: string;
  firmaPersonaEvaluadaRegistrada: boolean;
  hayTestigo: RespuestaSiNo;
  nombreTestigo: string;
  cargoTestigo: string;
  confirmar: string;
};

type RegistroPersona = DatosFormulario;

const datosIniciales: DatosFormulario = {
  email: "",
  centroTrabajoSede: "",
  tipoPrueba: "",
  criteriosTomaMuestra: "Todo el Personal",
  equipoUtiliza: "",
  tipoIdentificacionRealizaPrueba: "CC - Cédula de Ciudadanía",
  identificacionRealizaPrueba: "",
  nombreRealizaPrueba: "",
  cargoRealizaPrueba: "",
  empresaPersonaEvaluada: "",
  personaPrueba: "",
  numeroIdentificacionPersona: "",
  empresaContratistaPersona: "",
  cargoPersona: "",
  resultadoPrimeraPruebaInicial: "",
  gradoDetectado: "",
  imagenEvidenciaNombre: "",
  imagenEvidenciaUrl: "",
  firmaPersonaEvaluada: "",
  firmaPersonaEvaluadaRegistrada: false,
  hayTestigo: "",
  nombreTestigo: "",
  cargoTestigo: "",
  confirmar: "",
};

const campoTexto =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-md outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const campoSeleccion =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-md outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const etiquetaCampo = "text-xs font-bold italic uppercase text-slate-950";
const marcaObligatorio = <span className="text-red-600">*</span>;
const soloNumeros = (value: string) => value.replace(/\D/g, "");
const soloDecimal = (value: string) => value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const camposSinNumeros = new Set<keyof DatosFormulario>([
  "nombreRealizaPrueba",
  "cargoRealizaPrueba",
  "personaPrueba",
  "cargoPersona",
  "nombreTestigo",
  "cargoTestigo",
]);

const serializarFirma = (svg: SVGSVGElement) => {
  const firmaClonada = svg.cloneNode(true) as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  const ancho = Math.max(Math.round(svg.clientWidth || rect.width || 600), 600);
  const alto = Math.max(Math.round(svg.clientHeight || rect.height || 220), 220);

  firmaClonada.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  firmaClonada.setAttribute("width", String(ancho));
  firmaClonada.setAttribute("height", String(alto));
  if (!firmaClonada.getAttribute("viewBox")) {
    firmaClonada.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
  }

  return new XMLSerializer().serializeToString(firmaClonada);
};

export default function VerificacionAlcoholDrogasForm() {
  const [datos, setDatos] = useState<DatosFormulario>(datosIniciales);
  const [registros, setRegistros] = useState<RegistroPersona[]>([]);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);
  const [firmaTieneTrazo, setFirmaTieneTrazo] = useState(false);
  const [imagenInputKey, setImagenInputKey] = useState(0);
  const referenciaFirma = useRef<SignatureRef>(null);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const campo = name as keyof DatosFormulario;
    let siguienteValor = camposSinNumeros.has(campo) ? quitarNumeros(value) : value;
    if (campo === "identificacionRealizaPrueba" || campo === "numeroIdentificacionPersona") siguienteValor = soloNumeros(value);
    if (campo === "gradoDetectado") siguienteValor = soloDecimal(value);
    setDatos((prev) => ({ ...prev, [campo]: siguienteValor }));
  };

  const manejarCargaImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      setDatos((prev) => ({
        ...prev,
        imagenEvidenciaNombre: archivo.name,
        imagenEvidenciaUrl: String(lector.result || ""),
      }));
    };
    lector.readAsDataURL(archivo);
  };

  const manejarRadio = (campo: "empresaPersonaEvaluada" | "hayTestigo", value: EmpresaPersona | RespuestaSiNo) => {
    setDatos((prev) => ({
      ...prev,
      [campo]: value,
      ...(campo === "empresaPersonaEvaluada"
        ? {
            empresaContratistaPersona: value === "INCOMINERIA" ? "INCOMINERIA" : "",
          }
        : {}),
      ...(campo === "hayTestigo" && value === "NO"
        ? {
            nombreTestigo: "",
            cargoTestigo: "",
          }
        : {}),
    }));
  };

  const limpiarFirma = () => {
    referenciaFirma.current?.clear();
    setFirmaTieneTrazo(false);
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
    if (indiceEdicion !== null) {
      setRegistros((prev) =>
        prev.map((registro, index) =>
          index === indiceEdicion
            ? {
                ...registro,
                firmaPersonaEvaluada: firmaComoUrl,
                firmaPersonaEvaluadaRegistrada: true,
              }
            : registro
        )
      );
    }
    setDatos((prev) => ({
      ...prev,
      firmaPersonaEvaluada: firmaComoUrl,
      firmaPersonaEvaluadaRegistrada: true,
    }));
    setModalFirmaAbierto(false);
    setFirmaTieneTrazo(false);
  };

  const limpiarRegistro = () => {
    setDatos((prev) => ({
      ...datosIniciales,
      email: prev.email,
      centroTrabajoSede: prev.centroTrabajoSede,
      tipoPrueba: prev.tipoPrueba,
      criteriosTomaMuestra: prev.criteriosTomaMuestra,
      equipoUtiliza: prev.equipoUtiliza,
      tipoIdentificacionRealizaPrueba: prev.tipoIdentificacionRealizaPrueba,
      identificacionRealizaPrueba: prev.identificacionRealizaPrueba,
      nombreRealizaPrueba: prev.nombreRealizaPrueba,
      cargoRealizaPrueba: prev.cargoRealizaPrueba,
      empresaPersonaEvaluada: prev.empresaPersonaEvaluada,
      empresaContratistaPersona: prev.empresaPersonaEvaluada === "INCOMINERIA" ? "INCOMINERIA" : "",
    }));
    setIndiceEdicion(null);
    setFirmaTieneTrazo(false);
    setImagenInputKey((prev) => prev + 1);
    referenciaFirma.current?.clear();
  };

  const agregarRegistro = () => {
    if (
      !datos.email ||
      !datos.centroTrabajoSede ||
      !datos.tipoPrueba ||
      !datos.criteriosTomaMuestra ||
      !datos.equipoUtiliza ||
      !datos.identificacionRealizaPrueba ||
      !datos.nombreRealizaPrueba ||
      !datos.cargoRealizaPrueba ||
      !datos.empresaPersonaEvaluada ||
      !datos.personaPrueba ||
      !datos.numeroIdentificacionPersona ||
      !datos.empresaContratistaPersona ||
      !datos.cargoPersona ||
      !datos.resultadoPrimeraPruebaInicial ||
      !datos.gradoDetectado ||
      !datos.hayTestigo ||
      (datos.hayTestigo === "SI" && (!datos.nombreTestigo || !datos.cargoTestigo)) ||
      !datos.confirmar ||
      !datos.firmaPersonaEvaluadaRegistrada
    ) {
      alert("Complete los campos obligatorios y registre la firma antes de agregar.");
      return;
    }

    if (indiceEdicion !== null) {
      setRegistros((prev) => prev.map((registro, index) => (index === indiceEdicion ? { ...datos } : registro)));
    } else {
      setRegistros((prev) => [...prev, { ...datos }]);
    }

    limpiarRegistro();
  };

  const editarRegistro = (index: number) => {
    setDatos(registros[index]);
    setIndiceEdicion(index);
  };

  const editarFirmaRegistro = (index: number) => {
    setDatos(registros[index]);
    setIndiceEdicion(index);
    setFirmaTieneTrazo(false);
    setModalFirmaAbierto(true);
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
    datosGenerales: {
      email: registros[0]?.email || datos.email,
      centroTrabajoSede: registros[0]?.centroTrabajoSede || datos.centroTrabajoSede,
      tipoPrueba: registros[0]?.tipoPrueba || datos.tipoPrueba,
      criteriosTomaMuestra: registros[0]?.criteriosTomaMuestra || datos.criteriosTomaMuestra,
      equipoUtiliza: registros[0]?.equipoUtiliza || datos.equipoUtiliza,
      realizadoPor: {
        tipoIdentificacion: registros[0]?.tipoIdentificacionRealizaPrueba || datos.tipoIdentificacionRealizaPrueba,
        identificacion: registros[0]?.identificacionRealizaPrueba || datos.identificacionRealizaPrueba,
        nombre: registros[0]?.nombreRealizaPrueba || datos.nombreRealizaPrueba,
        cargo: registros[0]?.cargoRealizaPrueba || datos.cargoRealizaPrueba,
      },
    },
    totalRegistros: registros.length,
    registros: registros.map((registro, index) => ({
      numeroRegistro: index + 1,
      personaEvaluada: {
        opcion: registro.empresaPersonaEvaluada,
        nombre: registro.personaPrueba,
        numeroIdentificacion: registro.numeroIdentificacionPersona,
        empresaContratista: registro.empresaContratistaPersona,
        cargo: registro.cargoPersona,
        resultadoPrimeraPruebaInicial: registro.resultadoPrimeraPruebaInicial,
        gradoDetectadoMg100ml: registro.gradoDetectado,
        imagenEvidencia: {
          nombreArchivo: registro.imagenEvidenciaNombre,
          imagenAdjunta: Boolean(registro.imagenEvidenciaUrl),
          dataUrl: registro.imagenEvidenciaUrl,
        },
        firma: registro.firmaPersonaEvaluada,
        firmaRegistrada: registro.firmaPersonaEvaluadaRegistrada,
      },
      testigo: {
        hayTestigo: registro.hayTestigo,
        nombre: registro.nombreTestigo,
        cargo: registro.cargoTestigo,
        confirmar: registro.confirmar,
      },
    })),
  });

  const enviarFormulario = async () => {
    if (registros.length === 0) {
      alert("Agregue al menos un registro antes de enviar el formulario.");
      return;
    }

    if (!confirm("¿Confirmas el envío del formulario HSE-F020?")) return;
    const respuestaJson = construirRespuestaJson();

    try {
      const respuestaHttp = await fetch("/api/formatos/verificacion-alcohol-drogas/respuestas", {
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
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <section className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={etiquetaCampo}>Email {marcaObligatorio}</label>
                <input name="email" type="email" value={datos.email} onChange={manejarCambio} placeholder="example1@domain.com,example2@domain.com..." className={campoTexto} />
              </div>

              <div>
                <label className={etiquetaCampo}>Centro de trabajo / sede {marcaObligatorio}</label>
                <input name="centroTrabajoSede" value={datos.centroTrabajoSede} onChange={manejarCambio} className={campoTexto} />
              </div>

              <div>
                <label className={etiquetaCampo}>Tipo de prueba {marcaObligatorio}</label>
                <input name="tipoPrueba" value={datos.tipoPrueba} onChange={manejarCambio} className={campoTexto} />
              </div>

              <div>
                <label className={etiquetaCampo}>Criterios de toma de muestra {marcaObligatorio}</label>
                <input name="criteriosTomaMuestra" value={datos.criteriosTomaMuestra} onChange={manejarCambio} className={campoTexto} />
              </div>

              <div>
                <label className={etiquetaCampo}>Equipo que utiliza {marcaObligatorio}</label>
                <input name="equipoUtiliza" value={datos.equipoUtiliza} onChange={manejarCambio} className={campoTexto} />
              </div>

              <div>
                <label className={etiquetaCampo}>Tipo de identificación de quien realiza la prueba {marcaObligatorio}</label>
                <select name="tipoIdentificacionRealizaPrueba" value={datos.tipoIdentificacionRealizaPrueba} onChange={manejarCambio} className={campoSeleccion}>
                  <option value="">Seleccione una opción</option>
                  <option value="CC - Cédula de Ciudadanía">CC - Cédula de Ciudadanía</option>
                  <option value="CE - Cédula de Extranjería">CE - Cédula de Extranjería</option>
                  <option value="TI - Tarjeta de Identidad">TI - Tarjeta de Identidad</option>
                  <option value="PAS - Pasaporte">PAS - Pasaporte</option>
                </select>
              </div>

              <div>
                <label className={etiquetaCampo}>Identificación de quien realiza la prueba {marcaObligatorio}</label>
                <input name="identificacionRealizaPrueba" value={datos.identificacionRealizaPrueba} onChange={manejarCambio} inputMode="numeric" pattern="[0-9]*" className={campoTexto} />
              </div>

              <div>
                <label className={etiquetaCampo}>Nombre de quien realiza la prueba {marcaObligatorio}</label>
                <input name="nombreRealizaPrueba" value={datos.nombreRealizaPrueba} onChange={manejarCambio} className={campoTexto} />
              </div>

              <div>
                <label className={etiquetaCampo}>Cargo {marcaObligatorio}</label>
                <input name="cargoRealizaPrueba" value={datos.cargoRealizaPrueba} onChange={manejarCambio} className={campoTexto} />
              </div>
            </section>

            <div className="mt-8 flex justify-center">
              <h2 className="rounded-lg border border-emerald-700 bg-white px-4 py-2 text-sm font-bold uppercase text-emerald-950 shadow-md">
                Información general del personal al que se le realiza la prueba
              </h2>
            </div>

            <section className="mt-9 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className={etiquetaCampo}>Seleccione una opción {marcaObligatorio}</p>
                <div className="mt-3 flex flex-wrap gap-8 pl-4 text-xs font-medium uppercase text-slate-900">
                  {(["INCOMINERIA", "OTRO"] as EmpresaPersona[]).map((opcion) => (
                    <label key={opcion} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        checked={datos.empresaPersonaEvaluada === opcion}
                        onChange={() => manejarRadio("empresaPersonaEvaluada", opcion)}
                        className="size-4 accent-emerald-700"
                      />
                      {opcion}
                    </label>
                  ))}
                </div>
              </div>

              {datos.empresaPersonaEvaluada ? (
                <div className="grid gap-5 md:col-span-2 md:grid-cols-2">
                  <div>
                    <label className={etiquetaCampo}>Persona a la cual se le realiza la prueba {marcaObligatorio}</label>
                    <input name="personaPrueba" value={datos.personaPrueba} onChange={manejarCambio} className={campoTexto} />
                  </div>

                  <div>
                    <label className={etiquetaCampo}>Numero de identificacion {marcaObligatorio}</label>
                    <input
                      name="numeroIdentificacionPersona"
                      value={datos.numeroIdentificacionPersona}
                      onChange={manejarCambio}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={campoTexto}
                    />
                  </div>

                  <div>
                    <label className={etiquetaCampo}>Empresa o contratista {marcaObligatorio}</label>
                    <input
                      name="empresaContratistaPersona"
                      value={datos.empresaContratistaPersona}
                      onChange={manejarCambio}
                      readOnly={datos.empresaPersonaEvaluada === "INCOMINERIA"}
                      className={`${campoTexto} ${datos.empresaPersonaEvaluada === "INCOMINERIA" ? "bg-slate-100" : ""}`}
                    />
                  </div>

                  <div>
                    <label className={etiquetaCampo}>Cargo {marcaObligatorio}</label>
                    <input name="cargoPersona" value={datos.cargoPersona} onChange={manejarCambio} className={campoTexto} />
                  </div>

                  <div>
                    <label className={etiquetaCampo}>Resultado primera prueba inicial {marcaObligatorio}</label>
                    <select name="resultadoPrimeraPruebaInicial" value={datos.resultadoPrimeraPruebaInicial} onChange={manejarCambio} className={campoSeleccion}>
                      <option value="">Seleccione una opción</option>
                      <option value="NEGATIVO">NEGATIVO</option>
                      <option value="POSITIVO">POSITIVO</option>
                    </select>
                  </div>

                  <div>
                    <label className={etiquetaCampo}>Grado detectado en mg / 100ml {marcaObligatorio}</label>
                    <input
                      name="gradoDetectado"
                      value={datos.gradoDetectado}
                      onChange={manejarCambio}
                      inputMode="decimal"
                      placeholder="Solo numeros decimales"
                      className={campoTexto}
                    />
                  </div>

                  <div>
                    <label className={etiquetaCampo}>Imagen evidencia</label>
                    <input
                      key={imagenInputKey}
                      type="file"
                      accept="image/*"
                      onChange={manejarCargaImagen}
                      className="mt-3 block w-full text-sm text-slate-900 file:mr-4 file:rounded-none file:border file:border-slate-400 file:bg-white file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-950"
                    />
                    {datos.imagenEvidenciaNombre ? (
                      <p className="mt-2 text-xs font-semibold text-slate-600">{datos.imagenEvidenciaNombre}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                <div>
                  <p className="text-xs font-bold italic uppercase text-slate-900">Firma {marcaObligatorio}</p>
                  <p className="mt-1 text-sm text-slate-600">{datos.firmaPersonaEvaluadaRegistrada ? "Firma registrada" : "Pendiente de firma"}</p>
                </div>
                <button type="button" onClick={() => setModalFirmaAbierto(true)} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                  Clic para firmar
                </button>
              </div>

              <p className="pt-4 text-base text-slate-950 md:col-span-2">
                <span className="font-bold text-red-600">NOTA:</span> Será positivo cuando el resultado del{" "}
                <span className="text-red-600">"Grado Detectado"</span> sea igual o mayor a{" "}
                <span className="text-red-600">20mg / 100ml</span>
              </p>

              <div className="flex justify-center py-4 md:col-span-2">
                <button
                  type="button"
                  onClick={agregarRegistro}
                  className="rounded-xl border border-slate-300 bg-slate-200 px-10 py-4 text-sm font-bold uppercase tracking-wide text-slate-600 shadow-md transition hover:bg-slate-300"
                >
                  {indiceEdicion !== null ? "Actualizar datos" : "Agregar datos"}
                </button>
              </div>

              <div className="md:col-span-2">
                <p className={etiquetaCampo}>¿ Hay testigo ?</p>
                <div className="mt-3 flex flex-wrap gap-8 pl-4 text-xs font-medium uppercase text-slate-900">
                  {(["SI", "NO"] as RespuestaSiNo[]).map((opcion) => (
                    <label key={opcion} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        checked={datos.hayTestigo === opcion}
                        onChange={() => manejarRadio("hayTestigo", opcion)}
                        className="size-4 accent-emerald-700"
                      />
                      {opcion}
                    </label>
                  ))}
                </div>
              </div>

              {datos.hayTestigo === "SI" ? (
                <>
                  <div>
                    <label className={etiquetaCampo}>Nombre de testigo</label>
                    <input name="nombreTestigo" value={datos.nombreTestigo} onChange={manejarCambio} className={campoTexto} />
                  </div>

                  <div>
                    <label className={etiquetaCampo}>Cargo</label>
                    <input name="cargoTestigo" value={datos.cargoTestigo} onChange={manejarCambio} className={campoTexto} />
                  </div>
                </>
              ) : null}

              <div>
                <label className={etiquetaCampo}>Confirmar</label>
                <input name="confirmar" value={datos.confirmar} onChange={manejarCambio} className={campoTexto} />
              </div>
            </section>
          </div>

          {registros.length > 0 ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Registros agregados</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[1180px] table-fixed divide-y divide-slate-200 text-xs">
                  <colgroup>
                    <col className="w-[4%]" />
                    <col className="w-[17%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                    <col className="w-[15%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[7%]" />
                  </colgroup>
                  <thead className="bg-emerald-900 text-center text-white">
                    <tr>
                      <th className="px-3 py-3 italic">N°</th>
                      <th className="px-3 py-3 italic">Persona a la cual se le realiza la prueba</th>
                      <th className="px-3 py-3 italic">Numero de identificación</th>
                      <th className="px-3 py-3 italic">Empresa o contratista</th>
                      <th className="px-3 py-3 italic">Cargo</th>
                      <th className="px-3 py-3 italic">Resultado primera prueba inicial</th>
                      <th className="px-3 py-3 italic">Resultado segunda prueba confirmatoria</th>
                      <th className="px-3 py-3 italic">Imagen</th>
                      <th className="px-3 py-3 italic">Firma</th>
                      <th className="px-3 py-3 italic">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 bg-slate-50 text-center text-slate-950">
                    {registros.map((registro, index) => (
                      <tr key={`${registro.empresaPersonaEvaluada}-${index}`}>
                        <td className="border border-slate-300 px-3 py-3 font-semibold">{index + 1}</td>
                        <td className="border border-slate-300 px-3 py-3 uppercase">{registro.personaPrueba}</td>
                        <td className="border border-slate-300 px-3 py-3">{registro.numeroIdentificacionPersona}</td>
                        <td className="border border-slate-300 px-3 py-3 uppercase">{registro.empresaContratistaPersona}</td>
                        <td className="border border-slate-300 px-3 py-3 uppercase">{registro.cargoPersona}</td>
                        <td className="border border-slate-300 px-3 py-3">
                          <div>{registro.resultadoPrimeraPruebaInicial}</div>
                          <div className="text-[11px] text-slate-600">{registro.gradoDetectado} mg / 100ml</div>
                        </td>
                        <td className="border border-slate-300 px-3 py-3">-</td>
                        <td className="border border-slate-300 px-3 py-2">
                          {registro.imagenEvidenciaUrl ? (
                            <img src={registro.imagenEvidenciaUrl} alt="Imagen evidencia" className="mx-auto h-14 w-full object-contain" />
                          ) : (
                            "Sin Imagen"
                          )}
                        </td>
                        <td className="border border-slate-300 p-0">
                          {registro.firmaPersonaEvaluada ? (
                            <div className="flex h-20 w-full items-center justify-center overflow-hidden bg-slate-50 px-2 py-1">
                              <img src={registro.firmaPersonaEvaluada} alt="Firma registrada" className="h-full w-full object-contain contrast-200" />
                            </div>
                          ) : (
                            "Pendiente"
                          )}
                        </td>
                        <td className="border border-slate-300 px-2 py-3">
                          <div className="flex flex-wrap justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => editarFirmaRegistro(index)}
                              aria-label="Editar firma"
                              title="Editar firma"
                              className="grid size-7 place-items-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              <span aria-hidden="true" className="text-[15px] leading-none">✎</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarRegistro(index)}
                              aria-label="Eliminar celda"
                              title="Eliminar celda"
                              className="grid size-7 place-items-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              <span aria-hidden="true" className="text-[14px] leading-none">⌫</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                <h3 className="mt-1 text-xl font-semibold text-slate-950">Personal al que se le realiza la prueba</h3>
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
