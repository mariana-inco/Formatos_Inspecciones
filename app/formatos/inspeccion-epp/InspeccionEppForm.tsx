"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Signature from "@uiw/react-signature";
import type { SignatureRef } from "@uiw/react-signature";
import {
  Check,
  ClipboardList,
  Ear,
  EarOff,
  Flame,
  Footprints,
  Glasses,
  Hand,
  HardHat,
  Minus,
  Pencil,
  PlusCircle,
  Shield,
  Shirt,
  Trash2,
  TriangleAlert,
  UserCog,
  UsersRound,
  Wind,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { enfocarYMostrarCampoFaltante } from "../components/campoFaltante";
import {
  esperarVisualizacionJsonEnConsola,
  limpiarFirmaParaJson,
  mapRevisionToId,
  registrarJsonFinalFormulario,
} from "../components/jsonFormulario";
import { perfilRocaActual } from "../config/perfilRoca";
import { FORM_META, camposEpp, gruposTablaEpp, opcionesCondicion } from "./data";
import type { CampoEpp, CampoEppKey, CondicionEpp } from "./data";

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
  firmaColaborador: string;
  firmaRegistrada: boolean;
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
  firmaColaborador: "",
  firmaRegistrada: false,
};

const dateInputClassName =
  "date-input mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none [color-scheme:light] focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const fieldClassName =
  "mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const tarjetaSeccion = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/70";
const encabezadoSeccion = "flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-5 py-5";
const iconoSeccion = "grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white";
const requiredMark = <span className="text-red-600">*</span>;
const quitarNumeros = (value: string) => value.replace(/[0-9]/g, "");
const camposSinNumeros = new Set<keyof DatosFormulario>(["nombreColaborador", "cargoTrabajador"]);
const enfocarCampoFaltante = (id: string) => {
  enfocarYMostrarCampoFaltante(id);
};
const etiquetaCondicion = (condicion: CondicionEpp) => {
  if (condicion === "BUENO") return "Bueno";
  if (condicion === "REGULAR") return "Regular";
  if (condicion === "MALO") return "Malo";
  return "N/A";
};
const etiquetaCondicionId = (condicionId: number | null | undefined) => {
  if (condicionId === 1) return "Bueno";
  if (condicionId === 2) return "Regular";
  if (condicionId === 3) return "Malo";
  return "N/A";
};
const estiloBotonCondicion = (condicion: CondicionEpp, seleccionado: boolean) => {
  if (!seleccionado) {
    return "border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-slate-300 hover:bg-slate-50";
  }

  if (condicion === "BUENO") return "border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm";
  if (condicion === "REGULAR") return "border border-amber-300 bg-amber-100 text-amber-800 shadow-sm";
  if (condicion === "MALO") return "border border-red-300 bg-red-100 text-red-800 shadow-sm";
  return "border border-slate-700 bg-slate-700 text-white shadow-sm ring-2 ring-slate-400";
};
const iconosEpp: Partial<Record<CampoEppKey, LucideIcon>> = {
  casco: HardHat,
  caretaEsmerilar: Shield,
  caretaSoldadura: Flame,
  monogafas: Glasses,
  copa: Ear,
  insercion: EarOff,
  guantePoliuretano: Hand,
  guanteCaucho: Hand,
  guanteNitrilo: Hand,
  guanteVaqueta: Hand,
  mangaCarnaza: Shirt,
  guantesSoldador: Hand,
  mascarillaPolvoM10: Wind,
  respiradorMediaCara: Wind,
  petoCarnaza: Shield,
  botaCaucho: Footprints,
  botasSeguridad: Footprints,
  botaSoldador: Footprints,
};
const estilosGrupoTabla = [
  { line: "bg-emerald-300", border: "border-l-emerald-300" },
  { line: "bg-cyan-300", border: "border-l-cyan-300" },
  { line: "bg-lime-300", border: "border-l-lime-300" },
  { line: "bg-sky-300", border: "border-l-sky-300" },
  { line: "bg-amber-300", border: "border-l-amber-300" },
  { line: "bg-teal-300", border: "border-l-teal-300" },
];
const obtenerIconoEpp = (campo: CampoEpp) => iconosEpp[campo.key] ?? Shield;
const obtenerEstiloGrupo = (index: number) => estilosGrupoTabla[index % estilosGrupoTabla.length];
const obtenerCondicionRegistro = (registro: RegistroEpp, campo: CampoEpp) => registro[campo.key] as CondicionEpp;
const camposResumenEpp = gruposTablaEpp.flatMap((grupo) => grupo.fields);
const contarCondicionesRegistro = (registro: RegistroEpp) =>
  camposResumenEpp.reduce(
    (total, campo) => {
      const condicion = obtenerCondicionRegistro(registro, campo);
      if (condicion === "BUENO") total.buenos += 1;
      if (condicion === "REGULAR") total.regulares += 1;
      if (condicion === "MALO") total.malos += 1;
      return total;
    },
    { buenos: 0, regulares: 0, malos: 0 }
  );
