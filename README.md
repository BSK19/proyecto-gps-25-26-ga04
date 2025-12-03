# UnderSounds

**Plataforma de música para artistas independientes**

UnderSounds es una plataforma completa que conecta artistas musicales independientes con sus seguidores. Permite a los músicos distribuir su música, vender merchandising y construir su audiencia, mientras que los oyentes pueden descubrir, comprar y disfrutar música en diversos formatos.

## Visión General

UnderSounds nace como respuesta a la necesidad de los artistas independientes de tener un canal directo con su audiencia, sin intermediarios que diluyan sus ingresos o controlen su contenido. La plataforma ofrece:

- **Para oyentes**: Descubrimiento musical, reproductor integrado, descargas en múltiples formatos y conexión directa con artistas
- **Para artistas**: Distribución digital, venta de merchandising, analíticas detalladas y pagos directos

## Arquitectura de Microservicios

UnderSounds implementa una arquitectura de microservicios moderna con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                     │
│                           Puerto 3000                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   USER SERVICE      │ │   CONTENT SERVICE   │ │   STATS SERVICE     │
│   (Node.js/Express) │ │   (Node.js/Express) │ │   (Python/FastAPI)  │
│   Puerto 5000       │ │   Puerto 5001       │ │   Puerto 5002       │
│                     │ │                     │ │                     │
│ • Autenticación     │ │ • Álbumes/Tracks    │ │ • Eventos/KPIs      │
│ • JWT + OAuth       │ │ • Artistas          │ │ • Trending          │
│ • Gestión usuarios  │ │ • Merchandising     │ │ • Recomendaciones   │
│ • Follow/Like       │ │ • Noticias          │ │ • Alertas           │
│                     │ │ • Pagos (Stripe)    │ │ • Circuit Breaker   │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │        MongoDB          │
                    │   (3 bases de datos)    │
                    └─────────────────────────┘
```

### Servicios

| Servicio | Tecnología | Puerto | Responsabilidad |
|----------|------------|--------|-----------------|
| **Frontend** | React 18 + Vite | 3000 | Interfaz de usuario SPA |
| **User Service** | Node.js/Express | 5000 | Autenticación, perfiles, follows/likes |
| **Content Service** | Node.js/Express | 5001 | Catálogo musical, media, pagos |
| **Stats Service** | Python/FastAPI | 5002 | Analíticas, trending, recomendaciones |

## Características Principales

### 🎵 Para Oyentes

- **Descubrir música**: Exploración por géneros, tendencias y recomendaciones personalizadas
- **Reproductor integrado**: Audio player global con controles de volumen y progreso
- **Descargas**: Múltiples formatos (MP3, WAV, FLAC) con conversión en tiempo real
- **Carrito de compras**: Gestión de álbumes, tracks y merchandising
- **Interacción social**: Valoraciones, comentarios, follows y likes
- **Conciertos**: Información de eventos y fechas de artistas seguidos

### 🎸 Para Artistas

- **Perfil personalizado**: Banner, bio, redes sociales y ubicación
- **Distribución digital**: Subida de álbumes con múltiples tracks
- **Merchandising**: Venta de vinilos, CDs, cassettes y camisetas
- **Analíticas**: KPIs de reproducciones, likes, follows e ingresos
- **Alertas**: Notificaciones por email al superar umbrales de actividad
- **Pagos directos**: Integración con Stripe para cobros transparentes

### 🔐 Seguridad

- **Autenticación dual**: Credenciales locales + OAuth 2.0 (Google)
- **JWT con Refresh Tokens**: Access tokens (15min) + refresh en HttpOnly cookies (7 días)
- **Recuperación de contraseña**: Sistema OTP con tokens firmados
- **Rate limiting**: Protección contra ataques de fuerza bruta
- **Sanitización**: Prevención de XSS y NoSQL injection

### ⚡ Resiliencia

- **Circuit Breaker**: Protección ante fallos de servicios externos
- **Retry con backoff**: Reintentos automáticos con espera exponencial
- **Caché TTL**: Optimización de consultas frecuentes
- **Health checks**: Monitorización de estado de cada servicio

## Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| React 18 | Framework UI |
| Vite | Build tool y dev server |
| Material-UI 6 | Componentes de diseño |
| React Router 6 | Navegación SPA |
| Axios | Cliente HTTP |
| Context API | Estado global |

### Backend (Node.js)
| Tecnología | Uso |
|------------|-----|
| Express.js | Framework HTTP |
| Mongoose | ODM para MongoDB |
| Passport.js | Autenticación (JWT + OAuth) |
| Multer | Upload de archivos |
| FFmpeg | Conversión de audio |
| Stripe | Procesamiento de pagos |
| Pino | Logging estructurado |

### Backend (Python)
| Tecnología | Uso |
|------------|-----|
| FastAPI | Framework async |
| Motor | Driver async MongoDB |
| Pydantic | Validación de datos |
| aiobreaker | Circuit Breaker |
| tenacity | Retry patterns |
| cachetools | Caché en memoria |

### Infraestructura
| Tecnología | Uso |
|------------|-----|
| MongoDB | Base de datos NoSQL |
| Swagger/OpenAPI | Documentación de APIs |
| dotenv | Configuración por entorno |

## Instalación Rápida

### Prerrequisitos
- Node.js 18.x o superior
- Python 3.10 o superior
- MongoDB 5.0 o superior
- Cuenta de Stripe (para pagos)
- Proyecto en Google Cloud (para OAuth)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/undersounds.git
cd undersounds
```

