# CookShare — White Paper Funcional - LEGACY AT SEPTEMBRE 2026, USE JUST FOR ADITIONAL CONTEXT, NOT MANDATORY.

## Capa de objetos compartibles, adquisición y distribución de CookPilot

## 1. Declaración central

CookShare es la capa de CookPilot encargada de convertir objetos útiles en páginas compartibles.

Su propósito principal es cerrar un loop de adquisición orgánica:

> Un usuario crea algo útil, lo comparte, otra persona lo ve, lo usa o lo guarda, y CookPilot gana una nueva oportunidad de activación.

CookShare no existe para crear una red social.
No existe para crear feeds.
No existe para generar rankings, likes, comentarios o perfiles públicos complejos.
No existe para que el usuario comparta “la app”.

CookShare existe para que el usuario comparta cosas concretas:

* una receta;
* un menú;
* una lista;
* un día;
* una plantilla;
* un plan;
* una preparación útil.

La tesis central:

> La gente no comparte apps. Comparte objetos que sirven.

CookShare convierte esos objetos en puertas de entrada a CookPilot.

---

# 2. Principio de producto

CookShare debe ser una capa de distribución utilitaria.

La persona comparte porque el objeto tiene valor para alguien más.

Ejemplos:

* “mira esta receta”;
* “este es el menú de mañana”;
* “compra esto”;
* “usa esta lista”;
* “copia esta semana”;
* “este desayuno me cuadró perfecto”;
* “haz este plan conmigo”;
* “esta es la comida de la casa esta semana”.

El crecimiento viene como consecuencia de utilidad real.

La regla:

> CookShare no comparte marketing. Comparte comida organizada.

---

# 3. Objetivos de CookShare

CookShare debe cumplir tres objetivos:

## 3.1 Distribución

Cada objeto compartido debe funcionar como superficie de adquisición.

Cuando un usuario comparte un link, ese link debe poder traer tráfico nuevo a CookPilot.

## 3.2 Utilidad inmediata

El receptor debe poder entender y usar el objeto compartido sin depender primero de instalar la app.

La página compartida debe mostrar contenido suficiente para que el objeto tenga valor.

## 3.3 Activación

El receptor debe poder convertir ese objeto en algo propio dentro de CookPilot.

El CTA no debe ser genérico.

No basta con:


Descargar CookPilot


El CTA debe estar conectado al objeto:

* guardar receta;
* agregar menú;
* usar plantilla;
* copiar día;
* abrir lista;
* importar plan;
* ajustar a mis objetivos;
* abrir en CookPilot.

La adquisición ideal no termina en visita.

Termina en objeto usado.

---

# 4. Handles obligatorios

Todo usuario que quiera compartir objetos públicamente debe crear un handle/apodo público.

No existen links anónimos para compartir.

La regla:

> Para compartir, el usuario necesita identidad pública mínima.

El handle sirve para:

* identificar autoría;
* evitar URLs feas con IDs largos;
* reducir colisiones;
* crear links humanos;
* permitir páginas públicas;
* sostener SEO;
* hacer que los objetos compartidos tengan contexto.

Ejemplo:


cookpilot.pro/@paz/recetas/lomo-saltado-deficit


El handle no debe ser obligatorio para usar CookPilot.

Solo debe ser obligatorio cuando el usuario quiera compartir.

---

# 5. Reglas del handle

El handle debe ser único.

Debe poder contener:

* letras;
* números;
* guiones;
* guiones bajos si se decide permitirlos.

Debe evitar:

* espacios;
* caracteres raros;
* símbolos innecesarios;
* palabras reservadas;
* nombres protegidos;
* impersonación evidente.

Palabras reservadas posibles:

* recetas;
* menus;
* plantillas;
* listas;
* dias;
* admin;
* api;
* blog;
* cookpilot;
* soporte;
* legal;
* terms;
* privacy.

Si un handle está ocupado, el usuario debe elegir otro.

---

# 6. Estructura general de links

CookShare debe usar URLs legibles, indexables cuando aplique y organizadas por tipo de objeto.

La estructura recomendada:


cookpilot.pro/@handle/tipo/slug-del-objeto


Ejemplos:


cookpilot.pro/@paz/recetas/lomo-saltado-deficit
cookpilot.pro/@paz/menus/desayuno-de-volumen
cookpilot.pro/@paz/plantillas/semana-de-deficit
cookpilot.pro/@paz/listas/mercado-de-la-semana
cookpilot.pro/@paz/dias/dia-2100-kcal


