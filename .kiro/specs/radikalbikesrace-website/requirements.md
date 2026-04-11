# Documento de Requisitos — RadikalBikesRace Website

## Introducción

Sitio web para el taller de motos **RadikalBikesRace**, ubicado en Torrejón de la Calzada, Madrid. El objetivo es crear una web sencilla, funcional y con una estética auténtica de taller mecánico — colores oscuros, tonos industriales y un diseño que transmita personalidad real, evitando el aspecto genérico de plantillas generadas por IA. El sitio servirá como carta de presentación digital del taller, mostrando información de contacto, ubicación y enlace a redes sociales.

## Glosario

- **Sitio_Web**: La aplicación web completa de RadikalBikesRace, incluyendo todas sus páginas y componentes.
- **Página_Principal**: La página de inicio (landing page) del sitio web.
- **Sección_Hero**: Área principal visible al cargar la página, con el logo, nombre del taller y un mensaje de bienvenida.
- **Sección_Servicios**: Área de la página que muestra los servicios ofrecidos por el taller.
- **Sección_Ubicación**: Área de la página que muestra la dirección física y mapa de localización del taller.
- **Sección_Contacto**: Área de la página con información de contacto y formulario o datos para comunicarse con el taller.
- **Barra_Navegación**: Componente de navegación fijo en la parte superior del sitio web.
- **Pie_Página**: Componente en la parte inferior del sitio con información legal, enlaces y redes sociales.
- **Visitante**: Cualquier persona que accede al sitio web desde un navegador.
- **Logo**: Imagen del logotipo de RadikalBikesRace proporcionada por el cliente.
- **Enlace_Instagram**: Enlace a la cuenta de Instagram del taller (https://www.instagram.com/radicalbikesrace).
- **Sección_Citas**: Área de la página que permite a los visitantes consultar disponibilidad y reservar citas en el taller.
- **Calendario_Disponibilidad**: Componente visual de calendario que muestra los días y franjas horarias disponibles para reservar citas.
- **Franja_Horaria**: Bloque de tiempo disponible dentro de un día para agendar una cita en el taller.
- **Reserva**: Registro de una cita confirmada por un visitante, que incluye fecha, hora y datos de contacto.

## Requisitos

### Requisito 1: Estructura general del sitio web

**Historia de Usuario:** Como visitante, quiero acceder a un sitio web de una sola página con navegación clara, para poder encontrar toda la información del taller de forma rápida y sencilla.

#### Criterios de Aceptación

1. THE Sitio_Web SHALL presentar una estructura de página única (single-page) con secciones diferenciadas: Hero, Servicios, Citas, Ubicación y Contacto.
2. THE Barra_Navegación SHALL permanecer fija en la parte superior de la ventana del navegador durante el desplazamiento vertical.
3. WHEN el Visitante hace clic en un enlace de la Barra_Navegación, THE Sitio_Web SHALL desplazar la vista suavemente hasta la sección correspondiente.
4. THE Sitio_Web SHALL ser completamente responsive, adaptándose a pantallas de escritorio (1024px o más), tablet (768px a 1023px) y móvil (menos de 768px).
5. THE Sitio_Web SHALL cargar completamente en menos de 3 segundos en una conexión de banda ancha estándar.

### Requisito 2: Sección Hero con identidad del taller

**Historia de Usuario:** Como visitante, quiero ver el logo y nombre del taller de forma prominente al entrar al sitio, para identificar inmediatamente de qué negocio se trata.

#### Criterios de Aceptación

1. THE Sección_Hero SHALL mostrar el Logo de RadikalBikesRace en una posición central y destacada.
2. THE Sección_Hero SHALL mostrar el nombre "RadikalBikesRace" como texto principal.
3. THE Sección_Hero SHALL incluir un eslogan o mensaje breve que transmita la esencia del taller.
4. THE Sección_Hero SHALL ocupar al menos el 80% de la altura visible de la ventana del navegador en la carga inicial.
5. WHEN el Sitio_Web se carga en un dispositivo móvil, THE Sección_Hero SHALL adaptar el tamaño del Logo y la tipografía para mantener la legibilidad.

### Requisito 3: Diseño visual auténtico de taller

**Historia de Usuario:** Como propietario del taller, quiero que el sitio web tenga un aspecto auténtico de taller mecánico, para que los visitantes perciban personalidad real y no un diseño genérico.

#### Criterios de Aceptación

1. THE Sitio_Web SHALL utilizar una paleta de colores basada en tonos oscuros: negro (#0A0A0A), gris oscuro (#1A1A1A), gris medio (#2D2D2D) y un color de acento en rojo o naranja (#E63946 o similar).
2. THE Sitio_Web SHALL utilizar tipografías con carácter industrial o mecánico para los títulos (tipo condensada o bold sans-serif).
3. THE Sitio_Web SHALL utilizar una tipografía legible de tipo sans-serif para el cuerpo de texto.
4. THE Sitio_Web SHALL incorporar texturas o elementos visuales sutiles que evoquen un ambiente de taller (como texturas metálicas, grunge o líneas industriales).
5. THE Sitio_Web SHALL mantener un contraste mínimo de 4.5:1 entre el texto del cuerpo y el fondo, conforme a las pautas de accesibilidad WCAG 2.1 nivel AA.

### Requisito 4: Sección de servicios del taller

**Historia de Usuario:** Como visitante, quiero conocer los servicios que ofrece el taller, para saber si pueden atender las necesidades de mi moto.

#### Criterios de Aceptación

1. THE Sección_Servicios SHALL mostrar una lista de servicios ofrecidos por el taller, cada uno con un icono representativo y una descripción breve.
2. THE Sección_Servicios SHALL incluir al menos los siguientes servicios: mantenimiento general, reparación de motor, diagnóstico, preparación de motos y personalización.
3. THE Sección_Servicios SHALL presentar los servicios en un diseño de tarjetas (cards) o cuadrícula visual.
4. WHEN el Visitante visualiza la Sección_Servicios en un dispositivo móvil, THE Sección_Servicios SHALL reorganizar las tarjetas en una columna única vertical.

### Requisito 5: Sección de ubicación con mapa

**Historia de Usuario:** Como visitante, quiero ver la dirección del taller y un mapa interactivo, para poder llegar fácilmente al local.

#### Criterios de Aceptación

1. THE Sección_Ubicación SHALL mostrar la dirección completa del taller: "C. de Eulalia Sauquillo, 6, Local, 28991 Torrejón de la Calzada, Madrid".
2. THE Sección_Ubicación SHALL incluir un mapa embebido (iframe de Google Maps o similar) que muestre la ubicación exacta del taller.
3. THE Sección_Ubicación SHALL mostrar el mapa con un tamaño mínimo de 300px de alto en escritorio y 200px de alto en móvil.
4. WHEN el Visitante hace clic en el mapa embebido, THE Sección_Ubicación SHALL permitir la interacción con el mapa (zoom y desplazamiento).

### Requisito 6: Sección de contacto

**Historia de Usuario:** Como visitante, quiero poder contactar con el taller fácilmente, para hacer consultas o solicitar citas.

#### Criterios de Aceptación

1. THE Sección_Contacto SHALL mostrar la información de contacto del taller: dirección, teléfono y correo electrónico.
2. THE Sección_Contacto SHALL incluir un enlace directo al perfil de Instagram del taller (https://www.instagram.com/radicalbikesrace).
3. WHEN el Visitante hace clic en el Enlace_Instagram, THE Sitio_Web SHALL abrir el perfil de Instagram en una nueva pestaña del navegador.
4. WHEN el Visitante hace clic en el número de teléfono desde un dispositivo móvil, THE Sitio_Web SHALL iniciar una llamada telefónica mediante el protocolo tel:.
5. WHEN el Visitante hace clic en el correo electrónico, THE Sitio_Web SHALL abrir el cliente de correo predeterminado mediante el protocolo mailto:.

### Requisito 7: Pie de página

**Historia de Usuario:** Como visitante, quiero ver información complementaria al final de la página, para acceder a datos legales y enlaces adicionales.

#### Criterios de Aceptación

1. THE Pie_Página SHALL mostrar el nombre del taller "RadikalBikesRace" y el año actual de copyright.
2. THE Pie_Página SHALL incluir un icono con enlace a la cuenta de Instagram del taller.
3. THE Pie_Página SHALL mostrar la dirección resumida del taller.
4. WHEN el Visitante hace clic en el enlace de Instagram del Pie_Página, THE Sitio_Web SHALL abrir el perfil en una nueva pestaña del navegador.

### Requisito 8: Rendimiento y compatibilidad

**Historia de Usuario:** Como visitante, quiero que el sitio web funcione correctamente en cualquier navegador moderno, para tener una buena experiencia independientemente de mi dispositivo.

#### Criterios de Aceptación

1. THE Sitio_Web SHALL ser compatible con las dos últimas versiones de Chrome, Firefox, Safari y Edge.
2. THE Sitio_Web SHALL optimizar todas las imágenes para web, utilizando formatos modernos (WebP con fallback a PNG/JPG).
3. IF el navegador del Visitante no soporta formato WebP, THEN THE Sitio_Web SHALL servir la imagen en formato PNG o JPG como alternativa.
4. THE Sitio_Web SHALL incluir metaetiquetas Open Graph básicas para una correcta previsualización al compartir el enlace en redes sociales.
5. THE Sitio_Web SHALL incluir una etiqueta meta viewport configurada para dispositivos móviles.

### Requisito 9: Accesibilidad básica

**Historia de Usuario:** Como visitante con diversidad funcional, quiero poder navegar el sitio web con tecnologías de asistencia, para acceder a la información del taller sin barreras.

#### Criterios de Aceptación

1. THE Sitio_Web SHALL incluir atributos alt descriptivos en todas las imágenes.
2. THE Sitio_Web SHALL utilizar una estructura semántica de HTML con etiquetas header, nav, main, section y footer.
3. THE Sitio_Web SHALL permitir la navegación completa mediante teclado (tecla Tab y Enter).
4. WHEN un elemento interactivo recibe el foco del teclado, THE Sitio_Web SHALL mostrar un indicador de foco visible.
5. THE Sitio_Web SHALL declarar el idioma del documento como español (lang="es") en la etiqueta html.


### Requisito 10: Sistema de reserva de citas

**Historia de Usuario:** Como visitante, quiero poder ver la disponibilidad del taller y reservar una cita directamente desde la web, para agendar el servicio de mi moto sin necesidad de llamar por teléfono.

#### Criterios de Aceptación

1. THE Sección_Citas SHALL mostrar un Calendario_Disponibilidad con los días y Franjas_Horarias disponibles para reservar citas.
2. WHEN el Visitante selecciona un día en el Calendario_Disponibilidad, THE Sección_Citas SHALL mostrar las Franjas_Horarias disponibles para ese día.
3. WHEN no existen Franjas_Horarias disponibles para un día seleccionado, THE Sección_Citas SHALL mostrar un mensaje indicando que no hay disponibilidad para esa fecha.
4. THE Calendario_Disponibilidad SHALL mostrar visualmente los días con disponibilidad diferenciados de los días sin disponibilidad (mediante color o indicador visual).
5. THE Calendario_Disponibilidad SHALL impedir la selección de fechas pasadas.
6. WHEN el Visitante selecciona una Franja_Horaria disponible, THE Sección_Citas SHALL mostrar un formulario de reserva solicitando: nombre completo, teléfono, correo electrónico, modelo de moto y descripción breve del servicio requerido.
7. THE Sección_Citas SHALL validar que todos los campos obligatorios del formulario de reserva estén completos antes de permitir el envío.
8. IF el Visitante envía el formulario de reserva con campos obligatorios vacíos, THEN THE Sección_Citas SHALL mostrar mensajes de error específicos junto a cada campo incompleto.
9. WHEN el Visitante envía el formulario de reserva con todos los campos válidos, THE Sección_Citas SHALL registrar la Reserva y mostrar un mensaje de confirmación con la fecha, hora y datos de la cita.
10. WHEN una Reserva se confirma, THE Sección_Citas SHALL marcar la Franja_Horaria correspondiente como no disponible para otros visitantes.
11. WHEN el Visitante visualiza la Sección_Citas en un dispositivo móvil, THE Calendario_Disponibilidad SHALL adaptarse al ancho de la pantalla manteniendo la funcionalidad completa de selección de fechas y franjas horarias.
12. IF se produce un error al registrar la Reserva, THEN THE Sección_Citas SHALL mostrar un mensaje de error indicando al Visitante que intente de nuevo o contacte al taller por teléfono.
