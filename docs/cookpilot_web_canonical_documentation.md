
# CookPilot Web

## 1. Definición

**CookPilot Web** es la web oficial e informativa de CookPilot.

Su función es explicar el producto completo, mostrar cómo funciona, educar al usuario, presentar Pro, resolver dudas y llevar a descarga.

No reemplaza la app.
No ejecuta el sistema.
No intenta meter todo en una landing eterna.

La app móvil es donde CookPilot crea, organiza, ajusta, compra y cocina.
La web explica con claridad qué es CookPilot y por qué existe.

---

## 2. Rol principal

CookPilot Web cumple este rol:

> Abrir el libro que la tienda no puede abrir.

Las tiendas son la vitrina rápida.
La web es la explicación completa.

Debe ayudar a que un usuario entienda:

* qué es CookPilot;
* cómo se usa;
* qué puede hacer;
* qué incluye Pro;
* cómo se conectan planificación, compra, nutrición, cocina, importación y reutilización;
* por qué CookPilot no es solo una app de recetas;
* por qué vale la pena descargarlo.

---

## 3. Idiomas

CookPilot Web soportará **español e inglés desde el inicio**.

Estructura obligatoria:


/es/...
/en/...


Reglas:

* Las rutas en español usan slugs en español.
* Las rutas en inglés usan slugs en inglés.
* Nunca se usan rutas españolas dentro de `/en`.
* El idioma puede detectarse por navegador/timezone, pero siempre debe existir selector manual.
* La preferencia de idioma se persiste.
* SEO multiidioma se trabaja correctamente con `hreflang`, canonical y equivalencias claras entre páginas.

---

## 4. App bar

### Español


Logo
Cómo funciona
Guías
Pro
FAQ
Descargar
Idioma


### Inglés


Logo
How it works
Guides
Pro
FAQ
Download
Language


Reglas:

* `Descargar / Download` es botón destacado.
* No va “Comparativas” en app bar.
* No va “Blog” en app bar.
* No va “Contacto” en app bar.
* No va ninguna referencia futura o incompleta.

---

## 5. Sitemap congelado

## Español


/es
/es/como-funciona
/es/guias
/es/pro
/es/faq
/es/descargar
/es/comparativas
/privacy-and-terms


## Inglés


/en
/en/how-it-works
/en/guides
/en/pro
/en/faq
/en/download
/en/compare
/privacy-and-terms


Notas:

* `comparativas / compare` existe como página independiente.
* `comparativas / compare` no aparece en app bar.
* Legal usa la ruta existente: `/privacy-and-terms`.
* No habrá página de contacto formal por ahora.

---

# 6. Página Home

## URLs


/es
/en


## Rol

Dar una vista general del sistema CookPilot.

## Estructura


Hero
Resumen de CookPilot
Flujo general del sistema
Pilares principales
Vista general de Pro
Guías destacadas
FAQ corta
Descarga final


## Subsecciones

### Resumen de CookPilot


Qué es
Qué problema ordena
Qué conecta dentro del producto


### Flujo general del sistema


Planificar
Generar / resolver
Ajustar
Comprar
Cocinar
Guardar
Reutilizar


### Pilares principales


Planifica
Ajusta
Compra
Cocina
Importa
Reutiliza


### Vista general de Pro


Qué desbloquea
Por qué existe
Relación con uso recurrente


### Guías destacadas


Primeros pasos
Planificar una semana
Usar lista de compras
Ajustar macros
Cocinar con CookMode
Guardar y reutilizar


### FAQ corta


Uso general
Nutrición
Compras y costos
Pro
Disponibilidad


### Descarga final


Google Play
AppGallery


---

# 7. Página Cómo funciona

## URLs


/es/como-funciona
/en/how-it-works


## Rol

Explicar CookPilot de punta a punta como sistema conectado.

## Estructura


Visión general
Crear o resolver comida
Organizar día y semana
Revisar compra
Revisar nutrición
Cocinar
Guardar y reutilizar
Resumen del flujo completo
Descargar


## Subsecciones

### Crear o resolver comida


Crear menú
Resolver menú
Resolver día
Generación de menús inteligentes


### Organizar día y semana


Momentos de comida
Menús
Días
Semanas
CookPlan


### Revisar compra


Lista de compras
Cantidades
Costos referenciales
Claridad al comprar


### Revisar nutrición