La inclusión del tipo evita colisiones entre objetos del mismo usuario.

Un usuario puede tener:


/@paz/recetas/lomo-saltado
/@paz/menus/lomo-saltado


sin conflicto.

---

# 7. Recetas oficiales

Las recetas oficiales de CookPilot pueden tener URLs públicas sin handle.

Estructura recomendada:


cookpilot.pro/recetas/lomo-saltado
cookpilot.pro/recetas/aji-de-gallina
cookpilot.pro/recetas/arroz-con-pollo


Estas páginas pueden funcionar como base SEO.

Su objetivo es captar búsquedas directas de recetas y llevar tráfico a CookPilot.

Las recetas oficiales son objetos públicos de CookPilot, no de un usuario.

Por eso no requieren handle.

---

# 8. Recetas públicas de usuario

Las recetas públicas de usuario deben vivir bajo el handle del usuario.

Estructura:


cookpilot.pro/@handle/recetas/slug


Ejemplos:


cookpilot.pro/@paz/recetas/lomo-saltado-deficit
cookpilot.pro/@ana/recetas/panqueques-de-avena
cookpilot.pro/@carlos/recetas/pollo-alto-en-proteina


Una receta pública de usuario debe mostrar autoría.

El usuario puede controlar qué recetas publica.

No toda receta personal debe volverse pública automáticamente.

---

# 9. Slugs de objetos

Cada objeto compartible debe tener un slug público.

El slug debe derivarse del nombre del objeto, pero puede editarse si hace falta.

Regla:

> El nombre interno del objeto y el slug público no tienen que ser idénticos.

Ejemplo:

Nombre interno:


Lomo saltado déficit


Slug público:


lomo-saltado-deficit


Si hay colisión dentro del mismo tipo y handle, el usuario debe cambiar el slug público.

No se debe añadir sufijo automáticamente salvo que el sistema lo proponga como sugerencia editable.

---

# 10. Colisiones

La colisión se resuelve dentro de:


handle + tipo + slug


Esto significa que dos usuarios pueden tener el mismo slug:


/@paz/recetas/lomo-saltado
/@ana/recetas/lomo-saltado


No hay conflicto.

Un mismo usuario no puede tener dos recetas públicas con el mismo slug.

Si ocurre, el sistema debe pedir otro slug.

---

# 11. Objetos shareables

CookShare debe permitir compartir objetos útiles.

Los objetos principales son:

* recetas;
* menús;
* listas;
* días;
* plantillas;
* planes;
* cards nutricionales simples si aplica.

Cada objeto debe tener página propia o representación pública suficiente para que el receptor entienda qué está viendo.

---

# 12. Shareable: Receta

La receta es el objeto shareable base.

Una página de receta puede mostrar:

* título;
* imagen si existe;
* autor si es de usuario;
* ingredientes;
* cantidades;
* pasos;
* porciones;
* calorías;
* macros;
* fibra;
* badges;
* costo estimado si existe;
* CTA principal;
* CTA secundaria.

CTAs posibles:

* guardar receta;
* abrir receta;
* cocinar;
* ajustar a mis objetivos;
* copiar a mi cuenta.

La receta es el objeto más natural para SEO y tráfico externo.

---

# 13. Shareable: Menú

El menú es más potente que una receta aislada.

Un menú puede contener varios componentes.

Ejemplos:


Panqueques + ponche



Lomo saltado + arroz + ensalada


Una página de menú puede mostrar:

* título;
* componentes;
* cantidades;
* porciones;
* calorías;
* macros;
* fibra;
* costo estimado;
* ingredientes consolidados;
* CTA principal;
* CTA secundaria.

CTAs posibles:

* guardar menú;
* agregar a mi día;
* copiar menú;
* ajustar menú;
* abrir en CookPilot.

El menú permite compartir una comida completa, no solo una preparación.

---

# 14. Shareable: Lista

Las listas son shareables utilitarios.

Una lista puede representar compras, ingredientes o preparación.

Una página de lista puede mostrar:

* nombre;
* ingredientes;
* cantidades;
* agrupación simple si existe;
* costo estimado si existe;
* autor;
* origen del objeto;
* CTA principal.

