# Correo y apertura · 15-11-2026

**Actualización v0.9:** el titular ya configuró SMTP Brevo y confirmó recepción y cambio de contraseña. El servidor marca `smtp_ready=true`. Ya hay declaración de edad 18+ validada y registrada en servidor. Documentos 0.9.1-borrador y plan aprobado de 60 días + 30 para exportar. El registro sigue cerrado. El resto de esta página conserva las instrucciones de instalación; para estado y pendientes actuales ver [apertura y cierre](lanzamiento-mvp.md).

## Qué está hecho

Supabase Free está conectado en eu-north-1. Tablas y RLS instalados; comprobado en transacción con identidades sintéticas (sin correo), sin conservar fixtures. Registro cerrado de verdad mediante trigger Auth. La cuenta confirmada del propietario conserva acceso como piloto. Se guarda cada aceptación de condiciones con versiones y fecha de servidor en tabla protegida: no depende de metadatos editables después del alta.

Brisa incluye formulario de registro, confirmación y recuperación PKCE en `auth.html`, recuperación desde el acceso, y baja mediante Edge Function autenticada `brisa-delete-account`, ya desplegada. La baja solo toma la identidad verificada del token, nunca un ID enviado por el navegador. Elimina identidad y calendario por cascada. Las exportaciones y cachés de otros dispositivos no se pueden borrar a distancia. No se ha probado un envío real ni eliminado la cuenta del propietario.

## Correo gratuito sin comprar dominio

El proveedor SMTP transporta los mensajes; Supabase genera los enlaces de confirmación y recuperación. No es una suscripción de marketing. El SMTP de pruebas de Supabase no sirve para público: destinatarios restringidos y 2 mensajes/hora.

Brevo anuncia un plan Free de 300 envíos diarios (incluye transaccionales), sin fecha de fin de prueba anunciada. No se ha contratado nada, ni comprado dominio ni activado pagos. Las cuotas y condiciones pueden cambiar. Sin dominio propio Brevo documenta un reemplazo temporal del remitente por un dominio suyo; exige validar el remitente y la cuenta y no garantiza que esa solución dure. Si no autoriza el envío transaccional, mantener cerrado el registro. Un dominio propio verificado es la solución estable y suele tener coste anual.

1. Crear cuenta Free en https://www.brevo.com/ y verificar el remitente. No contratar Starter ni introducir tarjeta para una mejora de pago.
2. En Brevo, abrir Transactional → SMTP & API y obtener host, puerto, usuario SMTP y clave SMTP. No usar como clave la contraseña de acceso a Brevo.
3. En Supabase → Authentication → Email / SMTP Settings, activar Custom SMTP y pegar allí esos datos junto con remitente y nombre Brisa. **No enviar la clave por chat ni guardarla en GitHub.** Los menús pueden variar. Mantener confirmación de email activada.
4. En Supabase → Authentication → URL Configuration, Site URL: `https://brisa-plan-estudio.gleamingalbum4.chatgpt.site`. Añadir como Redirect URL exacta `https://brisa-plan-estudio.gleamingalbum4.chatgpt.site/auth.html`. No comodines.
5. En Email Templates, copiar `supabase/templates/confirmation.html` en Confirm signup y `recovery.html` en Reset password. Conservar `{{ .ConfirmationURL }}`. Desactivar seguimiento de clics del proveedor sobre los enlaces de autenticación.
6. Probar con una cuenta de prueba controlada: alta, recepción/confirmación, recuperar contraseña, cerrar y reabrir, guardar desde móvil, aislamiento y eliminación. PKCE exige abrir en el mismo navegador que solicitó el enlace. No enviar pruebas a terceros sin su autorización.

No hay herramienta conectada para administrar SMTP ni URL Configuration. Hace falta esta configuración del titular o una conexión administrativa adecuada; conectar el acceso a la base de datos no concede esas operaciones.

## Antes de abrir cuentas

Completar textos que siguen como borradores: identificación/contacto exigibles según actividad, edad de usuarios, plazos reales de conservación y logs, proveedores/contratos, transferencias y atención de derechos. Ningún texto evita que alguien reclame ni permite renunciar a derechos obligatorios. No marcar `legal_ready` solo para encender el botón.

Tras completar lo anterior y probar el correo, actualizar con acceso administrativo la única fila de `brisa_registration_settings`: `smtp_ready`, `legal_ready`, `registration_open` y versiones definitivas de condiciones/privacidad. La función rechaza versiones que contengan «borrador». El navegador consulta el estado real, no permite abrirlo modificando un flag JS. Un operador que cree usuarios desde el dashboard también encontrará el cierre del registro; no desactivar el trigger como atajo.

Para una instalación nueva ejecutar en orden `supabase/setup.sql`, `supabase/migrations/20261115_registration_gate.sql`, `supabase/registration-hardening.sql` y desplegar la función. En el proyecto del propietario ya está aplicado: **no volver a ejecutar el setup antiguo**, porque reemplaza las políticas más recientes.

## Verificación y límites

75 pruebas Node pasan, incluidas recuperación verificada y borrado sin aceptar otro ID. SQL real comprobó cierre de altas, aceptación requerida, registro de versiones, guardado propio, denegación de lectura/escritura ajena, conflicto de revisión y cascada de borrado; transacción revertida. Auditoría Supabase sin avisos de tablas/funciones: queda el aviso de protección contra contraseñas filtradas desactivada, cuya disponibilidad debe revisarse según plan, sin contratar un plan de pago. No se dispone de navegador de pruebas en este entorno y no se ha verificado visualmente ni un correo real.

Fuentes:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders
