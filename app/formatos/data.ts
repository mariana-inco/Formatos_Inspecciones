export type Formato = {
  codigo: string;
  nombre: string;
  area: string;
  responsable: string;
  ruta: string;
};

export const formatos: Formato[] = [
  {
    codigo: "HSE-F006",
    nombre: "INSPECCIÓN DE EQUIPOS DE PROTECCIÓN CONTRA CAÍDAS",
    area: "INSPECCIONES",
    responsable: "MARIANA",
    ruta: "/formatos/inspeccion-equipos-proteccion-contra-caidas",
  },
  {
    codigo: "HSE-F002",
    nombre: "INSPECCIÓN EPP",
    area: "INSPECCIONES",
    responsable: "MARIANA",
    ruta: "/formatos/inspeccion-epp",
  },
  {
    codigo: "HSE-F020",
    nombre: "VERIFICACIÓN EN SITIO DE ALCOHOL Y DROGAS",
    area: "INSPECCIONES",
    responsable: "MARIANA",
    ruta: "/formatos/verificacion-alcohol-drogas",
  },
  {
    codigo: "HSE-F003",
    nombre: "INSPECCIÓN Y VERIFICACIÓN DE EXTINTORES",
    area: "INSPECCIONES",
    responsable: "MARIANA",
    ruta: "/formatos/inspeccion-extintores",
  },
  {
    codigo: "HSE-F010",
    nombre: "LISTA DE CHEQUEO DE LAS CONDICIONES DE SEGURIDAD",
    area: "INSPECCIONES",
    responsable: "MARIANA",
    ruta: "/formatos/lista-chequeo-condiciones-seguridad",
  },
];
