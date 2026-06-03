export type InspectionTypeKey =
  | "arnes"
  | "eslingas"
  | "descendedor"
  | "mosqueton"
  | "autoretracto"
  | "freno"
  | "tieoff"
  | "linea-vida";

export type ChecklistItem = {
  key: string;
  factor: string;
  instrucciones: string | string[];
};

export type InspectionType = {
  label: string;
  checklist: ChecklistItem[];
};

export const inspectionTypes: Record<InspectionTypeKey, InspectionType> = {
  arnes: {
    label: "INSPECCIÓN ARNÉS",
    checklist: [
      {
        key: "observaciones_previas",
        factor: "Observaciones previas",
        instrucciones: [
          "Compruebe la presencia y la legibilidad del número de serie y del marcado.",
          "Compruebe que no se haya superado la vida útil del producto.",
          "Compare con un aparato nuevo la ausencia de modificación o pérdida de un elemento.",
        ],
      },
      {
        key: "revision_cintas",
        factor: "Revisión del estado de las cintas",
        instrucciones: [
          "Controle los cortes, aumento de grosor, daños y desgastes debidos a la utilización, al calor, a los productos químicos.",
          "Controle las cintas del cinturón, perneras, unión perneras/cinturón y tirantes si los hay. No olvide las zonas escondidas por las hebillas y los puntos de enganche.",
          "Compruebe el estado de las costuras de seguridad (por encima/por debajo). Detecte cualquier hilo flojo, desgastado o cortado. Las costuras de seguridad son identificables por ser de hilos de colores diferentes a los de la cinta.",
        ],
      },
      {
        key: "revision_puntos_enganche",
        factor: "Revisión de los puntos de enganche",
        instrucciones: [
          "Compruebe el estado de los puntos de enganche metálicos (marcas, fisuras, desgaste, deformación, corrosión...).",
          "Compruebe el estado de los puntos de enganche textiles (cortes, desgastes, desgarro...).",
        ],
      },
      {
        key: "revision_hebillas_regulacion",
        factor: "Revisión del estado de las hebillas de regulación",
        instrucciones: [
          "Compruebe el estado de las hebillas de regulación (marcas, fisuras, desgaste, deformación, corrosión...).",
          "Compruebe que las cintas están pasadas correctamente (sin torsiones).",
          "Compruebe el correcto funcionamiento de las hebillas.",
        ],
      },
      {
        key: "revision_casquillo_bloqueo",
        factor: "Revisión del casquillo de bloqueo automático",
        instrucciones: [
          "Compruebe el estado del casquillo de bloqueo (marcas, deformación, corrosión, fisuras...).",
          "Compruebe el funcionamiento correcto del sistema de bloqueo del casquillo, según el modo de abertura descrito en la ficha técnica de su conector.",
          "Compruebe el bloqueo automático completo al soltar el gatillo y el casquillo. Si es necesario, limpie con agua y jabón y lubrique ligeramente (ej. polvo de grafito).",
        ],
      },
      {
        key: "caso_particular_arnes",
        factor: "Caso particular del arnés",
        instrucciones: [
          "Compruebe el estado del puente de enganche textil (cortes, desgaste, desgarro...). Para los puentes de enganche de cuerda, asegúrese de que la cuerda no presenta ningún corte, quemadura, hilos deshilachados, zonas despeluchadas o rastros de productos químicos.",
          "Compruebe el estado de los anillos con cierre (marcas, fisuras, desgaste, deformación, corrosión...). Compruebe que el tornillo está bien apretado.",
        ],
      },
    ],
  },
  eslingas: {
    label: "INSPECCIÓN ESLINGAS",
    checklist: [
      {
        key: "observaciones_previas",
        factor: "Observaciones previas",
        instrucciones: [
          "Compruebe la presencia y la legibilidad del número de serie y del marcado.",
          "Compruebe que no se haya superado la vida útil del producto.",
          "Compare con un aparato nuevo la ausencia de modificación o pérdida de un elemento.",
        ],
      },
      {
        key: "revision_cintas",
        factor: "Revisión del estado de las cintas",
        instrucciones: [
          "Vigile el desgaste y los daños debidos a la utilización (cortes, zonas despeluchadas, rastros de productos químicos...).",
          "Compruebe el estado de las costuras de seguridad (por encima/por debajo). Detecte cualquier hilo flojo, desgastado o cortado.",
        ],
      },
      {
        key: "revision_cinta_absorbedora_energia",
        factor: "Revisión del estado de la cinta absorbedora de energía",
        instrucciones: [
          "Compruebe el estado de la funda. Vigile el desgaste y los daños debidos a la utilización (cortes, zonas despeluchadas, rastros de productos químicos...).",
          "Abra la funda y extraiga la cinta absorbedora de energía de ser necesario.",
          "Vigile el desgaste y los daños debidos a la utilización (cortes, zonas despeluchadas, rastros de productos químicos...).",
          "Compruebe el estado de las costuras de seguridad (por encima/por debajo). Detecte cualquier hilo flojo, desgastado o cortado.",
          "Compruebe si el absorbedor de energía ha sufrido un choque (compruebe la ausencia de desgarro del cosido entre las cintas).",
        ],
      },
      {
        key: "revision_conectores_puntas_amarre",
        factor: "Revisión del estado de los conectores de las puntas de los elementos de amarre",
        instrucciones: [
          "Compruebe el estado del gatillo (marcas, desgaste, deformación, corrosión, fisuras...).",
          "Compruebe el estado del remache (grietas, deformación, corrosión...).",
          "Compruebe la abertura manual completa del gatillo.",
          "Compruebe el cierre automático del gatillo, la eficacia del muelle de retorno y el alineamiento gatillo/punta.",
        ],
      },
    ],
  },
  descendedor: {
    label: "INSPECCIÓN DESCENDEDOR",
    checklist: [
      {
        key: "observaciones_previas",
        factor: "Observaciones previas",
        instrucciones: [
          "Compruebe la presencia y la legibilidad del número de serie y del marcado.",
          "Compruebe que no se haya superado la vida útil del producto.",
          "Compare con un aparato nuevo la ausencia de modificación o pérdida de un elemento.",
        ],
      },
      {
        key: "revision_estado_cuerpo_descendedor",
        factor: "Revisión del estado del cuerpo",
        instrucciones: [
          "Compruebe el estado del cuerpo (marcas, desgaste, fisuras, deformación, corrosión...).",
          "Compruebe el estado de los orificios de conexión (marcas, deformaciones, fisuras, corrosión...).",
          "Compruebe el desgaste provocado por el paso de la cuerda.",
          "Compruebe la presencia de todos los dientes y su estado de desgaste. Los dientes no deben tener suciedad. Si es necesario, límpielos con la ayuda de un cepillo.",
          "Compruebe que el testigo de desgaste no es visible.",
        ],
      },
      {
        key: "revision_leva_descendedor",
        factor: "Revisión de la leva",
        instrucciones: [
          "Compruebe el estado de la leva (marcas, deformación, fisuras, corrosión...).",
          "Compruebe la presencia de todos los dientes y su estado de desgaste. Los dientes no deben tener suciedad. Si es necesario, límpielos con la ayuda de un cepillo.",
          "Compruebe el estado del eje de la leva y del remache (marcas, deformaciones, fisuras, corrosión...).",
          "Compruebe la rotación de la leva y la eficacia del muelle de retorno.",
        ],
      },
      {
        key: "revision_tope_seguridad_descendedor",
        factor: "Revisión del tope de seguridad",
        instrucciones: [
          "Compruebe el estado del tope y de su eje (marcas, deformaciones, fisuras, corrosión...).",
          "Compruebe la eficacia del muelle de retorno del tope.",
          "Compruebe el correcto funcionamiento del bloqueo del tope.",
        ],
      },
      {
        key: "revision_placa_lateral_movil_descendedor",
        factor: "Revisión de la placa lateral móvil",
        instrucciones: [
          "Compruebe el estado de la placa lateral móvil (marcas, deformaciones, aplastamiento, fisuras, desgastes...).",
          "Compruebe el estado del gatillo y la eficacia del muelle.",
          "Compruebe la apertura y el cierre de la placa lateral móvil. - Compruebe la holgura y la deformación de la placa lateral móvil: si la placa puede pasar por encima de la cabeza del eje de la leva, deje de utilizar el producto.",
          "Compruebe el estado del orificio de conexión (marcas, deformaciones, fisuras, corrosión...).",
          "Compruebe el estado de los remaches (marcas, deformaciones, fisuras, corrosión, ausencia de holgura...).",
        ],
      },
      {
        key: "revision_estado_cuerpo_bloqueador_descendedor",
        factor: "Revisión del estado del cuerpo",
        instrucciones: [
          "Compruebe el estado de la leva y de su eje (marcas, deformaciones, suciedad, fisuras, corrosión...). Testigo de desgaste, si la garganta está desgastada hasta el testigo de desgaste, deje de utilizar.",
          "Compruebe la rotación de la leva.",
          "Compruebe la eficacia del muelle de retorno de la leva.",
          "Compruebe el estado del patín (marcas, deformaciones, suciedad, fisuras...).",
          "Compruebe el estado del orificio de conexión (marcas, deformaciones, fisuras, corrosión...).",
          "Compruebe el estado de la leva indicadora de error (marcas, deformaciones, fisuras, corrosión...). Compruebe la presencia de todos los dientes y su estado de desgaste. Los dientes no deben tener suciedad. Si es necesario, límpielos con la ayuda de un cepillo.",
          "Compruebe la rotación de la leva indicadora de error y la eficacia del muelle de retorno.",
          "Compruebe el estado de los remaches (marcas, deformaciones, fisuras, corrosión, ausencia de holgura...).",
        ],
      },
      {
        key: "revision_empunadura_descendedor",
        factor: "Revisión del estado de la empuñadura",
        instrucciones: [
          "Compruebe el estado de la empuñadura (marcas, deformaciones, fisuras...).",
          "Compruebe que todas las posiciones de la empuñadura son accesibles y están bien marcadas.",
          "Compruebe el correcto funcionamiento del muelle de retorno de la empuñadura.",
          "Compruebe el correcto funcionamiento del botón de posicionamiento horizontal.",
        ],
      },
      {
        key: "revision_funcional_descendedor_arnes",
        factor: "Revisión funcional",
        instrucciones: "Realice una prueba de funcionamiento con el aparato en el arnés. Tire de la cuerda lado anclaje, el aparato debe bloquear la cuerda.",
      },
      {
        key: "revision_funcional_descendedor_bloqueador",
        factor: "Revisión funcional",
        instrucciones: "Compruebe que el bloqueador deslice a lo largo de la cuerda en un sentido y bloquee en sentido contrario.",
      },
    ],
  },
  mosqueton: {
    label: "INSPECCIÓN MOSQUETÓN",
    checklist: [
      {
        key: "revision_cuerpo_mosqueton",
        factor: "Revisión del cuerpo",
        instrucciones: [
          "Para comprobar correctamente el conector, debe ser desmontado de cualquier aparato que pueda esconder una parte del cuerpo: Elemento de amarre, elemento de amarre absorbedor de energía, polea, etc...",
          "Compruebe el estado del cuerpo (marcas, desgaste, fisuras, deformación, corrosión...).",
          "Compruebe el desgaste provocado por el paso de la cuerda o el apoyo en los anclajes (profundidad de las marcas: un desgaste de más de 1 mm de profundidad es grave, aparición de aristas cortantes...).",
          "Compruebe el estado de la punta (marcas, desgaste, fisuras, deformación...).",
        ],
      },
      {
        key: "revision_gatillo_mosqueton",
        factor: "Revisión del gatillo (según el modelo de conector)",
        instrucciones: [
          "Compruebe el estado del gatillo (marcas, desgaste, deformación, corrosión, fisuras...).",
          "Compruebe que el orificio del Keylock esté limpio.",
          "Compruebe el estado del remache (grietas, deformación, corrosión...).",
          "Compruebe la abertura manual completa del gatillo.",
          "Compruebe el cierre automático del gatillo, la eficacia del muelle de retorno y el alineamiento gatillo/punta.",
        ],
      },
      {
        key: "revision_casquillo_bloqueo_manual_mosqueton",
        factor: "Revisión del casquillo de bloqueo manual (según el modelo de conector)",
        instrucciones: [
          "Compruebe el estado del casquillo de bloqueo (marcas, deformación, corrosión, fisuras...).",
          "Compruebe el recorrido completo del casquillo al bloquear y desbloquear. Si es necesario, limpie con agua y jabón y lubrique ligeramente (ej. polvo de grafito).",
          "Compruebe que el casquillo no gire en el vacío en su posición de parada.",
        ],
      },
      {
        key: "revision_casquillo_bloqueo_automatico_mosqueton",
        factor: "Revisión del casquillo de bloqueo automático (según el modelo de conector)",
        instrucciones: [
          "Compruebe el estado del casquillo de bloqueo (marcas, deformación, corrosión, fisuras...).",
          "Compruebe el funcionamiento correcto del sistema de bloqueo del casquillo, según el modo de abertura descrito en la ficha técnica de su conector.",
          "Compruebe el bloqueo automático completo al soltar el gatillo y el casquillo. Si es necesario, limpie con agua y jabón y lubrique ligeramente (ej. polvo de grafito).",
        ],
      },
    ],
  },
  autoretracto: {
    label: "INSPECCIÓN AUTORETRACTO",
    checklist: [
      {
        key: "observaciones_previas",
        factor: "Observaciones previas",
        instrucciones: [
          "Compruebe la presencia y la legibilidad del número de serie y del marcado.",
          "Compruebe que no se haya superado la vida útil del producto.",
          "Compare con un aparato nuevo la ausencia de modificación o pérdida de un elemento.",
        ],
      },
      {
        key: "revision_placas_laterales_autoretracto",
        factor: "Revisión del estado de las placas laterales",
        instrucciones: [
          "Compruebe el estado de las placas laterales (marcas, deformaciones, fisuras, corrosión, desgaste...).",
          "Compruebe el estado de los orificios de conexión (marcas, deformaciones, fisuras, corrosión...).",
          "Para las poleas con placas laterales móviles, compruebe la correcta rotación de las placas laterales.",
          "Compruebe el estado de los remaches (marcas, deformaciones, fisuras, corrosión, ausencia de holgura...).",
        ],
      },
      {
        key: "revision_roldana_autoretracto",
        factor: "Revisión del estado de la roldana",
        instrucciones: [
          "Compruebe el estado de la roldana (marcas, deformación, fisuras, corrosión, ausencia de cuerpos extraños...).",
          "Compruebe que la roldana gire libremente.",
        ],
      },
      {
        key: "revision_casquillo_bloqueo_manual_autoretracto",
        factor: "Revisión del casquillo de bloqueo manual (según el modelo de conector)",
        instrucciones: [
          "Asegurarse de que el cable del auto retráctil no tenga aplastamientos, dobleces, quemaduras, desgaste, oxidación, astillamientos o deshilachados.",
          "Verificar que los ganchos abran y cierren sin atorarse y que estén libres de corrosión. Tirar de la línea o cinta para asegurarse de que se extienda completamente sin atorarse y que se retraiga sin detenerse.",
          "Realizar una prueba tirando de la línea de forma brusca para verificar que el mecanismo de bloqueo funcione correctamente, activándose instantáneamente.",
        ],
      },
      {
        key: "revision_funcional_autoretracto",
        factor: "Revisión funcional",
        instrucciones: [
          "Instale la polea en un anclaje e instale una cuerda compatible alrededor de la roldana.",
          "Haga circular la cuerda en los dos sentidos.",
        ],
      },
    ],
  },
  freno: {
    label: "INSPECCIÓN FRENO",
    checklist: [
      {
        key: "observaciones_previas",
        factor: "Observaciones previas",
        instrucciones: [
          "Compruebe la presencia y la legibilidad del número de serie y del marcado.",
          "Compruebe que no se haya superado la vida útil del producto.",
          "Compare con un aparato nuevo la ausencia de modificación o pérdida de un elemento.",
        ],
      },
      {
        key: "estado_general_freno",
        factor: "Estado General",
        instrucciones: [
          "Busca cualquier signo de daño como cortes, quemaduras, perforaciones o deformidades en las partes metálicas, plásticas y correas.",
          "Oxidación: Verifica que no haya oxidación ni corrosión en ninguna parte del equipo.",
          "Costuras: Asegúrate de que las costuras estén firmes y sin desprendimientos.",
          "Marcas de Impacto: Revisa que los indicadores de impacto estén intacto.",
        ],
      },
      {
        key: "seguro_freno",
        factor: "Seguro",
        instrucciones: [
          "Comprueba que el seguro se activa correctamente para evitar la apertura en momentos inoportunos.",
          "Resorte: Asegúrate de que el resorte funcione correctamente y regrese a su posición original.",
          "Leva: Verifica el estado de la leva y que todos sus dientes estén presentes.",
          "Dirección de Uso: Comprueba la dirección de uso y que el freno se pueda cerrar solo en la posición correcta.",
        ],
      },
      {
        key: "revision_funcional_freno",
        factor: "Revisión funcional",
        instrucciones: [
          "Revisa si engrana con el sistema de protección anticaídas y no presenta deslizamiento.",
          "Impacto: Si el equipo ha sufrido un impacto debido a una caída, debe ser inspeccionado por una persona calificada, no solo por el usuario.",
          "Documentación: Los resultados deben documentarse en un informe para generar un registro del estado del equipo.",
        ],
      },
    ],
  },
  "tieoff": {
    label: "INSPECCIÓN TIE-OFF",
    checklist: [
      {
        key: "observaciones_previas",
        factor: "Observaciones previas",
        instrucciones: [
          "Compruebe la presencia y la legibilidad del número de serie y del marcado.",
          "Compruebe que no se haya superado la vida útil del producto.",
          "Compare con un aparato nuevo la ausencia de modificación o pérdida de un elemento.",
        ],
      },
      {
        key: "revision_cinta_tieoff",
        factor: "Revisión del estado de la cinta",
        instrucciones: [
          "Controle el estado de la cinta en toda su longitud: vigile los cortes, desgastes y daños debidos al uso, al calor, a los productos químicos...",
          "Atención a los hilos cortados.",
          "Compruebe el estado de las costuras de seguridad (por encima/por debajo). Detecte cualquier hilo flojo, desgastado o cortado.",
        ],
      },
      {
        key: "revision_puntos_enganche_hebilla_tieoff",
        factor: "Revisión de los puntos de enganche y de la hebilla de regulación (según los modelos)",
        instrucciones: [
          "Controle el estado de los puntos de enganche y de la hebilla de regulación: marcas, fisuras, desgaste, deformación, corrosión...",
          "Controle el funcionamiento de la hebilla de regulación.",
        ],
      },
      {
        key: "revision_recubrimiento_nylon_tieoff",
        factor: "Revisión del recubrimiento de Nylon",
        instrucciones: [
          "Verifique que el recubrimiento de nylon no tenga partes levantadas y que este completo.",
          "Asegúrese que no hayan partes metálicas descubiertas",
        ],
      },
    ],
  },
  "linea-vida": {
    label: "LÍNEA DE VIDA",
    checklist: [
      {
        key: "observaciones_previas",
        factor: "Observaciones previas",
        instrucciones: [
          "Compruebe la presencia y la legibilidad del número de serie y del marcado.",
          "Compruebe que no se haya superado la vida útil del producto.",
          "Compare con un aparato nuevo la ausencia de modificación o pérdida de un elemento.",
        ],
      },
      {
        key: "revision_funda_linea_vida",
        factor: "Revisión del estado de la funda",
        instrucciones: "Revise el estado de la funda en toda la longitud de la cuerda. Asegúrese de que no presenta ningún corte, quemadura, hilos deshilachados, zonas despeluchadas o rastros de productos químicos...",
      },
      {
        key: "revision_alma_linea_vida",
        factor: "Revisión del estado del alma",
        instrucciones: "Realice un control táctil del alma, en toda la longitud de la cuerda, como se indica en el dibujo. Esto le permitirá detectar las zonas donde el alma está deteriorada (puntos duros, abultamientos, zonas blandas o aplastadas...).",
      },
      {
        key: "revision_fundas_terminales_linea_vida",
        factor: "Revisión de las fundas plásticas y de los terminales cosidos",
        instrucciones: [
          "Compruebe el estado de las fundas plásticas (desgastes, cortes...).",
          "Compruebe el estado de los terminales cosidos y de las costuras de seguridad (por encima/por debajo). Detecte cualquier hilo flojo, desgastado o cortado.",
        ],
      },
      {
        key: "revision_longitud_cuerda_linea_vida",
        factor: "Revisión de la longitud de la cuerda y de la mitad de la cuerda",
        instrucciones: [
          "Para controlar la longitud de la cuerda, siga los siguientes pasos:",
          "Desenrolle completamente la cuerda.",
          "Controle el marcado de la mitad de la cuerda. Existe un método muy fácil para encontrar la mitad de la cuerda: sujete juntas las dos puntas de la cuerda y, después, haga deslizar los dos cabos simultáneamente en sus manos hasta alcanzar la mitad de la cuerda.",
          "Si la cuerda tiene un marcado de mitad de la cuerda, compruebe que se encuentra en el lugar correcto. Si el marcado es OK, continúe con el paso siguiente.",
          "Si el marcado de la cuerda no está en el lugar correcto o si no tiene marcado de mitad de la cuerda, coloque una cinta adhesiva en la mitad de la cuerda para realizar la medición de la longitud de la cuerda.",
          "Para finalizar la medición, tire de la cuerda y después aflóje la cuerda.",
          "Mida la longitud de la cuerda. Para ello, haga una marca de 1 m en una superficie plana (mesa o similar).",
          "Mida cada metro de cuerda con esta referencia haciendo pasar la cuerda hasta la mitad de la cuerda.",
          "Mida la mitad de la longitud de la cuerda y, a continuación, multiplique por dos el valor resultante para obtener la longitud total de la cuerda.",
        ],
      },
    ],
  },
};

export const inspectionTypeKeys: InspectionTypeKey[] = [
  "arnes",
  "eslingas",
  "descendedor",
  "mosqueton",
  "autoretracto",
  "freno",
  "tieoff",
  "linea-vida",
];

export const decisionOptions = [
  { value: "", label: "--Seleccione--" },
  { value: "apto", label: "APTO PARA SER UTILIZADO" },
  { value: "no-apto", label: "NO APTO PARA SER UTILIZADO" },
];

