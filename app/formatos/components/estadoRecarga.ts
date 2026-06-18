export type SeveridadRecarga = "bueno" | "regular" | "critico" | "malo" | "pendiente";

export type EstadoRecarga = {
  estado: string;
  severidad: SeveridadRecarga;
  dias: number | null;
  mensaje: string;
};

const normalizarFechaLocal = (fecha: Date) => {
  const normalizada = new Date(fecha);
  normalizada.setHours(0, 0, 0, 0);
  return normalizada;
};

export const calcularEstadoRecarga = (fechaProximaRecarga?: string | null): EstadoRecarga => {
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
      estado: "Bueno",
      severidad: "bueno",
      dias,
      mensaje: `Vigente. Faltan ${dias} días.`,
    };
  }

  if (dias > 0) {
    return {
      estado: "Regular",
      severidad: "regular",
      dias,
      mensaje: `Próximo a vencer. Faltan ${dias} días.`,
    };
  }

  if (dias === 0) {
    return {
      estado: "Vence hoy",
      severidad: "critico",
      dias,
      mensaje: "Vence hoy. Requiere gestión.",
    };
  }

  return {
    estado: "Vencido",
    severidad: "malo",
    dias,
    mensaje: `Vencido hace ${diasAbsolutos} días.`,
  };
};
