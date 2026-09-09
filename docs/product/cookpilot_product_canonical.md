# CookPilot

**Arquitectura General del Sistema de Producto**

Mapa funcional de capacidades, flujos e interdependencias del ecosistema culinario

Versión 1.0 · 22 de julio de 2026

# Cómo leer este documento

Este es el mapa general de CookPilot.

No reemplaza las documentaciones especializadas de CookPlan, CookSearch, CookImport, CookList, CookMode, CookBalance, CookBilling, nutrición, precios o las capas AI. Su función es mostrar:

- - qué problema resuelve el producto completo;
    - cuáles son sus nodos principales;
    - qué recibe y entrega cada feature;
    - cómo circula una receta, un menú, un día o una semana por el sistema;
    - dónde empieza y dónde termina el valor para el usuario;
    - cómo se conectan producto, retención y monetización.

El detalle de implementación, contratos, límites y arquitectura vive en los documentos especializados.

## Leyenda del mapa

- - **Núcleo:** superficies que sostienen el loop principal.
    - **Capacidad integrada:** motor o acción que opera dentro de otra superficie.
    - **Capa transversal:** identidad, preferencias, datos o acceso que sirven a varias features.
    - **Expansión:** dirección canónica reservada, no necesariamente una superficie central activa hoy.

# Declaración central

CookPilot existe para organizar la alimentación real de las personas. No es una app de recetas con más botones.

No es un catálogo infinito.

No es un chatbot colocado encima de la cocina.

No es un tracker nutricional que obliga a todos a vivir entre macros. CookPilot convierte contenido, intención y contexto en una secuencia útil:

qué quiero o necesito comer

\-> comida organizada

\-> compra clara

\-> ejecución guiada

\-> resultado registrado

\-> decisión reutilizable

Su promesa completa es:

**Que el usuario sepa qué comer, qué necesita, cómo encaja en su día, cómo cocinarlo y cómo volver a usarlo sin empezar desde cero.**

# El problema que une a todas las features

El problema no es la falta de recetas. El problema es la fricción acumulada alrededor de la comida.

La persona debe decidir, coordinar, comprar, ajustar cantidades, entender costos, cuidar objetivos, ejecutar varios pasos y recordar qué funcionó. Cuando cada parte vive en una app, una nota o una decisión separada, cocinar se vuelve más costoso mentalmente que pedir delivery o improvisar.

CookPilot reduce siete tipos de caos:

| **Caos**                                  | **Respuesta de CookPilot** |
| ----------------------------------------- | -------------------------- |
| No sé qué comer                           | Home, MESA y CookMatch     |
| No sé cómo organizarlo                    | CookPlan                   |
| No encuentro lo que guardé                | CookSearch                 |
| La receta está fuera de la app            | CookImport                 |
| No sé qué comprar                         | CookList                   |
| No sé cómo ejecutar todo junto            | CookMode                   |
| No sé si todo este esfuerzo valió la pena | CookBalance                |

Nutrición, precios, memoria, billing y settings atraviesan esas respuestas sin reemplazarlas.

# La tesis de producto

CookPilot es un sistema operativo culinario centrado en acciones reales.

La receta es una pieza, no el producto completo. El sistema trabaja con distintas escalas:

Ingrediente

\-> Receta

\-> Menú

\-> Momento del día

\-> Día

\-> Semana

\-> Sesión cocinada

\-> Progreso acumulado

El valor aparece cuando esas escalas pueden moverse entre features sin perder identidad, cantidades, contexto, costo, nutrición ni intención.

Tres principios sostienen todo el sistema:

- **Materializar, no solo sugerir.** Una respuesta útil termina como menú, plan, lista, receta o sesión real.
- **Conservar el trabajo ya hecho.** Guardar, aplicar, copiar, repetir e importar evitan reconstruir decisiones.
- **Separar complejidad de experiencia.** La inteligencia puede ser profunda por debajo, pero la siguiente acción debe ser clara.

# Mapa general del sistema

MEMORIA Y DESCUBRIMIENTO

CookImport

CookSearch

Bibli ver

oteca + Disco

ENTRADA Y CONTEXTO

Contenido externo

Settings + idioma + moneda + memoria + AI especializada

DECIDIR Y ORGANIZAR

Auth + Onboarding

HOME

Intención / objetios

CookMatch

Recipe / Menu Preview

CookPlan

Menú - emana

\> Día -> S

CookBilling: Free / Trial / Pro / Packs

ACCIÓN

INTERPRETAR Y AJUSTAR

CookList Compra convergente

CookMode Ejecución

