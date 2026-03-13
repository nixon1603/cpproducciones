# CP Producciones - Todo

## Base de Datos
- [x] Tabla events con campos: title, description, date, venue, image, bannerImage, venueMapImage, videoUrl, type, whatsappNumber, isActive, zones (JSON), days (JSON)
- [x] Tabla purchases con campos: eventId, buyerName, buyerEmail, buyerPhone, selectedZone (JSON), selectedDays (JSON), quantity, totalPrice, status
- [x] Gestión de administradores mediante campo role en tabla users
- [x] Migración y aplicación del esquema

## Backend (tRPC Routers)
- [x] Router events: listPublic, getById, listAll, create, update, delete, toggleActive, toggleFeatured (admin)
- [x] Router purchases: create, listAll, listByEvent, getById, updateStatus (admin)
- [x] Router admins: list, listUsers, updateRole, delete, getUser
- [x] Validaciones Zod para zonas (máx 6) y días (máx 4)
- [x] Procedimientos protegidos para operaciones admin (adminProcedure)

## Generación de Assets
- [x] Logo CP Producciones (variante oscura para navbar/footer)
- [x] Logo CP Producciones (variante clara para admin)
- [x] Hero background image para landing

## Diseño Global
- [x] Tema futurista luxury 2030 (paleta azul/morado) en index.css
- [x] Fuentes Google: Inter + Orbitron
- [x] Variables CSS personalizadas para colores de marca
- [x] ThemeProvider configurado en dark mode
- [x] Clases utilitarias: cp-gradient, cp-gradient-text, animate-glow-pulse

## Frontend Público
- [x] Navbar con logo CP Producciones y links (Inicio, Eventos, Quiénes Somos)
- [x] Landing page con hero banner animado
- [x] Sección de eventos destacados en landing
- [x] Catálogo de eventos (solo conciertos) con filtros
- [x] Página de detalle de evento: días/artistas, zonas/precios, plano del venue, normativas, taquilla, video
- [x] Página "Quiénes Somos" con contenido de CP Producciones
- [x] Footer con redes sociales y contacto

## Flujo de Compra
- [x] Modal de compra con selector de día (muestra artistas de cada día)
- [x] Selector de zona con precios visibles
- [x] Selector de cantidad de entradas
- [x] Cálculo automático del total (precio zona × cantidad × días seleccionados)
- [x] Formulario de datos del comprador (nombre, email, teléfono)
- [x] Confirmación y envío a WhatsApp con mensaje completo
- [x] Guardado de compra en base de datos

## Panel de Administración
- [x] Layout de admin con sidebar y logo CP Producciones
- [x] Dashboard con estadísticas (eventos activos, ventas recientes)
- [x] Lista de eventos con acciones (crear, editar, eliminar, activar/desactivar, destacar)
- [x] Formulario de evento con tabs:
  - [x] Tab "Información General": título, descripción, fecha, venue, tipo, WhatsApp, estado
  - [x] Tab "Días y Artistas": hasta 4 días con nombre, fecha y lista de artistas (con preview de badges)
  - [x] Tab "Zonas y Precios": hasta 6 zonas con nombre, precio y capacidad (con preview visual)
  - [x] Tab "Media y Extras": imagen card, banner, plano del venue, video URL, normativas, taquilla
- [x] Sección de Administradores: listar admins, listar usuarios, promover, degradar, eliminar
- [x] Lista de compras/ventas con detalles expandibles y cambio de estado

## Tests
- [x] Test de router de eventos (crear, listar, validaciones de zonas/días)
- [x] Test de router de compras (crear con zona y día, validaciones de cantidad)
- [x] Test de router de administradores (listar, actualizar rol, eliminar, auto-protección)
- [x] Test de auth.logout (24 tests en total, todos pasando)

## Documentación
- [x] Documento de especificaciones de imágenes (medidas en px) — ESPECIFICACIONES_IMAGENES.md
- [x] Checkpoint final listo para publicar

## Mejoras v1.1

- [x] Subir logo real CP Producciones al CDN y reemplazar en todo el sitio
- [x] Corregir bug NaN en página /admin/compras
- [x] Landing: banner de eventos disponibles al inicio, luego cards de eventos
- [x] Cards de eventos: botón "COMPRAR Tickets" ultra llamativo estilo WOW 2030
- [x] Quitar categorías del catálogo, solo conciertos
- [x] Reordenar secciones landing: banner → eventos → "Experiencias que Trascienden" → artistas → "Lista para Vivir"
- [x] "Lista para Vivir" con diseño más moderno y sorprendente
- [x] Detalle de evento: plano, normativas, taquilla y video visibles al hacer scroll
- [x] Panel admin: agregar administrador por email/nombre sin necesidad de Manus
- [x] Compras en admin filtradas por evento (no mezclar)
- [x] Subida de imágenes desde PC en formulario de evento
- [x] Normativas por casillas con logo/ícono y descripción individual
- [x] Taquilla estructurada: Torre Británica, horarios y link Google Maps
- [x] Estado de compras: marcar automáticamente como "enviado a WhatsApp" al confirmar

## Mejoras v1.2

- [x] Hero landing: reemplazar imagen estática por carrusel automático de banners de eventos activos
- [x] Hero landing: quitar logo del centro, texto "Conócenos" y botón secundario
- [x] Navbar: ocultar botón "Panel Admin" para usuarios que no sean administradores
- [x] Navbar: ocultar botón "Acceder" para usuarios no autenticados (compra no requiere login)

## Mejoras v1.3

- [ ] Hero: carrusel full-screen de banners puros (sin texto encima), animación Ken Burns (zoom/paneo suave)
- [ ] Hero: único botón flotante "COMPRAR Tickets" que abre el modal de compra del evento activo
- [ ] Hero: transición con fade suave entre banners, indicadores de punto abajo
