# Auditoría visual y estructural — CookPilot Web (landing)

## 1. Diagnóstico general

La landing es **funcionalmente sólida**, pero **estéticamente irregular**. Hay bloques que se sienten cuidados (Hero, segmented selector, FAQ) y bloques que se sienten genéricos o desbalanceados (Summary, ProOverview, FinalDownload). El sistema de diseño existe, pero no se aplica con consistencia: se usan tokens en unos componentes y hardcodeos en otros. El problema más grave es el **espaciado y la escala**: no hay un ritmo vertical común, los títulos no siempre mandan, y las cards/containers no siempre se comportan como una misma familia de componentes.

---

## 2. Lo que sí funciona

- **Hero**: composición clara, fondo animado con blobs y presentación de CTAs.
- **Segmented selector (AppShowcase)**: estructura premiada, cambio de contenido limpio y labels claros.
- **FAQ**: accordion con interacción clara, estados hover/open reconocibles.
- **Header**: personalidad visual, glass pill, cambio de idioma y tema.

---

## 3. Problemas visuales prioritarios

1. **Inconsistencia de botones** — Hero, ProOverview y FinalDownload usan implementaciones diferentes del mismo botón. El Hero pierde padding porque quita la clase base `.cp-btn` en favor de overrides locales; ProOverview usa un `.cta` hecho a mano; FinalDownload usa overrides `.btn`/`.ghost`. Eso destruye consistencia.
2. **Espaciado sin sistema** — paddings, gaps y separaciones entre bloques cambian de valor por componente. No se respeta un spacing scale basado en múltiplos de 8.
3. **Jerarquía de títulos débil** — en Summary y ProOverview el título no tiene suficiente presencia respecto al cuerpo y al mockup.
4. **Cards “genéricas”** — FeaturedGuides y FAQ usan border-radius y sombras sin personalidad; se ven como cualquier UI kit.
5. **Uso de `--cp-text-secondary` en zonas que deben ser destacadas** — rompe contraste y jerarquía.
6. **FinalDownload con glow y gradientes decorativos** — siente “AI slop” y no sigue el patrón minimalista del resto.

---

## 4. Auditoría por sección

### 4.1 Hero
- Funciona: PPTA alineada a la izquierda, CTAs visibles, carrusel de mockups.
- Está mal: los botones de descarga no usan el componente base `.cp-btn`; tienen padding roto y se ven “aplanados”.
- Jerarquía: título dominates, pero los CTAs pierden presencia por el override de botón.
- Espaciado: aceptable, pero `.ctaWrap` y `.ctaBtn` tienen reglas custom que rompen ritmo.
- Consistencia:/components/Hero.tsx — override local de botón.

### 4.2 Summary
- Funciona: estructura izquierda/derecha clara.
- Está mal: tipografía muy chica por hardcode (`font-size: 16px`) y uso de `--cp-text-secondary` en body.
- Jerarquía: título ok, pero subtítulo y nota pierden peso visual.
- Espaciado: pad de sección ok, pero gap interno entre columnas es只听凭.
- Consistencia: no usa tokens de tipografía globales.

### 4.3 AppShowcase (segmented selector)
- Funciona: Patrón ganador. Texto + mockup + selector abajo.
- Está mal: Ningún problema estructural grave; fine-tuning de espaciado.
- Jerarquía: Título del pilar activo ok, pero podría ser más pesado.
- Espaciado: previewCard tiene buen aire, pero el selector está muy pegado al contenido.
- Consistencia: bien, pero la card contenedora es la única en el sitio; conviene darle familia a otras cards.

### 4.4 ProOverview
- Funciona: Layout simple, imagen a la derecha.
- Está mal: botón custom `.cta` distinto a `.cp-btn`; título “CookPilot Pro” no tiene presencia; se siente tímido.
- Jerarquía: Falta un título que mande. El subtítulo está en color secundario y se pierde.
- Espaciado: gap 64px es correcto, pero el bloque izquierdo está desbalanceado por la falta de peso tipográfico.
- Consistencia: botón custom rompe el sistema.