### 2. Configurar servicios

**User Service:**
```bash
cd user-service
npm install
cp .env.example .env  # Configurar variables
```

**Content Service:**
```bash
cd content-service
npm install
cp .env.example .env  # Configurar variables
```

**Stats Service:**
```bash
cd stats-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configurar variables
```

**Frontend:**
```bash
cd undersounds-frontend
npm install
cp .env.example .env  # Configurar variables
```

### 3. Iniciar servicios

```bash
# Terminal 1 - User Service
cd user-service && npm start

# Terminal 2 - Content Service
cd content-service && npm start

# Terminal 3 - Stats Service
cd stats-service && python server.py

# Terminal 4 - Frontend
cd undersounds-frontend && npm run dev
```

### 4. Acceder a la aplicación

| Recurso | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| User API Docs | http://localhost:5000/api-docs |
| Content API Docs | http://localhost:5001/api-docs |
| Stats API Docs | http://localhost:5002/api/docs |

## Estructura del Proyecto

```
undersounds/
├── user-service/           # Microservicio de usuarios
│   ├── config/             # Configuración (DB, Passport)
│   ├── controller/         # Lógica de negocio
│   ├── middleware/         # Rate limiting, sanitización
│   ├── model/              # DAO, DTO, Factory, Models
│   ├── routes/             # Definición de rutas
│   ├── docs/               # OpenAPI spec
│   └── server.js
│
├── content-service/        # Microservicio de contenidos
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── services/           # Conversión de audio
│   ├── assets/             # Imágenes y música
│   ├── docs/
│   └── server.js
│
├── stats-service/          # Microservicio de estadísticas
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── docs/
│   └── server.py
│
├── undersounds-frontend/   # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # Estado global (Auth, Cart, Player)
│   │   ├── pages/          # Vistas principales
│   │   ├── services/       # Clientes API
│   │   ├── styles/         # CSS por componente
│   │   └── utils/          # Utilidades
│   └── vite.config.js
│
├── test_api.bat            # Script de pruebas automatizadas
└── README.md               # Este archivo
```

## Variables de Entorno

### Frontend (.env)
```env
VITE_USER_API_URL=http://localhost:5000/api
VITE_CONTENT_API_URL=http://localhost:5001/api
VITE_STATS_API_URL=http://localhost:5002/api
```

### User Service (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/undersounds_users
ACCESS_TOKEN_SECRET=<secreto>
REFRESH_TOKEN_SECRET=<secreto>
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>
```

### Content Service (.env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/undersounds_content
STRIPE_SECRET_KEY=<stripe_key>
```

### Stats Service (.env)
```env
PORT=5002
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/undersounds_stats
CONTENT_SERVICE_URL=http://localhost:5001
```

## Documentación Adicional

Cada servicio incluye su propia documentación técnica detallada:

- [User Service README](./user-service/README.md) — Autenticación, OAuth, gestión de cuentas
- [Content Service README](./content-service/README.md) — Catálogo, media, pagos
- [Stats Service README](./stats-service/README.md) — Analíticas, trending, recomendaciones

## Testing

El proyecto incluye un script de pruebas automatizadas para validar todos los endpoints:

```bash
# Windows
test_api.bat

# El script prueba:
# - Health checks de todos los servicios
# - Registro y login de usuarios
# - CRUD de álbumes, artistas, noticias
# - Ingesta de eventos y KPIs
# - Trending y recomendaciones
# - Circuit breaker y caché
```

## Licencia

Este proyecto está bajo la Licencia MIT — ver [LICENSE](LICENSE) para más detalles.

**UnderSounds** — Proyecto académico desarrollado para la asignatura de Arquitectura de Sistemas Empresariales en la Universidad de Extremadura.
