// Guías de mantenimiento de la Yamaha MT-07, redactadas a partir del manual de servicio oficial (MT07A 2014).
// El manual es de la versión con ABS; la moto del usuario es una MT-07 de 2015 sin ABS, así que se omiten los pasos
// que solo afectan al ABS (unidad hidráulica, sensores de rueda, prueba con la herramienta de diagnóstico).
// Pasos comunes: quitar y poner el depósito de gasolina (necesario para el filtro de aire y las bujías).
const PARES_DEPOSITO = [
  'tornillo-del-asiento-del-piloto',
  'tornillo-de-la-tapa-superior-del-deposito',
  'tornillo-de-la-tapa-del-deposito-m5-12-mm',
  'tornillo-de-la-tapa-del-deposito-m5-16-mm',
  'tornillo-de-la-tapa-central-del-deposito',
  'tornillo-superior-de-la-tapa-delantera-del-deposito',
  'tornillo-inferior-de-la-tapa-delantera-del-deposito',
  'tornillo-del-soporte-trasero-del-deposito',
  'tornillo-del-soporte-delantero-del-deposito',
]

const QUITAR_DEPOSITO = [
  {
    titulo: 'Quitar asientos y tapas',
    texto:
      'Quita el asiento del pasajero y después el del piloto. Quita la tapa superior del depósito (1) (quita su tornillo, levanta la parte trasera y tira hacia atrás), las tapas laterales izquierda (2) y derecha (3) (tornillos y remache rápido), la tapa central (4) (tornillos y remache rápido) y la tapa delantera del depósito (5).',
    fig: 'mt07:4-11.0',
  },
  {
    titulo: 'Vaciar el depósito',
    texto: 'Saca la gasolina del depósito con una bomba por la boca de llenado.',
  },
  {
    titulo: 'Desconectar',
    texto:
      'Desconecta el conector del sensor de temperatura del aire (1), el tubo de rebose (2), el tubo respiradero (3) y el conector de la bomba de gasolina (4).',
    fig: 'mt07:7-1.0',
  },
  {
    titulo: 'Soltar la manguera de gasolina',
    texto:
      'Pon trapos debajo y tapa la conexión con un trapo: puede quedar presión y gasolina en la manguera. Desliza la tapa del conector (1) en el sentido de la flecha, aprieta los dos botones laterales (2) y saca la manguera a mano, sin herramientas.',
    fig: 'mt07:7-3.0',
  },
  {
    titulo: 'Quitar el depósito',
    texto:
      'Quita los tornillos del soporte trasero del depósito (1) y el del soporte delantero, y retira el depósito. Al levantarlo, no tires de los tubos de rebose y respiradero. No lo apoyes sobre la base de la bomba de gasolina: déjalo apoyado contra una pared.',
    fig: 'mt07:3-4.1',
  },
]

const PONER_DEPOSITO = [
  {
    titulo: 'Colocar el depósito',
    texto:
      'Coloca el depósito y aprieta solo provisionalmente el tornillo del soporte delantero. Conecta la manguera de gasolina en la rampa de inyectores y en la bomba hasta oír un «clic» y desliza la tapa del conector a su sitio.',
    aviso: 'Si la manguera de gasolina no queda bien enclavada y con la tapa del conector en su posición, puede soltarse.',
  },
  {
    titulo: 'Conectar y apretar',
    texto:
      'Conecta el conector de la bomba de gasolina, el tubo respiradero, el tubo de rebose y el sensor de temperatura del aire (revisa que los tubos de rebose y respiradero queden bien guiados). Aprieta los tornillos del soporte trasero a [[tornillo-del-soporte-trasero-del-deposito]] y después el del soporte delantero a [[tornillo-del-soporte-delantero-del-deposito]].',
    fig: 'mt07:3-4.0',
  },
  {
    titulo: 'Poner tapas y asientos',
    texto:
      'Monta la tapa delantera del depósito (tornillo superior a [[tornillo-superior-de-la-tapa-delantera-del-deposito]], inferior a [[tornillo-inferior-de-la-tapa-delantera-del-deposito]]), la tapa central ([[tornillo-de-la-tapa-central-del-deposito]]), las tapas laterales (tornillos M5 × 12 a [[tornillo-de-la-tapa-del-deposito-m5-12-mm]] y M5 × 16 a [[tornillo-de-la-tapa-del-deposito-m5-16-mm]]) y la tapa superior ([[tornillo-de-la-tapa-superior-del-deposito]]). Pon el asiento del piloto (encaja su ranura en el saliente del soporte; tornillo a [[tornillo-del-asiento-del-piloto]]) y el del pasajero.',
  },
]

