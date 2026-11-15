# Brisa · v0.9.0

Planificación personal en español, con un calendario tranquilo y progreso de estudio real. HTML, CSS y JavaScript, con SDK oficial de Supabase incluido y configuración publicable. Repositorio: https://github.com/GonzaloGallegoGomez/brisa

## Ejecutar

Con Python 3: `python3 -m http.server 3000 --directory dist` y abrir http://localhost:3000. Con Node 18+: `npm test` y `npm run check`. Para desplegar, servir `dist/` en un alojamiento estático. El manifiesto `.openai/hosting.json` solo está en el repositorio de despliegue Sites, no en GitHub.

## Prueba pública en preparación

Documentos adaptados a mayores de 18 años, 20 días gratuitos y 30 posteriores para exportar antes de eliminar cuentas que no continúen expresamente. Sin tarjeta ni cobros automáticos. SMTP y recuperación comprobados por el titular; declaración de edad comprobada en servidor. Las fechas, identificación del titular, proveedores y cierre operativo siguen pendientes. Ver [guía de apertura y cierre](docs/lanzamiento-mvp.md). El registro permanece cerrado.

## Cuenta de prueba y sincronización Supabase

La URL y clave publicable del proyecto del propietario se han incorporado a `dist/supabase-config.js`. Son configuración para navegador, no claves administrativas. No hay `service_role`, secret key ni contraseña de base de datos en el repositorio.

La base de datos del propietario ya está instalada y verificada. Se han añadido cierre de altas en servidor, aceptación versionada y baja autenticada. No volver a ejecutar el setup antiguo sobre el proyecto actual. Para una instalación nueva, el orden y los pendientes están en [correo y lanzamiento](docs/correo-y-lanzamiento.md).

El guardado está separado por usuario autenticado y utiliza una revisión de servidor. Un dispositivo con una revisión antigua recibe un conflicto en vez de sobrescribir al otro. Las escrituras incluyen también el ID de la cuenta esperado; SQL lo compara con `auth.uid()`. Los cambios pendientes se guardan por cuenta en el dispositivo. Recargar la nube permite revisar una recuperación, descargar una copia o elegir la nube; no hay fusión automática de dos planes.

Cada modificación guarda una copia local y se intenta sincronizar al cabo de un segundo. Cerrar la pestaña antes del envío puede dejar cambios pendientes hasta volver a ese dispositivo. No se anuncia sincronización offline ni entrega en segundo plano. Al salir se intenta guardar y se limpia la caché de cuenta; si quedan cambios sin enviar se pide una decisión explícita para conservarlos aquí o descargarlos. Una copia pendiente retenida sigue accesible a quien tenga acceso al almacenamiento del navegador.

El tutorial y preferencias forman parte del horario de la cuenta; terminarlo y sincronizarlo evita repetirlo en otro dispositivo. El modo local mantiene su horario separado. No se borra al iniciar sesión o cerrar la sesión de nube.

El SDK oficial `@supabase/supabase-js` 2.119.0 se ha incluido en `dist/vendor` con su licencia. Se verificó la integridad SHA-512 del paquete npm antes de extraerlo. No se carga desde un CDN en cada visita. Las contraseñas del formulario se envían directamente al proveedor de autenticación; no se guardan como parte del calendario. El SDK conserva la sesión en `brisa-supabase-session` para poder seguir autenticado.

**Alcance del piloto:** formularios de alta, confirmación y recuperación preparados; eliminación autónoma desplegada. El registro sigue cerrado por SMTP sin configurar y documentos legales en borrador. No se ha enviado un correo real. El enlace permite compartir el modo local; cada cuenta Supabase mantiene su horario privado.

Ver [correo y lanzamiento](docs/correo-y-lanzamiento.md).

## Interfaz más visual

La pantalla principal reduce las explicaciones: tarjeta de siguiente bloque con acceso directo, círculo de minutos reales del día, indicadores compactos, barras de progreso y superficies de color adaptadas a las cinco paletas. Los objetivos y rutinas se despliegan al pulsar su cabecera o desde el menú. Las copias de seguridad están dentro de otra sección desplegable.

La agenda tiene filtros Todo / Estudio / Mi vida. Filtrar no cambia datos ni planificación. «Mis huecos libres», ayudas de formularios y opciones avanzadas de estudio se abren cuando se necesitan. Los campos obligatorios dentro de un desplegable se revelan si hay un error de validación.