### 4.5 FeaturedGuides
- Funciona: Cards con iconos internos y hover.
- Está mal: Iconos muy pequeños, clip-path poco claro, texto no siempre encima del icono.
- Jerarquía: número y arrow ok, título ok, pero el icono decorativo no suma.
- Espaciado: min-height 180px es rígido; en mobile se siente apretado.
- Consistencia: border-radius 24px y cards con sombra genérica.

### 4.6 ShortFAQ
- Funciona: Interacción clara.
- Está mal: Tipografía de pregunta/respuesta es pequeña; padding de item es excesivo para el contenido.
- Jerarquía: Pregunta bold ok, respuesta en secondary se ve apagada.
- Espaciado: gap 16px entre items es aceptable, pero el padding 24px es mucho para una FAQ corta.
- Consistencia: border-radius 20px y sombra genérica.

### 4.7 FinalDownload
- Funciona: CTAs visibles.
- Está mal: box con gradientes radiales y glow se siente “AI slop”; botones usan overrides `.btn`/`.ghost`.
- Jerarquía: título grande ok, pero el contenedor compite con el contenido.
- Espaciado: padding 80px es excesivo para una sección tan simple.
- Consistencia: rompe el patrón visual del resto.

### 4.8 Header / Footer
- Header: bien, pero el glass pill es muy pesado; el botón de descarga es otro custom button.
- Footer: tipografía y spacing coherentes, pero los títulos de columna son pequeños y la grid se siente apretada.

---

## 5. Inventario tipográfico real

| Sección | Elemento | Clase / Estilo | Tamaño | Peso | Line-height | Letter-spacing | Observación crítica |
|---|---|---|---|---|---|---|---|
| Hero | Título | `.headline` | 64px desktop | Bold | 1.1 | -2px | Correcto, domina. |
| Hero | Subtítulo | `.support` | 22px | Regular | 1.4 | normal | Bien, pero puede ser 18px para mejor ritmo. |
| Hero | CTAs | inline/cp-btn custom | 17px | Semibold | inherit | 0.02em | Padding roto, no usa `.cp-btn`. |
| Summary | Título | `.title` | var(--cp-text-display-l-size) | Bold | inherit | var(--cp-text-display-l-letter-spacing) | Ahora ok tras corrección. |
| Summary | Body | `.body` | var(--cp-text-body-l-size) | Regular | inherit | var(--cp-text-body-l-letter-spacing) | Bien. |
| AppShowcase | Título sección | `.title` | 40px | Bold | 1.15 | -0.02em | Bien, pero puede subir a 48px. |
| AppShowcase | Título activo | `.activeTitle` | 36px | Bold | 1.2 | -0.03em | Bien. |
| AppShowcase | Subtítulo | `.activeSubtitle` | 16px | Regular | 1.6 | 0 | Bien. |
| ProOverview | Título | `.title` | var(--cp-text-display-l-size) | Bold | 1.15 | var(--cp-text-display-l-letter-spacing) | Falta peso por el span “Pilot”; necesita ser más grande. |
| ProOverview | Subtítulo | `.subtitle` | var(--cp-text-body-l-size) | Regular | 1.6 | var(--cp-text-body-l-letter-spacing) | Bien, pero no tiene jerarquía. |
| FeaturedGuides | Título card | `.cardLabel` | 18px | Bold | 1.4 | 0 | Bien. |
| FeaturedGuides | Número | `.num` | 24px | Bold | inherit | 0 | Bien. |
| ShortFAQ | Pregunta | `.questionText` | 17px | Bold | 1.4 | 0 | Bien, puede ser 18px. |
| ShortFAQ | Respuesta | `.answerText` | 15px | Regular | 1.6 | 0 | Bien. |
| FinalDownload | Título | `.title` | 48px | Bold | 1.1 | -0.03em | Bien. |
| FinalDownload | Subtítulo | `.subtitle` | 20px | Regular | 1.5 | 0 | Bien, pero el box le quita protagonismo. |

---

## 6. Inventario de espaciado real

