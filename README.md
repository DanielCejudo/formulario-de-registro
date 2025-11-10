# Formulario Validador

Aplicación completa (frontend + backend) para registrar usuarios a través de un formulario con validación en tiempo real y persistencia en PostgreSQL.

## Contenido

- `index.html`, `styles.css`, `script.js`: interfaz web lista para abrir en el navegador. Valida cada campo con mensajes contextuales y previene envíos si hay errores.
- `server/`: API REST construida con Express que guarda los registros en la base de datos.

## Características principales

- Validación instantánea de nombre, correo, contraseña, confirmación y términos.
- Feedback accesible con estados de error/éxito por campo.
- Envío al backend solo cuando todo es válido; el botón muestra estado de carga.
- API que encripta la contraseña con `pgcrypto` y maneja errores comunes (duplicados, datos faltantes).
- Configuración para CORS y despliegue con SSL opcional (modo producción).

## Requisitos

- Node.js 18 o superior.
- PostgreSQL 13 o superior.

## Configuración del backend

1. Copia el archivo `.env.example` (si no existe, créalo) dentro de `server/` y define al menos:

   ```bash
   DATABASE_URL=postgres://usuario:password@localhost:5432/nombredb
   CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500
   PORT=4000
   ```

   - `DATABASE_URL`: cadena de conexión completa a PostgreSQL.
   - `CORS_ORIGIN`: URLs que pueden consumir la API (separadas por coma). Ajusta según tu frontend.

2. Instala dependencias y prepara la base de datos:

   ```bash
   cd server
   npm install
   psql "$DATABASE_URL" -f schema.sql
   ```

3. Inicia el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   El API escuchará en `http://localhost:4000`. Usa `node test-connection.js` para comprobar la conexión si lo necesitas.

### Endpoints

- `POST /api/register`

  - **Body JSON**: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "Clave123!" }`
  - **Respuestas**:
    - `201 Created`: `{ ok: true, user: { id, full_name, email, created_at } }`
    - `409 Conflict`: correo ya registrado.
    - `400` / `500`: mensaje de error descriptivo.

- `GET /health`: devuelve `{ "status": "ok" }`, útil para sondas de vida.

## Uso del frontend

1. Asegúrate de tener el backend ejecutándose.
2. Abre `index.html` directamente en el navegador o sirve la carpeta raíz con tu servidor estático favorito.
3. Completa el formulario. Cada campo mostrará mensajes de validación según escribes.
4. Al enviar datos válidos, verás el mensaje de éxito; en caso de error desde el backend, se mostrará el mensaje correspondiente.

## Scripts útiles

Desde `server/`:

- `npm run dev`: inicia el servidor con recarga automática (`node --watch`).
- `node test-connection.js`: prueba la conexión a la base de datos usando la configuración actual.

## Estructura del proyecto

```
formulariovalidador/
├── index.html
├── script.js
├── styles.css
└── server/
    ├── package.json
    ├── schema.sql
    ├── server.js
    └── test-connection.js
```

## Próximos pasos sugeridos

- Añadir tests automatizados para las validaciones y los endpoints.
- Incorporar un cliente HTTP (ej. Thunder Client, Postman) con colecciones compartidas.
- Desplegar el backend en un servicio compatible con PostgreSQL y definir variables de entorno seguras.