Kcal
Macros
Objetivos
CookHealth
CookFit
Ajuste automático


### Cocinar


CookMode
Last Mile
Guía paso a paso
Asistencia durante cocina


### Guardar y reutilizar


Guardar
Aplicar
Copiar / pegar
Fijar
Plantillas
Favoritos
Semanas reutilizables


---

# 8. Página Guías

## URLs


/es/guias
/en/guides


## Rol

Fusionar explicación de funciones y educación de uso.

No será una página fría de features.
No será un blog.
Será el manual público útil de CookPilot.

## Estructura


Índice de guías
Primeros pasos
Planificación
Generación inteligente
Nutrición y ajuste
Compras y costos
Cocina guiada
Importación
Biblioteca
Reutilización
Pro, créditos y packs


## Subsecciones

### Primeros pasos


Qué puedes hacer con CookPilot
Cómo empezar
Cómo crear tu primer menú o día
Cómo llegar a valor rápido


### Planificación


CookPlan
Menús
Momentos de comida
Días
Semanas
Resolver huecos


### Generación inteligente


Generar menús
Resolver menú
Resolver día
Créditos
Uso recomendado


### Nutrición y ajuste


CookHealth
Objetivos nutricionales
Kcal
Macros
CookFit
Ajuste automático


### Compras y costos


CookList
Lista de compras
Cantidades
Costos referenciales
Ahorro referencial
Claridad al comprar


### Cocina guiada


CookMode
Last Mile
Pasos
Tiempos
Asistencia
Visual Review


### Importación


CookImport
Recetas externas
Videos
Textos
Imágenes
PDFs
Edición posterior


### Biblioteca


CookSearch
Recetas guardadas
Importadas
Favoritos
Menús guardados
Búsqueda y filtros


### Reutilización


Guardar
Aplicar
Copiar
Pegar
Fijar
Plantillas
Semanas repetibles


### Pro, créditos y packs


Qué incluye Pro
Cómo funcionan créditos
Cuándo usar packs
Qué desbloquea el plan anual


---

# 9. Página Pro

## URLs


/es/pro
/en/pro


## Rol

Explicar qué desbloquea Pro y cómo se monetiza CookPilot sin convertir la página en una tabla confusa de límites.

## Estructura


Qué es Pro
Qué desbloquea
Planes
Créditos
Packs
Uso incluido
FAQ de pagos
Descargar


## Subsecciones

### Qué desbloquea


Planificación completa
Generación de menús inteligentes
Ajuste de macros automático
Nutrición avanzada
Importaciones avanzadas
Cocina guiada
Visual y asistencia
Reutilización


### Planes


Mensual
Anual


### Créditos


Créditos incluidos
Qué consume créditos
Renovación
Uso responsable


### Packs


Packs adicionales
Uso intensivo
Relación con Pro


### FAQ de pagos


Trial / pase si aplica
Renovación
Cancelación
Diferencia entre Pro y packs
Disponibilidad por tienda


---

# 10. Página FAQ

## URLs


/es/faq
/en/faq


## Rol

Resolver dudas frecuentes de forma rápida y clara.

## Estructura


General
Planificación
Nutrición
Compras y costos
Cocina
Importaciones
Pro y packs
Disponibilidad
Cuenta y soporte básico


## Subsecciones

### General


Qué es CookPilot
Para quién sirve
Qué lo diferencia de una app de recetas


### Planificación


Menús
Días
Semanas
Plantillas
Reutilización


### Nutrición


Macros
Kcal
Objetivos
Ajuste automático
Uso sin macros


### Compras y costos


Listas
Cantidades
Costos referenciales
Ahorro referencial
Precisión esperada


### Cocina


CookMode
Last Mile
Guía paso a paso
Asistencia


### Importaciones


Tipos de contenido
Edición
Guardado
Uso dentro del plan


### Pro y packs


Qué incluye Pro
Créditos
Packs
Mensual
Anual


### Disponibilidad


Android
Google Play
AppGallery
Idiomas
Países


---

# 11. Página Descargar

## URLs


/es/descargar
/en/download


## Rol

Llevar a instalación sin distracción.

## Estructura


Google Play
AppGallery
Requisitos
Idiomas
Disponibilidad
Ayuda de instalación
FAQ corta


## Subsecciones

### Tiendas


Google Play
AppGallery


### Requisitos


