import { FormatDetail } from "../components/FormatDetail";

export const metadata = {
  title: "HSE-F010 - Lista de chequeo de las condiciones de seguridad",
};

export default function ListaChequeoCondicionesSeguridadPage() {
  return (
    <FormatDetail
      codigo="HSE-F010"
      nombre="LISTA DE CHEQUEO DE LAS CONDICIONES DE SEGURIDAD"
      area="INSPECCIONES"
      responsable="MARIANA"
    />
  );
}