Los clics de controles habilitados tienen una respuesta de escala de 180 ms. Diálogos, vistas y desplegables aparecen con transiciones de 160–200 ms, sin animaciones continuas. No se retrasa la ejecución de las acciones. En Ajustes se pueden desactivar las animaciones; la preferencia de movimiento reducido del sistema siempre prevalece. La elección se guarda en el navegador e incluye en la copia JSON.

## Hoy y semana

«Hoy» es la vista inicial: siguiente bloque, agenda del día, minutos realmente registrados, estudio por delante y huecos sin compromisos. Los huecos pueden contener pausas o márgenes; no se presentan como tiempo para llenar obligatoriamente. La semana completa sigue disponible y adapta su eje para mostrar compromisos fuera de 08:00–22:00. En móvil ofrece también una lista por día con botones grandes.

El tutorial inicial aparece una tarjeta a la vez, hasta terminar. Se puede repetir desde «Ver tutorial». Un inicio nuevo está vacío; los horarios anteriores se migran sin borrarlos.

## Añadir, editar y cancelar

- Horario fijo: clases, trabajo, transporte, exámenes y sueño.
- Horario nuevo: planes para una fecha concreta.
- Al abrir una rutina desde el calendario se muestran «Todas las semanas» y la periodicidad editable. El botón «Solo esta sesión» permite crear una excepción. La sección Eliminar siempre ofrece botones separados para una sesión y toda la rutina (cuando hay una fecha concreta).
- Las rutinas permiten cada 1, 2, 3 o hasta 52 semanas, con lunes de referencia. Una excepción cambia o cancela solo una fecha. Editar toda la rutina conserva las excepciones; eliminar la rutina elimina también sus excepciones convertidas en eventos puntuales.
- Pulsa un bloque en la agenda o calendario para editar. Los exámenes abren su objetivo. Las sesiones de estudio abren el progreso y permiten mover o cambiar la duración de un bloque futuro.
- Los bloques de estudio movidos manualmente quedan fijados. El resto del objetivo se distribuye automáticamente; un bloque manual incompatible se muestra para corregirlo. Los bloques ya iniciados no se mueven desde el editor: se revisa su progreso.
- Eliminar un objetivo elimina su progreso e historial local. Eliminar un bloque futuro de estudio libera ese hueco y recoloca las horas; no reduce las horas del objetivo.

## Propuestas y deshacer

Añadir o editar compromisos, objetivos, sueño, sesiones o preferencias de estudio genera una propuesta. Enseña bloques antes/después y, por objetivo, horas hechas, planificadas y sin hueco. Cancelar no escribe el borrador ni cambia el plan. «Ajustar» vuelve al formulario. «Aplicar» verifica otra vez que el plan siga vigente y guarda. Hay un paso de deshacer durante la sesión.

Un compromiso o cambio de disponibilidad no puede aumentar el déficit de objetivos existentes. Los objetivos nuevos o el registro del progreso real pueden guardarse con pendientes explícitos, porque la falta de tiempo no debe falsificar lo ocurrido. Las alternativas ensayan límites diarios mayores, días libres disponibles o ventana más larga; solo cambian el borrador, respetan el sueño y requieren aplicación expresa. No se reducen objetivos silenciosamente.

## Progreso real

Las horas del objetivo son el total que quieres estudiar. Las horas completadas se calculan exclusivamente de lo registrado:

- **Hecho:** registra la duración completa de la sesión.
- **He estudiado menos:** registra los minutos reales, incluido un número que no sea múltiplo de 30.
- **Posponer:** no cuenta estudio; evita el hueco original y reparte el tiempo en otros huecos disponibles. Puede encontrar otro hueco del mismo día, no obliga a esperar a mañana.

Modificar un registro reemplaza su valor, no lo suma dos veces. La planificación restante usa `horas objetivo − minutos reales registrados`. Los minutos residuales exactos se conservan. Las sesiones pasadas sin revisar se presentan para registrar; nunca se convierten automáticamente en estudio completado. El progreso se asocia al día del bloque revisado, con fecha de registro adicional.

## Mi forma de estudiar

Accesible desde la vista principal y Ajustes:

