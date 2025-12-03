# Stats Service — UnderSounds

Microservicio de estadísticas, analíticas y recomendaciones para la plataforma UnderSounds.

## Descripción

El **Stats Service** es responsable de la ingesta de eventos de usuario, cálculo de KPIs de artistas, detección de tendencias y generación de recomendaciones personalizadas. Implementa patrones de resiliencia avanzados (Circuit Breaker, Retry) y sistema de caché para optimizar el rendimiento.

## Características Principales

### Ingesta de Eventos
- **Event Sourcing**: Recepción y almacenamiento de eventos de usuario en tiempo real
- **Procesamiento asíncrono**: Actualización de KPIs en background tasks
- **Tipos de eventos soportados**: `track.played`, `track.liked`, `artist.followed`, `order.paid`

### KPIs de Artistas
- **Métricas agregadas**: plays, likes, follows, purchases, revenue
- **Consultas por rango de fechas**: Filtrado por `startDate` y `endDate`
- **Persistencia**: Almacenamiento incremental en colección dedicada

### Sistema de Tendencias
- **Trending tracks**: Top canciones por reproducciones
- **Trending artists**: Artistas más seguidos
- **Períodos configurables**: day, week, month, year
- **Enriquecimiento de datos**: Consulta al Content Service para metadatos completos

### Recomendaciones
- **Recomendaciones por usuario**: Basadas en historial de likes y reproducciones
- **Recomendaciones por similitud**: Álbumes del mismo género
- **Fallback inteligente**: Artistas populares cuando no hay historial

### Sistema de Alertas
- **Umbrales configurables**: plays, likes, follows
- **Notificación por email**: Envío automático al superar umbrales
- **Cooldown**: Prevención de spam (1 hora entre alertas)
- **Ventana temporal**: Configurable en minutos

### Resiliencia
- **Circuit Breaker**: Protección ante fallos del Content Service (aiobreaker)
- **Retry con backoff exponencial**: 3 intentos con espera progresiva (tenacity)
- **Caché TTL**: Reducción de carga en consultas frecuentes (cachetools)

## Arquitectura

```
stats-service/
├── config/
│   ├── db.py                 # Conexión a MongoDB (motor async)
│   ├── init_db.py            # Inicialización de colecciones
│   ├── dbmeta.json           # Metadatos de versión compartidos
│   └── dbmeta_local.json     # Versión local de BD
├── controller/
│   ├── ArtistKPIController.py  # KPIs, trending, cache, alertas, CB
│   └── EventController.py      # Ingesta de eventos
├── middleware/
│   └── rate_limit.py         # Limitador de tasa (slowapi)
├── model/
│   ├── dao/
│   │   ├── ArtistKPIDAO.py   # Acceso a datos de KPIs
│   │   └── EventDAO.py       # Acceso a datos de eventos
│   ├── dto/
│   │   ├── ArtistKPIDTO.py   # Transferencia de datos
│   │   └── EventDTO.py
│   ├── factory/
│   │   ├── ArtistKPIFactory.py
│   │   └── EventFactory.py
│   └── models/
│       ├── ArtistKPIModel.py # Modelo Pydantic
│       └── EventModel.py
├── routes/
│   ├── ArtistKPIRoutes.py    # Rutas de estadísticas
│   └── EventRoutes.py        # Rutas de eventos
├── utils/
│   └── logger.py             # Logging estructurado
├── docs/
│   └── Estadisticas.yaml     # Especificación OpenAPI
├── data-dump/
│   ├── artist_kpis.json      # KPIs exportados
│   └── events.json           # Eventos exportados
├── view/
│   └── index.html            # Página de bienvenida
├── requirements.txt          # Dependencias Python
└── server.py                 # Punto de entrada FastAPI
```

## Instalación

### Prerrequisitos
- Python 3.10 o superior
- MongoDB 5.0 o superior
- Node.js 18.x (para scripts de import/export)
- Servidor SMTP (para alertas por email)

### Configuración

1. **Crear entorno virtual**:
   ```bash
   cd stats-service
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   npm install  # Para scripts de BD
   ```

3. **Configurar variables de entorno** (`.env`):
   ```env
   # Servidor
   PORT=5002
   HOST=0.0.0.0
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   SHUTDOWN_TIMEOUT=30

   # Base de datos
   MONGO_URI=mongodb://localhost:27017/undersounds_stats

   # Content Service (para enriquecimiento de datos)
   CONTENT_SERVICE_URL=http://localhost:5001

   # SMTP (para alertas)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<email>
   SMTP_PASS=<password>
   FROM_EMAIL=<email_remitente>

   # Caché
   CACHE_MAX_SIZE=500
   CACHE_DEFAULT_TTL=3600
   ```

4. **Ejecutar el servicio**:
   ```bash
   python server.py
   ```

5. **Acceder a la documentación**:
   - Swagger UI: `http://localhost:5002/api/docs`
   - OpenAPI YAML: `http://localhost:5002/api/openapi.yaml`
   - Health check: `http://localhost:5002/healthz`

## API Endpoints

### Ingesta de Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/stats/events` | Enviar evento de usuario (async) |

**Tipos de eventos soportados:**
- `track.played` — Reproducción de pista
- `track.liked` — Like a pista
- `artist.followed` — Follow a artista
- `order.paid` — Compra completada

### KPIs de Artistas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/stats/artist/{artist_id}/kpis` | KPIs agregados (plays, likes, follows, purchases, revenue) |

**Query parameters:**
- `startDate` (ISO 8601) — Fecha inicio del rango
- `endDate` (ISO 8601) — Fecha fin del rango

### Tendencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/stats/trending` | Top tracks o artistas |

