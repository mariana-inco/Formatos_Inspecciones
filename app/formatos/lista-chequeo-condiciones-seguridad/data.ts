export const FORM_META = {
  codigo: "HSE-F010",
  fecha: "2025-09-09",
  version: "04",
  area: "GESTIÓN HSE",
  titulo: "LISTA DE CHEQUEO DE LAS CONDICIONES DE SEGURIDAD",
};

export type EstadoChequeo = "" | "Cumple" | "No Cumple" | "N.A";

export type ItemChequeo = {
  key: string;
  label: string;
};

export type SeccionChequeo = {
  titulo: string;
  items: ItemChequeo[];
};

export const opcionesEstado: EstadoChequeo[] = ["Cumple", "No Cumple", "N.A"];

export const seccionesChequeo: SeccionChequeo[] = [
  {
    titulo: "1. Instalaciones Locativas",
    items: [
      { key: "escalerasBarandas", label: "Escaleras y barandas" },
      { key: "estadoPinturaMamposteria", label: "Estado pintura / Mampostería" },
      { key: "pisosParedesTechosPuertas", label: "Pisos / Paredes / Techos / Puertas" },
      { key: "rejillasDesagues", label: "Rejillas y desagües" },
      { key: "senalizacionAdecuada", label: "Señalización Adecuada" },
      { key: "vidriosVentanas", label: "Vidrios y Ventanas" },
    ],
  },
  {
    titulo: "2. Condiciones Generales",
    items: [
      { key: "iluminacion", label: "Iluminación" },
      { key: "ruido", label: "Ruido" },
      { key: "temperatura", label: "Temperatura" },
      { key: "ventilacion", label: "Ventilación" },
    ],
  },
  {
    titulo: "3. Orden y Aseo",
    items: [
      { key: "disposicionResiduos", label: "Disposición de residuos" },
      { key: "estadoContenedores", label: "Estado de contenedores" },
      { key: "estadoGeneralOrdenAseo", label: "Estado general de orden y aseo" },
      { key: "utensiliosAseoSitio", label: "Utensilios de aseo en su sitio" },
    ],
  },
  {
    titulo: "4. Almacenamiento de productos",
    items: [
      { key: "almacenamientoIdentificacion", label: "Almacenamiento / Identificación" },
      { key: "estadoEstanterias", label: "Estado de estanterías" },
      { key: "manejoCargas", label: "Manejo de cargas" },
    ],
  },
  {
    titulo: "5. Política no fumar",
    items: [
      { key: "presenciaColillas", label: "Presencia de colillas" },
      { key: "senalizacionAreas", label: "Señalización de áreas" },
    ],
  },
  {
    titulo: "6. Peligros eléctricos",
    items: [
      { key: "estadoCablesExtensiones", label: "Estado de cables / extensiones" },
      { key: "estadoCajasTableros", label: "Estado de cajas / tableros" },
      { key: "senalizacion", label: "Señalización" },
      { key: "sistemasAterrizados", label: "Sistemas aterrizados" },
      { key: "tomaCorrientesLamparas", label: "Toma corrientes / Lámparas" },
    ],
  },
  {
    titulo: "7. Sistemas de Alarma y control",
    items: [
      { key: "extintoresNumeroEstado", label: "Extintores, Numero y estado" },
      { key: "libreAccesoSistemasControl", label: "Libre acceso a sistemas de control" },
      { key: "otrosSistemasControl", label: "Otros sistemas de control" },
      { key: "sistemaAlarmaOperacional", label: "Sistema de alarma operacional" },
    ],
  },
  {
    titulo: "8. Salidas de emergencia",
    items: [
      { key: "despejadasOperacionales", label: "Despejadas y operacionales" },
      { key: "rutasEvacuacionLibres", label: "Rutas de evacuación libres" },
      { key: "senalizadas", label: "Señalizadas" },
    ],
  },
  {
    titulo: "9. Peligros de seguridad",
    items: [
      { key: "senalizacionPreventiva", label: "Señalización preventiva" },
      { key: "guardasOperacionalesEstado", label: "Guardas operacionales / estado" },
      { key: "aislamientosEstado", label: "Aislamientos / estado" },
      { key: "estadoTuberias", label: "Estado de tuberías" },
      { key: "escapesFugas", label: "Escapes / Fugas" },
      { key: "estadoHerramientas", label: "Estado de herramientas" },
      { key: "usoElementosProteccionPersonal", label: "Uso de elementos de protección personal" },
    ],
  },
];

export const opcionesCantidadOtros = Array.from({ length: 5 }, (_, index) => String(index + 1));
