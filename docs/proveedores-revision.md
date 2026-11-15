# Revisión de proveedores · 15-11-2026

Revisión documental pública, no certificación legal ni auditoría de las cuentas del titular. No se han firmado contratos adicionales ni cambiado ajustes de Brevo/Gmail. Las fechas de prueba quedan canceladas: servicio gratuito sin pagos ni fecha fija de cierre.

## Supabase

Uso real: Auth, calendario en base de datos y función de eliminación. Proyecto Free eu-north-1, UE. SMTP externo configurado por titular y recuperación probada. RLS, declaración 18+, aceptación y cascada comprobados con fixtures revertidos. Su DPA publicado forma parte del contrato y contempla subencargados y garantías de transferencias; hay una lista de subencargados actualizada. No se deduce de la región UE que no haya transferencias. Conservar referencia de condiciones aplicables a la cuenta.

No se ha accedido a copias o configuraciones administrativas no expuestas. Free no debe presentarse como una oferta de copias diarias de producción: la documentación de backups recomienda exportaciones para Free. Antes de abrir: decidir y probar recuperación, obtener plazos de logs/copias y limpieza de altas sin confirmar, sin inventar un plazo contractual único. No activar planes de pago. Aviso de contraseñas filtradas desactivadas sigue documentado; no se afirma que esa protección esté activa.

Fuentes: https://supabase.com/legal/customer-resources/data-processing-addendum ; https://supabase.com/legal/customer-resources/subprocessor-list ; https://supabase.com/docs/guides/platform/backups ; https://supabase.com/pricing

## ChatGPT Sites / alojamiento

Hallazgo: existe DPA específico para Sites de usuarios Plus/Pro individuales. Para titular en EEE, identifica OpenAI Ireland Ltd. Se incorpora a las condiciones al publicar/alojar un Site que recoge datos personales. Cubre el tratamiento de datos alojados para operar Sites, y distingue ese tratamiento del de prompts/conversaciones para construirlo: no enviar dumps de usuarios, DNI o secretos por chat como si quedasen cubiertos automáticamente por este DPA.

La existencia del acuerdo resuelve la duda anterior de si había una vía contractual de encargo para Sites individuales; no comprueba por sí sola todos los plazos o ajustes del alojamiento. Pendiente inventario efectivo de cookies/almacenamiento del alojamiento y retención de logs/copias, para reflejar sus garantías en la información pública. No se contrataron servicios ni se firmó un acuerdo separado.

Fuentes: https://openai.com/policies/chatgpt-sites-data-processing-addendum/ ; https://openai.com/policies/chatgpt-sites-terms/

## Brevo

Uso real: SMTP de confirmación/recuperación y futuros avisos estrictamente necesarios. No se envía calendario ni contraseña. Su ayuda sitúa el DPA dentro de las condiciones de servicio. Falta confirmar entidad contractual concreta y ajustes efectivos de la cuenta del titular.

Hallazgo operativo: la documentación de retención dice que sin regla los logs y previsualizaciones se conservan indefinidamente por defecto. No asumir que el cierre de Brisa los borra. Acción recomendada antes del alta: Settings → Transactional emails → Retention rules; elegir 1 mes para logs si la cuenta lo permite y no hay necesidad justificada de más, desactivar guardado de previsualizaciones de mensajes y revisar cómo eliminar las previas. La regla de logs es retroactiva; desactivar previews solo afecta mensajes futuros y el borrado puede tardar hasta 24 horas tras el plazo. La doc permite entre 1 y 24 meses. Estos cambios no se han realizado: no hay acceso administrativo a Brevo. Desactivar seguimiento de aperturas/clics y verificarlo sobre un mensaje real, especialmente para enlaces Auth.

Fuentes: https://help.brevo.com/hc/en-us/articles/15403782599570-Where-can-I-find-the-Data-Processing-Agreement-DPA ; https://help.brevo.com/hc/en-us/articles/4415743225746-Configure-a-custom-retention-period-for-your-transactional-logs-and-email-previews

## Gmail personal

Google indica explícitamente que no ofrece DPA para Gmail de consumo. Un buzón nuevo gratuito del mismo tipo no resuelve esta cuestión. No afirmar que se ha formalizado un encargo mediante su política de privacidad.

Acción pendiente: definir un canal apropiado para soporte y derechos, con garantías contractuales adecuadas a los datos tratados. Puede ser otro proveedor o un servicio con DPA; comparar opciones antes de contratar, sin asumir que requiere comprar un plan concreto. Mientras se resuelve, no usar el Gmail personal como archivo de exportaciones de calendarios, DNIs o datos innecesarios. El correo actual sigue figurando como contacto, con limitación explicada en borrador; no se anuncia resuelto.

Fuente: https://support.google.com/policies/answer/9581826?hl=en

## Identificación del titular en proyecto gratuito

NIF de persona física española normalmente es DNI con letra; para extranjeros normalmente NIE. No hace falta foto del documento para redactar el aviso. El Ministerio explica que la LSSI atiende a si existe actividad económica directa o indirecta y excluye páginas personales sin ella. El nuevo proyecto declarado gratuito, sin pagos ni publicidad, exige revisar la aplicación antes de publicar NIF/domicilio automáticamente; no implica que RGPD desaparezca al ofrecer cuentas al público.

Fuentes: https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/solicitar-nif/nif-persona-fisica.html ; https://lssi.digital.gob.es/lssi/la-ley/preguntas-frecuentes
