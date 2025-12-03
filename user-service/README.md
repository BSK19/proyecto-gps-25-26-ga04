# User Service — UnderSounds

Microservicio de autenticación y gestión de cuentas de usuario para la plataforma UnderSounds.

## Descripción

El **User Service** es responsable de toda la lógica relacionada con la identidad y autenticación de usuarios dentro de la arquitectura de microservicios de UnderSounds. Gestiona el ciclo de vida completo de las cuentas: registro, autenticación, autorización, recuperación de contraseña y preferencias de usuario.

## Características Principales

### Autenticación y Seguridad
- **JWT con Refresh Tokens**: Access tokens de corta duración (15 min) + refresh tokens en cookies HttpOnly (7 días)
- **OAuth 2.0 con Google**: Integración completa mediante Passport.js
- **Recuperación de contraseña**: Sistema OTP con tokens firmados y expiración de 10 minutos
- **Rate limiting**: Protección contra ataques de fuerza bruta en endpoints sensibles
- **Sanitización de inputs**: Prevención de inyección XSS/NoSQL

### Gestión de Cuentas
- **Roles diferenciados**: `fan`, `band` (artista/banda) y `label` (sello discográfico)
- **Perfiles personalizables**: Imagen de perfil, banner, bio, enlaces sociales
- **Vinculación con Content Service**: Las cuentas `band` se sincronizan automáticamente con el catálogo de artistas
- **Sistema de seguimiento**: Follow/unfollow de artistas
- **Likes de canciones**: Gestión de tracks favoritos

### Comunicación Inter-servicios
- **Retry con backoff exponencial**: Resiliencia en llamadas al Content Service
- **Creación automática de artistas**: Al registrar una cuenta `band`, se crea el artista correspondiente en el Content Service

## Arquitectura

```
user-service/
├── config/
│   ├── db.js                 # Conexión a MongoDB
│   ├── passport.js           # Estrategias OAuth y JWT
│   ├── dbmeta.json           # Metadatos de versión compartidos
│   └── dbmeta_local.json     # Versión local de BD
├── controller/
│   └── AccountController.js  # Lógica de negocio
├── middleware/
│   ├── rateLimit.js          # Limitadores de tasa
│   └── sanitize.js           # Sanitización de inputs
├── model/
│   ├── dao/
│   │   └── AccountDAO.js     # Acceso a datos
│   ├── dto/
│   │   └── AccountDTO.js     # Transferencia de datos
│   ├── factory/
│   │   └── AccountFactory.js # Creación de entidades
│   └── models/
│       └── Account.js        # Esquema Mongoose
├── routes/
│   └── AccountRoutes.js      # Definición de rutas
├── utils/
│   ├── httpRetry.js          # Utilidad de reintentos HTTP
│   └── logger.js             # Logging con Pino
├── docs/
│   └── Usuarios.yaml         # Especificación OpenAPI
├── data-dump/
│   └── accounts.json         # Datos exportados
├── view/
│   └── index.html            # Página de bienvenida
└── server.js                 # Punto de entrada
```

## Instalación

### Prerrequisitos
- Node.js 18.x o superior
- MongoDB 5.0 o superior
- Cuenta de Google Cloud (para OAuth)
- Servidor SMTP (para envío de OTP)

### Configuración

1. **Instalar dependencias**:
   ```bash
   cd user-service
   npm install
   ```

2. **Configurar variables de entorno** (`.env`):
   ```env
   # Servidor
   PORT=5000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173

   # Base de datos
   MONGO_URI=mongodb://localhost:27017/undersounds_users

   # JWT
   ACCESS_TOKEN_SECRET=<clave_secreta_access>
   REFRESH_TOKEN_SECRET=<clave_secreta_refresh>
   OTP_SECRET=<clave_secreta_otp>
   SESSION_SECRET=<clave_sesion>

   # OAuth Google
   GOOGLE_CLIENT_ID=<client_id>
   GOOGLE_CLIENT_SECRET=<client_secret>
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # SMTP (para OTP)
   SMTP_USER=<email>
   SMTP_PASS=<password>
   FROM_EMAIL=<email_remitente>

   # Comunicación inter-servicios
   CONTENT_SERVICE_URL=http://localhost:5001/api
   SERVICE_API_KEY=<api_key_compartida>
   ```

3. **Ejecutar el servicio**:
   ```bash
   npm start
   ```

