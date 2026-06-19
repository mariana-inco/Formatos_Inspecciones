export type SeveridadRecarga = "bueno" | "regular" | "critico" | "malo" | "pendiente";

export type EstadoRecarga = {
  estado: string;
  severidad: SeveridadRecarga;
  dias: number | null;
  mensaje: string;
  fechaProximaRecarga?: string;
};

const normalizarFechaLocal = (fecha: Date) => {
  const normalizada = new Date(fecha);
  normalizada.setHours(0, 0, 0, 0);
  return normalizada;
};

const formatearFechaIsoLocal = (fecha: Date) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fechaValidaIso = (fecha?: string | null) => {
  if (!fecha) return "";
  const parsed = normalizarFechaLocal(new Date(`${fecha}T00:00:00`));
  return Number.isNaN(parsed.getTime()) ? "" : fecha;
};

export const calcularFechaProximaRecargaAnual = (fechaUltimaRecarga?: string | null) => {
  const fechaBase = fechaValidaIso(fechaUltimaRecarga);
  if (!fechaBase) return "";
  const fecha = normalizarFechaLocal(new Date(`${fechaBase}T00:00:00`));
  fecha.setFullYear(fecha.getFullYear() + 1);
  return formatearFechaIsoLocal(fecha);
};

type EntradaRecarga =
  | string
  | null
  | undefined
  | {
      fechaUltimaRecarga?: string | null;
      fechaProximaRecarga?: string | null;
    };

const resolverFechaProximaRecarga = (entrada: EntradaRecarga) => {
  if (typeof entrada === "string" || entrada == null) return fechaValidaIso(entrada);
  return fechaValidaIso(entrada.fechaProximaRecarga) || calcularFechaProximaRecargaAnual(entrada.fechaUltimaRecarga);
};

export const calcularEstadoRecarga = (entrada?: EntradaRecarga): EstadoRecarga => {
  const fechaProximaRecarga = resolverFechaProximaRecarga(entrada);

  if (!fechaProximaRecarga) {
    return {
      estado: "Pendiente",
      severidad: "pendiente",
      dias: null,
      mensaje: "Sin fecha próxima de recarga registrada.",
    };
  }

  const fecha = normalizarFechaLocal(new Date(`${fechaProximaRecarga}T00:00:00`));
  if (Number.isNaN(fecha.getTime())) {
    return {
      estado: "Pendiente",
      severidad: "pendiente",
      dias: null,
      mensaje: "Sin fecha próxima de recarga registrada.",
    };
  }

  const hoy = normalizarFechaLocal(new Date());
  const dias = Math.round((fecha.getTime() - hoy.getTime()) / 86400000);
  const diasAbsolutos = Math.abs(dias);

  if (dias > 30) {
    return {
      estado: "Vigente",
      severidad: "bueno",
      dias,
      mensaje: `Vigente. Faltan ${dias} días para la próxima recarga anual.`,
      fechaProximaRecarga,
    };
  }

  if (dias > 0) {
    return {
      estado: "Próximo a vencer",
      severidad: "regular",
      dias,
      mensaje: `Próximo a vencer. Faltan ${dias} días para la próxima recarga anual.`,
      fechaProximaRecarga,
    };
  }

  if (dias === 0) {
    return {
      estado: "Vence hoy",
      severidad: "critico",
      dias,
      mensaje: "Vence hoy. Requiere gestión.",
      fechaProximaRecarga,
    };
  }

  return {
    estado: "Vencido",
    severidad: "malo",
    dias,
    mensaje: `Vencido hace ${diasAbsolutos} días. Gestión urgente.`,
    fechaProximaRecarga,
  };
};
