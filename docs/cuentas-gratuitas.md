# Compartir Brisa con cuentas personales

Es viable arrancar un MVP pequeño sin pagar por dominio, alojamiento o base de datos, dentro de los límites de proveedores gratuitos. No es una promesa de servicio gratuito ilimitado. Esta versión aún no implementa cuentas y el despliegue Sites actual sigue privado.

## Propuesta

1. Servir la web en un alojamiento estático gratuito con su subdominio (por ejemplo GitHub Pages para un repositorio público, sujeto a sus condiciones).
2. Usar Supabase Free para autenticación y base de datos.
3. Guardar un registro de calendario por `user_id`, con políticas RLS que permitan leer y escribir solo cuando `auth.uid() = user_id`. Nunca usar email como única comprobación de identidad ni una clave de servicio en el navegador.
4. Guardar `tutorial_completed_at` por cuenta, además del horario. Primera sesión: tutorial; siguientes: recuperar su calendario, desde cualquier dispositivo.
5. Añadir guardado con control de versión para evitar sobrescrituras si una persona modifica el horario en dos dispositivos.

## Correo y coste

Supabase Free permite autenticación por email y contraseña y proveedores sociales. Google permite entrar con una cuenta de correo de Google sin depender del envío de correos de acceso de nuestra aplicación. Para verificación de direcciones y recuperación de contraseña en producción hace falta configurar SMTP: el servidor de correo incorporado en Supabase es de pruebas, restringido a destinatarios autorizados y actualmente limitado a 2 mensajes/hora. No sirve para invitar libremente a usuarios externos. Un proveedor de correo puede ofrecer cuota gratuita, pero sus condiciones y la posible necesidad de dominio deben comprobarse antes de elegirlo.

A fecha de consulta, 15-11-2026, Supabase Free anuncia 50.000 usuarios activos mensuales, 500 MB de base de datos y pausa de proyectos tras una semana de inactividad. Hay otros límites de tráfico y almacenamiento. No activar planes de pago sin autorización; si se alcanza una cuota, revisar disponibilidad y límites antes de ampliar. Las llamadas a un modelo de IA no están incluidas en esta propuesta de coste cero.

Fuentes oficiales:

- https://supabase.com/pricing
- https://supabase.com/docs/guides/auth/auth-smtp
- https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages

## Qué faltaría para ponerlo en marcha

Crear y conectar el proyecto Supabase del propietario, configurar el acceso (Google o correo), crear las tablas y políticas, probar con dos cuentas que una no ve datos de la otra y desplegar en una URL compartible. No basta con hacer público el prototipo actual: sigue almacenando datos solo en el navegador y no autentica usuarios propios.
