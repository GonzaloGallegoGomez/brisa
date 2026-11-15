# Brisa: apertura y cierre del MVP

Estado: 15-11-2026. Borradores legales 0.9.0-borrador preparados; registro cerrado. El enlace público permite modo local. No hay cobros, tarjeta ni renovación automática. La recepción del correo y recuperación de contraseña han sido confirmadas por el titular. SMTP figura listo en servidor. Prueba aprobada: mayores de 18 años, 20 días globales y 30 posteriores para exportar; después eliminar cuentas sin continuación expresa.

## Documentos preparados

- Condiciones: funciones reales, edad, precio cero, periodo global, salida y futura contratación separada, reclamaciones y derechos irrenunciables.
- Privacidad: datos y finalidad por tratamiento, bases previstas, medidas básicas, proveedores, recuento de usuarios, derechos, cierre y pendientes claramente identificados.
- Almacenamiento: claves propias, sesión y PKCE, copias locales, ausencia de publicidad; inventario del alojamiento aún por confirmar.
- Aviso legal: nombre y correo reales; domicilio/NIF exigibles pendientes. No publicar datos ficticios ni una sociedad inexistente.
- Declaración 18+ desmarcada y separada de la aceptación. Se valida en servidor y se copia a una evidencia protegida: editar metadatos del usuario después no cambia esa evidencia. No es comprobación documental de edad.

Son borradores revisables, no garantía de inmunidad a reclamaciones. La revisión profesional adaptada al caso es recomendable; no se presenta como trámite universal obligatorio. La gratuidad de la prueba, con intención de comercialización, no debe usarse para suponer que no hay obligaciones de actividad económica o servicio digital.

## Pendientes del titular

1. Completar domicilio de actividad/residencia e identificación fiscal que procedan para el aviso legal conforme al artículo 10 LSSI; resolver antes cómo facilitar públicamente los datos exigibles. No enviar DNI o domicilio personal por chat ni incorporarlos automáticamente al repositorio público. Si se usa domicilio profesional, debe ser real y adecuado al requisito, no inventado.
2. Elegir fecha/hora de apertura y final (20 días naturales globales) y de eliminación (30 días naturales posteriores al final), con zona Europe/Madrid y fechas explícitas visibles antes del alta. No hay cuenta atrás iniciada todavía.
3. Confirmar las entidades contractuales, acuerdos de tratamiento, subencargados, países y garantías del alojamiento Sites, Supabase, Brevo y el buzón Gmail. El DPA de Supabase se integra en su contrato según el documento publicado; guardar la evidencia aplicable a la cuenta. No firmar contratos adicionales en nombre del titular sin autorización.
4. Obtener los plazos reales de logs SMTP, Auth, alojamiento y copias de seguridad y las opciones de borrado. No prometer un borrado instantáneo de copias fuera del control de Brisa. Evaluar si el buzón de soporte actual ofrece garantías contractuales apropiadas; una dirección exclusiva ayuda a organizar, no resuelve por sí sola el encargo.

## Trabajo técnico antes de activar

- Añadir fechas y aviso de prueba al formulario y cuenta; cierre de nuevas altas al final. Durante los 30 días permitir acceso y descarga de calendario. No hay pagos que comprobar en esta versión: si no existe contratación posterior, el cierre afectará a todos los participantes. Las cuentas técnicas del propietario se gestionan aparte; no excluir participantes por correo o por decisión informal.
- Preparar avisos de servicio de cierre y recordatorio de exportación, configurar ejecución de eliminación y documentar resultado. Eliminar mediante Auth Admin con cascadas, nunca con un listado manual sin revisar. Antes de borrar: generar solo inventario mínimo de IDs afectados, comparar con alcance/fechas y no ejecutar antes del plazo. Tras borrar: comprobar ausencia de calendarios/aceptaciones y revocación de acceso. No usar la base de datos para borrar una cuenta de pago futura sin comprobar su estado real.
- Limpiar altas no confirmadas según un plazo proporcionado, documentado e informado; todavía no configurado. Definir también conservación de soporte/logs en función de los proveedores y obligaciones reales.
- Revisar con el titular contraseñas, MFA de paneles y recuperación del titular. No activar servicios de pago sin autorización. Comprobar límites de usuarios, SMTP y disponibilidad gratuita. No presentar protección contra contraseñas filtradas como activa: el asesor de Supabase la indica desactivada.
- Prueba con dos cuentas controladas y autorizadas en navegador/móvil: alta y confirmación, declaración de edad, rechazo sin aceptación, tutorial solo primera vez, guardado al reabrir, conflictos, exportación, recuperación y baja. Las pruebas SQL con fixtures revertidos ya verifican edad/aceptación, RLS, revisión y cascada. No sustituyen la experiencia real de alta. Sin navegador de pruebas disponible en este entorno.
- Actualizar documentos definitivos, conservar versión inmutable y alinear sus IDs con `brisa_registration_settings`. Comprobar formulario y función antes de marcar `legal_ready=true` y `registration_open=true`. No abrir con versiones «borrador». `supabase/adult-trial.sql` está aplicado; no volver a ejecutar el setup antiguo que sustituye RLS.

