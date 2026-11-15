# Supabase: configuración del piloto de Brisa

## Estado

La URL del proyecto y su clave **publicable** son las facilitadas por el propietario. Una comprobación de solo lectura de `/auth/v1/settings` respondió HTTP 200 y confirmó email habilitado. El código está preparado, pero las tablas no pueden crearse con esa clave. No se ha usado una contraseña de la base de datos ni se ha creado ningún usuario desde esta conversación.

No dar por verificado un guardado real ni el aislamiento de dos cuentas hasta ejecutar el SQL y hacer la prueba. El registro público de la web sigue cerrado; el proyecto Supabase debe desactivar también «Allow new users to sign up» durante el piloto. Ocultar el botón en la web no impide por sí solo usar el endpoint público de Auth.

## Pasos del propietario

1. Abrir el proyecto en Supabase y entrar en **SQL Editor → New query**.
2. Copiar íntegro `supabase/setup.sql`, ejecutar **Run** y comprobar que el resultado final es `1`.
3. En **Authentication → Users → Add user → Create new user**, crear un usuario de prueba con email y contraseña. Confirmarlo desde el panel para el piloto si la opción está disponible. No desactivar RLS ni enviar la contraseña al asistente.
4. En la configuración de autenticación, desactivar **Allow new users to sign up** hasta preparar el lanzamiento. Verificar el nombre exacto del ajuste en el panel actual.
5. Abrir Brisa y entrar mediante **Conectar cuenta**. El acceso privado a Sites puede exigir antes la cuenta propietaria de ChatGPT.
6. La cuenta nueva empieza vacía. Para trasladar el horario previo, usar **Mi cuenta → Importar mi horario local**, revisar y aplicar. Esperar a «Guardado en tu cuenta».
7. Abrir Brisa en el móvil y acceder al mismo usuario Supabase. Debería cargar ese horario. Las ediciones posteriores se envían al servidor; para traer cambios del otro dispositivo pulsar Recargar nube.

## Tabla y RPC

`public.brisa_calendars` guarda una fila por `auth.users.id`. El payload incluye calendario, progreso, tutorial y preferencias. RLS se habilita y fuerza. `anon` no tiene permisos sobre la tabla; `authenticated` solo tiene políticas para su propio `user_id`.

`brisa_save_calendar(p_owner_id,p_payload,p_expected_revision)` es `SECURITY INVOKER`, no eleva privilegios. Exige usuario autenticado, coincidencia del propietario declarado, JSON de formato básico y máximo 2 MiB. Una alta inicial usa revisión 0; actualizaciones requieren la revisión exacta y la incrementan. Las contraseñas nunca van en este payload. El cliente valida el modelo completo antes de cargar y guardar; cada usuario sigue pudiendo modificar sus propios datos.

No se concede DELETE directo al rol authenticated. El piloto no incluye eliminación autónoma de la identidad Auth. El propietario deberá atender bajas y solicitudes y completar su automatización antes de un lanzamiento abierto.

## Prueba manual con dos usuarios

Crear A y B **de prueba** en el panel, con contraseñas que no se compartan aquí:

1. A entra, termina tutorial, añade un objetivo y espera guardado.
2. B entra desde otro navegador o sesión. No debe ver el objetivo ni el nombre de A. No importar el modo local de A en B.
3. Volver a A y confirmar sus datos.
4. Intentar consultar desde la sesión B el `user_id` de A mediante la API pública: la lectura debe devolver cero filas. Una llamada a la RPC con `p_owner_id` de A y el JWT de B debe fallar con `BRISA_UNAUTHORIZED`. Hacerlo solo con usuarios de prueba propios.
5. Con A en dos dispositivos, cargar ambos; guardar un cambio en el primero y luego otro en el segundo sin recargar. El segundo debe mostrar conflicto y conservar su copia pendiente. Recargar nube y revisar antes de aplicar una recuperación.
6. Cortar la red, cambiar un objetivo, comprobar que no aparece como sincronizado y descargar copia. Recuperar red y recargar la nube para revisar los cambios pendientes.

Las pruebas Node usan dobles del backend y validaciones estructurales de SQL. No sustituyen estas comprobaciones en PostgreSQL/Supabase. No hay PostgreSQL ni controlador de navegador habilitados en el entorno de desarrollo actual.

## Recuperación y límites

No se fusionan planes automáticamente. La propuesta de recuperación sustituye el payload completo y usa la revisión actual; si otro dispositivo vuelve a guardar, se detecta otro conflicto. Los cambios pendientes persisten en `brisa-cloud-pending-<uuid>`. Los horarios de cuenta se separan en `brisa-account-<uuid>` y el modo local permanece en `brisa-v2`. El SDK guarda su sesión en `brisa-supabase-session`.

El guardado automático tarda aproximadamente un segundo en arrancar y depende de la conexión. Al cerrar antes puede quedar pendiente. Los datos no se sincronizan mágicamente cuando la web está cerrada. Al salir se intenta guardar; si falla, la interfaz ofrece descargar o conservar conscientemente una copia pendiente. En equipos compartidos, evita conservar esa copia.

## Antes de registro público

Completar identidad de actividad, edades, conservación, borrado de cuenta, contratos/región/transferencias reales, SMTP y los documentos legales. Implementar aceptación versionada comprobada por servidor antes de habilitar datos de usuario y no sustituirla por un booleano de JavaScript. El archivo `legal-config.js` sigue siendo de borrador y no se ha presentado una aceptación ficticia como válida. El alta abierta de Supabase y la audiencia de Sites deben revisarse por separado y no se activan por recibir una clave publicable.

## Dependencia

SDK: `@supabase/supabase-js` 2.119.0, artefacto oficial npm, UMD incluido localmente. Integridad del tarball verificada:

`sha512-MKP49G6bJbPhvsZDegZ/IXS/ITApPgplDCF5+F65KZ5kIArS5Y90WFxwvWYALx2bsxdrSuHvkCiXHYr3dU8+sw==`

Licencia en `dist/vendor/supabase-LICENSE`. Nunca añadir `sb_secret_…`, `service_role`, contraseña de la base de datos o contraseñas de usuarios al repositorio.
