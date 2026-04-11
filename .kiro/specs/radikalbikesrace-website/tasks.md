# Plan de Implementación: RadikalBikesRace Website

## Resumen

Implementación incremental del sitio web de RadikalBikesRace: primero la estructura del proyecto y el frontend estático (HTML/CSS), luego los módulos JavaScript del sistema de citas, después el backend con API REST y base de datos SQLite, y finalmente la integración completa de todos los componentes.

## Tareas

- [x] 1. Estructura del proyecto e inicialización
  - Crear la estructura de directorios del proyecto (`css/`, `js/`, `assets/`, `assets/icons/`, `server/`, `server/routes/`, `server/db/`)
  - Crear `package.json` con dependencias: `express`, `better-sqlite3`, `cors`; devDependencies: `vitest`, `fast-check`, `jsdom`, `supertest`
  - Crear `css/variables.css` con custom properties: paleta oscura (#0A0A0A, #1A1A1A, #2D2D2D, #E63946), tipografías industriales (condensada bold para títulos, sans-serif para cuerpo)
  - Crear `css/base.css` con reset CSS, estilos base del body, `scroll-behavior: smooth`, y estilos de foco visible para accesibilidad
  - _Requisitos: 1.1, 1.3, 3.1, 3.2, 3.3, 9.4_

- [x] 2. Página HTML principal con estructura semántica y secciones estáticas
  - [x] 2.1 Crear `index.html` con estructura semántica completa
    - Declarar `lang="es"`, meta viewport, meta charset, metaetiquetas Open Graph (og:title, og:description, og:image)
    - Estructura: `<header>` con `<nav>`, `<main>` con `<section>` para Hero, Servicios, Citas, Ubicación y Contacto, y `<footer>`
    - Barra de navegación con logo pequeño y enlaces ancla a cada sección
    - Sección Hero: logo centrado, nombre "RadikalBikesRace", eslogan, min-height 80vh
    - Sección Servicios: grid de tarjetas con iconos SVG inline para mantenimiento general, reparación de motor, diagnóstico, preparación de motos y personalización
    - Sección Ubicación: dirección completa "C. de Eulalia Sauquillo, 6, Local, 28991 Torrejón de la Calzada, Madrid" + iframe de Google Maps (min-height 300px desktop, 200px móvil)
    - Sección Contacto: teléfono con `tel:`, email con `mailto:`, enlace Instagram con `target="_blank" rel="noopener noreferrer"`
    - Sección Citas: contenedor vacío para el calendario, panel de franjas y formulario (se implementará con JS)
    - Footer: "© {año} RadikalBikesRace", dirección resumida, icono Instagram con enlace
    - Atributos `alt` descriptivos en todas las imágenes
    - Usar `<picture>` con `<source srcset="logo.webp" type="image/webp">` y fallback a PNG
    - _Requisitos: 1.1, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.5_

  - [x] 2.2 Crear estilos CSS para layout y componentes
    - `css/layout.css`: grid responsive con breakpoints (escritorio ≥1024px, tablet 768-1023px, móvil <768px), contenedores y espaciado
    - `css/components.css`: estilos de la barra de navegación fija (`position: sticky`), tarjetas de servicios con hover, sección hero, contacto, footer, texturas industriales sutiles (gradientes, bordes, sombras)
    - `css/calendar.css`: estilos del calendario (grid 7 columnas), días disponibles/no disponibles, franjas horarias, formulario de reserva, mensajes de confirmación/error
    - Asegurar contraste mínimo 4.5:1 entre texto y fondo (WCAG 2.1 AA)
    - Menú hamburguesa en móvil, tarjetas de servicios en columna única en móvil
    - _Requisitos: 1.2, 1.4, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 4.4, 5.3, 5.4, 10.11_

- [x] 3. Módulos JavaScript del frontend
  - [x] 3.1 Crear `js/main.js` — inicialización y navegación
    - Registrar event listeners en los enlaces de navegación para scroll suave
    - Implementar menú hamburguesa para móvil (toggle clase activa)
    - Generar año dinámico en el footer con `new Date().getFullYear()`
    - Inicializar los módulos de calendario, franjas y formulario
    - Navegación completa por teclado (Tab y Enter)
    - _Requisitos: 1.3, 7.1, 9.3, 9.4_

  - [x] 3.2 Crear `js/calendar.js` — módulo del calendario de disponibilidad
    - Implementar `CalendarModule` con funciones: `init()`, `fetchAvailability(year, month)`, `render(availability)`, `onDaySelect(callback)`, `navigateMonth(direction)`
    - Renderizar calendario mensual con grid de 7 columnas (Lun-Dom)
    - Botones de navegación anterior/siguiente mes
    - Días con disponibilidad: clase CSS `.available` con color de acento
    - Días sin disponibilidad: clase CSS `.unavailable`, atenuados, no clicables
    - Fechas pasadas: clase CSS `.past`, deshabilitadas, no interactivas
    - Al seleccionar un día disponible: invocar callback con la fecha seleccionada
    - Fetch a `GET /api/availability/:year/:month` para obtener datos
    - Manejo de error: mostrar mensaje "No se pudo cargar la disponibilidad" con botón reintentar
    - _Requisitos: 10.1, 10.2, 10.4, 10.5, 10.11_

  - [x] 3.3 Crear `js/timeSlots.js` — módulo de franjas horarias
    - Implementar `TimeSlotsModule` con funciones: `fetchSlots(date)`, `render(slots)`, `onSlotSelect(callback)`, `renderNoAvailability()`
    - Fetch a `GET /api/slots/:date` para obtener franjas
    - Renderizar franjas como botones seleccionables con la hora
    - Si no hay franjas disponibles: mostrar mensaje "No hay disponibilidad para esta fecha"
    - Al seleccionar una franja: invocar callback con el objeto slot
    - Manejo de error de red con opción de reintentar
    - _Requisitos: 10.2, 10.3_

  - [x] 3.4 Crear `js/bookingForm.js` — módulo del formulario de reserva
    - Implementar `BookingFormModule` con funciones: `show(date, slot)`, `validate()`, `submit(data)`, `showErrors(errors)`, `showConfirmation(booking)`, `showServerError()`
    - Mostrar formulario con fecha y hora preseleccionadas al seleccionar franja
    - Campos: nombre completo, teléfono, email, modelo de moto, descripción del servicio (todos obligatorios)
    - Validación frontend: campos vacíos, formato email (regex), formato teléfono
    - Mostrar mensajes de error específicos junto a cada campo inválido con borde rojo
    - POST a `/api/bookings` con los datos del formulario
    - En éxito (201): mostrar confirmación con fecha, hora, nombre, modelo y descripción
    - En error 409: mostrar "La franja horaria seleccionada ya no está disponible" y recargar franjas
    - En error 500: mostrar "Error al registrar la reserva. Por favor, inténtelo de nuevo o contacte al taller por teléfono."
    - _Requisitos: 10.6, 10.7, 10.8, 10.9, 10.10, 10.12_

- [x] 4. Checkpoint — Verificar frontend estático
  - Asegurar que el HTML, CSS y JS del frontend cargan correctamente, la navegación funciona, el menú responsive se muestra y los módulos JS se inicializan sin errores. Preguntar al usuario si hay dudas.

- [x] 5. Backend — Servidor Express y base de datos SQLite
  - [x] 5.1 Crear `server/db/init.js` — inicialización de la base de datos
    - Crear/abrir archivo SQLite `server/db/radikalbikes.db`
    - Crear tablas `time_slots` y `bookings` según el esquema del diseño
    - Crear índices `idx_slots_date` e `idx_bookings_date`
    - Función para poblar franjas horarias por defecto (lunes a viernes, 09:00-14:00 y 16:00-19:00, intervalos de 1 hora) para las próximas 4 semanas
    - Exportar instancia de la base de datos para uso en rutas
    - _Requisitos: 10.1, 10.2_

  - [x] 5.2 Crear `server/validation.js` — validación de datos de reserva
    - Función `validateBookingData(data)` que valida: campos obligatorios no vacíos, formato de email, formato de teléfono, formato de fecha (YYYY-MM-DD), existencia de slotId
    - Retorna objeto `{ valid: boolean, errors: [{field, message}] }`
    - Sanitización de inputs para prevenir inyección
    - _Requisitos: 10.7, 10.8_

  - [x] 5.3 Crear `server/routes/availability.js` — ruta GET /api/availability/:year/:month
    - Consultar franjas de la base de datos para el mes solicitado
    - Agrupar por fecha y determinar si cada día tiene al menos una franja disponible
    - Retornar JSON con array de `{ date, available }` para cada día del mes
    - Validar formato de año y mes; retornar 400 si inválido
    - _Requisitos: 10.1, 10.4_

  - [x] 5.4 Crear `server/routes/slots.js` — ruta GET /api/slots/:date
    - Consultar franjas horarias de la base de datos para la fecha solicitada
    - Retornar JSON con array de `{ id, time, available }` para cada franja del día
    - Validar formato de fecha; retornar 400 si inválido
    - _Requisitos: 10.2, 10.3_

  - [x] 5.5 Crear `server/routes/bookings.js` — ruta POST /api/bookings
    - Validar datos con `validateBookingData()`; retornar 400 con errores si inválido
    - Verificar que la franja existe; retornar 404 si no encontrada
    - Verificar que la franja está disponible; retornar 409 si ya reservada
    - Crear registro en tabla `bookings`, marcar franja como `available = 0` en `time_slots`
    - Usar transacción SQLite para garantizar atomicidad
    - Retornar 201 con datos de confirmación de la reserva
    - Retornar 500 con mensaje genérico si error interno
    - _Requisitos: 10.9, 10.10, 10.12_

  - [x] 5.6 Crear `server/index.js` — servidor Express principal
    - Configurar Express con middleware: `cors()`, `express.json()`, servir archivos estáticos del directorio raíz
    - Montar rutas: `/api/availability`, `/api/slots`, `/api/bookings`
    - Inicializar base de datos al arrancar
    - Puerto configurable por variable de entorno (default 3000)
    - _Requisitos: 10.1, 10.2, 10.9_

- [x] 6. Checkpoint — Verificar backend y API
  - Asegurar que el servidor arranca correctamente, la base de datos se inicializa con franjas horarias, y los endpoints responden correctamente. Preguntar al usuario si hay dudas.

- [x] 7. Integración frontend-backend y tests
  - [x] 7.1 Conectar módulos JS del frontend con la API del backend
    - Actualizar `calendar.js` para usar las URLs reales de la API (`/api/availability/:year/:month`)
    - Actualizar `timeSlots.js` para usar `/api/slots/:date`
    - Actualizar `bookingForm.js` para usar `POST /api/bookings`
    - Verificar flujo completo: seleccionar día → ver franjas → seleccionar franja → llenar formulario → enviar → ver confirmación
    - _Requisitos: 10.1, 10.2, 10.6, 10.9, 10.10_

  - [ ]* 7.2 Escribir test de propiedad — Renderizado de disponibilidad en calendario
    - **Propiedad 1: Renderizado correcto de disponibilidad en el calendario**
    - Generar conjuntos aleatorios de datos de disponibilidad con fast-check
    - Renderizar calendario con jsdom y verificar que los días con `available: true` tienen clase `.available` y los demás no
    - Verificar que la cantidad de días marcados como disponibles coincide con los datos de entrada
    - **Valida: Requisitos 10.1, 10.4**

  - [ ]* 7.3 Escribir test de propiedad — Selección de día muestra franjas correctas
    - **Propiedad 2: Selección de día muestra franjas correctas**
    - Generar días aleatorios con conjuntos aleatorios de franjas horarias
    - Simular selección de día y verificar que las franjas mostradas coinciden exactamente con los datos
    - **Valida: Requisitos 10.2**

  - [ ]* 7.4 Escribir test de propiedad — Fechas pasadas no seleccionables
    - **Propiedad 3: Fechas pasadas no son seleccionables**
    - Generar fechas pasadas aleatorias con fast-check
    - Verificar que el elemento del día tiene atributo disabled y no dispara evento de selección
    - **Valida: Requisitos 10.5**

  - [ ]* 7.5 Escribir test de propiedad — Validación de formulario
    - **Propiedad 4: Validación de formulario con mensajes de error por campo**
    - Generar combinaciones aleatorias de campos vacíos/llenos del formulario
    - Verificar que cada campo vacío produce un mensaje de error específico
    - Verificar que la cantidad de errores mostrados es igual a la cantidad de campos vacíos
    - **Valida: Requisitos 10.7, 10.8**

  - [ ]* 7.6 Escribir test de propiedad — Integridad de confirmación de reserva
    - **Propiedad 5: Integridad de datos en la confirmación de reserva**
    - Generar datos de reserva válidos aleatorios con fast-check
    - Enviar reserva vía API con supertest y verificar que la confirmación contiene los mismos datos enviados
    - **Valida: Requisitos 10.9**

  - [ ]* 7.7 Escribir test de propiedad — Franja marcada como no disponible tras reserva
    - **Propiedad 6: Reserva marca la franja como no disponible**
    - Generar reservas aleatorias, enviar vía API
    - Consultar disponibilidad de la fecha y verificar que la franja reservada aparece como `available: false`
    - **Valida: Requisitos 10.10**

  - [ ]* 7.8 Escribir tests unitarios del backend
    - Test de validación: campos vacíos, email inválido, teléfono inválido, fecha inválida
    - Test de endpoint availability: respuesta correcta para mes con/sin franjas
    - Test de endpoint slots: respuesta correcta para fecha con/sin franjas
    - Test de endpoint bookings: reserva exitosa, reserva duplicada (409), datos inválidos (400)
    - _Requisitos: 10.7, 10.8, 10.9, 10.10, 10.12_

- [x] 8. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, que el flujo completo de reserva funciona de extremo a extremo, y que el sitio es responsive y accesible. Preguntar al usuario si hay dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental del progreso
- Los tests de propiedades validan las 6 propiedades de corrección definidas en el diseño
- Los tests unitarios validan escenarios específicos y casos borde
- Stack: HTML/CSS/JS vanilla (frontend) + Node.js/Express/SQLite (backend) + Vitest/fast-check (testing)
