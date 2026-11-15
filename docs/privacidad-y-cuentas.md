# Cuentas de Brisa: proveedores, costes y privacidad

Orientación para un eventual lanzamiento en España/UE, consultada el 15-11-2026. No es una política de privacidad publicable ni sustituye la revisión del caso concreto por un profesional. Esta versión no crea cuentas, ni recopila correos o contraseñas para Brisa.

## Proveedor y automatización

Una opción para el MVP es Supabase Auth + Postgres, con un alojamiento web estático y subdominio gratuito. Supabase Free es un plan de 0 USD/mes con cuotas, no una prueba temporal con vencimiento fijo. Actualmente anuncia 50.000 usuarios activos/mes, 500 MB de base de datos y pausa tras una semana de inactividad. El proveedor puede cambiar condiciones.

El código de acceso, las tablas, el aislamiento por usuario (RLS), el guardado por cuenta y la migración local pueden prepararse y probarse desde aquí. El propietario debe crear/conectar su proyecto y aceptar las condiciones del proveedor. Cualquier suscripción o dominio de pago requiere su autorización. Las claves privadas irían en secretos del servidor; nunca en GitHub ni en el navegador.

Para verificación y recuperación de contraseña por correo, configurar SMTP de producción. El SMTP incorporado de Supabase es de pruebas, con destinatarios restringidos y límites bajos; no basta para abrir cuentas al público. Valorar un proveedor de envío con cuota gratuita y comprobar si exige dominio propio, cuyo coste no está incluido. Google OAuth es otra opción de acceso, sin compartir la contraseña de Google con Brisa.

No se ha creado ningún recordatorio ni existe una suscripción monitorizada. Si se elige una prueba temporal, se necesita la fecha real de vencimiento y un calendario o sistema de alertas configurado para avisar; una conversación por sí sola no asegura avisos futuros. El consumo de cuotas tampoco se vigila automáticamente en este MVP.

## Qué preparar antes de recoger datos de otras personas

- **Responsable y finalidad:** identificar quién decide cómo se usan los datos, su contacto, y el uso de cada dato. Recoger solo lo necesario: correo, identificador de usuario, preferencias y calendario. El correo para prestar el servicio no autoriza publicidad.
- **Base jurídica e información:** documentar una base adecuada para cada finalidad. Crear/prestar la cuenta puede basarse en la ejecución del contrato cuando sea necesario, sin tratar todo como un consentimiento genérico. Informar antes de registrarse de finalidad, base, conservación, destinatarios, transferencias y derechos. El consentimiento comercial, cuando proceda, debe ir separado.
- **Seguridad:** delegar el manejo de contraseñas en un proveedor de autenticación. Nunca guardarlas en claro, en localStorage ni en logs. Usar HTTPS, contraseñas con hash seguro, verificación y recuperación, limitación de intentos y políticas que impidan leer horarios ajenos. El propietario de la aplicación sigue teniendo obligaciones aunque use un proveedor.
- **Derechos y conservación:** ofrecer acceso, corrección, exportación y supresión cuando correspondan, con un canal de contacto y plazos de conservación. Planear borrado de cuenta y de sus datos y el tratamiento de copias de seguridad.
- **Proveedores y transferencias:** formalizar contratos de encargo con los proveedores que actúen por cuenta de Brisa. Preferir región UE y revisar subencargados y eventuales transferencias fuera del EEE: seleccionar una región europea no garantiza por sí solo que nunca haya transferencias.
- **Menores:** definir público objetivo y edades. En España, cuando la base sea el consentimiento, para menores de 14 años se necesita el de sus representantes; eso no resuelve por sí solo las cuestiones de capacidad contractual. Al ser una app de estudiantes, conviene diseñar este punto antes del alta pública.
- **Cookies y terceros:** revisar almacenamiento de sesión, analítica y fuentes externas. Los mecanismos estrictamente necesarios no se tratan igual que analítica o publicidad: no asumir que basta un banner genérico. La versión actual usa almacenamiento local y fuentes del sistema; también se deben revisar los mecanismos de sesión del alojamiento.
- **Incidentes:** analizar riesgos y tener un procedimiento de respuesta. Bajo el RGPD, una brecha debe notificarse a la autoridad, cuando proceda, sin dilación indebida y de ser posible en 72 horas desde que se tiene constancia; evaluar también la comunicación a las personas afectadas.

No hay una tasa general por pedir correo y contraseña, pero las obligaciones de protección de datos existen aunque el servicio sea gratuito. Un asesoramiento adaptado es recomendable antes de abrirlo a terceros, especialmente si se admiten menores o se incorporan datos de salud u otros datos sensibles al calendario.

## Fuentes primarias

- Supabase: https://supabase.com/pricing
- SMTP y destinatarios: https://supabase.com/docs/guides/auth/auth-smtp
- AEPD, guía RGPD: https://www.aepd.es/guias/guia-rgpd-para-responsables-de-tratamiento.pdf
- AEPD, contratos con encargados: https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/8-responsable-y-encargado-del-tratamiento/FAQ-0252-sobre-relacion-entre-responsable-y-encargado
- LOPDGDD, artículo 7: https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673