Android
Versión mínima si aplica
Región si aplica


### Idiomas


Español
English


### Ayuda de instalación


Problemas comunes
Qué hacer si no aparece la app
Dónde reportar problemas


---

# 12. Página Comparativas

## URLs


/es/comparativas
/en/compare


## Rol

Página independiente para educación profunda y SEO serio.

No aparece en app bar.
Sí aparece en footer.

## Estructura


Índice de comparativas
Apps de recetas
Planners de comida
Trackers de macros
Listas de compras
Notas / Excel
Delivery / comer fuera


## Subpáginas futuras

### Español


/es/comparativas/apps-de-recetas
/es/comparativas/planners-de-comida
/es/comparativas/trackers-de-macros
/es/comparativas/listas-de-compras
/es/comparativas/notas-excel
/es/comparativas/delivery


### Inglés


/en/compare/recipe-apps
/en/compare/meal-planners
/en/compare/macro-trackers
/en/compare/grocery-list-apps
/en/compare/notes-excel
/en/compare/delivery


---

# 13. Legal

## URL existente


/privacy-and-terms


## Rol

Privacidad, términos y cumplimiento.

## Regla

Se mantiene la ruta existente.
No se crean rutas duplicadas de privacidad/términos por ahora.

---

# 14. Footer

## Estructura


Producto
Aprende
Legal
Tiendas
Social
Idioma


## Español

### Producto


Cómo funciona
Pro
Descargar


### Aprende


Guías
FAQ
Comparativas


### Legal


Privacidad y términos


### Tiendas


Google Play
AppGallery


### Social


LinkedIn


### Idioma


Español
English


---

## Inglés

### Product


How it works
Pro
Download


### Learn


Guides
FAQ
Compare


### Legal


Privacy and Terms


### Stores


Google Play
AppGallery


### Social


LinkedIn


### Language


Español
English


---

# 15. Reglas de contenido

CookPilot Web debe mantener estas reglas:

## Regla 1

No vender CookPilot como app de recetas.

## Regla 2

No vender CookPilot solo como app de ahorro.

## Regla 3

No vender CookPilot solo como app fitness.

## Regla 4

No separar el producto en caminos falsos.

Todo está conectado.

## Regla 5

Sí se puede explicar cada capa por separado, pero siempre como parte del sistema completo.

## Regla 6

La nutrición debe estar presente sin invadir la experiencia de quien solo quiere organizar comida.

## Regla 7

La planificación debe seguir siendo útil aunque el usuario no active macros.

## Regla 8

Los costos y ahorro son referenciales: se comunican como claridad para comprar mejor, no como garantía matemática.

## Regla 9

Pro se explica como acceso al sistema completo, no como bolsa fría de features.

## Regla 10

La web debe enseñar, no solo decorar.

---

# 16. Reglas SEO

SEO se trabaja desde el inicio, bien hecho.

## Obligatorio


Rutas separadas /es y /en
Slugs correctos por idioma
Canonical correcto
hreflang es/en
Metadata por página
Open Graph por página
Schema adecuado para app/software
Indexación clara
Contenido no duplicado mal localizado
Performance cuidada
Accesibilidad básica correcta


## Prohibido


SEO “temporal”
Páginas vacías para rellenar
Slugs mezclados por idioma
Contenido traducido a medias
Comparativas sin profundidad
Blog improvisado
Keyword stuffing


---

# 17. Orden de construcción

## Bloque 1


Sistema de rutas /es y /en
Layout global
App bar
Footer
Selector de idioma
Legal existente


## Bloque 2


Home
Descargar
Pro
FAQ


## Bloque 3


Cómo funciona
Guías
Comparativas


## Bloque 4


SEO completo
Metadata
hreflang
Open Graph
Schema
Performance
Accesibilidad


---

# 18. Estado congelado

CookPilot Web queda definida como:


/es
/en


Con páginas principales:


Home
Cómo funciona / How it works
Guías / Guides
Pro
FAQ
Descargar / Download


Con página secundaria:


Comparativas / Compare


Con legal existente:


/privacy-and-terms


Con footer simple:


Producto
Aprender
Legal
Tiendas
LinkedIn
Idioma


Y con una regla central:

> CookPilot Web debe explicar el sistema completo de CookPilot: planificar, ajustar, comprar, cocinar, importar y reutilizar comida real desde una sola experiencia conectada.
