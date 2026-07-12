export const guiasContent = {
  es: {
    hero: {
      title: "CookPilot paso a paso",
      subtitle: "Guías rápidas para planificar, comprar, ajustar, cocinar, importar y reutilizar sin perderte entre funciones.",
   
    },
    guides: [
      {
        id: "first-steps",
        number: "01",
        title: "Primeros pasos",
        description: "Organiza tu primera comida sin configurar todo.",
        chips: ["Menú", "Día", "Guardar"],
        icon: "/icons/actions/simple_menu.png",
        summary: "Crea o resuelve una comida real y déjala lista para planificar, comprar o cocinar.",
        whatYouDo: [
          "Crea un menú manual con recetas e ingredientes.",
          "Resuelve una comida o un día cuando no quieres decidir todo.",
          "Guarda lo que sirve para repetirlo después."
        ],
        whenToUse: "Cuando te gustaría entender CookPilot con una sola comida, sin configurar toda la semana ni activar objetivos.",
        whatGetsReady: [
          "Una comida editable y usable.",
          "Una base simple para seguir planificando."
        ],
        tip: "No necesitas llenar la app el primer día. Basta con una comida clara."
      },
      {
        id: "planning",
        number: "02",
        title: "Planificación",
        description: "Arma menús, días y semanas.",
        chips: ["Menús", "Días", "Semanas"],
        icon: "/icons/actions/planning.png",
        summary: "Ubica cada comida en momentos, días y semanas para reducir improvisación.",
        whatYouDo: [
          "Organiza desayunos, almuerzos, cenas y snacks.",
          "Construye días completos con espacios resueltos.",
          "Arma semanas repetibles sin empezar desde cero."
        ],
        whenToUse: "Cuando sabes qué quieres comer, pero todavía no tienes estructura para la semana ni el día.",
        whatGetsReady: [
          "Un plan claro por día y por semana.",
          "Menús listos para compra y cocina."
        ],
        tip: "Planificar no es controlar todo; es quitar presión a las decisiones que se repiten."
      },
      {
        id: "menu-generation",
        number: "03",
        title: "Generación de menús",
        description: "Resuelve comidas cuando no quieres empezar desde cero.",
        chips: ["Resolver", "Completar", "Revisar"],
        icon: "/icons/actions/menu-ideas.png",
        summary: "Pide propuestas de menús o días y convierte la sugerencia en contenido real.",
        whatYouDo: [
          "Pide una propuesta de menú o día.",
          "Revisa lo generado y ajusta lo que no encaja.",
          "Guarda lo útil y llévalo a tu planificación."
        ],
        whenToUse: "Cuando tienes un espacio vacío, no sabes qué cocinar o quieres completar un día rápido.",
        whatGetsReady: [
          "Un menú usable en minutos.",
          "Un día con menos huecos que resolver."
        ],
        tip: "Usa la generación como punto de partida, no como decisión final."
      },
      {
        id: "shopping",
        number: "04",
        title: "Compras y costos",
        description: "Convierte planes en ingredientes y cantidades.",
        chips: ["Lista", "Costos", "Compra"],
        icon: "/icons/actions/buying.png",
        summary: "Transforma tus menús en ingredientes, cantidades y referencias de costo.",
        whatYouDo: [
          "Revisa ingredientes y cantidades desde tus menús.",
          "Consolida repetidos y elimina lo innecesario.",
          "Compara costos referenciales antes de comprar."
        ],
        whenToUse: "Cuando ya tienes menús y necesitas pasar a compra sin revisar receta por receta.",
        whatGetsReady: [
          "Una lista de compras más clara.",
          "Mejor referencia de costos y ahorro."
        ],
        tip: "Una buena compra empieza antes de la tienda: empieza con el menú armado."
      },
      {
        id: "nutrition",
        number: "05",
        title: "Nutrición y ajuste",
        description: "Usa kcal y macros cuando realmente aportan.",
        chips: ["Kcal", "Macros", "Ajuste"],
        icon: "/icons/actions/nutrition.png",
        summary: "Revisa la nutrición de tus comidas y ajusta cantidades sin destruir el plato.",
        whatYouDo: [
          "Revisa kcal y macros por receta o menú.",
          "Conecta objetivos con lo que vas a comer.",
          "Modifica cantidades para acercarte a tu meta."
        ],
        whenToUse: "Cuando tienes un objetivo y quieres ver si tu comida se acerca a él, sin convertir todo en una fórmula.",
        whatGetsReady: [
          "Un menú más alineado a tu objetivo.",
          "Comida real, no platos genéricos."
        ],
        tip: "La nutrición debe ayudar, no obligar. Si solo quieres planificar, no tiene que dominar la experiencia."
      },
      {
        id: "cookmode",
        number: "06",
        title: "Cocina guiada",
        description: "Pasa del menú a la preparación.",
        chips: ["Pasos", "Tiempos", "Cocina"],
        icon: "/icons/actions/cookmode.webp",
        summary: "Sigue la preparación con pasos ordenados, ingredientes en contexto y menos caos.",
        whatYouDo: [
          "Abre CookMode desde tu menú o receta.",
          "Sigue pasos en orden sin perder el hilo.",
          "Consulta ingredientes y tiempos en el paso activo."
        ],
        whenToUse: "Cuando ya sabes qué toca cocinar y quieres ejecutar con menos fricción.",
        whatGetsReady: [
          "Una preparación más ordenada.",
          "Menos confusión en la cocina."
        ],
        tip: "CookPilot no termina cuando eliges qué comer. Termina cuando esa comida llega a la mesa."
      },
      {
        id: "importing",
        number: "07",
        title: "Importación",
        description: "Trae recetas externas a CookPilot.",
        chips: ["Web", "Video", "PDF"],
        icon: "/icons/actions/import.webp",
        summary: "Importa recetas desde web, video, imagen, texto o PDF y guárdalas en el sistema.",
        whatYouDo: [
          "Trae contenido desde una web, video o archivo.",
          "Revisa y corrige lo importado.",
          "Guárdalo para usarlo en menús y planificación."
        ],
        whenToUse: "Cuando tienes recetas fuera de CookPilot y quieres que pasen a ser parte de tu sistema.",
        whatGetsReady: [
          "Una receta editable y buscable.",
          "Contenido que puedes cocinar y reutilizar."
        ],
        tip: "Importar no es solo guardar. Es meter esa receta en un sistema que puede organizarla."
      },
      {
        id: "library",
        number: "08",
        title: "Biblioteca",
        description: "Encuentra recetas, favoritos e importadas.",
        chips: ["Buscar", "Guardados", "Favoritos"],
        icon: "/icons/actions/library.png",
        summary: "Busca lo que ya guardaste: recetas, menús, favoritos e importadas.",
        whatYouDo: [
          "Busca recetas y menús guardados.",
          "Abre favoritos y contenido importado.",
          "Revisa opciones listas para planificar."
        ],
        whenToUse: "Cuando sabes que ya tienes algo útil y solo necesitas encontrarlo rápido.",
        whatGetsReady: [
          "Contenido encontrado en segundos.",
          "Menos repetición y menos dispersión."
        ],
        tip: "Guardar solo sirve si después puedes encontrar lo que guardaste."
      },
      {
        id: "reuse",
        number: "09",
        title: "Reutilización",
        description: "Guarda lo que funciona y úsalo otra vez.",
        chips: ["Guardar", "Copiar", "Fijar"],
        icon: "/icons/actions/reuse.png",
        summary: "Guarda, aplica, copia, pega o fija estructuras que ya funcionan.",
        whatYouDo: [
          "Guarda recetas, menús, días o semanas.",
          "Aplica lo guardado a tu planificación.",
          "Copia, pega o fija estructuras recurrentes."
        ],
        whenToUse: "Cuando algo funcionó y quieres repetirlo sin reconstruirlo.",
        whatGetsReady: [
          "Menús y días reutilizables.",
          "Menos trabajo la próxima vez."
        ],
        tip: "CookPilot mejora cuando empieza a recordar lo que funciona para ti."
      },
      {
        id: "pro",
        number: "10",
        title: "Pro, créditos y packs",
        description: "Entiende qué desbloquea cada nivel.",
        chips: ["Pro", "Créditos", "Packs"],
        icon: "/icons/actions/pro-packs.png",
        summary: "Comprende qué desbloquea Pro, cuándo usar créditos y cómo ampliar con packs.",
        whatYouDo: [
          "Revisa qué incluye el acceso completo.",
          "Identifica funciones que consumen más recursos.",
          "Elige packs cuando necesitas más volumen."
        ],
        whenToUse: "Cuando quieres usar CookPilot con más frecuencia o necesitas ampliar capacidades.",
        whatGetsReady: [
          " Claridad sobre cada nivel.",
          "Un criterio para decidir cuándo subir o ampliar."
        ],
        tip: "No hace falta entender toda la mecánica el primer día. Basta con saber qué desbloquea cada nivel."
      }
    ]
  },
  en: {
    hero: {
      eyebrow: "CookPilot Step by Step",
      title: "CookPilot Step by Step",
      subtitle: "Quick guides to plan, shop, adjust, cook, import, and reuse without getting lost between features.",
      supportText: "Start with the guide that matches what you want to do today.",
    },
    guides: [
      {
        id: "first-steps",
        number: "01",
        title: "Getting started",
        description: "Organize your first meal without setting up everything.",
        chips: ["Menu", "Day", "Save"],
        icon: "/icons/actions/simple_menu.png",
        summary: "Create or resolve one real meal and leave it ready to plan, shop, or cook.",
        whatYouDo: [
          "Create a menu manually with recipes and ingredients.",
          "Resolve a meal or day when you do not want to decide everything.",
          "Save what works to reuse it later."
        ],
        whenToUse: "When you want to understand CookPilot with one meal, without setting up your whole week or turning on goals.",
        whatGetsReady: [
          "One editable, usable meal.",
          "A simple base to keep planning."
        ],
        tip: "You do not need to fill the app on day one. One clear meal is enough."
      },
      {
        id: "planning",
        number: "02",
        title: "Planning",
        description: "Build menus, days, and weeks.",
        chips: ["Menus", "Days", "Weeks"],
        icon: "/icons/actions/planning.png",
        summary: "Place each meal inside moments, days, and weeks to reduce improvisation.",
        whatYouDo: [
          "Organize breakfasts, lunches, dinners, and snacks.",
          "Build full days with resolved spaces.",
          "Create repeatable weeks without starting from zero."
        ],
        whenToUse: "When you know what you want to eat, but still lack structure for the day or week.",
        whatGetsReady: [
          "A clear day and week plan.",
          "Menus ready for shopping and cooking."
        ],
        tip: "Planning is not about controlling every detail forever. It is about removing pressure from repeating decisions."
      },
      {
        id: "menu-generation",
        number: "03",
        title: "Menu generation",
        description: "Resolve meals when you do not want to start from scratch.",
        chips: ["Resolve", "Complete", "Review"],
        icon: "/icons/actions/menu-ideas.png",
        summary: "Ask for menu or day proposals and turn the suggestion into real content.",
        whatYouDo: [
          "Ask for a menu or day proposal.",
          "Review what was generated and adjust what does not fit.",
          "Save what is useful and add it to your planning."
        ],
        whenToUse: "When you have an empty space, do not know what to cook, or want to complete a day fast.",
        whatGetsReady: [
          "A usable menu in minutes.",
          "A day with fewer gaps to solve."
        ],
        tip: "Use generation as a starting point, not as the final decision."
      },
      {
        id: "shopping",
        number: "04",
        title: "Shopping and costs",
        description: "Turn plans into ingredients and quantities.",
        chips: ["List", "Costs", "Shopping"],
        icon: "/icons/actions/buying.png",
        summary: "Turn your menus into ingredients, quantities, and reference costs.",
        whatYouDo: [
          "Review ingredients and quantities from your menus.",
          "Consolidate repeats and remove what you do not need.",
          "Compare reference costs before buying."
        ],
        whenToUse: "When you already have menus and need to move to shopping without checking every recipe again.",
        whatGetsReady: [
          "A clearer shopping list.",
          "Better cost reference and savings view."
        ],
        tip: "Better shopping starts before the store: it starts with a finished menu."
      },
      {
        id: "nutrition",
        number: "05",
        title: "Nutrition and adjustment",
        description: "Use kcal and macros when they actually help.",
        chips: ["Kcal", "Macros", "Adjust"],
        icon: "/icons/actions/nutrition.png",
        summary: "Review the nutrition of your meals and adjust quantities without ruining the dish.",
        whatYouDo: [
          "Review kcal and macros by recipe or menu.",
          "Connect goals with what you are about to eat.",
          "Modify quantities to get closer to your target."
        ],
        whenToUse: "When you have a goal and want to check if your meal fits, without turning food into a formula.",
        whatGetsReady: [
          "A menu closer to your goal.",
          "Real food, not generic dishes."
        ],
        tip: "Nutrition should help, not force. If you only want to plan, it does not have to dominate the experience."
      },
      {
        id: "cookmode",
        number: "06",
        title: "Guided cooking",
        description: "Move from menu to preparation.",
        chips: ["Steps", "Timing", "Cooking"],
        icon: "/icons/actions/cookmode.webp",
        summary: "Follow preparation with ordered steps, ingredients in context, and less chaos.",
        whatYouDo: [
          "Open CookMode from your menu or recipe.",
          "Follow steps in order without losing track.",
          "Check ingredients and timing on the active step."
        ],
        whenToUse: "When you already know what to cook and want to execute with less friction.",
        whatGetsReady: [
          "A more ordered preparation.",
          "Less confusion in the kitchen."
        ],
        tip: "CookPilot does not end when you choose what to eat. It ends when that food reaches the table."
      },
      {
        id: "importing",
        number: "07",
        title: "Importing",
        description: "Bring external recipes into CookPilot.",
        chips: ["Web", "Video", "PDF"],
        icon: "/icons/actions/import.webp",
        summary: "Import recipes from web, video, image, text, or PDF and save them into the system.",
        whatYouDo: [
          "Bring content from a website, video, or file.",
          "Review and correct what was imported.",
          "Save it to use in menus and planning."
        ],
        whenToUse: "When you have recipes outside CookPilot and want them inside your system.",
        whatGetsReady: [
          "An editable, searchable recipe.",
          "Content you can cook and reuse."
        ],
        tip: "Importing is not only saving. It is putting that recipe into a system that can organize it."
      },
      {
        id: "library",
        number: "08",
        title: "Library",
        description: "Find recipes, favorites, and imports.",
        chips: ["Search", "Saved", "Favorites"],
        icon: "/icons/actions/library.png",
        summary: "Find what you already saved: recipes, menus, favorites, and imports.",
        whatYouDo: [
          "Search saved recipes and menus.",
          "Open favorites and imported content.",
          "Review structured options ready for planning."
        ],
        whenToUse: "When you know you already have something useful and just need to find it fast.",
        whatGetsReady: [
          "Content found in seconds.",
          "Less repetition and less scatter."
        ],
        tip: "Saving only works if you can find what you saved afterwards."
      },
      {
        id: "reuse",
        number: "09",
        title: "Reuse",
        description: "Save what works and use it again.",
        chips: ["Save", "Copy", "Pin"],
        icon: "/icons/actions/reuse.png",
        summary: "Save, apply, copy, paste, or pin structures that already work.",
        whatYouDo: [
          "Save recipes, menus, days, or weeks.",
          "Apply saved items back into your planning.",
          "Copy, paste, or pin recurring structures."
        ],
        whenToUse: "When something worked and you want to repeat it without rebuilding it.",
        whatGetsReady: [
          "Reusable menus and days.",
          "Less work next time."
        ],
        tip: "CookPilot gets better when it starts remembering what works for you."
      },
      {
        id: "pro",
        number: "10",
        title: "Pro, credits, and packs",
        description: "Understand what each level unlocks.",
        chips: ["Pro", "Credits", "Packs"],
        icon: "/icons/actions/pro-packs.png",
        summary: "Understand what Pro unlocks, when to use credits, and how to extend with packs.",
        whatYouDo: [
          "Review what full access includes.",
          "Identify features that use more resources.",
          "Choose packs when you need more volume."
        ],
        whenToUse: "When you want to use CookPilot more frequently or need to expand capabilities.",
        whatGetsReady: [
          "Clarity about each level.",
          "A criterion to decide when to upgrade or extend."
        ],
        tip: "You do not need to understand every mechanic on day one. Just know what each level unlocks."
      }
    ]
  }
};
