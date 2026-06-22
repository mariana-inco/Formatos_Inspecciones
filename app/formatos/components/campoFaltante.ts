const etiquetasCampo: Record<string, string> = {
  email: "Correo electrónico",
  fechaInspeccion: "Fecha de inspección",
  fecha: "Fecha",
  lugar: "Lugar",
  areaTrabajo: "Área de trabajo",
  nombreColaborador: "Nombre del colaborador",
  cargoTrabajador: "Cargo del trabajador",
  firmaColaborador: "Firma",
  centroTrabajoSede: "Centro de trabajo / sede",
  tipoPrueba: "Tipo de prueba",
  criteriosTomaMuestra: "Criterios de toma de muestra",
  equipoUtiliza: "Equipo que utiliza",
  tipoIdentificacionRealizaPrueba: "Tipo de identificación de quien realiza la prueba",
  identificacionRealizaPrueba: "Identificación de quien realiza la prueba",
  nombreRealizaPrueba: "Nombre de quien realiza la prueba",
  cargoRealizaPrueba: "Cargo de quien realiza la prueba",
  empresaPersonaEvaluada: "Empresa de la persona evaluada",
  personaPrueba: "Persona evaluada",
  numeroIdentificacionPersona: "Número de identificación de la persona",
  empresaContratistaPersona: "Empresa contratista de la persona",
  cargoPersona: "Cargo de la persona",
  resultadoPrimeraPruebaInicial: "Resultado de la primera prueba",
  gradoDetectado: "Grado detectado",
  resultadoSegundaPruebaConfirmatoria: "Resultado de la segunda prueba",
  gradoDetectadoSegundaPrueba: "Grado detectado en segunda prueba",
  imagenEvidencia: "Imagen de evidencia",
  firmaPersonaEvaluada: "Firma de la persona evaluada",
  hayTestigo: "Confirmación de testigo",
  nombreTestigo: "Nombre del testigo",
  cargoTestigo: "Cargo del testigo",
  confirmar: "Confirmación final",
  sedeCentroTrabajo: "Sede / centro de trabajo",
  responsableInspeccion: "Responsable de inspección",
  cargoResponsable: "Cargo del responsable",
  equipoInterno: "Tipo de equipo",
  firmaResponsable: "Firma del responsable",
  numeroExtintor: "Número del extintor",
  ubicacion: "Ubicación",
  capacidad: "Capacidad",
  agente: "Agente",
  clase: "Clase",
  fechaUltimaRecarga: "Fecha de última recarga",
  fechaProximaRecarga: "Fecha de próxima recarga",
  inspector: "Inspector",
  areaInspeccionada: "Área inspeccionada",
  maquinariaHerramientas: "Maquinaria / herramientas",
  numeroTrabajadoresArea: "Número de trabajadores del área",
  puestosTrabajo: "Puestos de trabajo",
  sustanciasUtilizadas: "Sustancias utilizadas",
  agregarRegistro: "Agregar registro",
  agregarRegistroEpp: "Agregar registro",
  agregarRegistroAlcoholDrogas: "Agregar registro",
  agregarDatosEquipo: "Agregar datos del equipo",
  decisionFinal: "Decisión final",
  inspectorIdentificacion: "Identificación del inspector",
  inspectorNombre: "Nombre del inspector",
  inspectorCargo: "Cargo del inspector",
  inspectorFirma: "Firma del inspector",
  responsableIdentificacion: "Identificación del responsable",
  responsableNombre: "Nombre del responsable",
  responsableCargo: "Cargo del responsable",
  responsableFirma: "Firma del responsable",
};

const PersonId = (id: string) =>
  id
    .replace(/-\d+$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const obtenerEtiquetaCampo = (id: string) => {
  if (etiquetasCampo[id]) return etiquetasCampo[id];
  if (id.startsWith("otroEppCual-")) return "¿Cuál? del otro EPP";
  if (id.startsWith("otroEppCondicion-")) return "Condición del otro EPP";
  if (id.startsWith("otroCual-")) return "¿Cuál? de otros";
  if (id.startsWith("otroEstado-")) return "Estado de otros";
  if (id.startsWith("estado-")) return "Estado del ítem";
  if (id.startsWith("concepto-")) return "Concepto del ítem";
  return PersonId(id);
};

export const enfocarYMostrarCampoFaltante = (id: string) => {
  let campo = document.querySelector<HTMLElement>(`[name="${id}"], [data-required-id="${id}"]`);
  document.querySelectorAll(".mensaje-campo-faltante").forEach((mensaje) => mensaje.remove());

  if (!campo) {
    const etiquetaVisible = Array.from(document.querySelectorAll<HTMLElement>("label, p, h3, h4")).find((elemento) =>
      elemento.textContent?.toLowerCase().includes(id.toLowerCase())
    );
    campo = etiquetaVisible?.closest("div")?.querySelector<HTMLElement>("input, select, textarea, button, [data-required-id]") || null;
  }

  if (!campo) return;

  const mensaje = document.createElement("p");
  mensaje.className = "mensaje-campo-faltante mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700";
  mensaje.setAttribute("role", "alert");
  mensaje.textContent = `Falta diligenciar: ${obtenerEtiquetaCampo(id)}.`;

  campo.insertAdjacentElement("afterend", mensaje);
  campo.scrollIntoView({ behavior: "smooth", block: "center" });
  campo.focus({ preventScroll: true });

  const limpiarMensaje = () => mensaje.remove();
  campo.addEventListener("input", limpiarMensaje, { once: true });
  campo.addEventListener("change", limpiarMensaje, { once: true });
  campo.addEventListener("click", limpiarMensaje, { once: true });
};
