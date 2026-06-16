"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Signature from "@uiw/react-signature";
import type { SignatureRef } from "@uiw/react-signature";
import { ClipboardList, Eye, HardHat, PenLine, ShieldCheck, Upload, UserCog, UsersRound } from "lucide-react";
import { enfocarYMostrarCampoFaltante } from "../components/campoFaltante";
import { limpiarFirmaParaJson, limpiarImagenParaJson, registrarJsonFinalFormulario } from "../components/jsonFormulario";

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
  resultadoSegundaPruebaConfirmatoria: ResultadoPrueba;
  gradoDetectadoSegundaPrueba: string;
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

const perfilRocaActual = {
  nombre: "KATHERIN MARIANA GOMEZ CEPEDA",
  cargo: "DESARROLLADOR JUNIOR",
  proceso: "GESTION DE TECNOLOGIA",
  compania: "INCOMINERIA S.A.S.",
};

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
  resultadoSegundaPruebaConfirmatoria: "",
  gradoDetectadoSegundaPrueba: "",
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
  "mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const campoSeleccion =
  "mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const etiquetaCampo = "text-xs font-bold uppercase tracking-wide text-slate-600";
const tarjetaSeccion = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/70";
const encabezadoSeccion = "flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5";
const iconoSeccion = "grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white";
const marcaObligatorio = <span className="text-red-600">*</span>;
const soloNumeros = (value: string) => value.replace(/\D/g, "");
const soloDecimal = (value: string) => value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const enfocarCampoFaltante = (id: string) => {
  enfocarYMostrarCampoFaltante(id);
};
const camposSinNumeros = new Set<keyof DatosFormulario>([
  "nombreRealizaPrueba",
  "cargoRealizaPrueba",
  "personaPrueba",
  "cargoPersona",
  "nombreTestigo",
  "cargoTestigo",
]);
const clasificarGradoAlcohol = (grado: string) => {
  const valor = Number(grado.replace(",", "."));
  if (!Number.isFinite(valor)) return "";
  if (valor < 20) return "NORMAL";
  if (valor < 40) return "GRADO CERO";
  if (valor <= 80) return "PRIMER GRADO";
  if (valor < 150) return "SEGUNDO GRADO";
  return "TERCER GRADO";
};

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
  const [evidenciaVisible, setEvidenciaVisible] = useState<{ url: string; nombre: string } | null>(null);
  const [firmaTieneTrazo, setFirmaTieneTrazo] = useState(false);
  const [imagenInputKey, setImagenInputKey] = useState(0);
  const referenciaFirma = useRef<SignatureRef>(null);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const campo = name as keyof DatosFormulario;
    let siguienteValor = camposSinNumeros.has(campo) ? quitarNumeros(value) : value;
    if (campo === "identificacionRealizaPrueba" || campo === "numeroIdentificacionPersona") siguienteValor = soloNumeros(value);
    if (campo === "gradoDetectado" || campo === "gradoDetectadoSegundaPrueba") siguienteValor = soloDecimal(value);
    setDatos((prev) => ({
      ...prev,
      [campo]: siguienteValor,
      ...(campo === "resultadoPrimeraPruebaInicial" && siguienteValor !== "POSITIVO"
        ? {
            resultadoSegundaPruebaConfirmatoria: "",
            gradoDetectadoSegundaPrueba: "",
            imagenEvidenciaNombre: "",
            imagenEvidenciaUrl: "",
          }
        : {}),
      ...(campo === "resultadoSegundaPruebaConfirmatoria" && siguienteValor !== "POSITIVO"
        ? {
            imagenEvidenciaNombre: "",
            imagenEvidenciaUrl: "",
          }
        : {}),
    }));
    if (
      (campo === "resultadoPrimeraPruebaInicial" && siguienteValor !== "POSITIVO") ||
      (campo === "resultadoSegundaPruebaConfirmatoria" && siguienteValor !== "POSITIVO")
    ) {
      setImagenInputKey((prev) => prev + 1);
    }
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
      const campoFirma = svg as unknown as HTMLElement;
      campoFirma.scrollIntoView({ behavior: "smooth", block: "center" });
      campoFirma.focus?.({ preventScroll: true });
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
    }));
    setIndiceEdicion(null);
    setFirmaTieneTrazo(false);
    setImagenInputKey((prev) => prev + 1);
    referenciaFirma.current?.clear();
  };

  const reiniciarFormularioCompleto = () => {
    setDatos(datosIniciales);
    setRegistros([]);
    setIndiceEdicion(null);
    setModalFirmaAbierto(false);
    setEvidenciaVisible(null);
    setFirmaTieneTrazo(false);
    setImagenInputKey((prev) => prev + 1);
    referenciaFirma.current?.clear();
  };

  const obtenerCamposFaltantesRegistro = () => {
    const camposFaltantes: string[] = [];

    if (!datos.email) camposFaltantes.push("email");
    if (!datos.centroTrabajoSede) camposFaltantes.push("centroTrabajoSede");
    if (!datos.tipoPrueba) camposFaltantes.push("tipoPrueba");
    if (!datos.criteriosTomaMuestra) camposFaltantes.push("criteriosTomaMuestra");
    if (!datos.equipoUtiliza) camposFaltantes.push("equipoUtiliza");
    if (!datos.tipoIdentificacionRealizaPrueba) camposFaltantes.push("tipoIdentificacionRealizaPrueba");
    if (!datos.identificacionRealizaPrueba) camposFaltantes.push("identificacionRealizaPrueba");
    if (!datos.nombreRealizaPrueba) camposFaltantes.push("nombreRealizaPrueba");
    if (!datos.cargoRealizaPrueba) camposFaltantes.push("cargoRealizaPrueba");
    if (!datos.empresaPersonaEvaluada) camposFaltantes.push("empresaPersonaEvaluada");
    if (!datos.personaPrueba) camposFaltantes.push("personaPrueba");
    if (!datos.numeroIdentificacionPersona) camposFaltantes.push("numeroIdentificacionPersona");
    if (!datos.empresaContratistaPersona) camposFaltantes.push("empresaContratistaPersona");
    if (!datos.cargoPersona) camposFaltantes.push("cargoPersona");
    if (!datos.resultadoPrimeraPruebaInicial) camposFaltantes.push("resultadoPrimeraPruebaInicial");
    if (!datos.gradoDetectado) camposFaltantes.push("gradoDetectado");
    if (datos.resultadoPrimeraPruebaInicial === "POSITIVO" && !datos.resultadoSegundaPruebaConfirmatoria) {
      camposFaltantes.push("resultadoSegundaPruebaConfirmatoria");
    }
    if (datos.resultadoPrimeraPruebaInicial === "POSITIVO" && !datos.gradoDetectadoSegundaPrueba) {
      camposFaltantes.push("gradoDetectadoSegundaPrueba");
    }
    if (datos.resultadoSegundaPruebaConfirmatoria === "POSITIVO" && !datos.imagenEvidenciaUrl) camposFaltantes.push("imagenEvidencia");
    if (!datos.firmaPersonaEvaluadaRegistrada) camposFaltantes.push("firmaPersonaEvaluada");
    if (!datos.hayTestigo) camposFaltantes.push("hayTestigo");
    if (datos.hayTestigo === "SI" && !datos.nombreTestigo) camposFaltantes.push("nombreTestigo");
    if (datos.hayTestigo === "SI" && !datos.cargoTestigo) camposFaltantes.push("cargoTestigo");
    if (datos.hayTestigo === "SI" && !datos.confirmar) camposFaltantes.push("confirmar");

    return camposFaltantes;
  };

  const agregarRegistro = () => {
    const camposFaltantes = obtenerCamposFaltantesRegistro();

    if (camposFaltantes.length > 0) {
      enfocarCampoFaltante(camposFaltantes[0]);
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
    registro: {
      fechaRegistro: new Date().toISOString(),
      usuarioEmail: registros[0]?.email || datos.email,
    },
    datosGenerales: {
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
        resultadoSegundaPruebaConfirmatoria: registro.resultadoSegundaPruebaConfirmatoria,
        gradoDetectadoSegundaPruebaMg100ml: registro.gradoDetectadoSegundaPrueba,
        imagenEvidencia:
          registro.resultadoSegundaPruebaConfirmatoria === "POSITIVO"
            ? limpiarImagenParaJson({
                nombreArchivo: registro.imagenEvidenciaNombre,
                dataUrl: registro.imagenEvidenciaUrl,
                carpeta: "evidencias",
                prefijo: `evidencia-alcohol-drogas-${index + 1}`,
              })
            : null,
        firmas: {
          firmaPersonaEvaluada: limpiarFirmaParaJson(registro.firmaPersonaEvaluada, `firma-persona-evaluada-${index + 1}`),
        },
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
      const camposFaltantes = obtenerCamposFaltantesRegistro();

      if (camposFaltantes.length > 0) {
        enfocarCampoFaltante(camposFaltantes[0]);
      } else {
        enfocarCampoFaltante("agregarRegistroAlcoholDrogas");
      }
      return;
    }

    if (!confirm("¿Confirmas el envío del formulario HSE-F020?")) return;
    const respuestaJson = construirRespuestaJson();
    registrarJsonFinalFormulario(respuestaJson);

    try {
      const respuestaHttp = await fetch("/api/formatos/verificacion-alcohol-drogas/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestaJson),
      });

      if (!respuestaHttp.ok) {
        throw new Error("No se pudo guardar la respuesta en JSON.");
      }

      await respuestaHttp.json();
      reiniciarFormularioCompleto();
    } catch (error) {
      console.error("Error guardando la respuesta en JSON:", error);
      alert("No se pudo guardar el archivo JSON. Revise la consola para más detalles.");
    }
  };

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
                      Verificación en sitio de alcohol y drogas
                    </h1>
                    <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-white">{METADATOS_FORMATO.codigo}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    Integrado en ROCA con personas evaluadas, testigos y responsables de verificación.
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
                  <p className="mt-2 text-sm font-bold text-slate-950">{registros.length > 0 ? "Listo para enviar" : "En diligenciamiento"}</p>
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

        <div className="border-t-2 border-blue-500 pt-8">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <section className={tarjetaSeccion}>
              <div className={encabezadoSeccion}>
                <div className="flex items-center gap-4">
                  <div className={iconoSeccion}>
                    <UserCog className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Datos del evaluador</h3>
                </div>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className={etiquetaCampo}>Email {marcaObligatorio}</label>
                  <input name="email" type="email" value={datos.email} onChange={manejarCambio} placeholder="nombre@empresa.co" className={campoTexto} />
                </div>

                <div>
                  <label className={etiquetaCampo}>Centro de trabajo / sede {marcaObligatorio}</label>
                  <input name="centroTrabajoSede" value={datos.centroTrabajoSede} onChange={manejarCambio} className={campoTexto} />
                </div>
              </div>
            </section>

            <section className={`${tarjetaSeccion} mt-7`}>
              <div className={encabezadoSeccion}>
                <div className="flex items-center gap-4">
                  <div className={iconoSeccion}>
                    <ClipboardList className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Detalles de la prueba</h3>
                </div>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className={etiquetaCampo}>Tipo de prueba {marcaObligatorio}</label>
                  <input name="tipoPrueba" value={datos.tipoPrueba} onChange={manejarCambio} className={campoTexto} />
                </div>

                <div>
                  <label className={etiquetaCampo}>Criterios de toma de muestra {marcaObligatorio}</label>
                  <select name="criteriosTomaMuestra" value={datos.criteriosTomaMuestra} onChange={manejarCambio} className={campoSeleccion}>
                    <option value="">Seleccione una opcion</option>
                    <option value="Todo el Personal">Todo el Personal</option>
                    <option value="Duda Razonable">Duda Razonable</option>
                    <option value="Aleatorio">Aleatorio</option>
                    <option value="Caso Especial">Caso Especial</option>
                  </select>
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

                <div className="md:col-span-2">
                  <label className={etiquetaCampo}>Cargo {marcaObligatorio}</label>
                  <input name="cargoRealizaPrueba" value={datos.cargoRealizaPrueba} onChange={manejarCambio} className={campoTexto} />
                </div>
              </div>
            </section>

            <section className={`${tarjetaSeccion} mt-7`}>
              <div className={encabezadoSeccion}>
                <div className="flex items-center gap-4">
                  <div className={iconoSeccion}>
                    <UsersRound className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Información general del personal al que se le realiza la prueba</h3>
                </div>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className={etiquetaCampo}>Seleccione una opción {marcaObligatorio}</p>
                  <div data-required-id="empresaPersonaEvaluada" className="mt-3 flex flex-wrap gap-3 text-sm font-semibold uppercase text-slate-600" tabIndex={-1}>
                    {(["INCOMINERIA", "OTRO"] as EmpresaPersona[]).map((opcion) => (
                      <label
                        key={opcion}
                        className={`inline-flex min-w-36 items-center gap-3 rounded-2xl border px-5 py-3 transition ${
                          datos.empresaPersonaEvaluada === opcion ? "border-emerald-800 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={datos.empresaPersonaEvaluada === opcion}
                          onChange={() => manejarRadio("empresaPersonaEvaluada", opcion)}
                          className="size-5 accent-emerald-800"
                        />
                        {opcion}
                      </label>
                    ))}
                  </div>
                </div>

                {datos.empresaPersonaEvaluada ? (
                  <>
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

                    {datos.resultadoPrimeraPruebaInicial === "POSITIVO" ? (
                      <>
                        <div>
                          <label className={etiquetaCampo}>Resultado segunda prueba confirmatoria {marcaObligatorio}</label>
                          <select
                            name="resultadoSegundaPruebaConfirmatoria"
                            value={datos.resultadoSegundaPruebaConfirmatoria}
                            onChange={manejarCambio}
                            className={campoSeleccion}
                          >
                            <option value="">Seleccione una opción</option>
                            <option value="NEGATIVO">NEGATIVO</option>
                            <option value="POSITIVO">POSITIVO</option>
                          </select>
                        </div>

                        <div>
                          <label className={etiquetaCampo}>Grado detectado en mg / 100ml {marcaObligatorio}</label>
                          <input
                            name="gradoDetectadoSegundaPrueba"
                            value={datos.gradoDetectadoSegundaPrueba}
                            onChange={manejarCambio}
                            inputMode="decimal"
                            placeholder="Solo numeros decimales"
                            className={campoTexto}
                          />
                        </div>
                      </>
                    ) : null}

                    {datos.resultadoSegundaPruebaConfirmatoria === "POSITIVO" ? (
                      <div className="md:col-span-2" data-required-id="imagenEvidencia" tabIndex={-1}>
                        <label className={etiquetaCampo}>Imagen evidencia {marcaObligatorio}</label>
                        <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center">
                          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-900">
                            <Upload className="size-5" aria-hidden="true" />
                          </div>
                          <input
                            key={imagenInputKey}
                            type="file"
                            accept="image/*"
                            onChange={manejarCargaImagen}
                            className="block w-full text-sm text-slate-900 file:mr-4 file:rounded-xl file:border file:border-slate-200 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                          />
                        </div>
                        {datos.imagenEvidenciaNombre ? (
                          <p className="mt-2 text-xs font-semibold text-slate-600">{datos.imagenEvidenciaNombre}</p>
                        ) : null}
                      </div>
                    ) : null}

                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-slate-700">
                      <PenLine className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                    <p className="text-xs font-bold italic uppercase text-slate-900">Firma {marcaObligatorio}</p>
                    <p className="mt-1 text-sm text-slate-600">{datos.firmaPersonaEvaluadaRegistrada ? "Firma registrada" : "Pendiente de firma"}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setModalFirmaAbierto(true)} data-required-id="firmaPersonaEvaluada" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white sm:w-auto">
                    Clic para firmar
                  </button>
                </div>

                <p className="pt-4 text-base text-slate-950 md:col-span-2">
                  <span className="font-bold text-red-600">NOTA:</span> Será positivo cuando el resultado del{" "}
                  <span className="text-red-600">"Grado Detectado"</span> sea igual o mayor a{" "}
                  <span className="text-red-600">20mg / 100ml</span>
                </p>
                  </>
                ) : null}
              </div>
            </section>

            <section className={`${tarjetaSeccion} mt-7`}>
              <div className={encabezadoSeccion}>
                <div className="flex items-center gap-4">
                  <div className={iconoSeccion}>
                    <ShieldCheck className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Testigo y cierre</h3>
                </div>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className={etiquetaCampo}>¿ Hay testigo ?</p>
                  <div data-required-id="hayTestigo" className="mt-3 flex flex-wrap gap-3 text-sm font-semibold uppercase text-slate-600" tabIndex={-1}>
                    {(["SI", "NO"] as RespuestaSiNo[]).map((opcion) => (
                      <label
                        key={opcion}
                        className={`inline-flex min-w-28 items-center gap-3 rounded-2xl border px-5 py-3 transition ${
                          datos.hayTestigo === opcion ? "border-emerald-800 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={datos.hayTestigo === opcion}
                          onChange={() => manejarRadio("hayTestigo", opcion)}
                          className="size-5 accent-emerald-800"
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

                <div className="md:col-span-2">
                  <label className={etiquetaCampo}>Confirmar</label>
                  <input name="confirmar" value={datos.confirmar} onChange={manejarCambio} className={campoTexto} />
                </div>

                <div className="flex justify-center py-4 md:col-span-2">
                  <button
                    type="button"
                    onClick={agregarRegistro}
                    data-required-id="agregarRegistroAlcoholDrogas"
                    className="rounded-xl border border-slate-300 bg-slate-200 px-10 py-4 text-sm font-bold uppercase tracking-wide text-slate-600 shadow-md transition hover:bg-slate-300"
                  >
                    {indiceEdicion !== null ? "Actualizar datos" : "Agregar datos"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {registros.length > 0 ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Registros agregados</h2>
              <div className="mt-4 grid gap-4 md:hidden">
                {registros.map((registro, index) => (
                  <article key={`mobile-${registro.empresaPersonaEvaluada}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-emerald-800">N° {index + 1}</p>
                        <h3 className="mt-1 text-base font-bold uppercase text-slate-950">{registro.personaPrueba}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">{registro.cargoPersona}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => editarFirmaRegistro(index)}
                          aria-label="Editar firma"
                          title="Editar firma"
                          className="grid size-8 place-items-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <span aria-hidden="true" className="text-[15px] leading-none">✎</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarRegistro(index)}
                          aria-label="Eliminar celda"
                          title="Eliminar celda"
                          className="grid size-8 place-items-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <span aria-hidden="true" className="text-[14px] leading-none">⌫</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">Numero de identificación</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{registro.numeroIdentificacionPersona}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">Empresa o contratista</p>
                        <p className="mt-1 text-sm font-semibold uppercase text-slate-950">{registro.empresaContratistaPersona}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">Resultado primera prueba inicial</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{registro.resultadoPrimeraPruebaInicial}</p>
                        <p className="text-[11px] text-slate-600">{registro.gradoDetectado} mg / 100ml</p>
                        <p className="text-[11px] font-semibold uppercase text-slate-950">{clasificarGradoAlcohol(registro.gradoDetectado)}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">Resultado segunda prueba confirmatoria</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{registro.resultadoSegundaPruebaConfirmatoria || "-"}</p>
                        {registro.gradoDetectadoSegundaPrueba ? (
                          <>
                            <p className="text-[11px] text-slate-600">{registro.gradoDetectadoSegundaPrueba} mg / 100ml</p>
                            <p className="text-[11px] font-semibold uppercase text-slate-950">{clasificarGradoAlcohol(registro.gradoDetectadoSegundaPrueba)}</p>
                          </>
                        ) : null}
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">Imagen evidencia</p>
                        {registro.imagenEvidenciaUrl ? (
                          <button
                            type="button"
                            onClick={() => setEvidenciaVisible({ url: registro.imagenEvidenciaUrl, nombre: registro.imagenEvidenciaNombre || "Imagen evidencia" })}
                            aria-label="Ver imagen evidencia"
                            title="Ver imagen evidencia"
                            className="mt-2 inline-flex size-10 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm transition hover:bg-emerald-800"
                          >
                            <Eye className="size-5" aria-hidden="true" />
                          </button>
                        ) : (
                          <p className="mt-1 text-sm font-semibold text-slate-950">-</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">Firma</p>
                        {registro.firmaPersonaEvaluada ? (
                          <div className="mt-2 flex h-24 w-full items-center justify-center overflow-hidden bg-slate-50 px-2 py-1">
                            <img src={registro.firmaPersonaEvaluada} alt="Firma registrada" className="h-full w-full object-contain contrast-200" />
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-slate-600">Pendiente</p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4 hidden md:block">
                <table className="w-full table-fixed divide-y divide-slate-200 text-xs">
                  <colgroup>
                    <col className="w-[4%]" />
                    <col className="w-[17%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[7%]" />
                  </colgroup>
                  <thead className="bg-emerald-900 text-center text-white">
                    <tr>
                      <th className="px-2 py-3 italic">N°</th>
                      <th className="px-2 py-3 italic">Persona a la cual se le realiza la prueba</th>
                      <th className="px-2 py-3 italic">Numero de identificación</th>
                      <th className="px-2 py-3 italic">Empresa o contratista</th>
                      <th className="px-2 py-3 italic">Cargo</th>
                      <th className="px-2 py-3 italic">Resultado primera prueba inicial</th>
                      <th className="px-2 py-3 italic">Resultado segunda prueba confirmatoria</th>
                      <th className="px-2 py-3 italic">Imagen evidencia</th>
                      <th className="px-2 py-3 italic">Firma</th>
                      <th className="px-2 py-3 italic">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 bg-slate-50 text-center text-slate-950">
                    {registros.map((registro, index) => (
                      <tr key={`${registro.empresaPersonaEvaluada}-${index}`}>
                        <td className="border border-slate-300 px-2 py-3 font-semibold">{index + 1}</td>
                        <td className="break-words border border-slate-300 px-2 py-3 uppercase">{registro.personaPrueba}</td>
                        <td className="break-words border border-slate-300 px-2 py-3">{registro.numeroIdentificacionPersona}</td>
                        <td className="break-words border border-slate-300 px-2 py-3 uppercase">{registro.empresaContratistaPersona}</td>
                        <td className="break-words border border-slate-300 px-2 py-3 uppercase">{registro.cargoPersona}</td>
                        <td className="border border-slate-300 px-2 py-3">
                          <div>{registro.resultadoPrimeraPruebaInicial}</div>
                          <div className="text-[11px] text-slate-600">{registro.gradoDetectado} mg / 100ml</div>
                          <div className="text-[11px] font-semibold uppercase text-slate-950">{clasificarGradoAlcohol(registro.gradoDetectado)}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-3">
                          <div>{registro.resultadoSegundaPruebaConfirmatoria || "-"}</div>
                          {registro.gradoDetectadoSegundaPrueba ? (
                            <>
                              <div className="text-[11px] text-slate-600">{registro.gradoDetectadoSegundaPrueba} mg / 100ml</div>
                              <div className="text-[11px] font-semibold uppercase text-slate-950">{clasificarGradoAlcohol(registro.gradoDetectadoSegundaPrueba)}</div>
                            </>
                          ) : null}
                        </td>
                        <td className="border border-slate-300 p-0">
                          {registro.imagenEvidenciaUrl ? (
                            <button
                              type="button"
                              onClick={() => setEvidenciaVisible({ url: registro.imagenEvidenciaUrl, nombre: registro.imagenEvidenciaNombre || "Imagen evidencia" })}
                              aria-label="Ver imagen evidencia"
                              title="Ver imagen evidencia"
                              className="mx-auto my-3 grid size-9 place-items-center rounded-full bg-emerald-700 text-white shadow-sm transition hover:bg-emerald-800"
                            >
                              <Eye className="size-5" aria-hidden="true" />
                            </button>
                          ) : (
                            "-"
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

      {evidenciaVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-2xl">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Imagen evidencia</p>
                <h3 className="mt-1 break-words text-lg font-semibold text-slate-950">{evidenciaVisible.nombre}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEvidenciaVisible(null)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
            <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-auto bg-slate-50 p-4">
              <img src={evidenciaVisible.url} alt={evidenciaVisible.nombre} className="max-h-[72vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}

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