Victory Cierre

CookBalance Progreso

CookHealth + CookFit

Pricing / MESA


La dirección principal es:

Entrada y contexto

\-> Resolver y organizar

\-> Comprar

\-> Cocinar

\-> Registrar

\-> Reutilizar

Pero CookPilot no funciona como una tubería rígida. El usuario puede entrar desde distintos nodos:

- - una búsqueda;
    - una receta externa;
    - un día vacío;
    - una meta nutricional;
    - una lista escrita;
    - una sesión pausada;
    - un menú guardado;
    - una necesidad urgente expresada en lenguaje natural.

Todas esas entradas deben converger en objetos que el resto del sistema pueda entender.

# El loop principal

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAOCAYAAABgmT8gAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAC0ElEQVRIic2Vy2sTURTGz71zJ0kzyWQmsbWgtKGapHmTlBaLuBHBrTtRXIgLQQQRVBSkoCCCuhF0IXUluPQ/EBFFsCQ0TcZpk/gojSi2tUkmadM2mZeL0qIQ06SNtd/mLM757vl+d4YZpOs67BYVXh1/Jy+MHQaENYpxTlNWV5aw7gxlPZglrDtDrK4sMu75iRD6a2i0m4DK41cfr3x+erHRDDJwRWJ1Z9ZgXZkNaMY5jShDjexU2GZE88HkyiYzek3i5XxsWM7Hhv9oIEqlGOc0/nfxWhfhQsktm3WVUpe+uP77E9KqBYdSSvuVUjogS0J4O2dRrCe9Y0CavGhVy1mfUpoKKKV0YL1qq3Pd2z0bM70zFv+NW6bek8/bDqTrGlaXZvqUkhhSpMmQIolhRRJDamWmr927sKlrjvFdu9PRd3YUUYYaAMC2gDR5yaKUJkNKUYhsAJSmgrpSYVoPt3eW2LyirlaN8sL7I41mEc1JjPfyPbPr/CNEmMrvvaaBtGrRLkupiFIUIkoxFZWLQkRd/OQB0FErwZGBKxKbTyQ2r0hY7ySxeUVi84nYaM8DAFRnXx+T3px4WddMmZcZ94WH5v5LD7CBk+qN1AXSaiWbUkwOyIXEoFxIDMmF5IC2/LW3leCAiEJYT5pwfoHY/ALhginC+T5gU/ePRj9Gmq/zpcOGWseBc08Y35W7lKlrrtFaAgCglLPe2tzbo3JhfEguJAbV8sf+Vm4eGzvnCRdIrYX2C4TzC8TqSa+/160IGx0LuGPfN23l+35AWDM5Tz+z+K/fppieXDN+AgCwmntxqjJ1f6SpheaeHM2HJggfTqzXzW69VdF8aAIcg2OW4M0RwrozrXgJAABtj8brNbG5J0c7ojHaHo0TPpygufAENvKFdoRuJPbQ6BlMs+WteAkAALFH48hgz9OOgRhtj8Zp+1rFps759kZtTluFAQD4BYD1HHXaWVgFAAAAAElFTkSuQmCC)![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAOCAYAAACCRSRZAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACw0lEQVRIidWUT2jTUBzHX15e2q5pmgxxDnXprNvaLmk7O/8fPHhTEBE8eNtJcCroYeBlBw8KIvjnLB4UwYM3PewwheFJnDqsa5t2m1u7KmPS2aRduzZ5STzMjW2s2Had6AdCSPj+vvw+PHiEaZoAL864syNnRhDrjSKnN7b89kVJZ5cEKSYP/hMQAABgRRKNYppXi2lenXt9am0A2vkUYj0x5PRFVyQR64kRiC5sx0KaHAksTT+96BAHB6GFVWqZRQAAoCtxoVLAKM661OKsa70kYZKO9mnECuOI9UUQK4wjrnucdLinCEhp9YoAAICWGT2+NPnoajn98jxz4M51a9u5FwRBmNXMEqZpAjUzekydGz6NlbiAc5KgL053ANOANW8CLSpyeiTE+iKIE8OI84cRJ4ZJW8t8tRXK+/4npeTzvpVvS+vJYSZ07wpi3FNVyWzE1Es2nJ/06EqiG+ckAStxASuSoBdm9tcjCW0t82vlKE4Mk0xXnIAIb8xmhg5Jen7Cu77AWqa7B27T3mt3CdJarkmmEqZesuFcwocVScRKzI/lqB8rkmgsfd9bixwAAADSVqI4MYyaez5RzcEx1Bwcg7bd3zKvOn5UHGE6E87e+/2WXSdGtixTCUOVuVVBJerHcjSA5WjAxHmmpiICacDE1J9iNteFZ0zPrQFo27lOvCEym2GaBtQLqXYsR4JrH72Q3NeIfoLiZEfw5o0md99jgoAGANsoUwlDyzmxHAnibDik/fzcq2XDIT2f8NV14QAAqB2H3zEHH1yiOPHLX5fZDBMX7Wo2EpDfnn0D9CJdcwFB6vauyw//CRkAAMD5r50LQ6GJrXTUdbTbgbbw4ehWO1AjFmkE2sLHI1UFoUUl7XvSJO1KQjufJOm2FEnzSZLmk/+QzO+Tgdby6oJ2PkXSfBLSfJK0L/+DTa1zK7fXRn4Bs6tEFsbr2r0AAAAASUVORK5CYII=)

Organizar en CookPlan

Comprar con CookList

Cocinar

con CookMode

Cerrar con Victory

Medir

con CookBalance

Descubrir Guardar y

o importar reutilizar

El loop completo es:

Descubrir o traer contenido

\-> convertirlo en un objeto CookPilot

\-> organizarlo en un plan

\-> convertir el plan en compra

\-> ejecutar la comida

\-> cerrar con tiempo, costo, nutrición

\-> conservar el resultado para repetir o ajustar

CookPilot deja de ser útil si el loop se rompe en cualquiera de estos puntos.

- - Descubrimiento sin planificación produce favoritos olvidados.
    - Planificación sin compra produce calendarios decorativos.
    - Compra sin ejecución produce listas sin comida.
    - Ejecución sin cierre pierde aprendizaje y prueba de valor.
    - Resultado sin reutilización obliga a empezar de cero.

# Navegación principal y superficies

La navegación principal organiza el producto en cuatro destinos visibles:

| **Superficie Responsabilidad** | |
| --- | | --- |
| **Home** | Contexto del día, planificación, recomendaciones, composer y sesiones activas |
| **Recipes / CookSearch** | Biblioteca, búsqueda, guardados, imports y exploración |

| **Superficie Responsabilidad** | |
| --- | | --- |
| **CookShop / CookList** | Compra convergente por categoría, receta o menú |
| **CookBalance** | Progreso acumulado de dinero, tiempo y alimentación |

Desde esas superficies se abren flujos más profundos:

- - Preview de receta o menú;
    - CookImport;
    - CookMode;
    - CookMode Live y cámara;
    - Victory;
    - Paywall y packs;
    - Settings y configuración nutricional.

Home es el centro de operación diaria, pero no es dueño de todo. Cada feature conserva una responsabilidad clara y comparte objetos mediante handoffs.

# Entrada, identidad y activación

## Splash y Auth

La capa de entrada resuelve identidad, continuidad de sesión y acceso. Permite explorar ciertas superficies con menor fricción y exige cuenta cuando la acción necesita propiedad, persistencia o consumo personal.

Su valor no es el login. Su valor es que planes, imports, listas, sesiones y progreso pertenezcan a la misma persona y puedan recuperarse.

## Onboarding

El onboarding funciona como un resolver inicial, no como un interrogatorio. Debe entender qué necesita la persona ahora:

- - explorar;
    - resolver una comida;
    - organizar su alimentación;
    - configurar objetivos nutricionales;
    - entrar con el mínimo contexto útil.

Cuando corresponde, captura datos básicos de salud, metas y plan nutricional. Esa capa es opcional para quien solo quiere organizar comida.

## Pase de prueba

El trial existe para demostrar el loop Pro con capacidad controlada: resolver, importar, escanear, cocinar y probar asistencia avanzada. No debe convertirse en una copia confusa del plan completo ni en un muro antes del primer valor.

# Home: la superficie operativa

Home es el lugar donde CookPilot muestra qué importa ahora. Reúne:

- - el día seleccionado;
    - momentos de comida;
    - menús y cards disponibles;
    - recomendaciones;
    - composer de resolución;
    - sesiones CookMode activas o pausadas;
    - accesos a preview, plan, cocina y acciones relacionadas.

Home conecta dos tiempos distintos:

- - **futuro:** lo que el usuario piensa comer;
    - **presente:** lo que puede resolver o cocinar ahora.

No debe convertirse en biblioteca, lista de compras o dashboard de progreso. Su trabajo es priorizar y entregar la siguiente decisión útil.

## Preview de receta o menú

Preview es el puente de inspección entre contenido y acción. Permite revisar una receta o menú antes de:

- - cocinar;
    - ajustar porciones;
    - añadir al plan;
    - añadir a CookList;
    - guardar o marcar favorito;
    - editar una versión personal;
    - consultar costo o nutrición.

No es una feature aislada: es una compuerta compartida entre Home, CookSearch, CookImport, CookPlan y CookMode.

# CookMatch: resolver sin empezar desde cero

## CookMatch

CookMatch es el motor de composición de menús, momentos o días.

Combina intención, recetas disponibles, contexto, preferencias y restricciones para producir propuestas utilizables. Su trabajo es resolver huecos sin obligar al usuario a construir cada componente manualmente.

# CookPlan: el centro organizacional

CookPlan organiza alimentación futura. Su jerarquía es:

Receta

\-> Menú

\-> Momento del día

\-> Día

\-> Semana

El menú es la unidad práctica: representa lo que realmente se va a comer y puede contener una o varias recetas, ingredientes directos, porciones, tiempo, costo y nutrición cuando corresponda.

CookPlan permite:

- - resolver slots vacíos;
    - aplicar recetas o menús;
    - organizar días y semanas;
    - ajustar porciones e ingredientes;
    - copiar y pegar estructuras;
    - guardar menús, días y semanas;
    - reutilizar decisiones;
    - llevar contenido a CookList;
    - iniciar CookMode.

CookPlan no vigila ni registra comida pasada. Prepara el futuro para que improvisar deje de ser la opción por defecto.

# Reutilización: guardar, aplicar, copiar y repetir

CookPilot debe conservar decisiones buenas. Las operaciones principales son:

- - **Favorito:** acceso rápido a una receta oficial que interesa.
    - **Guardar:** convertir una receta, menú, día o semana en activo reutilizable.
    - **Aplicar:** materializar un objeto guardado dentro de CookPlan.
    - **Copiar y pegar:** reutilizar contenido de forma rápida dentro del plan.
    - **Repetir o fijar:** mantener una estructura recurrente cuando el flujo correspondiente está disponible.
    - **Plantilla:** conservar una estructura completa para usos futuros.

Esta capa conecta CookPlan con CookSearch. CookPlan crea y usa estructuras; CookSearch las conserva y permite encontrarlas.

# CookSearch: biblioteca y exploración

CookSearch es la biblioteca personal y la superficie de exploración de CookPilot. Reúne:

- - favoritos;
    - recetas guardadas;
    - menús guardados;
    - días guardados;
    - semanas guardadas;
    - recetas importadas;
    - grupos de imports;
    - búsqueda oficial;
    - categorías de Discover.

Sus superficies principales son:

Todo Guardado Importado Explorar

La búsqueda y los filtros funcionan como una lente transversal. La misma intención puede reducir resultados oficiales, favoritos, imports y categorías sin convertir cada origen en una isla.

CookSearch entrega objetos a:

- - Preview;
    - CookPlan;
    - CookImport para edición;
    - CookMode cuando la receta ya es cocinable;
    - favoritos y colecciones guardadas.

Su promesa es simple:

**Todo lo que podría cocinar el usuario debe poder encontrarse y reutilizarse desde un solo lugar.**

# CookImport: traer recetas externas al sistema

CookImport convierte contenido externo en una receta organizada, editable y utilizable. Acepta:

- - web;
    - video;
    - imágenes;
    - texto;
    - PDF;
    - combinaciones de medios cuando corresponda.

El flujo es:

Fuente externa

\-> extracción

\-> receta estructurada

\-> revisión

\-> guardado o sincronización

\-> biblioteca y uso

La revisión protege el control del usuario. La receta puede corregirse, enriquecerse y recibir imagen, costo o nutrición, pero los cambios importantes se guardan explícitamente.

Una receta importada puede:

- - vivir en CookSearch;
    - entrar a CookPlan;
    - reemplazar una receta en un menú;
    - alimentar CookList;
    - abrir Preview;
    - pasar a CookMode;
    - conectarse con nutrición, precios e imágenes.

CookImport no es un extractor aislado. Es la puerta universal para traer recetas al ecosistema.

# CookHealth, CookFit y la capa nutricional

La nutrición es una capa potente, pero opcional. CookPilot debe servir a dos personas distintas:

- - quien quiere organizar comida sin que los macros dominen la experiencia;
    - quien quiere planificar con calorías, proteína, carbohidratos, grasas y objetivos claros.

## CookHealth

CookHealth interpreta ingredientes, cantidades, recetas, menús y planes para explicar la comida. Aporta:

- - calorías y macros;
    - lectura del menú;
    - objetivo diario;
    - presupuesto nutricional restante;
    - perfiles y badges;
    - contexto para Preview, CookPlan, Victory y CookBalance.

No diagnostica ni reemplaza criterio médico.

## CookFit

CookFit ajusta cantidades hacia un objetivo sin destruir la identidad culinaria. Su principio es:

**Ajustar agresivamente cuando haga falta, pero conservar una comida reconocible y culturalmente coherente.**

CookFit modifica la composición ejecutable del menú antes de cocinar; CookMode recibe el resultado ya resuelto.

## Base de ingredientes

La base de ingredientes es infraestructura común para nutrición, matching, recetas, precios, listas. El objetivo no es acumular cada producto comercial existente, sino mantener un canon culinario suficientemente limpio para tomar decisiones confiables.

# Precios, MESA y claridad económica

La capa económica ayuda a responder:

- - cuánto podría costar cocinar en casa;
    - cuánto cuesta el conjunto de ingredientes;
    - cómo se compara con delivery o restaurante;
    - qué ahorro referencial aparece;
    - qué ingredientes explican el costo.

El precio es una referencia útil, no una garantía absoluta. MESA y los servicios de pricing alimentan:

- - cards y previews;
    - CookPlan;
    - CookList;
    - Victory;
    - Mesa Auditor cuando recibe contexto económico;
    - CookBalance.

La regla comercial y de confianza es:

**CookPilot muestra claridad económica para decidir mejor; no promete un ahorro exacto que no puede controlar.**

# CookList: convertir planes en compra

CookList es la capa de compra conectada. Recibe ingredientes desde:

- - entradas manuales;
    - listas personalizadas;
    - recetas;
    - menús;
    - CookPlan;
    - texto o imágenes procesadas por Scanner.

Los organiza en tres lecturas:

Por categoría Por receta Por menú

Todo converge en una lista global derivada. El usuario puede revisar cantidades, cambiar porciones, marcar compras, limpiar items y ver precios cuando están disponibles.

CookList conserva el origen de cada ingrediente para que una compra semanal siga siendo comprensible.

Su relación con otras features es directa:

CookPlan decide qué se cocinará

CookList traduce esa decisión a ingredientes comprables CookMode ejecuta lo que ya fue organizado y comprado

# CookMode: convertir una decisión en una comida terminada

CookMode es la capa de ejecución.

Recibe una receta o menú ya resuelto y lo convierte en una sesión con overview, timeline, progreso, tiempo, pausa, recuperación y cierre.

CookMode no decide desde cero qué comer ni renegocia el menú durante el fuego.

## Direct Mode

Usa el orden canónico cuando la comida es simple o una optimización adicional no aporta valor material.

## Last Mile

Organiza pasos existentes para que varias preparaciones formen una sola línea de cocina coherente. Protege calor, frescura, crocancia, reposos y carga mental sin reescribir recetas.

## Timers y continuidad

CookMode mantiene cronómetro global, progreso, pausa, salida y reanudación. Una sesión puede volver a abrirse sin obligar al usuario a reconstruir el punto en el que quedó.

## CookMode Live

Es el copiloto oral de una sesión activa. Responde dudas, consulta el estado real, maneja timers y puede activar capacidades visuales. No gobierna el timeline ni reemplaza la UI.

## Visual Review

Usa cámara temporal para observar lo que está ocurriendo y ayudar con color, textura, reducción o punto visual.

## Visual Reference

Genera una guía de cómo debería verse un estado concreto del paso. No mira la comida real.

## Hands-Free

Permite operar acciones ya existentes sin tocar el teléfono. Es una entrada adicional, no un CookMode paralelo.

## Clean Screen

Reduce ruido visual cuando el usuario necesita máxima atención.

## Victory

Cierra la sesión con tiempo, costo, ahorro, nutrición, imagen final . Solo en este cierre la ejecución se convierte en evento completo.

## Mesa Auditor

Revisa el plato final desde imágenes y contexto del menú. Aporta feedback breve y cierra la experiencia sin convertirla en concurso fotográfico.

# CookBalance: convertir uso en progreso visible

CookBalance es el tablero de impacto personal.

Recibe eventos reales de comidas completadas, principalmente desde Victory, y los convierte en tres ejes:

- - dinero ahorrado;
    - tiempo ahorrado;
    - comidas saludables o nutricionalmente valiosas.

Permite observar periodos como hoy, semana o mes y abrir el historial que explica cada cifra.

CookBalance no genera menús ni decide qué comer. Su trabajo es demostrar que usar CookPilot produjo un resultado acumulable.

La relación es:

Home promete una decisión útil CookPlan la organiza

CookMode la ejecuta Victory la registra

CookBalance demuestra el valor acumulado

CookBalance es una pieza de retención porque convierte la cocina cotidiana en evidencia personal.

# CookBilling: acceso, Pro y uso intensivo

CookBilling ordena planes, trial, límites, consumos y packs.

No define qué es CookPilot. Protege la economía del producto y explica qué capacidades están disponibles.

El modelo general es:

- - **Free:** permite explorar y usar la base del sistema con acceso limitado a operaciones costosas.
    - **Trial / Pase:** demuestra el loop premium con una muestra controlada.
    - **CookPilot Pro:** acceso recurrente al sistema completo y a cuotas mensuales de capacidades AI.
    - **Packs:** expansión contextual para uso intensivo de una capacidad concreta.

Los recursos pueden separar generación de menús, imports, Scanner, imágenes, Live, Mesa Auditor u otras operaciones costosas.

La regla de producto es:

**Agotar una capacidad premium puede detener esa automatización, pero no debe romper una receta que ya está en ejecución.**

Pro se vende como continuidad del sistema, no como una bolsa de monedas.

# Settings y capas transversales

## CookSettings

Settings concentra preferencias que modifican varias superficies:

- - idioma;
    - moneda;
    - visibilidad de precios;
    - preferencias culinarias;
    - objetivos nutricionales;
    - configuración de CookMode y Last Mile;
    - cuenta y sesión;
    - otras opciones personales.

## Moneda global

PEN y USD deben mantener una lectura coherente entre Preview, CookList, Victory y CookBalance. La moneda es presentación global, no una lógica paralela por feature.

## Memoria útil

CookPilot puede conservar preferencias estables, restricciones y patrones útiles. No debe convertir ruido conversacional, transcripts o incidentes puntuales en memoria permanente.

## Capa AI especializada

CookPilot no tiene una sola AI que hace todo. Usa capacidades especializadas para:

- - capturar contenido;
    - componer menús;
    - importar recetas;
    - escanear listas;
    - ajustar u organizar;
    - asistir por voz;
    - observar imágenes;
    - generar referencias;
    - auditar resultados.

La AI es infraestructura de transformación. La verdad de producto sigue viviendo en recetas, menús, planes, listas, sesiones y eventos reales.

## Diseño OS-like

Las superficies deben sentirse como partes del mismo sistema: continuidad, capas, foco, feedback y objetos que viajan entre features. La interfaz no debe parecer una colección de pantallas pegadas.

# Inventario resumido de features

| **Capa**          | **Feature o capacidad**           | **Trabajo principal**                                    |
| ----------------- | --------------------------------- | -------------------------------------------------------- |
| Entrada           | Splash / Auth                     | Identidad, sesión y continuidad                          |
| Entrada           | Onboarding                        | Detectar intención y recoger contexto mínimo             |
| Operación         | Home                              | Priorizar el día, las recomendaciones y sesiones activas |
| Resolución        | CookMatch                         | Componer recetas en menús, slots o días                  |
| Inspección        | Recipe / Menu Preview             | Revisar antes de guardar, planificar, comprar o cocinar  |
| Planificación     | CookPlan                          | Organizar menús en momentos, días y semanas              |
| Reutilización     | Guardados, copiar, pegar, repetir | Conservar decisiones y reducir reconstrucción            |
| Biblioteca        | CookSearch                        | Encontrar, explorar y reutilizar contenido               |
| Biblioteca        | Discover y favoritos              | Navegar catálogo y conservar interés                     |
| Entrada externa   | CookImport                        | Convertir fuentes externas en recetas CookPilot          |
| Nutrición         | CookHealth                        | Explicar ingredientes, recetas, menús y planes           |
| Nutrición         | CookFit                           | Ajustar cantidades hacia objetivos                       |
| Economía          | Pricing / MESA                    | Costo casero, comparación y ahorro referencial           |
| Compra            | CookList                          | Convertir decisiones en ingredientes comprables          |
| Compra            | CookList Scanner                  | Convertir texto e imágenes en items de compra            |
| Ejecución         | CookMode                          | Ejecutar una comida mediante una sesión persistente      |
| Ejecución         | Last Mile                         | Organizar pasos existentes                               |
| Ejecución         | Timers / Clean Screen             | Reducir carga operativa durante la cocina                |
| Asistencia        | CookMode Live                     | Ayuda oral contextual y tools                            |
| Asistencia visual | Visual Review                     | Observar comida real temporalmente                       |

| **Capa**             | **Feature o capacidad** | **Trabajo principal**                                   |
| -------------------- | ----------------------- | ------------------------------------------------------- |
| Asistencia visual    | Visual Reference        | Mostrar el estado visual esperado                       |
| Accesibilidad física | Hands-Free              | Operar sin tocar el teléfono                            |
| Cierre               | Victory                 | Registrar resultado, tiempo, costo, nutrición   |
| Evaluación           | Mesa Auditor            | Revisar el plato final                                  |
| Progreso             | CookBalance             | Mostrar impacto acumulado e historial                   |
| Acceso               | CookBilling             | Planes, trial, cuotas y packs                           |
| Configuración        | CookSettings            | Preferencias globales y cuenta                          |
| Expansión            | CookShare               | Compartir objetos útiles cuando la capa esté desplegada |

# Matriz de conexiones

| **Nodo**   | **Recibe**                          | **Entrega**                      | **Se conecta principalmente con** |
| ---------- | ----------------------------------- | -------------------------------- | --------------------------------- |
| Onboarding | intención y contexto inicial        | configuración y primer destino   | Home, CookHealth                  |
| Home       | plan, recomendaciones y sesiones    | siguiente acción priorizada      | CookPlan, Preview, CookMode       |
| CookMatch  | intención, catálogo y restricciones | composición utilizable           | Home, CookPlan                    |
| CookPlan   | recetas, menús y objetivos          | día o semana organizada          | CookSearch, CookList, CookMode    |
| CookSearch | catálogo, guardados e imports       | objeto encontrado o reutilizable | Preview, CookImport, CookPlan     |
| CookImport | web, video, imagen, texto o PDF     | receta personal estructurada     | CookSearch, CookPlan, CookMode    |

| **Nodo**         | **Recibe**                            | **Entrega**                  | **Se conecta principalmente con**   |
| ---------------- | ------------------------------------- | ---------------------------- | ----------------------------------- |
| CookHealth / Fit | ingredientes, cantidades y metas      | lectura y ajuste nutricional | Home, CookPlan, Preview, Balance    |
| Pricing / MESA   | ingredientes, porciones y referencias | costo y comparación          | Preview, CookList, Victory, Balance |
| CookList         | plan, recetas, menús y scanner        | compra organizada            | CookPlan, CookMode          |
| CookMode         | comida ya resuelta                    | sesión ejecutada             | Live, Visual, Victory               |
| Victory          | resultado real                        | evento, consumo y cierre     | CookBalance                 |
| CookBalance      | eventos completados                   | progreso acumulado           | Home y narrativa Pro                |
| CookBilling      | plan y saldo                          | acceso o gate contextual     | todas las capacidades premium       |

# Recorridos canónicos

## No sé qué cocinar

Home

\-> CookMatch

\-> Preview

\-> CookPlan

\-> CookList

\-> CookMode

\-> Victory

\-> CookBalance

## Encontré una receta en internet

CookImport

\-> revisión

\-> CookSearch

\-> Preview

\-> CookPlan o CookMode

\-> Victory

\-> CookBalance

## Quiero reutilizar una semana que funcionó

CookSearch / Semanas guardadas

\-> aplicar

\-> CookPlan

\-> ajustar

\-> CookList

\-> CookMode

## Quiero cumplir un objetivo nutricional

Onboarding o Settings

\-> CookHealth

\-> CookPlan

\-> CookFit

\-> Preview

\-> CookList

\-> CookMode

\-> CookBalance

## Solo quiero explorar

CookSearch / Discover

\-> Preview

\-> favorito o guardado

\-> uso posterior en CookPlan

## Ya estaba cocinando

Home / Sesiones activas

\-> reanudar CookMode

\-> Live o Visual si hace falta

\-> Victory

\-> CookBalance

# Valor para el usuario

CookPilot entrega seis formas de valor conectadas:

- **Menos decisiones repetidas.** El plan, la biblioteca y la reutilización conservan trabajo.
- **Menos carga mental.** El sistema coordina ingredientes, porciones, compra y ejecución.
- **Más control económico.** Precios y comparaciones hacen visible el costo antes y después.
- **Nutrición aplicada a comida real.** Los objetivos se conectan con platos reconocibles.
- **Menos errores al cocinar.** CookMode, Last Mile, Live y las capas visuales acompañan la ejecución.
- **Progreso visible.** CookBalance demuestra que las sesiones acumulan valor.

La experiencia ideal produce esta sensación:

**Ya sé qué voy a comer, ya sé qué necesito, ya sé cómo hacerlo y ya puedo repetirlo.**

# Valor de negocio

## Adquisición

CookSearch, Discover, CookImport y, más adelante, CookShare crean puertas de entrada. El usuario puede llegar por una receta, una necesidad o un objeto útil.

## Activación

El primer valor no es completar un perfil. Es obtener una solución materializada: una receta, menú, plan, lista o sesión cocinable.

## Retención

CookPlan, guardados, semanas, imports, listas, sesiones activas y CookBalance hacen que abandonar CookPilot implique perder orden y trabajo acumulado.

## Monetización

CookPilot Pro monetiza continuidad y automatización. Los packs monetizan intensidad. La cocina base y los objetos del usuario siguen siendo comprensibles incluso cuando una cuota premium se agota.

## Diferenciación

La ventaja no es una feature aislada ni el uso de AI. La ventaja es la conexión:

contenido propio y oficial

\+ planificación real

\+ compra convergente

\+ ejecución asistida

\+ economía y nutrición

\+ progreso acumulado

Un competidor puede copiar una pantalla. Es más difícil copiar un sistema donde cada objeto puede descubrirse, importarse, ajustarse, planificarse, comprarse, cocinarse y medirse.

# Invariantes de producto

- CookPilot organiza comida real; no colecciona features.
- La receta no es la única unidad: menú, día y semana también son objetos de primera clase.
- Home prioriza; CookPlan organiza; CookSearch conserva.
- CookMatch compone.
- CookImport trae contenido externo bajo control explícito del usuario.
- La planificación funciona aunque no exista objetivo nutricional.
- CookHealth y CookFit enriquecen la comida sin borrar su identidad cultural.
- Los precios son referenciales y deben expresarse con honestidad.
- CookList converge fuentes; no obliga a reconstruir ingredientes.
- CookMode recibe una comida ya resuelta y protege la ejecución.
- Last Mile organiza pasos existentes; no reescribe por deporte.
- Live acompaña; no gobierna el estado.
- Visual Review observa realidad; Visual Reference genera una expectativa.
- Hands-Free reutiliza acciones existentes.
- Victory es el cierre real del loop de cocina.
- CookBalance usa eventos reales y explica de dónde sale el progreso.
- AI costosa puede agotarse sin destruir la acción básica del usuario.
- La memoria permanente guarda señales estables, no ruido operativo.
- Guardar, aplicar y copiar no son la misma acción.
- Cada feature debe poder responder qué caos concreto está reduciendo.

# Fronteras y expansión

CookPilot no busca convertirse en:

- - una red social culinaria;
    - un marketplace generalista;
    - una base infinita de productos comerciales;
    - un tracker médico;
    - un chat permanente;
    - una economía de monedas confusa;
    - una colección de dashboards sin acción;
    - un sistema que obliga a usar AI para cada comida.

CookShare permanece como capa de expansión: compartir recetas, menús, listas, días, semanas o plantillas como objetos útiles. Cuando se despliegue, debe distribuir valor sin desviar el producto hacia followers, likes o feeds.

El crecimiento debe profundizar el loop principal antes de añadir universos paralelos.

# Documentaciones especializadas

Este canon debe acompañarse con los documentos particulares de cada sistema:

- - CookPlan - canon y documentación técnica;
    - CookSearch - canon de producto y documentación técnica;
    - CookImport - canon de producto y documentación técnica;
    - CookList - canon de producto y documentación técnica;
    - CookMode - canon de producto y documentación técnica;
    - CookMode Hands-Free - white paper;
    - CookMode Live - documento especializado;
    - CookBalance - canon operativo;
    - CookBilling - arquitectura comercial, planes y packs;
    - Ingredients & Nutrition Canon;
    - Pricing / MESA;
    - AI Edge Functions;
    - Design System y UI Playbook;
    - Constitución de Producto de CookPilot.

La documentación especializada responde cómo funciona cada nodo. Este documento responde por qué existe y cómo encaja en el sistema.

# Definición final

CookPilot es la casa donde la comida deja de estar dispersa y empieza a tener orden.

Puede recibir una idea, una receta, una foto, un objetivo, un menú guardado, una lista, una semana vacía o una sesión interrumpida.

Su trabajo es convertir esa entrada en algo ejecutable:

una receta clara un menú completo un día organizado

una semana reutilizable una compra concreta una sesión cocinable un resultado medible

La promesa final es:

**Decidir una vez, organizar con claridad, cocinar con menos fricción y conservar lo que funcionó.**