4. **Acceder a la documentación**:
   - Swagger UI: `http://localhost:5000/api-docs`
   - Health check: `http://localhost:5000/healthz`

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/auth/register` | Registro de nueva cuenta | 5/min |
| `POST` | `/api/auth/login` | Inicio de sesión | 5/min |
| `POST` | `/api/auth/logout` | Cierre de sesión | — |
| `POST` | `/api/auth/refresh-token` | Renovar access token | — |
| `GET`  | `/api/auth/me` | Obtener perfil actual (JWT) | — |

### Recuperación de Contraseña

| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/auth/forgot-password` | Solicitar OTP | 3/min |
| `POST` | `/api/auth/reset-password` | Restablecer con OTP | 3/min |

### OAuth 2.0

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/api/auth/google` | Iniciar flujo OAuth |
| `GET`  | `/api/auth/google/callback` | Callback de Google |

### Gestión de Cuenta

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `PUT`  | `/api/auth/:id` | Actualizar perfil | JWT |
| `POST` | `/api/auth/toggle-follow` | Seguir/dejar de seguir artista | JWT |
| `POST` | `/api/auth/toggle-like` | Like/unlike a track | JWT |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/healthz` | Estado del servicio y MongoDB |

## Modelo de Datos

### Account Schema

```javascript
{
  username: String,           // Nombre de usuario (requerido)
  email: String,              // Email único (requerido)
  password: String,           // Hash bcrypt (opcional para OAuth)
  role: 'fan' | 'band' | 'label',
  profileImage: String,       // URL de avatar
  bannerImage: String,        // URL de banner
  followers: Number,          // Contador de seguidores
  bio: String,                // Biografía
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  following: [String],        // IDs de artistas seguidos
  likedTracks: [String],      // IDs de canciones con like
  // Campos específicos por rol
  bandName: String,           // Solo para role='band'
  genre: String,              // Solo para role='band'
  labelName: String,          // Solo para role='label'
  website: String,            // Solo para role='label'
  artistId: ObjectId,         // Referencia al Content Service
  // OAuth
  provider: String,           // 'google', 'facebook', etc.
  providerId: String,         // ID del proveedor
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## Gestión de Base de Datos

El servicio incluye herramientas para sincronización de datos:

```bash
# Importar datos desde data-dump/
npm run mongoimport

# Exportar datos actuales
npm run mongoexport
```

El sistema de versionado (`dbmeta.json` / `dbmeta_local.json`) detecta automáticamente si la base de datos local está desactualizada y ejecuta la importación al iniciar.

## Seguridad

### Rate Limiting
- **authLimiter**: 5 peticiones/minuto para registro y login
- **otpLimiter**: 3 peticiones/minuto para recuperación de contraseña
- **generalLimiter**: 100 peticiones/minuto para el resto

### Sanitización
- Eliminación de caracteres peligrosos en body y query params
- Prevención de inyección NoSQL
- Escape de HTML para prevenir XSS

### Tokens
- Access Token: 15 minutos de validez
- Refresh Token: 7 días, almacenado en cookie HttpOnly
- OTP Token: 10 minutos, firmado con secreto dedicado

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| Express.js | Framework HTTP |
| Mongoose | ODM para MongoDB |
| Passport.js | Autenticación (JWT + OAuth) |
| bcrypt | Hash de contraseñas |
| jsonwebtoken | Generación/verificación de JWT |
| nodemailer | Envío de emails (OTP) |
| pino / pino-http | Logging estructurado |
| express-rate-limit | Rate limiting |
| swagger-ui-express | Documentación API |
| axios | Cliente HTTP (comunicación inter-servicios) |

## Comunicación con Otros Servicios

### Content Service (puerto 5001)
- **Creación de artistas**: Al registrar una cuenta `band`, se invoca `POST /api/artists`
- **Consulta de artistas**: Durante login/refresh se obtienen datos completos del artista
- **Retry automático**: 3 intentos con backoff exponencial (1s, 2s, 4s)

## Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor | No (default: 5000) |
| `NODE_ENV` | Entorno de ejecución | No |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | Sí |
| `MONGO_URI` | URI de conexión a MongoDB | Sí |
| `ACCESS_TOKEN_SECRET` | Secreto para access tokens | Sí |
| `REFRESH_TOKEN_SECRET` | Secreto para refresh tokens | Sí |
| `OTP_SECRET` | Secreto para tokens OTP | Sí |
| `SESSION_SECRET` | Secreto para sesiones | Sí |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | Sí |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth | Sí |
| `GOOGLE_CALLBACK_URL` | URL de callback OAuth | Sí |
| `SMTP_USER` | Usuario SMTP | Sí |
| `SMTP_PASS` | Contraseña SMTP | Sí |
| `FROM_EMAIL` | Email remitente | Sí |
| `CONTENT_SERVICE_URL` | URL del Content Service | No |
| `SERVICE_API_KEY` | API Key inter-servicios | No |