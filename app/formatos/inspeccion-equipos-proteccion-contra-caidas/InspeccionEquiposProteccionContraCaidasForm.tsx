"use client";

import React, { useMemo, useRef, useState } from "react";
import Signature from "@uiw/react-signature";
import type { SignatureRef } from "@uiw/react-signature";
import { inspectionTypes, inspectionTypeKeys, decisionOptions } from "./data";
import type { InspectionTypeKey } from "./data";

const initialGeneralData = {
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

const FORM_META = {
  codigo: "HSE-F006",
  fecha: "2025-09-18",
  version: "04",
};

const dateInputClassName =
  "date-input mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none [color-scheme:light] focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const fieldClassName =
  "mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const selectClassName =
  "mt-2 block w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const requiredMark = <span className="text-red-600">*</span>;

type ConceptoRevision = "" | "ACEPTADO" | "RECHAZADO";

type SignatureData = {
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
const camposFirmaNumericos = new Set<keyof SignatureData>(["inspectorIdentificacion", "responsableIdentificacion"]);
const camposFirmaSinNumeros = new Set<keyof SignatureData>([
  "inspectorNombre",
  "inspectorCargo",
  "responsableNombre",
  "responsableCargo",
]);

const inspectionButtonLabels: Record<InspectionTypeKey, string> = {
  arnes: "INSPECCIÓN ARNÉS",
  eslingas: "INSPECCIÓN ESLINGAS",
  descendedor: "INSPECCIÓN DESCENDEDOR",
  mosqueton: "INSPECCIÓN MOSQUETÓN",
  autoretracto: "INSPECCIÓN AUTORETRACT",
  freno: "INSPECCIÓN FRENO",
  tieoff: "INSPECCIÓN TIE-OFF",
  "linea-vida": "LÍNEA DE VIDA",
};

const inspectionButtonIcons: Record<InspectionTypeKey, string> = {
  arnes: "🦺",
  eslingas: "⛓️",
  descendedor: "🧗",
  mosqueton: "🔗",
  autoretracto: "🪢",
  freno: "🛞",
  tieoff: "⚓",
  "linea-vida": "🪜",
};

export default function InspeccionEquiposProteccionContraCaidasForm() {
  const [generalData, setGeneralData] = useState(initialGeneralData);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [datosRegistrados, setDatosRegistrados] = useState(false);
  const [selectedType, setSelectedType] = useState(inspectionTypeKeys[0]);
  const [decisionFinal, setDecisionFinal] = useState("");
  const [comentariosFinales, setComentariosFinales] = useState("");
  const [checklistResponses, setChecklistResponses] = useState<Record<string, { concepto: ConceptoRevision; comentario: string }>>({});
  const [signatureModalRole, setSignatureModalRole] = useState<"inspector" | "responsable" | null>(null);
  const [signatureHasStroke, setSignatureHasStroke] = useState(false);
  const signatureRef = useRef<SignatureRef>(null);
  const [signatures, setSignatures] = useState<SignatureData>({
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

  const currentChecklist = useMemo(() => inspectionTypes[selectedType].checklist || [], [selectedType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setGeneralData((prev) => ({ ...prev, [name]: value }));
    if (name === "decisionFinal") setDecisionFinal(value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleAddData = () => setDatosRegistrados(true);

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureHasStroke(false);
  };

  const handleSaveSignature = () => {
    const svg = signatureRef.current?.svg;
    if (!svg || !signatureModalRole) return;
    if (!signatureHasStroke) {
      alert("Por favor registre la firma antes de guardar.");
      return;
    }
    const serializedSignature = new XMLSerializer().serializeToString(svg);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSignature)}`;
    if (signatureModalRole === "inspector") {
      setSignatures((s) => ({ ...s, inspectorFirma: dataUrl, inspectorFirmado: true }));
    } else {
      setSignatures((s) => ({ ...s, responsableFirma: dataUrl, responsableFirmado: true }));
    }
    setSignatureModalRole(null);
    setSignatureHasStroke(false);
  };

  const handleChecklistConceptChange = (key: string, concepto: ConceptoRevision) => {
    setChecklistResponses((prev) => ({
      ...prev,
      [key]: { concepto, comentario: prev[key]?.comentario || "" },
    }));
  };

  const handleChecklistCommentChange = (key: string, comentario: string) => {
    setChecklistResponses((prev) => ({
      ...prev,
      [key]: { concepto: prev[key]?.concepto || "", comentario },
    }));
  };

  const applyConceptToChecklist = (concepto: ConceptoRevision) => {
    setChecklistResponses((prev) =>
      currentChecklist.reduce<Record<string, { concepto: ConceptoRevision; comentario: string }>>((next, item) => {
        next[item.key] = { concepto, comentario: prev[item.key]?.comentario || "" };
        return next;
      }, {})
    );
    if (concepto === "ACEPTADO") setDecisionFinal("apto");
    if (concepto === "RECHAZADO") setDecisionFinal("no-apto");
  };

  const handleInspectionTypeSelect = (type: InspectionTypeKey) => {
    setSelectedType(type);
    setChecklistResponses({});
    setComentariosFinales("");
    setDecisionFinal("");
  };

  const handleOpenSignatureModal = (role: "inspector" | "responsable") => {
    setSignatureHasStroke(false);
    setSignatureModalRole(role);
  };

  const handleCloseSignatureModal = () => {
    setSignatureHasStroke(false);
    setSignatureModalRole(null);
  };

  const handleSignatureFieldChange = (field: keyof SignatureData, value: string) => {
    let nextValue = value;
    if (camposFirmaNumericos.has(field)) nextValue = soloNumeros(value);
    if (camposFirmaSinNumeros.has(field)) nextValue = quitarNumeros(value);
    setSignatures((prev) => ({ ...prev, [field]: nextValue }));
  };

  const buildRespuestaJson = () => {
    const decisionFinalTexto = decisionOptions.find((option) => option.value === decisionFinal)?.label || "";

    return {
      formato: {
        nombre: "Inspección de equipos de protección contra caídas",
        codigo: FORM_META.codigo,
        fecha: FORM_META.fecha,
        version: FORM_META.version,
        area: "Gestión HSE",
      },
      fechaRegistro: new Date().toISOString(),
      inspeccion: {
        tipo: selectedType,
        nombre: inspectionTypes[selectedType].label,
      },
      datosEquipo: {
        ...generalData,
        imagenEquipo: {
          nombreArchivo: imageName || "",
          imagenAdjunta: Boolean(imageName),
        },
      },
      respuestasChecklist: currentChecklist.map((item) => ({
        key: item.key,
        factor: item.factor,
        instrucciones: item.instrucciones,
        concepto: checklistResponses[item.key]?.concepto || "",
        comentario: checklistResponses[item.key]?.comentario || "",
      })),
      cierreInspeccion: {
        comentariosFinales,
        decisionFinal,
        decisionFinalTexto,
      },
      firmas: signatures,
    };
  };

  const handleSubmit = async () => {
    if (!confirm("¿Confirmas el envío del formulario HSE-F006?")) return;
    const respuestaJson = buildRespuestaJson();

    try {
      const response = await fetch("/api/formatos/inspeccion-contra-caidas/respuestas", {
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
              <div className="border-b border-slate-400 py-1 text-center font-bold uppercase">Gestión HSE</div>
              <div className="flex min-h-[88px] items-start justify-center px-4 pt-3 text-center font-bold uppercase">
                Inspección de equipos de protección contra caídas
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

        <div className="mb-6 flex flex-wrap justify-center gap-3 border-t-2 border-blue-500 pt-8">
          {inspectionTypeKeys.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleInspectionTypeSelect(type)}
                aria-pressed={isSelected}
                className={`flex min-h-[60px] w-[170px] items-center justify-center gap-3 rounded-lg border px-3 py-3 text-xs font-bold uppercase text-white shadow-sm transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-800 ring-2 ring-emerald-300"
                    : "border-slate-800 bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-slate-950/20 text-2xl leading-none">
                  {inspectionButtonIcons[type]}
                </span>
                <span className="leading-5">{inspectionButtonLabels[type]}</span>
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
                    <label className="text-sm font-semibold text-slate-700">Correo electrónico {requiredMark}</label>
                    <input name="email" type="email" value={generalData.email} onChange={handleInputChange} placeholder="usuario@empresa.com" className={fieldClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha de inspección {requiredMark}</label>
                    <input name="fechaInspeccion" type="date" value={generalData.fechaInspeccion} onChange={handleInputChange} aria-label="Seleccione una fecha de inspección" className={dateInputClassName} />
                  </div>
                </div>
              </section>

              <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Identificación del equipo</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fabricante {requiredMark}</label>
                    <input name="fabricante" value={generalData.fabricante} onChange={handleInputChange} placeholder="Ej: Petzl" className={fieldClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Modelo {requiredMark}</label>
                    <input name="modelo" value={generalData.modelo} onChange={handleInputChange} placeholder="Ej: ASAP LOCK" className={fieldClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Número de serie {requiredMark}</label>
                    <input name="numeroSerie" value={generalData.numeroSerie} onChange={handleInputChange} placeholder="Ej: SN-000123" className={fieldClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Número interno {requiredMark}</label>
                    <input name="numeroInterno" value={generalData.numeroInterno} onChange={handleInputChange} placeholder="Ej: EQ-045" className={fieldClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Certificado</label>
                    <input name="certificado" value={generalData.certificado} onChange={handleInputChange} placeholder="Ej: CERT-2026-001" className={fieldClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Número de lote</label>
                    <input name="numeroLote" value={generalData.numeroLote} onChange={handleInputChange} placeholder="Ej: LOTE-2026-01" className={fieldClassName} />
                  </div>
                </div>
              </section>

              <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Fechas del equipo</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha de fabricación</label>
                    <input name="fechaFabricacion" type="date" value={generalData.fechaFabricacion} onChange={handleInputChange} aria-label="Seleccione una fecha de fabricación" className={dateInputClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha de compra</label>
                    <input name="fechaCompra" type="date" value={generalData.fechaCompra} onChange={handleInputChange} aria-label="Seleccione una fecha de compra" className={dateInputClassName} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Fecha primera utilización</label>
                    <input name="fechaPrimeraUtilizacion" type="date" value={generalData.fechaPrimeraUtilizacion} onChange={handleInputChange} aria-label="Seleccione una fecha de primera utilización" className={dateInputClassName} />
                  </div>
                </div>
              </section>

              <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="border-l-4 border-emerald-700 pl-3 text-sm font-bold uppercase text-slate-900">Características técnicas</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Periodicidad {requiredMark}</label>
                    <select name="periodicidad" value={generalData.periodicidad} onChange={handleInputChange} className={selectClassName}>
                      <option value="">Seleccione una periodicidad</option>
                      <option value="Mensual">Mensual</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Tipo de freno</label>
                    <select name="tipoFreno" value={generalData.tipoFreno} onChange={handleInputChange} className={selectClassName}>
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
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                    <span className="text-sm font-bold text-emerald-900">Arrastra una imagen aquí o haz clic para seleccionar</span>
                    <span className="mt-1 text-xs text-slate-600">Formatos permitidos: JPG, PNG o WEBP</span>
                    <span className="mt-3 max-w-full truncate rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                      {imageName || "Ningún archivo seleccionado"}
                    </span>
                  </label>
                  {imagePreviewUrl ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <img src={imagePreviewUrl} alt="Imagen del equipo seleccionada" className="mx-auto max-h-40 object-contain" />
                    </div>
                  ) : null}
                </div>
              </section>

              <div className="mt-6 flex justify-start">
                <button type="button" onClick={handleAddData} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white">Agregar Datos</button>
              </div>
            </div>

            <div className="mt-12">
              <label className="text-xs font-semibold italic text-slate-950">
                ANTECEDENTES DEL EQUIPO Condiciones de uso o acontecimiento excepcional durante la utilización (ejemplos: caída o detención de una caída, utilización o almacenamiento a temperaturas extremas, modificación fuera de los talleres del fabricante)
              </label>
              <textarea name="antecedentesEquipo" value={generalData.antecedentesEquipo} onChange={handleInputChange} rows={2} className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-md outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" />
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
                    ["Fecha inspección", generalData.fechaInspeccion],
                    ["Fabricante", generalData.fabricante],
                    ["Modelo", generalData.modelo],
                    ["Número de serie", generalData.numeroSerie],
                    ["Número interno", generalData.numeroInterno],
                    ["Periodicidad", generalData.periodicidad],
                    ["Fecha de fabricación", generalData.fechaFabricacion],
                    ["Certificado", generalData.certificado],
                    ["Fecha de compra", generalData.fechaCompra],
                    ["Número de lote", generalData.numeroLote],
                    ["Tipo de freno", generalData.tipoFreno],
                    ["Fecha primera utilización", generalData.fechaPrimeraUtilizacion],
                  ].map((item) => (
                    <div key={String(item[0])} className="grid grid-cols-[1fr_1fr] gap-3 rounded bg-white px-4 py-3">
                      <div className="text-xs font-semibold text-slate-500">{item[0]}</div>
                      <div className="text-sm text-slate-700">{item[1] || "-"}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded border bg-white p-4">
                  {imagePreviewUrl ? <img src={imagePreviewUrl} alt="Foto" className="w-full object-contain" /> : <div className="min-h-[180px] flex items-center justify-center text-sm text-slate-400">Foto del equipo</div>}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold italic text-slate-950">
                ANTECEDENTES DEL EQUIPO Condiciones de uso o acontecimiento excepcional durante la utilización (ejemplos: caída o detención de una caída, utilización o almacenamiento a temperaturas extremas, modificación fuera de los talleres del fabricante)
              </label>
              <textarea
                name="antecedentesEquipo"
                value={generalData.antecedentesEquipo}
                onChange={handleInputChange}
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

        <div className="border-t border-slate-200 bg-slate-100 px-6 py-6 mt-6">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{inspectionTypes[selectedType].label}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => applyConceptToChecklist("ACEPTADO")} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase text-white">
                  Todo aceptado
                </button>
                <button type="button" onClick={() => applyConceptToChecklist("RECHAZADO")} className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold uppercase text-white">
                  Todo rechazado
                </button>
                <button type="button" onClick={() => applyConceptToChecklist("")} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase text-slate-700">
                  Limpiar conceptos
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[1040px] table-fixed divide-y divide-slate-200 text-sm">
                <colgroup>
                  <col className="w-[52%]" />
                  <col className="w-[18%]" />
                  <col className="w-[30%]" />
                </colgroup>
                <thead className="bg-emerald-900 text-left text-white">
                  <tr>
                    <th className="px-4 py-4">FACTORES GENERALES</th>
                    <th className="px-6 py-4 text-center">CONCEPTO</th>
                    <th className="px-4 py-4">DETALLES DE APOYO / COMENTARIOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-slate-50">
                  {currentChecklist.map((item) => (
                    <tr key={item.key} className="border-b border-slate-200">
                      <td className="px-4 py-3 align-top">
                        <div className="text-xs font-semibold text-slate-950">{item.factor}</div>
                        {Array.isArray(item.instrucciones) ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-800">
                            {item.instrucciones.map((instruccion) => (
                              <li key={instruccion}>{instruccion}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs leading-5 text-slate-800">{item.instrucciones}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <select
                          value={checklistResponses[item.key]?.concepto || ""}
                          onChange={(e) => handleChecklistConceptChange(item.key, e.target.value as ConceptoRevision)}
                          className="mx-auto block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="">--Seleccione--</option>
                          <option value="ACEPTADO">ACEPTADO</option>
                          <option value="RECHAZADO">RECHAZADO</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          value={checklistResponses[item.key]?.comentario || ""}
                          onChange={(e) => handleChecklistCommentChange(item.key, e.target.value)}
                          className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                          placeholder="Solo si aplica"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-4 align-middle text-xs font-medium uppercase text-slate-950">COMENTARIOS</td>
                    <td colSpan={2} className="px-4 py-3 align-middle">
                      <input
                        value={comentariosFinales}
                        onChange={(e) => setComentariosFinales(e.target.value)}
                        className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 align-middle text-xs font-medium uppercase text-slate-950">DECISIÓN FINAL</td>
                    <td colSpan={2} className="px-4 py-3 text-center align-middle">
                      <select
                        name="decisionFinal"
                        value={decisionFinal}
                        onChange={handleInputChange}
                        className="mx-auto block h-10 w-full max-w-[300px] rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      >
                        {decisionOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                    <label className="text-xs font-bold italic uppercase text-slate-900">Número de identificación</label>
                    <input
                      value={signatures.inspectorIdentificacion}
                      onChange={(e) => handleSignatureFieldChange("inspectorIdentificacion", e.target.value)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold italic uppercase text-slate-900">Nombre</label>
                    <input
                      value={signatures.inspectorNombre}
                      onChange={(e) => handleSignatureFieldChange("inspectorNombre", e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold italic uppercase text-slate-900">Cargo</label>
                    <input
                      value={signatures.inspectorCargo}
                      onChange={(e) => handleSignatureFieldChange("inspectorCargo", e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold italic uppercase text-slate-900">Firma</p>
                      <p className="mt-1 text-sm text-slate-600">{signatures.inspectorFirmado ? "Firma registrada" : "Pendiente de firma"}</p>
                    </div>
                    <button type="button" onClick={()=>handleOpenSignatureModal("inspector")} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
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
                    <label className="text-xs font-bold italic uppercase text-slate-900">Nombre</label>
                    <input
                      value={signatures.responsableNombre}
                      onChange={(e) => handleSignatureFieldChange("responsableNombre", e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold italic uppercase text-slate-900">Número de identificación</label>
                    <input
                      value={signatures.responsableIdentificacion}
                      onChange={(e) => handleSignatureFieldChange("responsableIdentificacion", e.target.value)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold italic uppercase text-slate-900">Cargo</label>
                    <input
                      value={signatures.responsableCargo}
                      onChange={(e) => handleSignatureFieldChange("responsableCargo", e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold italic uppercase text-slate-900">Firma</p>
                      <p className="mt-1 text-sm text-slate-600">{signatures.responsableFirmado ? "Firma registrada" : "Pendiente de firma"}</p>
                    </div>
                    <button type="button" onClick={()=>handleOpenSignatureModal("responsable")} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                      Clic para firmar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-start">
              <button onClick={handleSubmit} className="rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                Enviar formulario
              </button>
            </div>

          </div>
        </div>
      </div>

      {signatureModalRole ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Firma digital</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  {signatureModalRole === "inspector" ? "Inspección realizada por" : "Colaborador responsable"}
                </h3>
              </div>
              <button type="button" onClick={handleCloseSignatureModal} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Cerrar
              </button>
            </div>

            <div className="mt-5">
              <label className="text-xs font-bold italic uppercase text-slate-900">Firma</label>
              <Signature
                ref={signatureRef}
                fill="#0f172a"
                onPointer={(points) => {
                  if (points.length > 0) setSignatureHasStroke(true);
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
              <button type="button" onClick={handleClearSignature} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
                Limpiar
              </button>
              <button type="button" onClick={handleCloseSignatureModal} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
                Cancelar
              </button>
              <button type="button" onClick={handleSaveSignature} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">
                Guardar firma
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
