export const ESTADOS_INSPECCION = {
  CUMPLE: 1,
  NO_CUMPLE: 2,
  NO_APLICA: 3,
} as const;

export const ESTADOS_REVISION = {
  BUENO: 1,
  REGULAR: 2,
  MALO: 3,
  NO_APLICA: 4,
} as const;

export const CONCEPTOS_REVISION = {
  ACEPTADO: 1,
  RECHAZADO: 2,
} as const;

type ArchivoFormulario = {
  fileName: string;
  mimeType: string;
  hasFile: boolean;
  fileUrl: string;
};

type OpcionesArchivo = {
  nombreArchivo?: string;
  dataUrl?: string;
  carpeta: "firmas" | "evidencias";
  prefijo: string;
  mimeType?: string;
};

const mapaEstados: Record<string, number> = {
  Cumple: ESTADOS_INSPECCION.CUMPLE,
  "No cumple": ESTADOS_INSPECCION.NO_CUMPLE,
  "No Cumple": ESTADOS_INSPECCION.NO_CUMPLE,
  "N.A": ESTADOS_INSPECCION.NO_APLICA,
  "N/A": ESTADOS_INSPECCION.NO_APLICA,
  "NO APLICA": ESTADOS_INSPECCION.NO_APLICA,
};

const mapaRevision: Record<string, number> = {
  BUENO: ESTADOS_REVISION.BUENO,
  REGULAR: ESTADOS_REVISION.REGULAR,
  MALO: ESTADOS_REVISION.MALO,
  "NO APLICA": ESTADOS_REVISION.NO_APLICA,
  "N/A": ESTADOS_REVISION.NO_APLICA,
};

const mapaConceptos: Record<string, number> = {
  ACEPTADO: CONCEPTOS_REVISION.ACEPTADO,
  RECHAZADO: CONCEPTOS_REVISION.RECHAZADO,
};

const extensionesPorMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

const limpiarNombreArchivo = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");

const obtenerMimeDesdeDataUrl = (dataUrl?: string) => {
  const coincidencia = dataUrl?.match(/^data:([^;,]+)/);
  return coincidencia?.[1];
};

const obtenerExtension = (nombreArchivo: string, mimeType: string) => {
  const extensionNombre = nombreArchivo.split(".").pop();
  if (extensionNombre && extensionNombre !== nombreArchivo) return extensionNombre.toLowerCase();
  return extensionesPorMime[mimeType] || "png";
};

export const mapEstadoToId = (estado: string) => mapaEstados[estado] ?? null;

export const mapRevisionToId = (estado: string) => mapaRevision[estado] ?? null;

export const mapConceptoToId = (concepto: string) => mapaConceptos[concepto] ?? null;

export const limpiarImagenParaJson = ({
  nombreArchivo,
  dataUrl,
  carpeta,
  prefijo,
  mimeType,
}: OpcionesArchivo): ArchivoFormulario | null => {
  const hayArchivo = Boolean(nombreArchivo || dataUrl);
  if (!hayArchivo) return null;

  const tipoArchivo = mimeType || obtenerMimeDesdeDataUrl(dataUrl) || "image/png";
  const fecha = new Date().toISOString().slice(0, 10);
  const nombreBase = nombreArchivo?.trim() || `${prefijo}-${fecha}.${obtenerExtension("", tipoArchivo)}`;
  const fileName = limpiarNombreArchivo(nombreBase);

  return {
    fileName,
    mimeType: tipoArchivo,
    hasFile: true,
    fileUrl: `/uploads/${carpeta}/${fileName}`,
  };
};

export const limpiarFirmaParaJson = (dataUrl: string, prefijo: string) =>
  limpiarImagenParaJson({
    dataUrl,
    carpeta: "firmas",
    prefijo,
    mimeType: obtenerMimeDesdeDataUrl(dataUrl) || "image/png",
  });

export const registrarJsonFinalFormulario = (registroFinal: unknown) => {
  void registroFinal;
};
