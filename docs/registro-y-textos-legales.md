# Puesta en marcha del futuro registro

## Alcance de v0.4.0

El propietario ha indicado España, su nombre (Gonzalo Gallego Gómez) y el correo gallegogonzalo2@gmail.com como contacto. Estos datos se incorporan en los borradores. Un correo exclusivo para Brisa es recomendable para separar soporte del personal; no hay obligación general de contratar Gmail de empresa o un dominio por el mero hecho de disponer de contacto. Las garantías contractuales y la seguridad del proveedor del buzón deben revisarse para el tratamiento real de consultas.

Los documentos no garantizan que no se pueda denunciar o reclamar. Una renuncia genérica a acciones, derechos de consumo o protección de datos puede ser ineficaz o abusiva. La información de privacidad no se convierte en un consentimiento válido mediante «acepto todo». Las casillas no sustituyen seguridad, contratos con encargados ni los derechos de los usuarios.

## Ficheros

- `dist/legal.html`: resumen y revisión previa de demostración.
- `dist/legal/condiciones.html`: funciones, limitaciones reales, derechos y condiciones propuestas.
- `dist/legal/privacidad.html`: información actual y puntos pendientes del futuro registro.
- `dist/legal/almacenamiento.html`: claves de almacenamiento local y alcance del inventario.
- `dist/legal/aviso.html`: titular y datos adicionales pendientes según la actividad.
- `dist/legal-config.js`: versiones de borrador y registro desactivado.

No hay un registro operativo que pueda saltarse esta pantalla; no hay cuentas. La demostración no conserva una evidencia de aceptación ni se reutilizará como si una persona hubiera contratado. Los enlaces abren documentos sin exigir aceptación. El usuario puede volver sin marcar nada.

## Antes de habilitar cuentas

1. Confirmar naturaleza y alcance de la actividad y completar identificación, domicilio de actividad e información exigible (incluido artículo 10 LSSI cuando aplique), por un medio adecuado. No exponer un domicilio personal sin evaluar el caso ni inventar una identidad empresarial.
2. Resolver público objetivo y edad mínima, capacidad contractual y procedimiento de representantes si procede. El umbral español de 14 años para consentimiento de datos no resuelve por sí solo estas cuestiones.
3. Elegir los proveedores reales (alojamiento, autenticación, base de datos y email), roles, región, subencargados y transferencias. Formalizar los acuerdos pertinentes. No basta indicar «Supabase» si todavía no se ha contratado ni configurado.
4. Concretar finalidades y bases jurídicas, interés legítimo y ponderación si se usa, y plazos/criterios de conservación por dato: cuentas, mensajes, evidencias, logs, bajas y copias. Ajustar documentos a esas decisiones. No presentar los actuales textos con apartados pendientes como información completa de un registro en producción.
5. Implementar autenticación segura, verificación y recuperación, aislamiento por usuario, controles de acceso, baja, exportación, atención de derechos, gestión de incidentes y copias. Probar con dos cuentas que no se ven los datos de la otra.
6. Sustituir los borradores por versiones finales identificadas y revisar su adecuación con asesoramiento jurídico adaptado antes de abrir el alta a terceros. No es una aprobación automática por haber pasado pruebas de código.

## Integración técnica de la aceptación real

- Mostrar condiciones e información de privacidad antes de la acción final de alta. Casilla expresa de condiciones sin premarcar, con enlaces accesibles y copia conservable. No obligar a aceptar publicidad para disponer del servicio; no añadir esa casilla si no existe tal finalidad.
- Mantener la información de privacidad separada de la aceptación del contrato. Si una finalidad requiere consentimiento, añadir un control específico, opcional cuando corresponda, con retirada sencilla y registro separado. No inventar «permisos legales» universales.
- Comprobar en el servidor la aceptación de la versión vigente antes de completar el alta. No confiar en valores de localStorage ni en el resultado de `reviewAcceptance`, que está pensado únicamente para esta demostración.
- Vincular a la cuenta un registro mínimo con identificador de usuario, versión exacta de condiciones, referencia de la información de privacidad facilitada, idioma, acto de aceptación y marca temporal del servidor. La referencia a privacidad acredita la información facilitada, no un consentimiento genérico. Mantener el contenido inmutable y localizable de cada versión. No guardar contraseñas en esta evidencia ni recoger IP/huellas por defecto sin justificación.
- Crear usuario y evidencia con una operación controlada y recuperable: si el proveedor crea una identidad antes de la aceptación, no habilitar acceso a datos o funcionalidades de cuenta hasta completar el paso validado por servidor. Evitar cuentas activas sin evidencia tras un error intermedio y definir la limpieza de altas incompletas.
- Una actualización material exige el tratamiento que corresponda, sin reetiquetar la aceptación antigua como si cubriese la nueva versión. Dar información clara y vías de baja y conservación/exportación pertinentes.
- Conservar estas evidencias con acceso restringido y durante un plazo proporcionado que se haya definido. No crear un archivo ilimitado de IPs o datos de navegación por el mero hecho de querer defenderse de reclamaciones.

## Fuentes oficiales consultadas el 15-11-2026

- AEPD, información de privacidad y consentimiento: https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0248-sobre-si-el-usuario-tiene-que-dar-consentimiento-a-clausula-de-privacidad
- RGPD, artículos 5, 6, 7, 12–22, 25, 28, 32–34 y 44 y siguientes: https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807
- Derechos de consumidores y cláusulas abusivas: https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555
- LOPDGDD, artículo 7: https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673
- LSSI, artículo 10: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758