CTAs posibles:

* copiar lista;
* guardar lista;
* abrir lista;
* usar en CookPilot.

Las listas tienen valor doméstico real.

No necesitan ser glamorosas para ser compartibles.

---

# 15. Shareable: Día

Un día compartible representa una estructura alimentaria completa.

Puede mostrar:

* momentos del día;
* menús;
* ingredientes sueltos si existen;
* calorías;
* proteína;
* carbohidratos;
* grasas;
* fibra;
* costo estimado si existe;
* badges principales;
* CTA principal.

CTAs posibles:

* copiar día;
* usar este día;
* guardar como plantilla;
* abrir en CookPilot.

Un día compartido puede ser muy fuerte para usuarios que buscan una estructura lista.

---

# 16. Shareable: Plantilla

Una plantilla compartible representa una estructura reutilizable.

Puede ser:

* plantilla de menú;
* plantilla de día;
* plantilla de semana;
* plantilla de rango.

Una página de plantilla puede mostrar:

* nombre;
* descripción corta;
* estructura;
* días incluidos;
* menús incluidos;
* porciones;
* macros promedio si aplica;
* costo estimado si aplica;
* CTA principal.

CTAs posibles:

* usar plantilla;
* guardar plantilla;
* copiar a mi cuenta;
* abrir en CookPilot.

Las plantillas son objetos de alta activación porque permiten que el receptor empiece con una estructura grande ya armada.

---

# 17. Shareable: Plan

Un plan compartible puede representar una organización más amplia.

Ejemplos:

* semana de comidas;
* plan familiar;
* plan económico;
* plan de volumen;
* plan de déficit;
* plan de cocina por días;
* plan de menús repetibles.

Una página de plan puede mostrar:

* nombre;
* días;
* menús;
* porciones;
* costo estimado;
* resumen nutricional si aplica;
* lista asociada si aplica;
* CTA principal.

CTAs posibles:

* copiar plan;
* usar plan;
* guardar como plantilla;
* abrir en CookPilot.

El plan es una pieza fuerte para adquisición porque entrega mucho valor de una vez.

---

# 18. Shareable: Card nutricional

CookShare puede permitir cards nutricionales simples.

Estas cards pueden mostrar:

* calorías;
* proteína;
* carbohidratos;
* grasas;
* fibra;
* badges;
* resumen corto.

No deben convertirse en el objeto principal de CookShare.

Sirven para compartir logros, ideas o composición nutricional de un objeto.

No se debe compartir progreso corporal sensible como parte del núcleo.

---

# 19. Qué no debe ser shareable en el núcleo

CookShare no debe enfocarse en compartir:

* peso;
* fotos de progreso corporal;
* historial completo;
* datos de salud;
* perfil nutricional completo;
* métricas privadas;
* rankings personales;
* comparaciones sociales;
* actividad física;
* información sensible;
* registros médicos;
* datos externos de salud.

CookShare comparte objetos útiles, no intimidad del usuario.

---

# 20. Página pública del objeto

Cada objeto compartido debe abrir en una página pública legible.

La página debe ser útil incluso antes de iniciar sesión.

Debe contener:

* título;
* autor;
* contenido principal;
* vista clara del objeto;
* CTA de acción;
* metadata de preview;
* fallback si el objeto fue eliminado o despublicado.

La página no debe ser solo una pantalla que empuja a instalar.

Primero debe entregar valor.

Luego debe invitar a usar CookPilot.

---

# 21. Metadata para previews

Cada link compartido debe generar buen preview en canales externos.

Debe incluir:

* título;
* descripción corta;
* imagen si existe;
* tipo de objeto;
* autor;
* marca CookPilot;
* URL canónica.

Ejemplo de preview:


Lomo saltado de déficit por @paz
650 kcal · 45P · 70C · 18F
Ver receta en CookPilot


Esto mejora apertura en WhatsApp, Telegram, LinkedIn, X, Facebook y otras superficies.

---

# 22. CTAs por tipo de objeto

Los CTAs deben ser específicos al objeto.

No usar siempre:


Descargar app


CTAs recomendados:

Para receta:

* guardar receta;
* cocinar receta;
* ajustar receta.

Para menú:

* guardar menú;
* agregar a mi día;
* ajustar menú.

Para lista:

* guardar lista;
* copiar lista;
* abrir lista.

Para día:

