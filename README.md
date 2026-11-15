# Brisa · v0.1.0

MVP web de planificación personal en español. HTML, CSS y JavaScript sin dependencias. Datos de ejemplo al primer inicio; elimina los objetivos y rutinas de ejemplo para comenzar tu plan.

## Ejecutar

Con Python 3: `python3 -m http.server 3000 --directory dist` y abrir http://localhost:3000. Con Node 18+: `npm test` y `npm run check`.

## Incluido

- Objetivos con fecha límite y horas de preparación pendientes.
- Rutinas semanales y planes personales; validación de conflictos.
- Planificador por fecha límite, sesiones de 30 minutos y máximo 3 horas por objetivo al día; reparto entre días con disponibilidad. No programa en el pasado ni el día del vencimiento. Ventana de estudio 08:00–22:00 dentro de la vigilia.
- Asistente por reglas para eventos con fecha o día de la semana, horas de sueño y deshacer (durante la sesión). Los días de la semana se refieren a la semana visible.
- Protección de horas al añadir eventos: rechaza los cambios que reduzcan el estudio programado o incrementen las horas pendientes de la semana afectada.
- Descanso diario uniforme, navegación por semanas, exportación ICS con aviso 30 minutos antes, copia/restauración JSON.
- Recordatorios tranquilizadores al abrir la aplicación.

## Límites explícitos

No incluye un modelo de IA, cuenta, backend, sincronización, notificaciones push ni avisos mientras la app está cerrada. Los avisos ICS dependen de la aplicación donde se importe el calendario. Almacenamiento local por navegador y origen; descargar copias periódicamente. No almacena claves.

El planificador es heurístico, no garantiza un óptimo global. Cada semana se calcula de forma independiente: las horas pendientes no se reparten ni se descuentan automáticamente entre semanas. Actualiza las horas pendientes cuando avances. Eventos que cruzan medianoche requieren división. Descanso idéntico todos los días; aún no admite promedio semanal. No contempla tiempos de desplazamiento ni descansos entre sesiones. Horas fuera de 08:00–22:00 no se muestran en la cuadrícula, pero bloquean disponibilidad. No modificar fechas mediante lenguaje ambiguo: usar YYYY-MM-DD.

## Próximas versiones

1. v0.2: modelo de IA en servidor para extraer peticiones estructuradas; validación de restricciones, propuesta de cambios antes de aplicar y pruebas de ambigüedad.
2. v0.3: planificación continua entre semanas, avance real y horizonte hasta cada examen; traslados, pausas y preferencias por día.
3. v0.4: cuentas, base de datos, recordatorios push y sincronización de calendarios.

## Versionado

Versión inicial: v0.1.0. Repositorio: https://github.com/GonzaloGallegoGomez/brisa. El manifiesto privado de Sites no se incluye: este repositorio puede alojarse de forma independiente. No añadir claves al repositorio. Servir `dist/` en cualquier alojamiento estático.

## Verificación

Pruebas de horas asignadas, fechas, conflictos, cena sobre un bloque de estudio, capacidad insuficiente, sueño tras medianoche y objetivos vencidos. Comprobación sintáctica JavaScript. La prueba visual en navegador está pendiente porque este entorno no dispone del controlador de navegador requerido por Sites.