export default [
  {
    id: 'mt07-aceite',
    titulo: 'Cambiar el aceite del motor y el filtro',
    grupo: 'Motor',
    cada: 'Aceite: a los 1.000 km, luego cada 10.000 km o cada año. Filtro: a los 1.000 km y luego cada 20.000 km',
    tiempo: '45 min',
    nivel: 1,
    resumen:
      'Vacía el aceite en caliente por el tapón del cárter, cambia el cartucho del filtro si toca y rellena con la cantidad exacta. El filtro se cambia en la primera revisión (1.000 km) y luego cada 20.000 km.',
    materiales: [
      'Aceite de motor YAMALUBE (recomendado): SAE 10W-30, 10W-40, 10W-50, 15W-40, 20W-40 o 20W-50 según la temperatura; API SG o superior, JASO MA',
      'Cantidad: 2,30 l sin cambiar el filtro · 2,60 l cambiando el filtro',
      'Cartucho de filtro de aceite nuevo (si toca)',
      'Arandela nueva para el tapón de vaciado',
      'Junta tórica nueva para el tapón de llenado',
    ],
    herramientas: [
      'Llave dinamométrica',
      'Llave de filtro de aceite (Yamaha 90890-01426 / YU-38411)',
      'Recipiente para el aceite usado',
      'Embudo',
    ],
    pares: ['tapon-de-vaciado-del-aceite-del-motor', 'filtro-de-aceite-cartucho'],
    avisos: [
      'El motor, el escape y el aceite queman: trabaja con guantes.',
      'El aceite también lubrica el embrague: no añadas aditivos químicos, no uses aceites de grado «CD» o superior ni etiquetados «ENERGY CONSERVING II»; podría patinar el embrague.',
      'No dejes que entre suciedad en el cárter.',
    ],
    pasos: [
      {
        titulo: 'Calentar el motor',
        texto: 'Arranca el motor, déjalo calentar unos minutos y páralo. Pon la moto recta sobre un caballete en suelo nivelado.',
      },
      {
        titulo: 'Vaciar el aceite',
        texto:
          'Pon el recipiente debajo del tapón de vaciado. Quita el tapón de llenado (1) y luego el tapón de vaciado (2) con su arandela (3). Deja que el cárter se vacíe por completo.',
        fig: ['mt07:3-22@135,308,272,430', 'mt07:3-22@76,440,272,558'],
      },
      {
        titulo: 'Quitar el filtro (si toca cambiarlo)',
        texto: 'Desenrosca el cartucho del filtro (1) con la llave de filtro (2).',
        fig: 'mt07:3-22.0',
      },
      {
        titulo: 'Montar el filtro nuevo',
        texto:
          'Unta la junta tórica (3) del filtro nuevo con una capa fina de aceite de motor. Comprueba que la junta queda bien asentada en su ranura. Enrosca el filtro y apriétalo con la llave de filtro a [[filtro-de-aceite-cartucho]].',
        fig: 'mt07:3-22@376,308,506,418',
        aviso: 'Si la junta tórica no está bien metida en la ranura, el filtro perderá aceite.',
      },
      {
        titulo: 'Poner el tapón de vaciado',
        texto: 'Monta el tapón de vaciado con una arandela nueva y apriétalo a [[tapon-de-vaciado-del-aceite-del-motor]].',
      },
      {
        titulo: 'Rellenar',
        texto:
          'Echa el aceite recomendado por la boca de llenado: 2,30 l si no has cambiado el filtro, 2,60 l si lo has cambiado. Elige la viscosidad según la temperatura ambiente con la tabla. Pon el tapón de llenado con una junta tórica nueva.',
        fig: 'mt07:3-21.2',
      },
      {
        titulo: 'Comprobar fugas',
        texto: 'Arranca el motor, déjalo calentar unos minutos y páralo. Revisa que no gotee aceite por el tapón ni por el filtro.',
      },
      {
        titulo: 'Comprobar el nivel',
        texto:
          'Con la moto recta en suelo nivelado, espera unos minutos a que el aceite baje y mira la mirilla: el nivel debe quedar entre la marca de mínimo (a) y la de máximo (b). Si está por debajo del mínimo, añade aceite del mismo tipo.',
        fig: 'mt07:3-21@310,252,540,378',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-1 a 3-2 (intervalos), 3-21 a 3-23',
  },
  {
    id: 'mt07-refrigerante',
    titulo: 'Cambiar el líquido refrigerante',
    grupo: 'Refrigeración',
    cada: 'Cada 3 años (nivel y fugas: cada 10.000 km o cada año)',
    tiempo: '1 h',
    nivel: 1,
    resumen:
      'Vacía el circuito por el tornillo de vaciado y el depósito de expansión, rellena el radiador con anticongelante mezclado al 50 % y comprueba el nivel con el motor caliente y luego reposado.',
    materiales: [
      'Anticongelante de etilenglicol de alta calidad con inhibidores de corrosión para motores de aluminio',
      'Agua destilada (si no tienes, agua blanda) para mezclar 1:1 (anticongelante : agua)',
      'Cantidad: 1,60 l el radiador con todo el circuito + 0,25 l el depósito de expansión hasta la marca de máximo',
      'Arandela de cobre nueva para el tornillo de vaciado',
    ],
    herramientas: ['Llave dinamométrica', 'Recipiente para el refrigerante usado', 'Trapo grueso o toalla', 'Embudo'],
    pares: ['tornillo-del-tapon-del-radiador', 'tornillo-del-deposito-de-refrigerante', 'tornillo-de-vaciado-del-refrigerante'],
    avisos: [
      'No abras el tapón del radiador con el motor caliente: el circuito está a presión y puede saltar líquido hirviendo.',
      'El refrigerante es tóxico. Si te salpica en los ojos, lávalos con mucha agua y ve al médico; si cae en la ropa, lávala con agua y luego con agua y jabón; si se traga, provoca el vómito y busca atención médica inmediata.',
      'Si cae sobre la pintura, lávala con agua enseguida.',
      'No mezcles tipos distintos de anticongelante. Rellenar solo con agua baja la protección anticongelante.',
    ],
    pasos: [
      {
        titulo: 'Abrir el tapón del radiador',
        texto:
          'Con el motor frío, quita el tornillo del tapón del radiador (1). Cubre el tapón (2) con un trapo grueso y gíralo despacio a la izquierda hasta el primer tope para que salga la presión. Cuando deje de silbar, empuja el tapón hacia abajo, sigue girando a la izquierda y quítalo.',
        fig: 'mt07:3-25.1',
      },
      {
        titulo: 'Quitar el depósito de expansión',
        texto:
          'Quita el tapón del depósito de expansión (1). Después quita el tornillo del depósito (1), el remache rápido (2), la tapa (3), el depósito (4) y el casquillo (5). Vacía el refrigerante del depósito.',
        fig: ['mt07:3-25.3', 'mt07:3-25.5'],
      },
      {
        titulo: 'Vaciar motor y radiador',
        texto: 'Pon el recipiente debajo y quita el tornillo de vaciado (1) con su arandela de cobre (2). Deja que se vacíen el motor y el radiador.',
        fig: 'mt07:3-25.0',
      },
      {
        titulo: 'Cerrar el vaciado',
        texto: 'Pon el tornillo de vaciado con una arandela de cobre nueva y apriétalo a [[tornillo-de-vaciado-del-refrigerante]].',
      },
      {
        titulo: 'Montar el depósito',
        texto:
          'Monta el casquillo, el depósito de expansión, su tapa y el remache rápido. Aprieta el tornillo del depósito a [[tornillo-del-deposito-de-refrigerante]].',
      },
      {
        titulo: 'Llenar el radiador',
        texto:
          'Llena el circuito por la boca del radiador con la mezcla 1:1 de anticongelante y agua destilada. Capacidad del radiador con todo el circuito: 1,60 l.',
      },
      {
        titulo: 'Cerrar el radiador',
        texto:
          'Pon el tapón del radiador (1) y su tornillo (2), haciendo coincidir el agujero (a) del tapón con el agujero (b) del radiador. Aprieta el tornillo a [[tornillo-del-tapon-del-radiador]].',
        fig: 'mt07:3-26@57,490,283,620',
      },
      {
        titulo: 'Llenar el depósito de expansión',
        texto: 'Llena el depósito de expansión con refrigerante hasta la marca de máximo (a) (unos 0,25 l) y pon su tapón.',
        fig: 'mt07:3-26.0',
      },
      {
        titulo: 'Calentar y comprobar el nivel',
        texto:
          'Arranca el motor, déjalo calentar unos minutos y páralo. Con la moto recta en suelo nivelado, espera unos minutos a que el líquido se asiente y mira el depósito: el nivel debe quedar entre la marca de máximo (a) y la de mínimo (b). Si está por debajo del mínimo, añade refrigerante. Revisa que no haya fugas.',
        fig: 'mt07:3-24@57,358,283,488',
        aviso: 'El manual no describe otra purga que esta: calentar el motor y volver a comprobar el nivel.',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-2 (intervalo), 3-24 a 3-26',
  },
  {
    id: 'mt07-pastillas-delanteras',
    titulo: 'Cambiar las pastillas de freno delanteras',
    grupo: 'Frenos',
    cada: 'Cuando estén gastadas hasta el límite (revisar cada 10.000 km o cada año)',
    tiempo: '1 h',
    nivel: 2,
    resumen:
      'Revisa los testigos de desgaste y, si hace falta, cambia las pastillas de las dos pinzas delanteras sin desconectar el latiguillo ni abrir la pinza. Se hace igual en las dos pinzas.',
    materiales: [
      'Juego de pastillas delanteras nuevas (dos pinzas)',
      'Muelle de pastillas nuevo para cada pinza (se cambia siempre junto con las pastillas)',
      'Líquido de frenos DOT 4 para reponer nivel',
    ],
    herramientas: [
      'Llave dinamométrica',
      'Tubo de plástico transparente y recipiente (para el purgador)',
      'Calibre (para medir el grosor de las pastillas)',
    ],
    pares: ['tornillo-de-la-pinza-de-freno-delantera', 'purgador-de-la-pinza-de-freno'],
    avisos: [
      'Cambia siempre las pastillas por juegos completos.',
      'El líquido de frenos daña la pintura y los plásticos: limpia enseguida lo que caiga.',
      'Si notas la maneta blanda o esponjosa al terminar, purga el freno antes de circular.',
    ],
    pasos: [
      {
        titulo: 'Comprobar el desgaste',
        texto:
          'Acciona el freno y mira los testigos de desgaste (a) de las pastillas. Si casi tocan el disco, cambia las pastillas.',
        fig: 'mt07:3-13.0',
      },
      {
        titulo: 'Quitar pasadores y muelle',
        texto: 'Quita los clips (1), el pasador de las pastillas (2) y el muelle de pastillas (3).',
        fig: 'mt07:4-42@58,522,280,640',
      },
      {
        titulo: 'Quitar pastillas y pinza',
        texto:
          'Saca las pastillas (1) y desmonta la pinza (2) de la botella de la horquilla quitando sus dos tornillos. No hace falta desconectar el latiguillo. No acciones la maneta con la pinza fuera.',
        fig: ['mt07:4-42.1', 'mt07:4-35.0'],
      },
      {
        titulo: 'Medir las pastillas',
        texto:
          'Mide el grosor del material de fricción (a) de cada pastilla. Nuevo: 4,5 mm. Límite: 0,5 mm. Si alguna está en el límite o por debajo, cambia el juego completo.',
        fig: 'mt07:4-42.3',
      },
      {
        titulo: 'Recoger los pistones',
        texto:
          'Conecta bien un tubo de plástico transparente (1) al purgador (2) y mete el otro extremo en un recipiente. Afloja el purgador y empuja con el dedo los pistones hacia dentro de la pinza. Cierra el purgador y apriétalo a [[purgador-de-la-pinza-de-freno]].',
        fig: 'mt07:4-43.0',
      },
      {
        titulo: 'Montar pastillas nuevas',
        texto:
          'Coloca las pastillas nuevas y un muelle de pastillas nuevo. La flecha (a) del muelle tiene que apuntar en el sentido de giro del disco.',
        fig: 'mt07:4-43.2',
      },
      {
        titulo: 'Montar la pinza',
        texto:
          'Pon el pasador de las pastillas y sus clips. Monta la pinza en la horquilla y aprieta sus tornillos a [[tornillo-de-la-pinza-de-freno-delantera]]. (La versión con ABS lleva además los soportes del cable del sensor en la pinza derecha.)',
      },
      {
        titulo: 'Repetir en la otra pinza',
        texto: 'Haz lo mismo en la otra pinza delantera.',
      },
      {
        titulo: 'Nivel y prueba',
        texto:
          'Con el depósito de la bomba horizontal, comprueba el nivel de líquido: si está por debajo de la marca de mínimo (a), añade DOT 4. Comprueba el funcionamiento de la maneta: si la notas blanda o esponjosa, purga el freno.',
        fig: 'mt07:3-15@311,450,549,568',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-13, 3-15, 4-35, 4-42 y 4-43',
  },
  {
    id: 'mt07-pastillas-traseras',
    titulo: 'Cambiar las pastillas de freno traseras',
    grupo: 'Frenos',
    cada: 'Cuando estén gastadas hasta el límite (revisar cada 10.000 km o cada año)',
    tiempo: '45 min',
    nivel: 2,
    resumen:
      'Revisa los testigos de desgaste y, si hace falta, desmonta la pinza trasera y cambia pastillas, chapas antirruido, aislantes y muelle. No hace falta desconectar el latiguillo ni abrir la pinza.',
    materiales: [
      'Juego de pastillas traseras nuevas',
      'Aislantes, chapas antirruido («shims») y muelle de pastillas nuevos (se cambian siempre junto con las pastillas)',
      'Grasa de silicona',
      'Fijador de roscas (LOCTITE®) para el tornillo de la pinza',
      'Líquido de frenos DOT 4 para reponer nivel',
    ],
    herramientas: [
      'Llave dinamométrica',
      'Tubo de plástico transparente y recipiente (para el purgador)',
      'Calibre (para medir el grosor de las pastillas)',
    ],
    pares: [
      'tapon-roscado-screw-plug',
      'tornillo-de-retencion-de-las-pastillas',
      'perno-de-retencion-de-la-pinza-de-freno-trasera',
      'tornillo-de-la-pinza-de-freno-trasera',
      'purgador-de-la-pinza-de-freno',
    ],
    avisos: [
      'Que no llegue grasa a las pastillas. Limpia la grasa sobrante.',
      'El líquido de frenos daña la pintura y los plásticos: limpia enseguida lo que caiga.',
      'Si notas el pedal blando o esponjoso al terminar, purga el freno antes de circular.',
    ],
    pasos: [
      {
        titulo: 'Comprobar el desgaste',
        texto: 'Acciona el freno y mira los testigos de desgaste (1). Si casi tocan el disco, cambia las pastillas.',
        fig: 'mt07:3-14@58,412,293,540',
      },
      {
        titulo: 'Desmontar la pinza',
        texto:
          'Sigue este orden: quita el tapón roscado (1), el tornillo de retención de las pastillas (2), el perno de retención de la pinza (3) y el tornillo de la pinza (4). Saca la pinza (5). No pises el pedal con la pinza fuera.',
        fig: 'mt07:4-49.0',
      },
      {
        titulo: 'Sacar las pastillas',
        texto: 'Saca las pastillas (6) con sus chapas antirruido (7) y aislantes (8), y el muelle de pastillas (9).',
        fig: 'mt07:4-49.0',
      },
      {
        titulo: 'Medir las pastillas',
        texto:
          'Mide el grosor del material de fricción (a). Nuevo: 6,0 mm. Límite: 1,0 mm. Si está en el límite o por debajo, cambia el juego completo.',
        fig: 'mt07:4-55.2',
      },
      {
        titulo: 'Recoger el pistón',
        texto:
          'Conecta bien un tubo transparente (1) al purgador (2) y mete el otro extremo en un recipiente. Afloja el purgador y empuja el pistón hacia dentro de la pinza con el dedo. Cierra el purgador y apriétalo a [[purgador-de-la-pinza-de-freno]].',
        fig: 'mt07:4-56@57,275,285,392',
      },
      {
        titulo: 'Preparar las pastillas nuevas',
        texto:
          'Monta en cada pastilla su aislante y su chapa antirruido, con grasa de silicona entre el aislante y la chapa. Que no llegue grasa al material de fricción; limpia lo que sobre.',
      },
      {
        titulo: 'Colocar muelle y pastillas',
        texto: 'Mete el muelle de pastillas en la pinza, con las patas largas (a) hacia el pistón, y coloca las pastillas.',
        fig: 'mt07:4-56.0',
      },
      {
        titulo: 'Montar la pinza',
        texto:
          'Engrasa con grasa de silicona el tornillo de la pinza y el perno de retención de la pinza. Monta la pinza y aprieta: tornillo de la pinza (con LOCTITE®) a [[tornillo-de-la-pinza-de-freno-trasera]], perno de retención de la pinza a [[perno-de-retencion-de-la-pinza-de-freno-trasera]], tornillo de retención de las pastillas a [[tornillo-de-retencion-de-las-pastillas]] y tapón roscado a [[tapon-roscado-screw-plug]].',
      },
      {
        titulo: 'Nivel y prueba',
        texto:
          'Comprueba el nivel del depósito del freno trasero: si está por debajo de la marca de mínimo (a), añade DOT 4. Comprueba el funcionamiento del pedal: si lo notas blando o esponjoso, purga el freno.',
        fig: 'mt07:3-15@311,572,549,690',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-14, 3-15, 4-49, 4-55 a 4-57',
  },
  {
    id: 'mt07-liquido-frenos',
    titulo: 'Cambiar el líquido de frenos y purgar (delantero y trasero)',
    grupo: 'Frenos',
    cada: 'Cada 2 años y siempre que se abra el circuito',
    tiempo: '1 h',
    nivel: 2,
    resumen:
      'Purga el circuito por los purgadores de las pinzas con líquido DOT 4 nuevo: primero las dos pinzas delanteras y después la trasera. En tu MT-07 sin ABS no hay unidad hidráulica, así que te saltas la prueba de la unidad con la herramienta de diagnóstico.',
    materiales: ['Líquido de frenos DOT 4 nuevo (envase cerrado)', 'Trapos'],
    herramientas: [
      'Llave dinamométrica',
      'Llave para el purgador',
      'Tubo de plástico transparente que ajuste bien en el purgador',
      'Recipiente para el líquido usado',
    ],
    pares: ['tornillo-de-la-tapa-del-deposito-de-la-bomba-de-freno', 'purgador-de-la-pinza-de-freno'],
    avisos: [
      'Usa solo DOT 4 y no lo mezcles con otro tipo: otros líquidos estropean los retenes.',
      'Que no entre agua en el depósito: baja el punto de ebullición y puede provocar bloqueo por vapor.',
      'El líquido de frenos daña la pintura y los plásticos: limpia enseguida lo que caiga. Si te entra en los ojos, lávalos con agua 15 minutos y ve al médico.',
      'El manual no trae un procedimiento aparte para cambiar el líquido: indica cambiarlo cada 2 años y describe la purga. Para renovarlo se sigue esa misma secuencia reponiendo líquido nuevo en el depósito; el manual no dice qué cantidad hay que hacer pasar.',
      'Comprueba los frenos antes de circular.',
    ],
    pasos: [
      {
        titulo: 'Orden de purga',
        texto: 'Purga siempre en este orden: 1.º las pinzas delanteras (cada una tiene su purgador); 2.º la pinza trasera.',
      },
      {
        titulo: 'Abrir el depósito delantero',
        texto:
          'Pon la moto recta y el depósito de la bomba delantera horizontal. Quita los tornillos de la tapa, la tapa, el soporte del diafragma y el diafragma. Llena el depósito hasta el nivel con DOT 4 y vuelve a poner el diafragma.',
        fig: 'mt07:3-15@311,450,549,568',
      },
      {
        titulo: 'Conectar el tubo',
        texto: 'Conecta bien el tubo transparente (1) al purgador (2) de una pinza delantera y mete el otro extremo en el recipiente.',
        fig: 'mt07:3-15@50,88,287,216',
      },
      {
        titulo: 'Purgar',
        texto:
          'Acciona despacio la maneta varias veces. Apriétala a fondo y mantenla. Afloja el purgador: saldrá líquido y la maneta llegará hasta el puño. Cierra el purgador y solo entonces suelta la maneta. Repite hasta que no salgan burbujas por el tubo.',
        aviso: 'Vigila el depósito: que nunca baje tanto como para que entre aire, ni que rebose.',
      },
      {
        titulo: 'Apretar el purgador',
        texto: 'Aprieta el purgador a [[purgador-de-la-pinza-de-freno]]. Repite la purga en la otra pinza delantera.',
      },
      {
        titulo: 'Cerrar el depósito delantero',
        texto:
          'Rellena el depósito hasta el nivel con DOT 4 (por encima de la marca de mínimo (a), con el depósito horizontal). Pon el diafragma, su soporte y la tapa; aprieta los tornillos a [[tornillo-de-la-tapa-del-deposito-de-la-bomba-de-freno]].',
      },
      {
        titulo: 'Freno trasero',
        texto:
          'Abre el depósito del freno trasero (tapón, soporte del diafragma y diafragma), llénalo hasta el nivel con DOT 4 y pon el diafragma. Conecta el tubo (1) al purgador (2) de la pinza trasera y purga igual que delante, pero con el pedal: písalo despacio varias veces, mantenlo a fondo, afloja el purgador (el pedal bajará del todo), ciérralo y suelta el pedal. Repite hasta que no salgan burbujas.',
        fig: 'mt07:3-15@50,216,287,340',
      },
      {
        titulo: 'Terminar el trasero',
        texto:
          'Aprieta el purgador a [[purgador-de-la-pinza-de-freno]]. Rellena el depósito trasero hasta el nivel (por encima de la marca de mínimo (a)) y ciérralo.',
        fig: 'mt07:3-15@311,572,549,690',
      },
      {
        titulo: 'Si cuesta purgar',
        texto:
          'Si no consigues sacar todo el aire, deja reposar el líquido unas horas y repite la purga cuando hayan desaparecido las burbujas pequeñas del tubo.',
      },
      {
        titulo: 'Comprobar',
        texto: 'Comprueba que maneta y pedal tienen tacto firme (nada esponjoso) y que los frenos funcionan bien antes de circular.',
        aviso: 'Un tacto blando o esponjoso indica aire en el circuito: vuelve a purgar.',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-2, 3-3, 3-13 a 3-16, 4-36, 4-50 y 4-55',
  },
  {
    id: 'mt07-cadena',
    titulo: 'Cadena: comprobar la holgura, tensar y engrasar',
    grupo: 'Transmisión',
    cada: 'Cada 800 km y después de lavar la moto o de rodar con lluvia o mojado',
    tiempo: '30 min',
    nivel: 1,
    resumen:
      'Mide la holgura de la cadena con la rueda trasera en el aire, ajústala con los tensores de los dos lados por igual y engrásala con lubricante para cadenas de juntas tóricas.',
    materiales: [
      'Lubricante para cadenas de juntas tóricas (O-ring) o aceite de motor',
      'Queroseno para limpiar la cadena (no uses otro disolvente)',
      'Trapos',
    ],
    herramientas: ['Llave dinamométrica', 'Caballete trasero (la rueda trasera debe quedar en el aire)', 'Regla o metro'],
    pares: ['tuerca-del-eje-de-la-rueda-trasera', 'contratuerca-del-tensor-de-cadena'],
    avisos: [
      'Una cadena demasiado tensa sobrecarga el motor y otras piezas; demasiado floja puede saltar, romperse y dañar el basculante o el chasis, o provocar un accidente.',
      'Sujeta bien la moto para que no pueda caerse.',
      'La cadena lleva juntas tóricas: no la limpies con vapor, agua a presión, disolventes ni cepillos duros.',
    ],
    pasos: [
      {
        titulo: 'Preparar',
        texto: 'Pon la moto en suelo nivelado sobre un caballete, con la rueda trasera en el aire. Pon punto muerto.',
      },
      {
        titulo: 'Medir la holgura',
        texto:
          'Mide la distancia (a) entre el extremo del nervio (b) de la guía de la cadena (1) y el centro de la cadena (2). Holgura correcta: 51,0–56,0 mm. Límite: 58,0 mm. Si está fuera de medida, ajústala.',
        fig: 'mt07:3-18@76,369,280,500',
      },
      {
        titulo: 'Aflojar el eje',
        texto: 'Afloja la tuerca del eje de la rueda trasera (1).',
        fig: 'mt07:3-18@337,90,537,212',
      },
      {
        titulo: 'Ajustar con los tensores',
        texto:
          'Afloja las contratuercas (1) de los tensores de los dos lados. Gira las tuercas de ajuste (2) de los dos lados: hacia (a) tensas la cadena, hacia (b) la aflojas. Gira las dos lo mismo para que la rueda quede alineada. Entre la placa del extremo del basculante y las tuercas de ajuste no debe quedar holgura.',
        fig: 'mt07:3-18@378,468,513,590',
      },
      {
        titulo: 'Apretar',
        texto:
          'Aprieta la tuerca del eje a [[tuerca-del-eje-de-la-rueda-trasera]] y después las contratuercas de los tensores a [[contratuerca-del-tensor-de-cadena]]. Vuelve a medir la holgura.',
      },
      {
        titulo: 'Limpiar y engrasar',
        texto:
          'Limpia la cadena solo con queroseno, sécala con un trapo y engrásala bien con lubricante para cadenas de juntas tóricas o con aceite de motor. No uses otros lubricantes: pueden llevar disolventes que dañan las juntas tóricas.',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-2 (intervalo), 3-17 a 3-19',
  },
  {
    id: 'mt07-filtro-aire',
    titulo: 'Cambiar el filtro de aire y limpiar el tubo de control',
    grupo: 'Admisión',
    cada: 'Filtro: cada 40.000 km (antes si ruedas por zonas muy húmedas o polvorientas). Tubo de control: a los 1.000 km y luego cada 10.000 km',
    tiempo: '1 h 30 min',
    nivel: 2,
    resumen:
      'Quita el depósito de gasolina para llegar a la caja del filtro, cambia el elemento de papel y limpia el tubo de control de la parte inferior de la caja. Si en ese tubo se acumula polvo o agua, límpialo y cambia también el filtro.',
    materiales: ['Filtro de aire nuevo (elemento de papel impregnado en aceite, desechable)', 'Bomba y bidón para sacar la gasolina', 'Trapos'],
    herramientas: ['Llave dinamométrica', 'Destornilladores y llaves para tapas y tornillos'],
    pares: ['tornillo-del-filtro-de-aire', 'tornillo-del-soporte-del-conducto-de-aire', ...PARES_DEPOSITO],
    avisos: [
      'El filtro es de papel impregnado en aceite y desechable: no lo limpies con aire comprimido.',
      'No arranques nunca el motor sin el filtro: se desgasta muy rápido y puede averiarse.',
      'Trabaja con gasolina lejos de llamas y chispas.',
    ],
    pasos: [
      ...QUITAR_DEPOSITO,
      {
        titulo: 'Quitar el soporte del conducto de aire',
        texto:
          'Desconecta el tubo de vacío que va del solenoide de admisión a la válvula de la caja del filtro. Quita los tornillos y el soporte del conducto de aire (1).',
        fig: 'mt07:3-11@337,90,540,210',
      },
      {
        titulo: 'Sacar el filtro',
        texto: 'Quita el tornillo y saca el filtro de aire (1). Revísalo: si está dañado, cámbialo (y siempre a los 40.000 km).',
        fig: 'mt07:3-11@58,540,284,668',
      },
      {
        titulo: 'Limpiar el tubo de control',
        texto:
          'En la parte inferior de la caja del filtro está el tubo de control (1). Si tiene polvo o agua acumulada, límpialo y cambia el filtro.',
        fig: 'mt07:3-11@58,185,279,318',
      },
      {
        titulo: 'Montar el filtro',
        texto:
          'Coloca el filtro y aprieta su tornillo a [[tornillo-del-filtro-de-aire]]. Monta el soporte del conducto de aire y aprieta sus tornillos a [[tornillo-del-soporte-del-conducto-de-aire]]. Vuelve a conectar el tubo de vacío.',
      },
      ...PONER_DEPOSITO,
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-1 a 3-3, 3-4, 3-11, 4-1, 4-2, 4-11 a 4-13, 7-1 a 7-7',
  },
  {
    id: 'mt07-bujias',
    titulo: 'Revisar y cambiar las bujías',
    grupo: 'Eléctrico',
    cada: 'Revisar, limpiar y calibrar a los 10000 y 30.000 km; cambiar a los 20000 y 40.000 km',
    tiempo: '1 h 30 min',
    nivel: 2,
    resumen:
      'Quita el depósito de gasolina, saca las pipas y las dos bujías, revisa su estado y la separación de electrodos, y vuelve a montarlas (o pon nuevas) al par.',
    materiales: ['Bujías NGK LMAR8A-9 (2 unidades) si toca cambiarlas', 'Bomba y bidón para sacar la gasolina', 'Trapos'],
    herramientas: [
      'Llave dinamométrica',
      'Llave de bujías',
      'Aire comprimido',
      'Galga de hilo para la separación de electrodos',
      'Limpiador de bujías o cepillo de alambre',
    ],
    pares: ['bujia', ...PARES_DEPOSITO],
    avisos: ['Trabaja con gasolina lejos de llamas y chispas.'],
    pasos: [
      ...QUITAR_DEPOSITO,
      {
        titulo: 'Sacar las bujías',
        texto:
          'Antes de aflojar nada, sopla con aire comprimido la suciedad acumulada en los pozos de las bujías para que no caiga dentro de los cilindros. Quita las bobinas de encendido (pipas) y las bujías.',
        aviso: 'Si cae suciedad en el cilindro puede dañar el motor.',
      },
      {
        titulo: 'Revisar',
        texto:
          'Comprueba que son del tipo correcto: NGK LMAR8A-9. Mira el electrodo (1): si está dañado o gastado, cambia la bujía. Mira el aislante (2): su color normal es marrón claro a medio; si tiene un color anormal, cambia la bujía.',
        fig: 'mt07:3-5.0',
      },
      {
        titulo: 'Limpiar y calibrar',
        texto:
          'Limpia la bujía con un limpiador de bujías o un cepillo de alambre. Mide la separación de electrodos (a) con una galga de hilo: 0,8–0,9 mm. Si está fuera de medida, ajústala.',
        fig: 'mt07:3-5.0',
      },
      {
        titulo: 'Montar',
        texto:
          'Limpia la bujía y la superficie de la arandela. Enrosca las bujías y apriétalas a [[bujia]]. Pon las bobinas de encendido.',
      },
      ...PONER_DEPOSITO,
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-1, 3-4, 3-5, 4-1, 4-2, 4-11 a 4-13, 7-1 a 7-5',
  },
  {
    id: 'mt07-embrague-juego',
    titulo: 'Ajustar el juego libre de la maneta de embrague',
    grupo: 'Embrague',
    cada: 'A los 1.000 km y luego cada 10.000 km',
    tiempo: '15 min',
    nivel: 1,
    resumen:
      'Mide el juego libre en la punta de la maneta del embrague y ajústalo con el tensor del manillar; si no llega, con la tuerca de ajuste del lado del motor.',
    materiales: [],
    herramientas: ['Llave dinamométrica', 'Regla'],
    pares: ['contratuerca-del-cable-de-embrague'],
    pasos: [
      {
        titulo: 'Medir',
        texto: 'Mide el juego libre (a) en la punta de la maneta del embrague. Correcto: 5,0–10,0 mm. Si está fuera de medida, ajústalo.',
        fig: 'mt07:3-12.1',
      },
      {
        titulo: 'Ajustar en el manillar',
        texto: 'Gira el tornillo de ajuste (1) de la maneta: hacia (a) aumenta el juego libre, hacia (b) disminuye. Busca un juego dentro de la medida.',
        fig: 'mt07:3-12@58,522,281,640',
      },
      {
        titulo: 'Si no llega: ajustar en el motor',
        texto:
          'Si con el ajuste del manillar no consigues la medida, usa el lado del motor: afloja la contratuerca (1), gira la tuerca de ajuste (2) hacia (a) para aumentar el juego o hacia (b) para disminuirlo, y aprieta la contratuerca a [[contratuerca-del-cable-de-embrague]].',
        fig: 'mt07:3-12@311,252,540,378',
      },
      {
        titulo: 'Comprobar',
        texto: 'Vuelve a medir el juego libre y comprueba que el embrague funciona bien.',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-1 (intervalo), 3-12',
  },
  {
    id: 'mt07-acelerador',
    titulo: 'Comprobar y ajustar el juego libre del acelerador',
    grupo: 'Mandos',
    cada: 'Cada 10.000 km o cada año',
    tiempo: '20 min',
    nivel: 1,
    resumen:
      'Comprueba que el puño gira suave y vuelve solo en todas las posiciones del manillar, mide el juego libre y ajústalo en el lado del cuerpo de mariposa o, si no llega, en el del manillar.',
    materiales: ['Lubricante para cables (o aceite de motor) si el cable va duro'],
    herramientas: ['Llave dinamométrica', 'Regla'],
    pares: [
      'contratuerca-del-cable-del-acelerador-lado-cuerpo-de-mariposa',
      'contratuerca-del-cable-del-acelerador-lado-manillar',
    ],
    avisos: ['Antes de ajustar el juego libre, la sincronización de los cuerpos de mariposa debe estar bien ajustada.'],
    pasos: [
      {
        titulo: 'Revisar cables y puño',
        texto:
          'Revisa los cables del acelerador: si están dañados o deteriorados, cámbialos. Con el motor parado, gira el puño despacio y suéltalo: debe girar suave y volver solo. Repítelo con el manillar girado a tope a la izquierda y a la derecha. Si va duro, lubrica o cambia la pieza defectuosa.',
      },
      {
        titulo: 'Lubricar el cable (si hace falta)',
        texto:
          'Si un cable va duro, sujeta su extremo hacia arriba y echa unas gotas de lubricante en la funda (aceite de motor o lubricante para cables), o usa un engrasador de cables. Si la funda exterior está dañada, cambia el cable.',
      },
      {
        titulo: 'Medir el juego libre',
        texto: 'Mide el juego libre del puño (a). Correcto: 3,0–5,0 mm.',
        fig: 'mt07:3-27@311,306,540,436',
      },
      {
        titulo: 'Ajustar en el cuerpo de mariposa',
        texto:
          'Afloja la contratuerca (1) del cable del acelerador. Gira la tuerca de ajuste (2): hacia (a) aumenta el juego, hacia (b) disminuye. Aprieta la contratuerca a [[contratuerca-del-cable-del-acelerador-lado-cuerpo-de-mariposa]].',
        fig: 'mt07:3-28@58,90,281,220',
      },
      {
        titulo: 'Si no llega: ajustar en el manillar',
        texto:
          'Echa hacia atrás la funda de goma (1). Afloja la contratuerca (2) y gira la tuerca de ajuste (3): hacia (a) aumenta el juego, hacia (b) disminuye. Aprieta la contratuerca a [[contratuerca-del-cable-del-acelerador-lado-manillar]] y vuelve a poner la funda, cubriendo del todo la tuerca de ajuste.',
        fig: 'mt07:3-28@58,455,281,585',
      },
      {
        titulo: 'Comprobar',
        texto: 'Vuelve a medir el juego libre y comprueba otra vez que el puño vuelve solo con el manillar a tope a ambos lados.',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-3 (intervalo), 3-27 y 3-28',
  },
  {
    id: 'mt07-rueda-trasera',
    titulo: 'Desmontar y montar la rueda trasera',
    grupo: 'Ruedas',
    cada: '',
    tiempo: '1 h',
    nivel: 2,
    resumen:
      'Quita la pinza trasera, afloja los tensores, saca el eje y la rueda, y al montar ajusta la holgura de la cadena antes de apretar todo al par. En tu MT-07 sin ABS no hay sensor de rueda que quitar.',
    materiales: ['Grasa de jabón de litio (labios de los retenes)', 'Fijador de roscas (LOCTITE®) para el tornillo de la pinza'],
    herramientas: ['Llave dinamométrica', 'Caballete trasero (la rueda trasera debe quedar en el aire)', 'Regla o metro (holgura de la cadena)'],
    pares: [
      'perno-de-retencion-de-la-pinza-de-freno-trasera',
      'tornillo-de-la-pinza-de-freno-trasera',
      'tuerca-del-eje-de-la-rueda-trasera',
      'contratuerca-del-tensor-de-cadena',
    ],
    avisos: [
      'Sujeta bien la moto para que no pueda caerse.',
      'No pises el pedal de freno con la pinza desmontada.',
      'Comprueba que el latiguillo de freno queda bien guiado.',
    ],
    pasos: [
      {
        titulo: 'Preparar',
        texto: 'Pon la moto en suelo nivelado sobre un caballete que deje la rueda trasera en el aire.',
      },
      {
        titulo: 'Quitar la pinza',
        texto:
          'Quita el tornillo de la pinza (4) y el perno de retención de la pinza (3), y saca la pinza trasera (5) del disco. (La versión con ABS lleva además el sensor de rueda, que habría que quitar antes.)',
        fig: 'mt07:4-49.0',
      },
      {
        titulo: 'Aflojar los tensores',
        texto: 'Afloja las contratuercas de los tensores de cadena (1) y las tuercas de ajuste (2) de los dos lados.',
        fig: 'mt07:4-30@85,580,272,707',
      },
      {
        titulo: 'Sacar el eje y la rueda',
        texto:
          'Quita la tuerca del eje (1) y la arandela, y saca el eje (2) y las placas de ajuste de la cadena. Empuja la rueda hacia delante, saca la cadena de la corona y retira la rueda. Saldrán también los tensores, las placas del extremo del basculante, el soporte de la pinza y los casquillos izquierdo y derecho.',
        fig: ['mt07:4-30@337,144,500,275', 'mt07:4-26.0'],
      },
      {
        titulo: 'Engrasar los retenes',
        texto: 'Unta los labios de los retenes de la rueda con grasa de jabón de litio.',
      },
      {
        titulo: 'Colocar la rueda',
        texto:
          'Monta el casquillo derecho, el izquierdo, el soporte de la pinza (1), la rueda, los tensores (2), las placas de ajuste de la cadena, el eje, la arandela, la tuerca del eje y las placas del extremo del basculante (3). Fíjate en esto: la flecha (a) del neumático, en el sentido de giro; el saliente (b) del basculante, encajado en la ranura (c) del soporte de la pinza; la flecha (d) de cada tensor y la flecha (e) de cada placa del basculante, hacia arriba.',
        fig: ['mt07:4-33.1', 'mt07:4-33.2'],
      },
      {
        titulo: 'Montar la pinza',
        texto: 'Coloca la pinza trasera con su perno de retención y su tornillo (con LOCTITE®), sin apretarlos todavía al par.',
      },
      {
        titulo: 'Colocar la cadena',
        texto: 'Encaja el hueco (a) entre las placas laterales de la cadena (1) en el nervio (b) de la guía de la cadena (2).',
        fig: 'mt07:4-33@315,148,540,275',
      },
      {
        titulo: 'Ajustar la holgura',
        texto:
          'Ajusta la holgura de la cadena a 51,0–56,0 mm girando por igual las tuercas de ajuste de los dos lados (mira la guía «Cadena: comprobar la holgura, tensar y engrasar»).',
      },
      {
        titulo: 'Apretar',
        texto:
          'Aprieta la tuerca del eje a [[tuerca-del-eje-de-la-rueda-trasera]], las contratuercas de los tensores a [[contratuerca-del-tensor-de-cadena]], el perno de retención de la pinza a [[perno-de-retencion-de-la-pinza-de-freno-trasera]] y el tornillo de la pinza a [[tornillo-de-la-pinza-de-freno-trasera]].',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-17, 3-18, 4-26, 4-27, 4-30, 4-32 y 4-33',
  },
  {
    id: 'mt07-rueda-delantera',
    titulo: 'Desmontar y montar la rueda delantera',
    grupo: 'Ruedas',
    cada: '',
    tiempo: '45 min',
    nivel: 2,
    resumen:
      'Quita las dos pinzas delanteras, afloja el tornillo de apriete del eje, saca el eje y la rueda. Al montar, aprieta primero el eje y después su tornillo de apriete. En tu MT-07 sin ABS no hay sensor de rueda que quitar.',
    materiales: ['Grasa de jabón de litio (labios de los retenes)'],
    herramientas: ['Llave dinamométrica', 'Caballete que deje la rueda delantera en el aire'],
    pares: [
      'tornillo-del-soporte-del-latiguillo-cable-delantero',
      'tornillo-de-la-pinza-de-freno-delantera',
      'tornillo-de-apriete-del-eje-delantero',
      'eje-de-la-rueda-delantera',
    ],
    avisos: [
      'Sujeta bien la moto para que no pueda caerse.',
      'No acciones la maneta de freno con las pinzas desmontadas.',
      'Comprueba que el latiguillo de freno queda bien guiado.',
    ],
    pasos: [
      {
        titulo: 'Quitar soportes y pinzas',
        texto:
          'Con la moto en suelo nivelado y bien sujeta, quita los soportes del latiguillo (1) y las dos pinzas delanteras (3). (La versión con ABS lleva además el sensor de rueda (4) y los soportes de su cable (2).)',
        fig: 'mt07:4-18.0',
      },
      {
        titulo: 'Levantar la rueda',
        texto: 'Pon la moto sobre un caballete adecuado que deje la rueda delantera en el aire.',
      },
      {
        titulo: 'Sacar el eje y la rueda',
        texto: 'Afloja el tornillo de apriete del eje (5). Saca el eje (6), los casquillos (7) y la rueda (8).',
        fig: 'mt07:4-18.0',
      },
      {
        titulo: 'Engrasar los retenes',
        texto: 'Unta los labios de los retenes de la rueda con grasa de jabón de litio.',
      },
      {
        titulo: 'Colocar la rueda',
        texto: 'Monta los casquillos, la rueda y el eje. La flecha (a) del neumático tiene que apuntar en el sentido de giro.',
        fig: 'mt07:4-24.1',
      },
      {
        titulo: 'Apretar el eje',
        texto:
          'Antes de apretar, empuja con fuerza el manillar hacia abajo varias veces y comprueba que la horquilla sube y baja con suavidad. Aprieta primero el eje a [[eje-de-la-rueda-delantera]] y después su tornillo de apriete a [[tornillo-de-apriete-del-eje-delantero]].',
      },
      {
        titulo: 'Montar pinzas y soportes',
        texto:
          'Monta las pinzas y aprieta sus tornillos a [[tornillo-de-la-pinza-de-freno-delantera]]. Pon los soportes del latiguillo (2) con el saliente (b) apoyado en el tope (c) de la horquilla y aprieta sus tornillos a [[tornillo-del-soporte-del-latiguillo-cable-delantero]].',
        fig: 'mt07:4-25@311,432,540,562',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 4-18, 4-20, 4-24 y 4-25',
  },
  {
    id: 'mt07-valvulas',
    titulo: 'Comprobar y ajustar el juego de válvulas',
    grupo: 'Motor',
    cada: 'Cada 40.000 km',
    tiempo: '5 h',
    nivel: 3,
    resumen:
      'Con el motor frío, quita la tapa de culata, pon cada cilindro en el punto muerto superior de compresión y mide el juego de cada válvula con galgas. Si alguno está fuera de medida, hay que desmontar los árboles de levas y cambiar las pastillas de ajuste.',
    materiales: [
      'Refrigerante para rellenar (mira la guía de cambio de refrigerante)',
      'Junta de la tapa de culata nueva',
      'Pastillas de ajuste de válvula del grosor calculado (n.º 150 a 240, en pasos de 0,05 mm), si hace falta ajustar',
      'Aceite de bisulfuro de molibdeno (pastillas, levas y apoyos de los árboles) y aceite de motor (empujadores y tornillos de los sombreretes)',
      'Alambre para sujetar la cadena de distribución',
    ],
    herramientas: [
      'Llave dinamométrica',
      'Galgas de espesores (Yamaha 90890-03180 / YU-26900-9)',
      'Ventosa de esmerilar válvulas (Yamaha 90890-04101 / YM-A8998) para sacar empujadores y pastillas',
      'Llave hexagonal para el tensor de la cadena de distribución (ref. 1WS-12228-00)',
    ],
    pares: [
      'tapon-de-acceso-a-la-marca-de-calado',
      'tapa-del-extremo-del-ciguenal',
      'tornillo-de-la-tapa-de-culata-tapa-de-valvulas',
      'tornillo-del-sombrerete-del-arbol-de-levas-de-escape',
      'tornillo-del-sombrerete-del-arbol-de-levas-de-admision',
      'bujia',
    ],
    avisos: [
      'Mide y ajusta con el motor frío, a temperatura ambiente.',
      'Para medir, el pistón del cilindro que mides tiene que estar en el punto muerto superior (PMS) de compresión.',
      'Gira siempre el cigüeñal en sentido antihorario.',
      'Desmontar los árboles de levas exige seguir el capítulo «CAMSHAFTS» del manual (págs. 5-13 a 5-23); un calado mal hecho daña el motor.',
    ],
    pasos: [
      {
        titulo: 'Vaciar el refrigerante',
        texto: 'Vacía el refrigerante como en la guía «Cambiar el líquido refrigerante».',
      },
      {
        titulo: 'Desmontar lo necesario',
        texto:
          'Quita la tapa superior y la tapa lateral izquierda del depósito, el radiador y su manguito de entrada (pág. 6-1), el depósito de compensación y el solenoide de admisión (pág. 7-19) y la guía del cable del embrague (pág. 5-4). Desconecta el tubo respiradero de la culata.',
      },
      {
        titulo: 'Quitar la tapa de culata',
        texto: 'Desconecta los conectores de las bobinas (2), quita las bobinas de encendido (3) y las bujías (4), y después la tapa de culata (5) con su junta (6).',
        fig: 'mt07:5-14.0',
      },
      {
        titulo: 'Abrir las tapas de calado',
        texto: 'Quita el tapón de acceso a la marca de calado (1) y la tapa del extremo del cigüeñal (2).',
        fig: 'mt07:3-5@311,643,504,779',
      },
      {
        titulo: 'Poner el cilindro n.º 1 en PMS',
        texto:
          'Gira el cigüeñal en sentido antihorario. Con el pistón n.º 1 en PMS de compresión, alinea la marca de PMS (a) del rotor del alternador con la ranura (b) de la tapa del alternador. El cilindro n.º 1 es el de la derecha mirando la figura, con la parte delantera (A) abajo.',
        fig: ['mt07:3-6@58,270,280,410', 'mt07:3-6.1'],
      },
      {
        titulo: 'Medir el cilindro n.º 1',
        texto:
          'Mide el juego de cada válvula con la galga de espesores (1). Juego en frío: admisión 0,11–0,20 mm; escape 0,24–0,30 mm. Anota cada medida que esté fuera de medida.',
        fig: 'mt07:3-6@58,504,281,643',
      },
      {
        titulo: 'Medir el cilindro n.º 2',
        texto: 'Gira el cigüeñal 270° más en sentido antihorario y mide igual las válvulas del cilindro n.º 2. Si todas están en medida, salta al último paso.',
        fig: 'mt07:3-6.3',
      },
      {
        titulo: 'Desmontar los árboles de levas',
        texto:
          'Si hay que ajustar, desmonta los árboles de levas siguiendo las págs. 5-15 a 5-18: quita el tensor de la cadena de distribución (con la llave hexagonal metida en el tensor) y afloja los tornillos de los sombreretes poco a poco, en cruz y de fuera hacia dentro. Sujeta la cadena de distribución con un alambre para que no caiga al cárter.',
        aviso: 'Si los sombreretes no se aflojan por igual puedes dañar la culata, los árboles o los propios sombreretes.',
      },
      {
        titulo: 'Sacar empujador y pastilla',
        texto:
          'Tapa con un trapo la abertura de la cadena para que no caiga ninguna pastilla al cárter. Saca el empujador (1) y la pastilla de ajuste (2) con la ventosa (3). Apunta la posición de cada empujador y cada pastilla para volver a ponerlos en su sitio.',
        fig: ['mt07:3-7@67,99,226,205', 'mt07:3-7.2'],
      },
      {
        titulo: 'Calcular la pastilla nueva',
        texto:
          'Resta: juego medido − juego especificado (ej.: 0,25 − 0,20 = 0,05 mm). Mira el grosor de la pastilla actual: va marcado en centésimas de mm (a) en la cara que toca el empujador (ej.: «158» = 1,58 mm). Súmalos: 1,58 + 0,05 = 1,63 mm → pastilla n.º 163. Redondea por la última cifra: 0, 1, 2 → 0; 3, 4, 5, 6 → 5; 7, 8, 9 → 10. En el ejemplo, 163 → 165. Hay pastillas del n.º 150 al 240 (1,50–2,40 mm) en pasos de 0,05 mm.',
        fig: 'mt07:3-7@335,90,517,211',
      },
      {
        titulo: 'Montar pastilla y empujador',
        texto:
          'Pon la pastilla nueva (1), lubricada con aceite de bisulfuro de molibdeno, y el empujador (2), lubricado con aceite de motor, cada uno en su sitio. El empujador tiene que girar suave con la mano.',
        fig: 'mt07:3-8.0',
      },
      {
        titulo: 'Montar los árboles de levas',
        texto:
          'Monta los árboles de levas, la cadena de distribución y los sombreretes siguiendo las págs. 5-20 a 5-23: lubrica levas y apoyos con aceite de bisulfuro de molibdeno, monta primero el de escape y alinea las marcas de los piñones de los árboles con el borde de la culata. Lubrica los tornillos de los sombreretes con aceite de motor y apriétalos por igual: escape a [[tornillo-del-sombrerete-del-arbol-de-levas-de-escape]], admisión a [[tornillo-del-sombrerete-del-arbol-de-levas-de-admision]]. Gira el cigüeñal en sentido antihorario varias vueltas completas para asentar las piezas.',
        aviso: 'No gires el cigüeñal mientras montas los árboles de levas: podrías dañar el motor o descalar la distribución.',
      },
      {
        titulo: 'Volver a medir',
        texto: 'Mide otra vez el juego de válvulas. Si sigue fuera de medida, repite el ajuste hasta conseguirlo.',
      },
      {
        titulo: 'Montar todo',
        texto:
          'Monta todo en orden inverso al desmontaje: tapón de acceso a la marca de calado a [[tapon-de-acceso-a-la-marca-de-calado]], tapa del extremo del cigüeñal a [[tapa-del-extremo-del-ciguenal]], tapa de culata con junta nueva a [[tornillo-de-la-tapa-de-culata-tapa-de-valvulas]] y bujías a [[bujia]]. Rellena el refrigerante como en su guía.',
      },
    ],
    fuente: 'Manual de servicio MT07A 2014, págs. 3-1 (intervalo), 3-5 a 3-8, 5-13 a 5-21',
  },
]