- Ventana diaria de estudio, sesiones preferidas de 30, 60, 90 o 120 minutos y pausas entre sesiones.
- Margen antes y después de compromisos (útil para desplazamientos), reserva al final de la ventana de estudio y comida protegida.
- Límites totales diarios y por objetivo, días libres y preferencia de mañana, tarde o final del día.
- Dificultad suave/media/alta por objetivo. A igualdad de fecha, los más difíciles se asignan primero; la dificultad no cambia las horas solicitadas.

Por defecto: ventana 08:00–22:00, sesiones de 60 min, pausas de 15 min, margen de 15 min, reserva de 30 min, comida 14:00–15:00 y límites de 6 h/día y 3 h/objetivo/día. Si añades Transporte explícitamente puedes bajar el margen para no contarlo dos veces. Las pausas regulan la separación entre sesiones; no sustituyen un trayecto que necesite su propio compromiso.

El plan considera todos los días hasta cada examen, no solo la semana visible. Se estudia hasta el día anterior, dentro de un horizonte de un año para nuevos objetivos. La preferencia horaria es una preferencia: si no hay hueco, puede usar otras horas de la ventana. Las sesiones pueden acortarse para encajar el tiempo restante. Los días libres impiden estudio, pero no borran clases o planes ya fijados.

## Paletas, horas y accesibilidad

Ajustes conserva nombre o apodo, cinco paletas y saludo con hora local. Selector horario propio con minuto exacto y entrada HH:MM. Los bloques son botones con nombre accesible, las horas tienen etiquetas explícitas y se conserva navegación de diálogos por teclado. Hay foco visible, objetivos táctiles mayores, lista semanal móvil y respeto por movimiento reducido.

Se comprueba contraste mínimo 4,5:1 para texto principal/secundario sobre superficies principales y blanco sobre botones en las cinco paletas. Esto no certifica toda la accesibilidad. La comprobación visual y de lector de pantalla sigue pendiente: el entorno no tiene el controlador de navegador requerido por Sites, y no se ha instalado otro para reemplazarlo.

## Datos y migración

Los datos permanecen por navegador y origen en `brisa-v2` (esquema interno 3). La clave anterior y el tutorial siguen siendo compatibles. Se migran rutinas, objetivos, colores y nombre; se incorporan progreso, excepciones, preferencias y sesiones manuales. Un bloque pasado de v0.4 no se considera estudiado. Los días siguientes pueden redistribuirse hasta que registres lo realizado.

Copia/restauración JSON incluye historial y preferencias. Restaurar muestra una propuesta de sustitución. Una copia inválida se rechaza. Si el almacenamiento falla, se muestra aviso y se puede descargar la copia antes de salir. En modo local no hay sincronización entre pestañas. En la cuenta, las revisiones impiden sobrescribir silenciosamente cambios de otro dispositivo; se recarga manualmente la nube para recibirlos.

## Otras funciones y límites

Asistente por reglas para planes sociales, sueño y deshacer, con propuesta antes de cambiar. Los días nombrados se refieren a la semana visible. No incluye IA generativa ni push cuando está cerrada. El piloto de cuentas usa Supabase; aún no es un registro público de producción.

Exportación ICS de la semana con aviso 30 minutos antes, cuya ejecución depende del calendario importador. Las fechas deben comprobarse con su fuente oficial. El motor es heurístico y no garantiza óptimo global; en casos con muchos objetivos o restricciones puede señalar falta de capacidad aunque otro reparto fuera posible. Las rutinas no tienen fecha de fin; eventos que cruzan medianoche necesitan dividirse. El sueño sigue siendo uniforme por día.

## Información legal

El centro legal y los documentos v0.4.0-borrador siguen accesibles. No se ha activado el registro público. El acceso a cuentas de prueba envía las credenciales directamente a Supabase. Ninguna casilla elimina derechos legales. Los textos contienen puntos pendientes antes de un lanzamiento a terceros. Ver [puesta en marcha legal](docs/registro-y-textos-legales.md) y [cuentas gratuitas](docs/cuentas-gratuitas.md).

## Validación

`npm test`: planificación a 20 días, continuidad entre semanas, conflictos y recurrencias, progreso parcial, corrección sin duplicados, posposición, pausas/márgenes, preferencias, excepciones, propuestas sin escritura al cancelar, edición, restauración, paletas, controles de horas y centro legal. Las pruebas de aplicación usan DOM simulado y no sustituyen una revisión visual de navegador. `npm run check`: sintaxis de los scripts de la aplicación y del centro legal.
