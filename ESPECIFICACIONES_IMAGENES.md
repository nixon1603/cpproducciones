# CP Producciones — Especificaciones de Imágenes

Este documento describe las dimensiones, formatos y recomendaciones para todas las imágenes utilizadas en la plataforma.

---

## 1. Imagen de Tarjeta de Evento (`imageUrl`)

| Propiedad | Valor |
|-----------|-------|
| **Dimensiones** | 800 × 450 px |
| **Relación de aspecto** | 16:9 |
| **Formato recomendado** | WEBP / JPG |
| **Tamaño máximo** | 500 KB |
| **Uso** | Tarjeta del evento en catálogo y landing |
| **Notas** | El sujeto principal debe estar centrado; se aplica un overlay oscuro en la parte inferior |

---

## 2. Banner / Hero del Evento (`bannerUrl`)

| Propiedad | Valor |
|-----------|-------|
| **Dimensiones** | 1920 × 600 px |
| **Relación de aspecto** | 32:10 |
| **Formato recomendado** | WEBP / JPG |
| **Tamaño máximo** | 1.5 MB |
| **Uso** | Cabecera de la página de detalle del evento |
| **Notas** | Imagen panorámica; el texto se superpone con gradiente oscuro. Evitar texto en la imagen. |

---

## 3. Plano del Venue (`venueMapUrl`)

| Propiedad | Valor |
|-----------|-------|
| **Dimensiones** | 1200 × 900 px |
| **Relación de aspecto** | 4:3 |
| **Formato recomendado** | PNG / WEBP |
| **Tamaño máximo** | 800 KB |
| **Uso** | Sección "Plano del Recinto" en la página de detalle |
| **Notas** | Fondo blanco o transparente; las zonas deben estar claramente diferenciadas por color |

---

## 4. Logo CP Producciones

| Propiedad | Valor |
|-----------|-------|
| **Dimensiones** | 400 × 120 px (horizontal) |
| **Formato recomendado** | PNG con fondo transparente / SVG |
| **Tamaño máximo** | 100 KB |
| **Uso** | Navbar, footer, panel de administración, hero de landing |
| **Notas** | Versión oscura para fondos claros; versión clara/blanca para fondos oscuros |

---

## 5. Imagen Hero de Landing (`HERO_BG`)

| Propiedad | Valor |
|-----------|-------|
| **Dimensiones** | 1920 × 1080 px |
| **Relación de aspecto** | 16:9 |
| **Formato recomendado** | WEBP / JPG |
| **Tamaño máximo** | 2 MB |
| **Uso** | Fondo del hero principal en la página de inicio |
| **Notas** | Imagen de concierto/venue; se aplica gradiente oscuro. Subir vía CDN. |

---

## 6. Imagen de Artista (opcional, para días)

| Propiedad | Valor |
|-----------|-------|
| **Dimensiones** | 400 × 400 px |
| **Relación de aspecto** | 1:1 |
| **Formato recomendado** | WEBP / JPG |
| **Tamaño máximo** | 200 KB |
| **Uso** | Avatar del artista en la sección de días (si se implementa en el futuro) |

---

## Flujo de Subida de Imágenes

1. Guardar el archivo original en `/home/ubuntu/webdev-static-assets/`
2. Ejecutar: `manus-upload-file --webdev /home/ubuntu/webdev-static-assets/nombre-imagen.webp`
3. Copiar la URL CDN devuelta
4. Pegar la URL en el campo correspondiente del formulario de creación/edición de evento

> **Importante:** No subir imágenes directamente a `client/public/` ni a `client/src/assets/`. Siempre usar el CDN para evitar timeouts en el despliegue.

---

## Paleta de Colores del Branding

| Color | Hex | Uso |
|-------|-----|-----|
| Azul primario | `#6366f1` (indigo-500) | Botones, acentos, gradientes |
| Morado acento | `#8b5cf6` (violet-500) | Gradientes, badges |
| Fondo oscuro | `#050510` | Background principal |
| Fondo tarjeta | `#0d0d1a` | Cards, paneles |
| Texto principal | `#f8fafc` | Títulos y texto primario |
| Texto secundario | `#94a3b8` | Subtítulos y texto muted |

---

*Documento generado automáticamente — CP Producciones Platform v1.0*