* copiar día;
* usar este día;
* guardar como plantilla.

Para plantilla:

* usar plantilla;
* guardar plantilla;
* aplicar estructura.

Para plan:

* copiar plan;
* usar plan;
* guardar como plantilla.

La regla:

> El CTA debe prometer una acción útil, no solo una instalación.

---

# 23. Activación desde objeto

CookShare debe diseñarse para que el receptor entre con un objeto ya útil.

Loop deseado:


Usuario comparte objeto
↓
Receptor abre página pública
↓
Receptor ve valor inmediato
↓
Receptor decide guardar/usar/copiar
↓
CookPilot solicita cuenta o app cuando sea necesario
↓
Receptor entra con el objeto ya incorporado


Esto reduce fricción de activación.

La persona no empieza desde cero.

Empieza desde algo que ya le interesó.

---

# 24. Publicación

Compartir implica publicar el objeto bajo el handle del usuario.

Antes de compartir, el usuario debe tener:

* handle creado;
* slug disponible;
* objeto válido para página pública.

El usuario debe entender que ese objeto será visible por link público.

Si el objeto contiene información que no debería mostrarse, debe decidir no compartirlo.

---

# 25. Despublicar

El usuario debe poder despublicar un objeto.

Cuando un objeto se despublica:

* el link deja de mostrar el contenido;
* la página puede mostrar estado no disponible;
* el objeto deja de ser público;
* previews futuros deben reflejar que ya no está disponible si es posible.

Despublicar no debe borrar necesariamente el objeto interno del usuario.

Solo elimina su disponibilidad pública.

---

# 26. Editar objeto publicado

Si el usuario edita un objeto publicado, debe definirse qué ocurre con la página pública.

Regla recomendada:

> La página pública refleja la versión actual del objeto publicado.

Si el usuario quiere preservar una versión anterior, debe duplicar antes de cambiar.

No se debe crear historial público complejo en el núcleo.

---

# 27. Autoría

Cada objeto publicado por usuario debe mostrar autoría.

Ejemplo:


Por @paz


La autoría puede ayudar a:

* generar confianza;
* reforzar identidad;
* permitir descubrimiento;
* dar contexto;
* fomentar reuso.

No debe convertirse en perfil social completo.

El handle basta como identidad pública mínima.

---

# 28. Página de handle

Un handle puede tener una página pública simple.

Ejemplo:


cookpilot.pro/@paz


Esta página puede mostrar objetos públicos del usuario.

Debe mantenerse simple:

* nombre público;
* handle;
* objetos publicados;
* filtros básicos por tipo si aplica.

No debe convertirse en feed social.

No debe incluir followers, likes, comentarios o rankings.

---

# 29. Indexación

No todos los objetos tienen la misma prioridad SEO.

Prioridad alta:

* recetas oficiales;
* recetas públicas de usuario.

Prioridad media:

* menús públicos;
* plantillas públicas;
* planes públicos seleccionados.

Prioridad baja:

* listas;
* días;
* cards nutricionales.

CookShare debe permitir indexación, pero no necesita convertir todo objeto en estrategia SEO.

La prioridad inicial debe ser utilidad y adquisición.

---

# 30. Estructura SEO recomendada

Recetas oficiales:


cookpilot.pro/recetas/lomo-saltado


Recetas de usuario:


cookpilot.pro/@paz/recetas/lomo-saltado-deficit


Menús:


cookpilot.pro/@paz/menus/desayuno-de-volumen


Plantillas:


cookpilot.pro/@paz/plantillas/semana-de-deficit


Listas:


cookpilot.pro/@paz/listas/mercado-de-la-semana


Días:


cookpilot.pro/@paz/dias/dia-2100-kcal


Planes:


cookpilot.pro/@paz/planes/semana-alta-proteina


La URL debe ser legible.

No debe depender de IDs largos visibles.

---

# 31. IDs internos

Los objetos pueden tener IDs internos.

Pero esos IDs no deben ser el centro visible del link público.

No usar URLs tipo:


cookpilot.pro/user-id/uuid/lomo-saltado


Tampoco usar sufijos innecesarios en el slug público si se puede evitar.

La identidad visible debe ser:


@handle + tipo + slug


Los IDs internos pueden existir para resolver backend, seguridad, ownership o routing, pero no deben ensuciar el link.

---

# 32. Links y colisión global

