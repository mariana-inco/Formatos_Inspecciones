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
    nombre: "Inspección de Equipos de Protección contra Caídas",
    area: "Inspecciones",
    responsable: "Mariana Gomez",
    ruta: "/formatos/inspeccion-equipos-proteccion-contra-caidas",
  },
  {
    codigo: "HSE-F002",
    nombre: "Entrega de EPP",
    area: "Inspecciones",
    responsable: "Mariana Gomez",
    ruta: "/formatos/entrega-epp",
  },
  {
    codigo: "HSE-F020",
    nombre: "Verificación de alcohol y drogas",
    area: "Inspecciones",
    responsable: "Mariana Gomez",
    ruta: "/formatos/verificacion-alcohol-drogas",
  },
  {
    codigo: "HSE-F003",
    nombre: "Inspección y verificación de extintores",
    area: "Inspecciones",
    responsable: "Mariana Gomez",
    ruta: "/formatos/inspeccion-extintores",
  },
  {
    codigo: "HSE-F010",
    nombre: "Lista de chequeo condiciones de seguridad",
    area: "Inspecciones",
    responsable: "Mariana Gomez",
    ruta: "/formatos/lista-chequeo-condiciones-seguridad",
  },
];
