import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
import { calcularEstadoRecarga } from "../../../components/estadoRecarga";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    codigo: string;
    archivo: string;
  }>;
};

type FuenteRegistro = {
  dir: string;
  nombre: string;
};

const fuentesPorCodigo: Record<string, FuenteRegistro> = {
  "HSE-F006": { dir: "inspeccion-equipos-proteccion-contra-caidas", nombre: "Inspección de equipos de protección contra caídas" },
  "HSE-F002": { dir: "inspeccion-epp", nombre: "Inspección de elementos de protección personal" },
  "HSE-F020": { dir: "verificacion-alcohol-drogas", nombre: "Verificación en sitio de alcohol y drogas" },
  "HSE-F003": { dir: "inspeccion-extintores", nombre: "Inspección de extintores" },
  "HSE-F010": { dir: "lista-chequeo-condiciones-seguridad", nombre: "Lista de chequeo de las condiciones de seguridad" },
};

const estadoChequeo = (estadoId?: number | null) => {
  if (estadoId === 1) return { label: "Cumple", className: "bg-emerald-100 text-emerald-800" };
  if (estadoId === 2) return { label: "Con novedad", className: "bg-red-100 text-red-800" };
  if (estadoId === 3) return { label: "N.A", className: "bg-slate-100 text-slate-700" };
  return { label: "Sin evaluar", className: "bg-amber-50 text-amber-700" };
};

const etiquetaCampo = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const valorVacio = (value: unknown) => value === null || value === undefined || value === "";
const esImagenBase64 = (value: unknown): value is string => typeof value === "string" && value.startsWith("data:image/");
const texto = (value: unknown, fallback = "Sin dato") => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};
const claseResultado = (value: unknown) => {
  const resultado = String(value || "").toUpperCase();
  if (resultado === "POSITIVO") return "bg-red-100 text-red-800";
  if (resultado === "NEGATIVO") return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
};
const estadoRevisionExtintor = (revision: any) => {
  if (revision?.estadoId === 1 || String(revision?.estado || "").toUpperCase() === "BUENO") {
    return { label: "Bueno", className: "bg-emerald-100 text-emerald-800" };
  }
  if (revision?.estadoId === 2 || String(revision?.estado || "").toUpperCase() === "REGULAR") {
    return { label: "Regular", className: "bg-amber-100 text-amber-800" };
  }
  if (revision?.estadoId === 3 || String(revision?.estado || "").toUpperCase() === "MALO") {
    return { label: "Malo", className: "bg-red-100 text-red-800" };
  }
  if (revision?.estadoId === 4 || ["NO APLICA", "N/A"].includes(String(revision?.estado || "").toUpperCase())) {
    return { label: "N/A", className: "bg-slate-200 text-slate-800" };
  }
  return { label: "Sin evaluar", className: "bg-slate-100 text-slate-600" };
};
const claseRecarga = (severidad: string) => {
  if (severidad === "bueno") return "bg-emerald-100 text-emerald-800";
  if (severidad === "regular") return "bg-amber-100 text-amber-800";
  if (severidad === "critico") return "bg-orange-100 text-orange-800";
  if (severidad === "malo") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-700";
};
const clasificarGradoAlcohol = (grado: unknown) => {
  const valor = Number(String(grado || "").replace(",", "."));
  if (!Number.isFinite(valor)) return "Sin grado";
  if (valor < 20) return "Normal";
  if (valor < 40) return "Grado cero";
  if (valor <= 80) return "Primer grado";
  if (valor < 150) return "Segundo grado";
  return "Tercer grado";
};
const imagenAdjunta = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.dataUrl || "";
};
const renderImagenAdjunta = (value: any, label: string) => {
  const url = imagenAdjunta(value);
  if (!url) {
    if (value?.fileUrl) {
      return (
        <div className="max-w-36 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">
          Archivo no disponible en el servidor
        </div>
      );
    }
    return <span className="text-slate-400">Sin adjunto</span>;
  }
  return (
    <div className="flex h-16 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white px-2 py-1">
      <img src={url} alt={label} className="h-full w-full object-contain" />
    </div>
  );
};

