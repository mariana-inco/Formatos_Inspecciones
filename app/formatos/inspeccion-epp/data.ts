export const FORM_META = {
  codigo: "HSE-F002",
  fecha: "2025-09-09",
  version: "04",
  titulo: "INSPECCIÓN DE ELEMENTOS DE PROTECCIÓN PERSONAL",
  area: "Gestión HSE",
};

export const opcionesCondicion = ["BUENO", "REGULAR", "MALO", "N/A"] as const;

export type CondicionEpp = "" | (typeof opcionesCondicion)[number];

export type CampoEppKey =
  | "casco"
  | "caretaEsmerilar"
  | "caretaSoldadura"
  | "monogafas"
  | "copa"
  | "insercion"
  | "guantePoliuretano"
  | "guanteCaucho"
  | "guanteNitrilo"
  | "guanteVaqueta"
  | "mangaCarnaza"
  | "guantesSoldador"
  | "mascarillaPolvoM10"
  | "respiradorMediaCara"
  | "petoCarnaza"
  | "botaCaucho"
  | "botasSeguridad"
  | "botaSoldador"
  | "otrosEpps";

export type CampoEpp = {
  key: CampoEppKey;
  label: string;
};

export const camposEpp: CampoEpp[] = [
  { key: "casco", label: "CASCO" },
  { key: "caretaEsmerilar", label: "CARETA DE ESMERILAR" },
  { key: "caretaSoldadura", label: "CARETA SOLDADURA" },
  { key: "monogafas", label: "MONOGAFAS" },
  { key: "copa", label: "COPA" },
  { key: "insercion", label: "INSERCIÓN" },
  { key: "guantePoliuretano", label: "GUANTE POLIURETANO" },
  { key: "guanteCaucho", label: "GUANTE DE CAUCHO" },
  { key: "guanteNitrilo", label: "GUANTE NITRILO" },
  { key: "guanteVaqueta", label: "GUANTE VAQUETA" },
  { key: "mangaCarnaza", label: "MANGA DE CARNAZA" },
  { key: "guantesSoldador", label: "GUANTES DE SOLDADOR" },
  { key: "mascarillaPolvoM10", label: "MASCARILLA POLVO M 10" },
  { key: "respiradorMediaCara", label: "RESPIRADOR MEDIA CARA" },
  { key: "petoCarnaza", label: "PETO DE CARNAZA" },
  { key: "botaCaucho", label: "BOTA CAUCHO" },
  { key: "botasSeguridad", label: "BOTAS DE SEGURIDAD" },
  { key: "botaSoldador", label: "BOTA SOLDADOR" },
  { key: "otrosEpps", label: "OTROS EPPS" },
];

export const gruposTablaEpp: { label: string; fields: CampoEpp[] }[] = [
  {
    label: "CABEZA, ROSTRO Y OJOS",
    fields: camposEpp.filter((campo) =>
      ["casco", "caretaEsmerilar", "caretaSoldadura", "monogafas"].includes(campo.key)
    ),
  },
  {
    label: "OÍDOS",
    fields: camposEpp.filter((campo) => ["copa", "insercion"].includes(campo.key)),
  },
  {
    label: "MANOS Y EXTREMIDADES",
    fields: camposEpp.filter((campo) =>
      [
        "guantePoliuretano",
        "guanteCaucho",
        "guanteNitrilo",
        "guanteVaqueta",
        "mangaCarnaza",
        "guantesSoldador",
      ].includes(campo.key)
    ),
  },
  {
    label: "SISTEMA RESPIRATORIO Y OTROS",
    fields: camposEpp.filter((campo) => ["mascarillaPolvoM10", "respiradorMediaCara"].includes(campo.key)),
  },
  {
    label: "CUERPO",
    fields: camposEpp.filter((campo) => ["petoCarnaza"].includes(campo.key)),
  },
  {
    label: "PIES",
    fields: camposEpp.filter((campo) => ["botaCaucho", "botasSeguridad", "botaSoldador"].includes(campo.key)),
  },
];