const EstadoBadge = ({ condicion, compacto = false }: { condicion: CondicionEpp; compacto?: boolean }) => {
  const estado =
    condicion === "BUENO"
      ? { label: "Bueno", icon: Check, className: "bg-emerald-100 text-emerald-800 ring-emerald-200" }
      : condicion === "REGULAR"
        ? { label: "Regular", icon: TriangleAlert, className: "bg-amber-100 text-amber-800 ring-amber-200" }
        : condicion === "MALO"
          ? { label: "Malo", icon: X, className: "bg-red-100 text-red-800 ring-red-200" }
          : { label: "N/A", icon: Minus, className: "bg-slate-100 text-slate-600 ring-slate-200" };
  const Icono = estado.icon;

  return (
    <span
      title={estado.label}
      aria-label={estado.label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-bold ring-1 ${estado.className} ${
        compacto ? "size-9 p-0" : "px-3 py-1.5 text-xs"
      }`}
    >
      <Icono className="size-4" aria-hidden="true" />
      {compacto ? <span className="sr-only">{estado.label}</span> : estado.label}
    </span>
  );
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

export default function InspeccionEppForm() {
  const router = useRouter();
  const [datos, setDatos] = useState<DatosFormulario>(datosIniciales);
  const [registros, setRegistros] = useState<RegistroEpp[]>([]);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);
  const [firmaTieneTrazo, setFirmaTieneTrazo] = useState(false);
  const referenciaFirma = useRef<SignatureRef>(null);

  const obtenerOpcionesCondicionVisibles = (condicionSeleccionada: CondicionEpp) =>
    condicionSeleccionada ? [condicionSeleccionada] : opcionesCondicion;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof DatosFormulario;
    const nextValue = camposSinNumeros.has(fieldName) ? quitarNumeros(value) : value;

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

  const handleAgregarOtroEpp = () => {
    setDatos((prev) => ({
      ...prev,
      otrosEpps: String(prev.otrosEppsDetalle.length + 1),
      otrosEppsDetalle: [...prev.otrosEppsDetalle, { cual: "", condicion: "" }],
    }));
  };

  const handleEliminarOtroEpp = (index: number) => {
    setDatos((prev) => {
      const otrosEppsDetalle = prev.otrosEppsDetalle.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...prev,
        otrosEpps: otrosEppsDetalle.length > 0 ? String(otrosEppsDetalle.length) : "",
        otrosEppsDetalle,
      };
    });
  };

  const handleCondicionEpp = (campo: CampoEppKey, condicion: CondicionEpp) => {
    setDatos((prev) => ({ ...prev, [campo]: prev[campo] === condicion ? "" : condicion }));
  };

  const handleCondicionOtroEpp = (index: number, condicion: CondicionEpp) => {
    setDatos((prev) => ({
      ...prev,
      otrosEppsDetalle: prev.otrosEppsDetalle.map((item, itemIndex) =>
        itemIndex === index ? { ...item, condicion: item.condicion === condicion ? "" : condicion } : item
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
    setFirmaTieneTrazo(false);
    referenciaFirma.current?.clear();
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
    setDatos((prev) => ({ ...prev, firmaColaborador: firmaComoUrl, firmaRegistrada: true }));
    setModalFirmaAbierto(false);
    setFirmaTieneTrazo(false);
  };

  const obtenerCamposFaltantesRegistro = () => {
    const camposFaltantes: string[] = [];

    if (!datos.email) camposFaltantes.push("email");
    if (!datos.fechaInspeccion) camposFaltantes.push("fechaInspeccion");
    if (!datos.lugar) camposFaltantes.push("lugar");
    if (!datos.areaTrabajo) camposFaltantes.push("areaTrabajo");
    if (!datos.nombreColaborador) camposFaltantes.push("nombreColaborador");
    if (!datos.cargoTrabajador) camposFaltantes.push("cargoTrabajador");
    if (!datos.firmaRegistrada) camposFaltantes.push("firmaColaborador");

    datos.otrosEppsDetalle.forEach((otroEpp, index) => {
      if (!otroEpp.cual) camposFaltantes.push(`otroEppCual-${index}`);
      if (!otroEpp.condicion) camposFaltantes.push(`otroEppCondicion-${index}`);
    });

    return camposFaltantes;
  };

  const handleAgregarRegistro = () => {
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
    registro: {
      fechaRegistro: new Date().toISOString(),
      usuarioEmail: registros[0]?.email || datos.email,
    },
    datosGenerales: {
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
        condicionId: mapRevisionToId(registro[campo.key] || ""),
      })),
      otrosEpps: {
        cantidad: Number(registro.otrosEpps || 0),
        detalle: registro.otrosEppsDetalle.map((otroEpp, otroIndex) => ({
          numeroRegistro: otroIndex + 1,
          cual: otroEpp.cual,
          condicionId: mapRevisionToId(otroEpp.condicion),
        })),
      },
      observaciones: registro.observaciones,
      firmas: {
        firmaColaborador: limpiarFirmaParaJson(registro.firmaColaborador, `firma-colaborador-${index + 1}`),
      },
    })),
  });

  const handleEnviarFormulario = async () => {
    if (registros.length === 0) {
      const camposFaltantes = obtenerCamposFaltantesRegistro();

      if (camposFaltantes.length > 0) {
        enfocarCampoFaltante(camposFaltantes[0]);
      } else {
        enfocarCampoFaltante("agregarRegistroEpp");
      }
      return;
    }

    if (!confirm("¿Confirmas el envío del formulario HSE-F002?")) return;
    const respuestaJson = buildRespuestaJson();
    registrarJsonFinalFormulario(respuestaJson);

    try {
      const response = await fetch("/api/formatos/inspeccion-epp/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestaJson),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la respuesta en JSON.");
      }

      await response.json();
      router.refresh();
      await esperarVisualizacionJsonEnConsola();
      router.push("/formatos");
    } catch (error) {
      console.error("Error guardando la respuesta en JSON:", error);
      alert("No se pudo guardar el archivo JSON. Revise la consola para más detalles.");
    }
  };

  const renderOtrosEpps = () => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-950">Otros EPPs</p>
          <p className="mt-1 text-sm font-medium text-slate-500">Agregue solo los elementos adicionales que apliquen.</p>
        </div>
        <button
          type="button"
          onClick={handleAgregarOtroEpp}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 sm:w-auto"
        >
          <PlusCircle className="size-4" aria-hidden="true" />
          Agregar otro EPP
        </button>
      </div>

      {datos.otrosEppsDetalle.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {datos.otrosEppsDetalle.map((otroEpp, index) => (
            <div key={`otro-epp-${index}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-bold uppercase text-slate-700">Otro EPP {index + 1}</p>
                <button
                  type="button"
                  onClick={() => handleEliminarOtroEpp(index)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase text-red-700 transition hover:bg-red-100 sm:w-auto"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Eliminar
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-end">
                <div>
                  <label className="text-sm font-semibold italic text-slate-700">¿Cuál?</label>
                  <input
                    data-required-id={`otroEppCual-${index}`}
                    value={otroEpp.cual}
                    onChange={(event) => handleOtroEppChange(index, "cual", event.target.value)}
                    placeholder={`Ej: Arnés, careta, línea de vida`}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Condición</label>
                  <div
                    data-required-id={`otroEppCondicion-${index}`}
                    className="mt-2 flex w-full flex-wrap gap-1.5 rounded-xl bg-blue-50 p-1 text-[11px] font-semibold text-slate-900 lg:w-fit"
                  >
                    {obtenerOpcionesCondicionVisibles(otroEpp.condicion).map((opcion) => {
                      const seleccionado = otroEpp.condicion === opcion;
                      return (
                        <button
                          key={`otro-epp-${index}-${opcion}`}
                          type="button"
                          onClick={() => handleCondicionOtroEpp(index, opcion)}
                          aria-pressed={seleccionado}
                          className={`min-w-11 rounded-lg px-3 py-2 transition ${estiloBotonCondicion(opcion, seleccionado)}`}
                        >
                          {etiquetaCondicion(opcion)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-center">
          <p className="text-sm font-semibold text-slate-500">No hay otros EPPs agregados.</p>
        </div>
      )}
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
                      Inspección de elementos de protección personal
                    </h1>
                    <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-white">{FORM_META.codigo}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    Integrado en ROCA con colaboradores firmantes y responsables de revisión.
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
                  <p className="mt-2 text-sm font-bold uppercase text-slate-950">{FORM_META.version}</p>
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
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Registro de inspección EPP</h2>
              <p className="mt-1 text-sm text-slate-600">Complete los datos generales y califique la condición de los elementos de protección personal.</p>
            </div>

            <section className={tarjetaSeccion}>
              <div className={encabezadoSeccion}>
                <div className={iconoSeccion}>
                  <UserCog className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Datos generales</h3>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Correo electrónico {requiredMark}</label>
                  <input name="email" type="email" value={datos.email} onChange={handleChange} placeholder="usuario@empresa.com" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Lugar {requiredMark}</label>
                  <input name="lugar" value={datos.lugar} onChange={handleChange} placeholder="Ej: Mina principal" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Fecha de inspección {requiredMark}</label>
                  <input name="fechaInspeccion" type="date" value={datos.fechaInspeccion} onChange={handleChange} aria-label="Seleccione una fecha de inspección" className={dateInputClassName} />
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

            <section className={`${tarjetaSeccion} mt-5`}>
              <div className={encabezadoSeccion}>
                <div className={iconoSeccion}>
                  <UsersRound className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Datos del colaborador</h3>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nombre del colaborador {requiredMark}</label>
                  <input name="nombreColaborador" value={datos.nombreColaborador} onChange={handleChange} placeholder="Nombre completo" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Cargo del trabajador {requiredMark}</label>
                  <input name="cargoTrabajador" value={datos.cargoTrabajador} onChange={handleChange} placeholder="Ej: Operador" className={fieldClassName} />
                </div>
              </div>
            </section>

            <section className={`${tarjetaSeccion} mt-5`}>
              <div className={encabezadoSeccion}>
                <div className={iconoSeccion}>
                  <Shield className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide text-slate-950">Califique la condición del EPP</h3>
              </div>
              <div className="grid w-full gap-4 px-5 py-5">
                <div className="w-full space-y-5">
                  {gruposTablaEpp.map((grupo) => (
                    <section key={grupo.label} className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                      <div className="bg-emerald-800 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white">
                        {grupo.label}
                      </div>
                      <div className="grid gap-4 p-4 lg:grid-cols-2">
                        {grupo.fields.map((campo) =>
                          campo.key === "otrosEpps" ? (
                            <div key={campo.key} className="lg:col-span-2">{renderOtrosEpps()}</div>
                          ) : (
                            <div key={campo.key} className="grid min-h-[92px] min-w-0 gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-3 sm:grid-cols-[minmax(160px,1fr)_minmax(0,360px)] sm:items-center">
                              <p className="text-xs font-bold uppercase text-slate-950">{campo.label}</p>
                              <div
                                className="grid w-full min-w-0 grid-cols-2 gap-2 rounded-xl bg-blue-50 p-1.5 text-xs font-semibold text-slate-900 min-[520px]:grid-cols-4"
                              >
                                {obtenerOpcionesCondicionVisibles(datos[campo.key] as CondicionEpp).map((opcion) => {
                                  const seleccionado = datos[campo.key] === opcion;
                                  return (
                                    <button
                                      key={`${campo.key}-${opcion}`}
                                      type="button"
                                      onClick={() => handleCondicionEpp(campo.key, opcion)}
                                      aria-pressed={seleccionado}
                                      className={`min-h-10 min-w-0 rounded-lg px-2 py-2 text-center transition ${estiloBotonCondicion(opcion, seleccionado)}`}
                                    >
                                      {etiquetaCondicion(opcion)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  ))}

                  {renderOtrosEpps()}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Observaciones</label>
                  <textarea name="observaciones" value={datos.observaciones} onChange={handleChange} rows={3} placeholder="Registre observaciones si aplica" className={fieldClassName} />
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                  <div>
                    <p className="text-xs font-bold italic uppercase text-slate-900">Firma {requiredMark}</p>
                    <p className="mt-1 text-sm text-slate-600">{datos.firmaRegistrada ? "Firma registrada" : "Pendiente de firma"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFirmaTieneTrazo(false);
                      setModalFirmaAbierto(true);
                    }}
                    data-required-id="firmaColaborador"
                    className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white sm:w-auto"
                  >
                    Clic para firmar
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={handleAgregarRegistro} data-required-id="agregarRegistroEpp" className="rounded-full bg-emerald-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
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

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Resumen de EPPs calificados</h2>
              <p className="mt-1 text-sm text-slate-600">Revise los registros agregados antes de enviar el formulario.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-4 py-2 text-xs font-bold uppercase text-emerald-800">
              <ClipboardList className="size-4" aria-hidden="true" />
              {registros.length} registro{registros.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-4">
            {registros.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
                <PlusCircle className="mx-auto size-10 text-emerald-700" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-slate-600">Aún no hay registros agregados.</p>
                <button type="button" onClick={() => enfocarCampoFaltante("nombreColaborador")} className="mt-4 rounded-full bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800">
                  Agregar el primer registro
                </button>
              </div>
            ) : (
              registros.map((registro, index) => {
                const totales = contarCondicionesRegistro(registro);
                return (
                  <article key={`card-${registro.nombreColaborador}-${index}`} className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <aside className="space-y-4">
                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="border-b border-slate-200 pb-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Estado global</p>
                          <h3 className="mt-2 text-sm font-bold uppercase leading-5 text-slate-950">{registro.nombreColaborador}</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-600">{registro.cargoTrabajador}</p>
                        </div>
                        <div className="mt-3 space-y-2 text-xs font-bold">
                          <div className="flex items-center justify-between gap-3 text-emerald-700">
                            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-600" aria-hidden="true" />Buenos</span>
                            <span>{totales.buenos}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-amber-700">
                            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />Regulares</span>
                            <span>{totales.regulares}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-red-700">
                            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-red-600" aria-hidden="true" />Malos</span>
                            <span>{totales.malos}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Acciones rápidas</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => handleEditarRegistro(index)} aria-label={`Editar registro de ${registro.nombreColaborador}`} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-emerald-800 transition hover:bg-emerald-50">
                            <Pencil className="size-4" aria-hidden="true" />
                            Editar
                          </button>
                          <button type="button" onClick={() => handleEliminarRegistro(index)} aria-label={`Borrar registro de ${registro.nombreColaborador}`} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-red-700 transition hover:bg-red-50">
                            <Trash2 className="size-4" aria-hidden="true" />
                            Borrar
                          </button>
                        </div>
                      </div>
                    </aside>

                    <div className="grid gap-4">
                      <div className="grid gap-4">
                        {gruposTablaEpp.map((grupo, grupoIndex) => {
                          const estiloGrupo = obtenerEstiloGrupo(grupoIndex);
                          return (
                            <section key={`${registro.nombreColaborador}-${grupo.label}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                              <div className="flex items-center justify-between gap-3 bg-slate-100 px-4 py-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className={`block size-2 rounded-full ${estiloGrupo.line}`} aria-hidden="true" />
                                  <h4 className="truncate text-xs font-bold uppercase tracking-wide text-emerald-900">{grupo.label}</h4>
                                </div>
                                <span className="shrink-0 rounded-full bg-emerald-700 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                                  {grupo.fields.length} item{grupo.fields.length === 1 ? "" : "s"}
                                </span>
                              </div>
                              <div className="divide-y divide-slate-100">
                                {grupo.fields.map((campo) => {
                                  const IconoCampo = obtenerIconoEpp(campo);
                                  return (
                                    <div key={`${registro.nombreColaborador}-${campo.key}`} className="flex items-center justify-between gap-3 px-4 py-3">
                                      <div className="flex min-w-0 items-center gap-3">
                                        <IconoCampo className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
                                        <span title={campo.label} className="text-xs font-bold uppercase text-slate-800">
                                          {campo.label}
                                        </span>
                                      </div>
                                      <EstadoBadge condicion={obtenerCondicionRegistro(registro, campo)} />
                                    </div>
                                  );
                                })}
                              </div>
                            </section>
                          );
                        })}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-bold uppercase text-slate-500">Observaciones</p>
                          <p className="mt-3 rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold italic leading-6 text-slate-700">{registro.observaciones || "-"}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-bold uppercase text-slate-500">Firma de conformidad</p>
                          {registro.firmaColaborador ? (
                            <div className="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2">
                              <img src={registro.firmaColaborador} alt="Firma registrada" className="h-full w-full object-contain contrast-200" />
                            </div>
                          ) : (
                            <p className="mt-3 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-500">Pendiente</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-start">
          <button onClick={handleEnviarFormulario} className="rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
            Enviar formulario
          </button>
        </div>

      </div>

      {modalFirmaAbierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Firma digital</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">Colaborador inspeccionado</h3>
              </div>
              <button type="button" onClick={() => setModalFirmaAbierto(false)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Cerrar
              </button>
            </div>

            <div className="mt-5">
              <label className="text-xs font-bold italic uppercase text-slate-950">Firma</label>
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