La estructura `@handle/tipo/slug` permite escalar sin conflicto global.

El sistema no necesita exigir que todos los slugs sean únicos globalmente.

Solo deben ser únicos dentro del espacio del usuario y tipo.

Esto permite URLs limpias y humanas.

---

# 33. Compartir sin handle

CookShare no permite compartir sin handle.

Si el usuario intenta compartir y no tiene handle, debe crearlo.

El flujo debe ser corto:


Elige tu link público
cookpilot.pro/@_____


Después de crear el handle, el usuario puede continuar compartiendo.

Esto evita links anónimos, feos o sin contexto.

---

# 34. Share como imagen

CookShare puede permitir compartir imagen/card además del link.

Esto puede servir para:

* stories;
* WhatsApp;
* redes sociales;
* chats;
* mensajes rápidos.

La imagen no reemplaza el link.

La imagen debe llevar el link o marca suficiente para llevar tráfico.

No debe convertirse en diseño manual complejo.

---

# 35. Contenido mínimo por objeto

Cada tipo de objeto debe tener contenido mínimo para poder publicarse.

Ejemplos:

Receta:

* título;
* ingredientes;
* pasos o preparación;
* cantidades mínimas.

Menú:

* título;
* al menos un componente;
* cantidades o porciones.

Lista:

* título;
* al menos un item.

Día:

* al menos un momento con contenido.

Plantilla:

* estructura reutilizable válida.

Plan:

* al menos un bloque o día.

Si un objeto no tiene contenido suficiente, no debe publicarse.

---

# 36. Marca CookPilot en páginas compartidas

Cada página compartida debe incluir marca CookPilot de forma clara pero no invasiva.

La marca debe funcionar como origen y CTA.

No debe tapar el contenido.

La regla:

> Primero el objeto, luego CookPilot.

El usuario llega por la receta, menú o lista.

CookPilot aparece como el sistema que permite guardarlo, ajustarlo y usarlo.

---

# 37. Analítica de CookShare

CookShare debe poder medir el loop de adquisición.

Métricas conceptuales:

* objetos publicados;
* objetos compartidos;
* visitas por objeto;
* clicks en CTA;
* objetos guardados;
* objetos copiados;
* conversiones a cuenta/app;
* usuarios nuevos desde share;
* tipo de objeto que mejor convierte;
* handles con más tráfico;
* recetas con más tráfico.

La métrica importante no es solo visita.

La métrica importante es:

> objeto compartido → objeto usado por otra persona.

---

# 38. Anti-abuso básico

CookShare debe protegerse de abuso.

Riesgos:

* spam;
* contenido ofensivo;
* impersonación;
* slugs engañosos;
* recetas falsas peligrosas;
* uso de marcas protegidas;
* contenido irrelevante;
* publicación masiva basura.

Guardrails mínimos:

* reportar objeto;
* despublicar;
* bloquear handles reservados;
* bloquear slugs reservados;
* eliminar contenido abusivo;
* limitar comportamientos extremos si aparecen.

No hace falta convertir esto en moderación social compleja desde el inicio, pero la puerta pública necesita defensas.

---

# 39. Qué no debe construir CookShare

CookShare no debe convertirse en:

* red social;
* feed;
* marketplace;
* comunidad;
* sistema de seguidores;
* sistema de likes;
* comentarios;
* rankings;
* inbox;
* grupos;
* retos sociales;
* perfil corporal público;
* app de influencers.

CookShare es distribución por objetos.

La regla:

> Si no mejora el compartir, ver, guardar o usar objetos, no pertenece al núcleo de CookShare.

---

# 40. Principio final

CookShare convierte objetos útiles de CookPilot en páginas públicas que otras personas pueden ver, compartir y usar.

Su fuerza no está en decir:


Mira CookPilot.


Su fuerza está en decir:


Mira esta receta.
Mira este menú.
Mira esta lista.
Mira esta semana.


Y luego permitir:


Guárdalo.
Úsalo.
Cópialo.
Ajústalo.


La adquisición nace de utilidad.

El loop final:


crear objeto útil
↓
publicarlo bajo handle
↓
compartir link
↓
receptor ve valor
↓
receptor usa o guarda
↓
CookPilot gana activación


CookShare no es un botón de compartir.

CookShare es la capa de distribución pública de los objetos útiles de CookPilot.