const mostrarValor = (value: unknown): React.ReactNode => {
  if (valorVacio(value)) return <span className="text-slate-400">Sin dato</span>;
  if (esImagenBase64(value)) {
    return (
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-white px-3 py-2">
        <img src={value} alt="Evidencia registrada" className="h-full w-full object-contain" />
      </div>
    );
  }
  if (typeof value === "object" && value && "hasFile" in value) {
    return renderImagenAdjunta(value, "Adjunto registrado");
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value);
};

const renderCampo = (label: string, value: unknown) => (
  <div key={label} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">{mostrarValor(value)}</div>
  </div>
);

const renderGenerico = (value: unknown, keyPath = "root"): React.ReactNode => {
  if (valorVacio(value)) return <span className="text-slate-400">Sin dato</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-400">Sin registros</span>;
    return (
      <div className="space-y-4">
        {value.map((item, index) => (
          <section key={`${keyPath}-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Registro {index + 1}</p>
            <div className="mt-3">{renderGenerico(item, `${keyPath}-${index}`)}</div>
          </section>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([key, item]) => key !== "__archivo" && !valorVacio(item));
    if (entries.length === 0) return <span className="text-slate-400">Sin datos</span>;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map(([key, item]) => (
          <div key={`${keyPath}-${key}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{etiquetaCampo(key)}</p>
            <div className="mt-3 text-sm font-semibold leading-6 text-slate-900">{renderGenerico(item, `${keyPath}-${key}`)}</div>
          </div>
        ))}
      </div>
    );
  }
  return mostrarValor(value);
};

