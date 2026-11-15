# Brisa · v0.4.0

Planificación personal en español. Web estática sin dependencias, con datos guardados en el navegador. Repositorio: https://github.com/GonzaloGallegoGomez/brisa

## Ejecutar

Con Python 3: `python3 -m http.server 3000 --directory dist` y abrir http://localhost:3000. Con Node 18+: `npm test` y `npm run check`. No requiere instalar paquetes ni claves. Para desplegar, servir `dist/` en un alojamiento estático. `.openai/hosting.json` solo se utiliza en el repositorio de despliegue Sites y se omite en GitHub.

## Primera visita

Calendario vacío y cinco tarjetas de tutorial, una a una, con botón para cerrar y continuar. Escape también avanza una tarjeta. El fondo permanece inactivo hasta terminar. Al completar, se guarda el estado del tutorial y no vuelve a aparecer automáticamente en ese navegador. «Ver tutorial» permite repetirlo. No se borran los horarios anteriores al actualizar: se migran desde v0.1.

## Dos formas de añadir

- **Horario fijo:** clases, trabajo, transporte y otras rutinas por días de la semana; examen con fecha, hora, duración y horas totales de preparación; descanso diario.
- **Horario nuevo:** evento social, sesión de gimnasio u otro plan para una fecha concreta.

## Repetición, horas y ajustes

En una rutina fija, elige los días y la frecuencia: cada semana, cada dos semanas (una sí y una no), cada tres o un intervalo de 1 a 52 semanas. Elige cualquier día de la primera semana activa como referencia: se normaliza al lunes. El resumen muestra las tres primeras semanas activas. No hay fecha de fin de rutina. Las rutinas anteriores a v0.3 siguen siendo semanales.

El cálculo usa semanas de calendario y no milisegundos locales: no cambia por horario de verano o al pasar de año. Disponibilidad de estudio, exportación de la semana y detección de conflictos usan la misma regla. Dos ciclos de semanas alternas pueden compartir una hora si no coinciden en fechas reales.

Los campos de hora usan un selector propio con horas 00–23, minutos rápidos y minuto exacto 00–59. También se puede escribir HH:MM. Cancelar no modifica el valor. No depende de los menús nativos del sistema operativo.

En Ajustes se puede guardar nombre o apodo (hasta 40 caracteres) y cinco paletas: verde, azul, anaranjado, violeta y rosa. El tema se aplica a la interfaz y al selector horario. Saludo con hora local del dispositivo: buenos días de 06:00 a 11:59, buenas tardes de 12:00 a 19:59, buenas noches el resto; se actualiza al volver a la página. Ajustes incluidos en la copia JSON. No se crean cuentas.

## Planificación de exámenes

El plan se calcula sobre un único horizonte entre hoy y cada fecha de examen (hasta 365 días al crear el objetivo), independientemente de la semana visible. Ejemplo: 20 horas para un examen dentro de 20 días se reparten entre esos días según disponibilidad. No se repite la asignación al navegar por semanas.

- Sesiones en pasos de 30 minutos. Estudio entre 08:00 y 22:00, dentro de la vigilia.
- Hasta 3 h por objetivo al día y 6 h totales de estudio al día. Prioridad por fecha límite y reparto equilibrado por días.
- Estudio hasta el día anterior al examen. Fecha y hora del examen visibles en calendario y recordatorios; duración 0 permite registrar una entrega.
- Rutinas, sueño, eventos nuevos y otros exámenes bloquean disponibilidad. Un examen puede coincidir con una clase (por ejemplo si se realiza durante esa clase), pero no con estudio de otro objetivo.
- Cuando añades un evento o cambias el sueño, se recalcula el futuro completo. Se rechaza si aumenta el déficit de algún objetivo; nunca se ocultan horas sin hueco.
- Los bloques ya iniciados se conservan en el historial de planificación. No equivalen a horas de estudio realmente completadas: todavía no hay seguimiento de progreso.

## Otras funciones

Asistente por reglas para añadir planes con hora y fecha, sueño y deshacer durante la sesión. Los nombres de día se refieren a la semana visible. Exportación ICS de la semana con aviso 30 minutos antes (su ejecución depende del calendario importador), copia y restauración JSON, avisos de falta de capacidad y fechas próximas.

## Límites actuales

No incluye modelo de IA, cuenta, backend, sincronización entre dispositivos ni notificaciones con la app cerrada. Datos y tutorial por navegador y origen; borrar el almacenamiento o usar otro dispositivo puede reiniciar la primera visita. Descarga copias periódicas. El calendario visible cubre 08:00–22:00: compromisos fuera de esa franja aparecen en el listado, y el sueño en el pie. Eventos que cruzan medianoche necesitan dividirse. Sueño uniforme por día, sin promedio semanal, traslados ni pausas automáticas. El reparto es heurístico, no garantiza un óptimo global. Objetivos imposibles muestran las horas pendientes.

La aplicación no usa un backend ni almacena claves. La tipografía usa fuentes del sistema; no se carga Google Fonts. Los tipos y fechas de las copias se validan. Una importación sustituye el horario local; se puede deshacer en la sesión.

## Información legal y futura aceptación

En el pie del calendario hay enlaces a `legal.html` y a cuatro documentos: condiciones, privacidad, almacenamiento y aviso legal. Son borradores para España, con responsable Gonzalo Gallego Gómez y el correo de contacto facilitado por él. No incluyen un domicilio o DNI inventado ni una promesa de inmunidad frente a reclamaciones.

La vista previa tiene una sola casilla desmarcada para las condiciones y enlaces para consultar los textos sin aceptar. La privacidad se informa por separado, sin consentimiento general forzado. No hay marketing. El botón permite probar la revisión: no crea cuentas ni guarda una evidencia de aceptación, correo o contraseña. `legal-config.js` indica `registrationEnabled: false` y versiones de borrador. No se sustituye la autorización del servidor por un control del navegador.

Antes de abrir cuentas hay que completar los datos exigibles por la actividad, fijar edades y conservación, configurar proveedores y garantías, implementar los derechos y la baja, y revisar textos y medidas reales. Ver [guía de puesta en marcha legal](docs/registro-y-textos-legales.md). Ninguna aceptación suprime los derechos irrenunciables de los usuarios. No se presenta este trabajo como asesoramiento jurídico definitivo.

## Próximas versiones

- Acceso por correo o Google y base de datos con aislamiento por usuario, tutorial guardado por cuenta y sincronización. Aún no implementado; ver [opciones de cuentas gratuitas](docs/cuentas-gratuitas.md).
- Registro de sesiones realmente realizadas, edición de objetivos, preferencias de estudio, pausas y traslados.
- Modelo de IA en servidor para convertir lenguaje libre en propuestas estructuradas y validadas.

Para futuros usuarios en España/UE, ver [consideraciones legales](docs/privacidad-y-cuentas.md). No es una política de privacidad lista para publicar.

## Validación

`npm test`: pruebas del tutorial, modos de formulario, persistencia, migración, examen a 20 días, continuidad entre semanas, reorganización, varios exámenes, fechas, sueño y capacidad insuficiente. Las pruebas de aplicación ejecutan los eventos con un DOM simulado; no sustituyen una prueba visual. `npm run check`: sintaxis JavaScript. QA visual pendiente: falta el controlador de navegador requerido por Sites en el entorno actual.