**Query parameters:**
- `genre` — `"tracks"` o `"artists"` para filtrar tipo
- `period` — `day`, `week`, `month` (default: `week`)
- `limit` — Número de resultados (default: `10`)

### Recomendaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/recommendations/user/{user_id}` | Recomendaciones personalizadas |
| `GET` | `/api/recommendations/similar` | Álbumes similares por género |

### Alertas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/stats/alerts` | Evaluar umbrales y enviar alerta |

**Body:**
```json
{
  "artistId": "123",
  "windowMinutes": 60,
  "thresholds": {
    "plays": 100,
    "likes": 50,
    "follows": 10
  },
  "notifyEmail": "artist@example.com"
}
```

### Caché y Monitorización

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/stats/cache/info` | Estadísticas del caché |
| `POST` | `/api/stats/cache/clear` | Limpiar caché (todo o clave específica) |
| `GET` | `/api/stats/cb/status` | Estado del Circuit Breaker |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/healthz` | Estado del servicio, MongoDB, memoria, CB |

## Modelos de Datos

### Event Schema

```python
{
    "eventType": str,       # "track.played", "track.liked", etc.
    "timestamp": datetime,  # Momento del evento
    "userId": str | None,   # ID de usuario (opcional)
    "anonymous": bool,      # True si usuario anónimo
    "entityType": str,      # "track", "artist", "album"
    "entityId": str,        # ID de la entidad afectada
    "metadata": {           # Datos adicionales del evento
        "albumId": str,
        "artistId": str,
        "genre": str,
        "price": float
    }
}
```

### ArtistKPI Schema

```python
{
    "artistId": str,
    "period": str | None,     # Período de agregación
    "plays": int,             # Total reproducciones
    "uniqueListeners": int,   # Oyentes únicos
    "likes": int,             # Total likes
    "follows": int,           # Total seguidores
    "purchases": int,         # Total compras
    "revenue": float          # Ingresos totales
}
```

## Patrones de Resiliencia

### Circuit Breaker

El servicio implementa Circuit Breaker para proteger las llamadas al Content Service:

| Estado | Descripción |
|--------|-------------|
| **Closed** | Funcionamiento normal, las peticiones pasan |
| **Open** | Circuito abierto tras 5 fallos, rechaza peticiones |
| **Half-Open** | Tras 30s, permite una petición de prueba |

**Configuración:**
- `fail_max`: 5 fallos consecutivos
- `reset_timeout`: 30 segundos

### Retry con Backoff Exponencial

Las peticiones HTTP fallidas se reintentan automáticamente:

| Intento | Espera |
|---------|--------|
| 1 | 1 segundo |
| 2 | 2 segundos |
| 3 | 4 segundos |

**Errores reintentables:** `TimeoutException`, `ConnectError`, códigos 502/503/504

### Caché TTL

- **Tamaño máximo:** 500 entradas (configurable)
- **TTL por defecto:** 3600 segundos (1 hora)
- **Claves cacheadas:** trending, recomendaciones de usuario
- **Thread-safe:** Locks por clave para evitar stampedes

## Gestión de Base de Datos

```bash
# Importar datos desde data-dump/
npm run mongoimport

# Exportar datos actuales
npm run mongoexport
```

El sistema de versionado (`dbmeta.json` / `dbmeta_local.json`) sincroniza automáticamente al iniciar si la versión local está desactualizada.

## Comunicación con Otros Servicios

### Content Service (puerto 5001)

| Operación | Endpoint | Propósito |
|-----------|----------|-----------|
| Obtener álbum | `GET /api/albums/{id}` | Enriquecer trending tracks |
| Obtener artista | `GET /api/artists/{id}` | Enriquecer trending artists, obtener email |
| Buscar por género | `GET /api/albums?genre=X` | Recomendaciones similares |

Todas las llamadas están protegidas por Circuit Breaker y Retry.

## Variables de Entorno

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `PORT` | Puerto del servidor | Sí | — |
| `HOST` | Host de escucha | Sí | — |
| `CORS_ORIGINS` | Orígenes permitidos (coma) | Sí | — |
| `MONGO_URI` | URI de conexión a MongoDB | Sí | — |
| `CONTENT_SERVICE_URL` | URL del Content Service | No | — |
| `SMTP_HOST` | Servidor SMTP | No | — |
| `SMTP_PORT` | Puerto SMTP | No | 587 |
| `SMTP_USER` | Usuario SMTP | No | — |
| `SMTP_PASS` | Contraseña SMTP | No | — |
| `FROM_EMAIL` | Email remitente | No | — |
| `CACHE_MAX_SIZE` | Tamaño máximo del caché | No | 500 |
| `CACHE_DEFAULT_TTL` | TTL del caché en segundos | No | 3600 |
| `SHUTDOWN_TIMEOUT` | Timeout de graceful shutdown | No | 30 |

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| FastAPI | Framework HTTP async |
| Motor | Driver async para MongoDB |
| Pydantic | Validación y serialización |
| aiobreaker | Circuit Breaker async |
| tenacity | Retry con backoff |
| cachetools | Caché TTL in-memory |
| httpx | Cliente HTTP async |
| slowapi | Rate limiting |
| uvicorn | Servidor ASGI |
| psutil | Monitorización de recursos |
| pino (structlog) | Logging estructurado |

## Health Check Response

```json
{
  "status": "ok",
  "service": "stats-service",
  "timestamp": "2025-11-27T12:00:00Z",
  "checks": {
    "mongodb": { "status": "ok" },
    "memory": { "status": "ok", "rss_mb": 128.5 },
    "circuit_breaker": { "status": "ok", "state": "Closed" }
  }
}
```

**Estados posibles:**
- `ok` — Todos los checks pasaron
- `degraded` — Algún componente con problemas
- `error` — Fallo crítico