const renderListaChequeo = (registro: any) => {
  const grupos = registro.itemsInspeccion || [];
  const items = grupos.flatMap((grupo: any) => grupo.items || []);
  const cumplen = items.filter((item: any) => item.estadoId === 1).length;
  const novedades = items.filter((item: any) => item.estadoId === 2).length;
  const noAplica = items.filter((item: any) => item.estadoId === 3).length;
  const total = items.length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total ítems", total, "bg-slate-100 text-slate-700"],
          ["Cumplen", cumplen, "bg-emerald-100 text-emerald-800"],
          ["Con novedad", novedades, "bg-red-100 text-red-800"],
          ["No aplica", noAplica, "bg-slate-100 text-slate-700"],
        ].map(([label, value, className]) => (
          <article key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-3 inline-flex rounded-full px-4 py-2 text-2xl font-bold ${className}`}>{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Datos generales</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(registro.datosGenerales || {}).map(([key, value]) => renderCampo(etiquetaCampo(key), value))}
        </div>
      </section>

      <section className="space-y-4">
        {grupos.map((grupo: any) => (
          <article key={grupo.grupoTitulo} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-950">{grupo.grupoTitulo}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {(grupo.items || []).map((item: any) => {
                const estado = estadoChequeo(item.estadoId);
                return (
                  <div key={item.key || item.criterio} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_150px_minmax(220px,0.7fr)] lg:items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.criterio || "Ítem sin criterio"}</p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${estado.className}`}>{estado.label}</span>
                    <p className="text-sm font-medium leading-6 text-slate-600">{item.observaciones || "Sin observaciones"}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      {registro.otros?.detalle?.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Otros</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {registro.otros.detalle.map((item: any) => {
              const estado = estadoChequeo(item.estadoId);
              return (
                <div key={item.numeroRegistro} className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-950">{item.cual || `Otro ${item.numeroRegistro}`}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado.className}`}>{estado.label}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-600">{item.observaciones || "Sin observaciones"}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {renderCampo("Observaciones generales", registro.observacionesGenerales)}
        {renderCampo("Recomendaciones", registro.recomendaciones)}
      </section>
    </div>
  );
};

const renderAlcoholDrogas = (registro: any) => {
  const datosGenerales = registro.datosGenerales || {};
  const realizadoPor = datosGenerales.realizadoPor || {};
  const registros = registro.registros || [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Fecha de registro", registro.registro?.fechaRegistro?.slice(0, 10) || registro.fechaRegistro?.slice(0, 10)],
          ["Sede / área", datosGenerales.centroTrabajoSede || datosGenerales.sede],
          ["Tipo de prueba", datosGenerales.tipoPrueba],
          ["Criterio de muestra", datosGenerales.criteriosTomaMuestra || datosGenerales.criterioTomaMuestra],
          ["Equipo utilizado", datosGenerales.equipoUtiliza],
          ["Total registros", registro.totalRegistros || registros.length],
        ].map(([label, value]) => renderCampo(String(label), value))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Responsable de la prueba</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Tipo identificación", realizadoPor.tipoIdentificacion],
            ["Identificación", realizadoPor.identificacion],
            ["Nombre", realizadoPor.nombre || datosGenerales.evaluador],
            ["Cargo", realizadoPor.cargo],
          ].map(([label, value]) => renderCampo(String(label), value))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Personas evaluadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#006948] text-white">
              <tr>
                {["N°", "Persona", "Identificación", "Empresa", "Cargo", "Primera prueba", "Segunda prueba", "Evidencia", "Firma", "Testigo"].map((header) => (
                  <th key={header} className="px-4 py-4 text-xs font-bold uppercase tracking-wide">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {registros.map((item: any, index: number) => {
                const persona = item.personaEvaluada || {};
                const firma = persona.firmas?.firmaPersonaEvaluada || persona.firma;
                const evidencia = persona.imagenEvidencia;
                return (
                  <tr key={item.numeroRegistro || index} className="align-top">
                    <td className="px-4 py-4 font-bold text-slate-950">{item.numeroRegistro || index + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">{texto(persona.nombre)}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{texto(persona.opcion, "Sin opción")}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{texto(persona.numeroIdentificacion)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{texto(persona.empresaContratista)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{texto(persona.cargo)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${claseResultado(persona.resultadoPrimeraPruebaInicial)}`}>
                        {texto(persona.resultadoPrimeraPruebaInicial)}
                      </span>
                      <p className="mt-2 text-xs font-semibold text-slate-600">{texto(persona.gradoDetectadoMg100ml, "0")} mg / 100ml</p>
                      <p className="text-xs font-bold uppercase text-slate-950">{clasificarGradoAlcohol(persona.gradoDetectadoMg100ml)}</p>
                    </td>
                    <td className="px-4 py-4">
                      {persona.resultadoSegundaPruebaConfirmatoria ? (
                        <>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${claseResultado(persona.resultadoSegundaPruebaConfirmatoria)}`}>
                            {texto(persona.resultadoSegundaPruebaConfirmatoria)}
                          </span>
                          <p className="mt-2 text-xs font-semibold text-slate-600">{texto(persona.gradoDetectadoSegundaPruebaMg100ml, "0")} mg / 100ml</p>
                          <p className="text-xs font-bold uppercase text-slate-950">{clasificarGradoAlcohol(persona.gradoDetectadoSegundaPruebaMg100ml)}</p>
                        </>
                      ) : (
                        <span className="text-slate-400">No aplica</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{renderImagenAdjunta(evidencia, `Evidencia ${index + 1}`)}</td>
                    <td className="px-4 py-4">{renderImagenAdjunta(firma, `Firma ${index + 1}`)}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">{texto(item.testigo?.hayTestigo)}</p>
                      {String(item.testigo?.hayTestigo || "").toUpperCase() === "SI" ? (
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {texto(item.testigo?.nombre)} · {texto(item.testigo?.cargo)}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs font-semibold text-slate-500">{texto(item.testigo?.confirmar, "Sin observación")}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {registros.length === 0 ? <p className="px-5 py-6 text-sm font-semibold text-slate-500">No hay personas evaluadas registradas.</p> : null}
      </section>
    </div>
  );
};

const renderExtintores = (registro: any) => {
  const datosInspeccion = registro.datosInspeccion || {};
  const registros = registro.registros || [];
  const firmaResponsable = registro.firmas?.firmaResponsable || datosInspeccion.firma;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Fecha de registro", registro.registro?.fechaRegistro?.slice(0, 10) || registro.fechaRegistro?.slice(0, 10)],
          ["Sede / centro de trabajo", datosInspeccion.sedeCentroTrabajo],
          ["Responsable inspección", datosInspeccion.responsableInspeccion],
          ["Cargo responsable", datosInspeccion.cargoResponsable],
          ["Equipo interno", datosInspeccion.equipoInterno],
          ["Equipo externo", datosInspeccion.equipoExterno],
          ["Total registros", registro.totalRegistros || registros.length],
        ].map(([label, value]) => renderCampo(String(label), value))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Firma del responsable</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{texto(datosInspeccion.responsableInspeccion)}</p>
          </div>
          <div className="w-full max-w-xs">{renderImagenAdjunta(firmaResponsable, "Firma del responsable")}</div>
        </div>
      </section>

      <section className="space-y-5">
        {registros.map((item: any, index: number) => {
          const identificacion = item.identificacionExtintor || {};
          const recarga = calcularEstadoRecarga(identificacion.fechaProximaRecarga);
          const revisiones = item.verificacion || [];
          const conteos = revisiones.reduce(
            (acc: Record<string, number>, revision: any) => {
              const estado = estadoRevisionExtintor(revision).label;
              acc[estado] = (acc[estado] || 0) + 1;
              return acc;
            },
            {}
          );

          return (
            <article key={item.numeroRegistro || index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Registro {item.numeroRegistro || index + 1}</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950">
                      Extintor {texto(identificacion.numeroExtintor, `${index + 1}`)}
                    </h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${claseRecarga(recarga.severidad)}`}>{recarga.estado}</span>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Número extintor", identificacion.numeroExtintor],
                    ["Capacidad", identificacion.capacidad],
                    ["Agente", identificacion.agente],
                    ["Clase", identificacion.clase],
                    ["Ubicación", identificacion.ubicacion],
                    ["Última recarga", identificacion.fechaUltimaRecarga],
                    ["Próxima recarga", identificacion.fechaProximaRecarga],
                  ].map(([label, value]) => renderCampo(String(label), value))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado de recarga</p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">{recarga.mensaje}</p>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-sm font-bold ${claseRecarga(recarga.severidad)}`}>{recarga.estado}</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    ["Buenos", conteos.Bueno || 0, "bg-emerald-100 text-emerald-800"],
                    ["Regulares", conteos.Regular || 0, "bg-amber-100 text-amber-800"],
                    ["Malos", conteos.Malo || 0, "bg-red-100 text-red-800"],
                    ["N/A", conteos["N/A"] || 0, "bg-slate-200 text-slate-800"],
                  ].map(([label, value, className]) => (
                    <div key={String(label)} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                      <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-lg font-bold ${className}`}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                    <thead className="bg-[#006948] text-white">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">Criterio</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {revisiones.map((revision: any) => {
                        const estado = estadoRevisionExtintor(revision);
                        return (
                          <tr key={revision.key || revision.criterio}>
                            <td className="px-4 py-3 font-semibold text-slate-900">{texto(revision.criterio || revision.key)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${estado.className}`}>{estado.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {item.observaciones ? (
                  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Observaciones</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{item.observaciones}</p>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

const leerRegistro = async (codigo: string, archivo: string) => {
  const fuente = fuentesPorCodigo[codigo];
  if (!fuente || !archivo.endsWith(".json") || archivo.includes("/") || archivo.includes("\\") || archivo.includes("..")) notFound();

  try {
    const contenido = await readFile(path.join(process.cwd(), "respuestas-json", fuente.dir, archivo), "utf8");
    return { fuente, registro: JSON.parse(contenido) };
  } catch {
    notFound();
  }
};

export default async function RegistroDiligenciadoPage({ params }: PageProps) {
  const { codigo, archivo } = await params;
  const { fuente, registro } = await leerRegistro(codigo, archivo);
  const formato = registro.formato || {};
  const titulo = formato.nombre || fuente.nombre;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#006948] text-white">
              <ClipboardCheck className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{codigo}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">{titulo}</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">{archivo}</p>
            </div>
          </div>
          <Link href="/formatos" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#006948] hover:text-[#006948]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Código", formato.codigo || codigo],
            ["Versión", formato.version],
            ["Fecha formato", formato.fecha],
            ["Área", formato.area],
          ].map(([label, value]) => renderCampo(String(label), value))}
        </section>

        {codigo === "HSE-F010" ? (
          renderListaChequeo(registro)
        ) : codigo === "HSE-F020" ? (
          renderAlcoholDrogas(registro)
        ) : codigo === "HSE-F003" ? (
          renderExtintores(registro)
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="size-5 text-[#006948]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-950">Formato diligenciado</h2>
            </div>
            {renderGenerico(registro)}
          </section>
        )}
      </main>
    </div>
  );
}