## Medición mínima del MVP

Objetivo del titular: saber cuántas personas acceden. Usar un agregado sobre Auth con intervalo de la prueba (fechas exactas por fijar): altas, confirmadas y cuentas con `last_sign_in_at` dentro del intervalo. No leer contenido de horarios, no exportar emails a Brevo como lista comercial ni añadir píxeles. `last_sign_in_at` no es un historial de visitas: no permite medir días activos o retención histórica después de nuevos accesos sin instrumentación adicional. No afirmar que una sesión se usó activamente solo porque se renovó un token.

Interés legítimo propuesto: evaluar una prueba pequeña del servicio. Necesidad: recuentos agregados con campos operativos existentes; no se necesita seguimiento de navegación. Impacto: limitado por no leer calendarios y no publicar identidades. Salvaguardas: acceso administrativo restringido, oposición por contacto, anonimizar el resultado, no segmentar ni contactar comercialmente. El titular debe confirmar y documentar esta ponderación antes de utilizar datos para la medición. La base de prestación del servicio no se extiende automáticamente a cualquier analítica.

## Atención de derechos e incidentes

Responsable operativo: Gonzalo Gallego Gómez; buzón gallegogonzalo2@gmail.com.

- Registrar de forma restringida fecha y tipo de solicitud, verificar identidad de forma proporcionada, contestar con carácter general en un mes y documentar cualquier extensión legal antes del vencimiento. No pedir DNI por defecto.
- Para exportar, proporcionar solo datos de la cuenta verificada; no compartir dumps globales. La app permite descargar el horario. Para supresión, eliminar identidad y cascadas, informar sobre datos locales y copias del proveedor. Conservar excepciones solo si existe base/plazo real, separadas del servicio activo.
- Ante incidente: contener, preservar evidencia mínima sin contraseñas/tokens, evaluar personas/datos afectados y documentar decisiones. Cuando sea exigible, notificar a autoridad sin dilación y, a ser posible, dentro de 72 horas desde conocimiento; comunicar a afectados si hay alto riesgo, con las excepciones aplicables. No toda incidencia técnica exige notificación a todos los usuarios.
- Al cerrar la prueba, verificar borrado de participantes y completar la documentación de cierre. El proceso de supresión masiva no está automatizado hoy. No habilitar el registro hasta disponer de un mecanismo operativo acorde a lo prometido.

## Fase de pago posterior (fuera de esta prueba)

Antes de cobrar: revisar alta fiscal/actividad y facturación en España con asesoramiento ajustado al caso, impuestos, proveedor de pagos, precio total/periodicidad, cancelación y desistimiento según servicio digital. No suponer que 1 €/mes exime de obligaciones ni que toda actividad obliga del mismo modo a alta en RETA sin analizar habitualidad y circunstancias. Informar costes y recabar contratación expresa. No usar cuentas de la prueba como suscriptores automáticos. ChatGPT Plus no cubre llamadas a una API de IA.

## Fuentes primarias consultadas

- LSSI, artículo 10: https://www.boe.es/eli/es/l/2002/07/11/34/
- RGPD: https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807
- LOPDGDD: https://www.boe.es/eli/es/lo/2018/12/05/3
- Consumidores y usuarios: https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555
- AEPD, contrato de encargo: https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/8-responsable-y-encargado-del-tratamiento/FAQ-0238-cual-seria-el-contenido-del-contrato-de-encargo-de-tratamiento
- AEPD, brechas: https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/brechas-de-datos-personales-notificacion
- Supabase DPA: https://supabase.com/legal/customer-resources/data-processing-addendum