| Sección | Padding vertical | Padding horizontal | Gaps principales | Separación entre bloques | Respeta múltiplos de 8 | Observación crítica |
|---|---|---|---|---|---|---|
| Hero | 120px top / 80px bottom | 48px | gap 16px entre CTAs | headline→support→text→CTA: 20/20/32px | Aceptable | `.ctaWrap` gap 16px ok, pero `.ctaBtn` custom rompe. |
| Summary | 100px top/bottom | 48px | gap entre columnas 64px | header→content: sin header | Parcial | Falta ritmo interno; title y body están pegados. |
| AppShowcase | 100px top/bottom | 48px | preview gap 56px, selector gap 8px | header→preview: 56px, preview→selector: 48px | Aceptable | PreviewCard padding 40px ok, pero selector está muy cerca. |
| ProOverview | 100px top/bottom | 48px | layout gap 64px | title→subtitle→support→cta: 16/16/16px | Aceptable | Falta separación entre título y bloque de texto. |
| FeaturedGuides | 100px top/bottom | 48px | grid gap 24px | header→grid: 64px | Aceptable | Cards min-height 180px forzado; padding 28px excesivo. |
| ShortFAQ | 100px top/bottom | 48px | accordion gap 16px | header→accordion: 64px | Aceptable | Item padding 24px muy alto para FAQ corta. |
| FinalDownload | 100px top/bottom | 48px | buttons gap 16px | title→subtitle→buttons: 20/40px | Parcial | Box padding 80px excesivo; glow/gradients descentrados. |

---

## 7. Sistema visual a reforzar

1. **Botón único obligatorio**: solo `.cp-btn`, `.cp-btn--primary`, `.cp-btn--ghost`. Prohibido crear `.cta`, `.btn`, `.ghost`, `.ctaBtn` por componente.
2. **Spacing scale global**: definir variables o reglas base:
   - `--cp-space-8: 8px`
   - `--cp-space-16: 16px`
   - `--cp-space-24: 24px`
   - `--cp-space-32: 32px`
   - `--cp-space-48: 48px`
   - `--cp-space-64: 64px`
   - `--cp-space-80: 80px`
   - `--cp-space-100: 100px`
   Usarlas en paddings, gaps, margins. Si un valor no entra, no lo inventes.
3. **Tipografía por roles**:
   - Hero: `--cp-text-display-xxl-size`
   - Section titles: `--cp-text-display-m-size`
   - Subtítulos: `--cp-text-body-l-size`
   - Cards label: `--cp-text-title-m-size`
   Nunca hardcodear `font-size` en módulos CSS.
4. **Cards unificadas**:
   - `.cp-card-base` con `background`, `border`, `border-radius`, `padding`, `transition`.
   - Solo variantes por sección cambiando padding/radius dentro de la escala.
5. **Color de texto destacado**:
   - Prohibido usar `--cp-text-secondary` en títulos o claims importantes.
   - Usar `--cp-text-primary` para claim fuerte, `--cp-text-secondary` solo para cuerpo secundario.
6. **Eliminar brillos decorativos y gradientes radiales** en secciones no-hero. El estilo debe venir del contenido, no de efectos.

---

## 8. Recomendación de placeholders visuales

| Sección | Placeholder recomendado | Motivo |
|---|---|---|
| Summary | Contenedor tipo `media-wrap` con aspect-ratio controlado para mockup | Hoy la imagen está “suelta” y se recorta mal en mobile. |
| AppShowcase | Ninguno. Faltan assets, pero los mockups actuales funcionan. | |
| ProOverview | Ninguno. El mockup `cookbilling.png` es suficiente. | |
| FeaturedGuides | Reemplazar iconos decorativos por chip/estampa alineada a esquina si la referencia lo pide. | Hoy los iconos son poco legibles. |
| FinalDownload | Ninguno. Conviene换掉 el box con fondo neutro o glass sin glow. | |

---

## 9. Prioridad de intervención

**Primero**
Unificar el sistema de botones a `.cp-btn` / `.cp-btn--primary` / `.cp-btn--ghost` en Hero, ProOverview y FinalDownload. Esto solo cambia clases, no estructura, y resuelve la inconsistencia más visible.

**Segundo**
Alinear tipografía a tokens globales en Summary, ProOverview y AppShowcase, eliminando hardcodeos y usando variables de diseño.

**Tercero**
Definir y aplicar un spacing scale real en paddings/gaps/margins, empezando por AppShowcase, Summary y ProOverview.

**Cuarto**
Limpiar FinalDownload eliminando gradientes radiales/glow y llevándolo al mismo lenguaje visual minimalista del resto de la landing.
