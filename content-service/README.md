# Content Service — UnderSounds

Microservicio de gestión de contenidos musicales para la plataforma UnderSounds.

## Descripción

El **Content Service** es el núcleo del catálogo musical de UnderSounds. Gestiona álbumes, artistas, pistas de audio, merchandising y noticias. Incluye funcionalidades avanzadas como conversión de audio en tiempo real, descarga de álbumes completos en ZIP y procesamiento de pagos con Stripe.

## Características Principales

### Catálogo Musical
- **Álbumes**: CRUD completo con filtrado por género y límite de resultados
- **Artistas**: Perfiles con biografía, ubicación, redes sociales y conciertos
- **Pistas de audio**: Almacenamiento local con URLs de streaming
- **Valoraciones**: Sistema de ratings y comentarios por álbum

### Gestión de Media
- **Conversión de audio**: MP3, WAV, FLAC mediante FFmpeg
- **Descarga individual**: Pistas en el formato solicitado
- **Descarga de álbumes**: ZIP con todas las pistas convertidas
- **Subida de archivos**: Cover images y archivos de audio vía multipart/form-data

### Merchandising
- **Catálogo de productos**: Vinilos, CDs, cassettes, camisetas
- **Filtrado por tipo**: Categorías numéricas (0-3)
- **Filtrado por artista**: Productos asociados a cada artista

### Noticias Musicales
- **CRUD completo**: Crear, leer, actualizar y eliminar noticias
- **Campos en español**: titulo, body, autor, fechaPublicacion

### Pagos
- **Stripe Checkout**: Creación de sesiones de pago
- **Carrito flexible**: Múltiples items con precio y cantidad
- **URLs configurables**: Success y cancel pages

## Arquitectura

```
content-service/
├── config/
│   ├── db.js                 # Conexión a MongoDB
│   ├── dbmeta.json           # Metadatos de versión compartidos
│   └── dbmeta_local.json     # Versión local de BD
├── controller/
│   ├── AlbumController.js    # Lógica de álbumes y descargas
│   ├── ArtistController.js   # Lógica de artistas
│   ├── MerchandisingController.js  # Lógica de productos
│   └── NewsController.js     # Lógica de noticias
├── middleware/
│   ├── rateLimit.js          # Limitadores de tasa
│   └── verifyServiceKey.js   # Autenticación inter-servicios
├── model/
│   ├── dao/
│   │   ├── AlbumDAO.js       # Acceso a datos de álbumes
│   │   ├── ArtistDAO.js      # Acceso a datos de artistas
│   │   ├── MerchandisingDAO.js
│   │   └── NewsDAO.js
│   ├── dto/
│   │   ├── AlbumDTO.js       # Transferencia de datos
│   │   ├── ArtistDTO.js
│   │   ├── MerchandisingDTO.js
│   │   └── NewsDTO.js
│   ├── factory/
│   │   ├── AlbumFactory.js   # Creación de entidades
│   │   ├── ArtistaFactory.js
│   │   ├── MerchandisingFactory.js
│   │   └── NewsFactory.js
│   └── models/
│       ├── Album.js          # Esquema Mongoose
│       ├── Artistas.js
│       ├── Merchandising.js
│       └── News.js
├── routes/
│   ├── AlbumRoutes.js        # Rutas de álbumes
│   ├── ArtistRoutes.js       # Rutas de artistas
│   ├── MerchandisingRoutes.js
│   └── NewsRoutes.js
├── services/
│   └── AudioConverterService.js  # Conversión FFmpeg
├── utils/
│   └── logger.js             # Logging con Pino
├── assets/
│   ├── images/               # Covers, banners, perfiles
│   └── music/                # Archivos de audio
├── docs/
│   └── Contenidos.yaml       # Especificación OpenAPI
├── data-dump/
│   ├── albums.json           # Álbumes exportados
│   ├── artists.json          # Artistas exportados
│   ├── noticiasMusica.json   # Noticias exportadas
│   ├── tracks.json           # Pistas exportadas
│   └── tshirts.json          # Merchandising exportado
├── view/
│   └── index.html            # Página de bienvenida
└── server.js                 # Punto de entrada
```

## Instalación

### Prerrequisitos
- Node.js 18.x o superior
- MongoDB 5.0 o superior
- FFmpeg (incluido via ffmpeg-static)
- Cuenta de Stripe (para pagos)

### Configuración

1. **Instalar dependencias**:
   ```bash
   cd content-service
   npm install
   ```

2. **Configurar variables de entorno** (`.env`):
   ```env
   # Servidor
   PORT=5001
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173

   # Base de datos
   MONGO_URI=mongodb://localhost:27017/undersounds_content

   # Stripe (pagos)
   STRIPE_SECRET_KEY=sk_test_...

   # Comunicación inter-servicios
   SERVICE_API_KEY=<api_key_compartida>
   ```

3. **Ejecutar el servicio**:
   ```bash
   npm start
   ```

4. **Acceder a la documentación**:
   - Swagger UI: `http://localhost:5001/api-docs`
   - Health check: `http://localhost:5001/healthz`

## API Endpoints

### Álbumes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/albums` | Listar álbumes (filtros: genre, limit) |
| `GET` | `/api/albums/{id}` | Obtener álbum por ID |
| `POST` | `/api/albums` | Crear álbum (multipart/form-data) |
| `PUT` | `/api/albums/{id}` | Actualizar álbum |
| `DELETE` | `/api/albums/{id}` | Eliminar álbum |
| `POST` | `/api/albums/{id}/rate` | Añadir valoración |

### Descargas de Media

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/albums/{id}/download` | Descargar pista (query: trackId, format) |
| `GET` | `/api/albums/{id}/download-album` | Descargar álbum completo en ZIP |

**Formatos soportados:** `mp3`, `wav`, `flac`

### Artistas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/artists` | Listar artistas |
| `GET` | `/api/artists/{id}` | Obtener artista por ID numérico |
| `POST` | `/api/artists` | Crear artista |
| `PUT` | `/api/artists/{id}` | Actualizar artista |
| `DELETE` | `/api/artists/{id}` | Eliminar artista |

### Noticias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/noticias` | Listar noticias |
| `GET` | `/api/noticias/{id}` | Obtener noticia por ID |
| `POST` | `/api/noticias` | Crear noticia |
| `PUT` | `/api/noticias/{id}` | Actualizar noticia |
| `DELETE` | `/api/noticias/{id}` | Eliminar noticia |

### Merchandising

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/merchandising` | Listar todo el merchandising |
| `GET` | `/api/merchandising/{id}` | Obtener producto por ID |
| `GET` | `/api/merchandising/artist/{artistId}` | Productos por artista |
| `POST` | `/api/merchandising` | Crear producto |

### Pagos (Stripe)

| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/create-checkout-session` | Crear sesión de pago | Checkout limiter |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/healthz` | Estado del servicio, MongoDB, memoria, Stripe |

## Modelos de Datos

### Album Schema

```javascript
{
  title: String,              // Título del álbum (requerido)
  artist: ObjectId,           // Referencia al artista (requerido)
  coverImage: String,         // URL de la portada
  price: Number,              // Precio en EUR (requerido)
  releaseYear: Number,        // Año de lanzamiento (requerido)
  genre: String,              // Género musical (requerido)
  tracks: [{
    id: Number,
    title: String,
    duration: String,         // Formato "3:45"
    url: String,              // URL del archivo de audio
    autor: String,
    n_reproducciones: Number,
    price: Number             // Precio individual (default: 0.99)
  }],
  ratings: [{
    userId: String,
    rating: Number,
    comment: String,
    profileImage: String
  }],
  vinyl: Boolean,             // Disponible en vinilo
  cd: Boolean,                // Disponible en CD
  cassettes: Boolean,         // Disponible en cassette
  destacado: Boolean,         // Álbum destacado
  description: String,
  label: String               // Sello discográfico
}
```

### Artist Schema

```javascript
{
  id: Number,                 // ID numérico (requerido)
  name: String,               // Nombre del artista (requerido)
  profileImage: String,       // URL de imagen de perfil
  genre: String,              // Género principal (requerido)
  bio: String,                // Biografía
  banner: String,             // URL de banner
  seguidores: String,         // Contador de seguidores (ej: "2.5M")
  ubicacion: String,          // Ubicación
  albums: [ObjectId],         // Referencias a álbumes
  concerts: [{
    id: Number,
    location: String,
    date: Date,
    time: String,
    venue: String
  }],
  merchandising: [{
    id: Number,
    name: String,
    price: Number,
    merchImage: String,
    description: String
  }],
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  }
}
```

### News Schema

```javascript
{
  id: Number,                 // ID numérico
  titulo: String,             // Título de la noticia (requerido)
  body: String,               // Cuerpo de la noticia (requerido)
  image: String,              // URL de imagen
  fechaPublicacion: Date,     // Fecha de publicación
  autor: String               // Nombre del autor
}
```

### Merchandise Schema

```javascript
{
  id: Number,
  name: String,               // Nombre del producto (requerido)
  price: Number,              // Precio en EUR (requerido)
  image: String,              // URL de imagen
  description: String,
  artistId: Number,           // ID del artista asociado
  type: Number,               // 0: vinyl, 1: cd, 2: cassette, 3: camiseta
  stock: Number               // Cantidad disponible
}
```

## Conversión de Audio

El servicio utiliza FFmpeg para convertir archivos de audio en tiempo real:

| Formato | Códec | Calidad |
|---------|-------|---------|
| MP3 | libmp3lame | Máxima (VBR 0) |
| WAV | pcm_s16le | Sin pérdida |
| FLAC | flac | Sin pérdida |

**Flujo de conversión:**
1. Usuario solicita descarga con formato específico
2. Si el archivo ya está en el formato correcto, se envía directamente
3. Si requiere conversión, FFmpeg procesa el archivo
4. El archivo convertido se almacena temporalmente y se envía
5. El archivo temporal se elimina después del envío

## Gestión de Base de Datos

```bash
# Importar datos desde data-dump/
npm run mongoimport

# Exportar datos actuales
npm run mongoexport
```

El sistema de versionado detecta automáticamente si la base de datos local está desactualizada y ejecuta la importación al iniciar.

## Comunicación con Otros Servicios

### User Service (puerto 5000)
- El User Service crea artistas en este servicio cuando se registra una cuenta `band`
- Autenticación mediante `SERVICE_API_KEY` en header `x-service-key`

### Stats Service (puerto 5002)
- Stats Service consulta este servicio para enriquecer datos de trending
- Endpoints consultados: `/api/albums/{id}`, `/api/artists/{id}`

## Variables de Entorno

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `PORT` | Puerto del servidor | No | 5001 |
| `CORS_ORIGINS` | Orígenes permitidos (coma) | No | localhost:3000 |
| `MONGO_URI` | URI de conexión a MongoDB | Sí | — |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | No | — |
| `SERVICE_API_KEY` | API Key para auth inter-servicios | No | — |

## Seguridad

### Rate Limiting
- **generalLimiter**: Límite general para todas las rutas
- **checkoutLimiter**: Límite específico para checkout de Stripe

### Autenticación Inter-servicios
- Header `x-service-key` para validar llamadas desde otros microservicios
- Middleware `verifyServiceKey` para proteger endpoints internos

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| Express.js | Framework HTTP |
| Mongoose | ODM para MongoDB |
| Multer | Upload de archivos |
| fluent-ffmpeg | Wrapper de FFmpeg |
| ffmpeg-static | Binario de FFmpeg incluido |
| archiver | Creación de archivos ZIP |
| Stripe | Procesamiento de pagos |
| swagger-ui-express | Documentación API |
| pino / pino-http | Logging estructurado |
| compression | Compresión gzip de respuestas |

## Health Check Response

```json
{
  "status": "ok",
  "service": "content-service",
  "timestamp": "2025-11-27T12:00:00.000Z",
  "checks": {
    "mongodb": { "status": "ok" },
    "memory": { 
      "status": "ok", 
      "heap_mb": 64, 
      "rss_mb": 128 
    },
    "stripe": { 
      "status": "ok", 
      "configured": true 
    },
    "uptime": { 
      "status": "ok", 
      "seconds": 3600 
    }
  }
}
```

## Assets Estáticos

Los archivos multimedia se sirven desde el directorio `/assets`:

```
/assets/images/   →  Portadas, banners, perfiles, productos
/assets/music/    →  Archivos de audio (MP3, WAV, FLAC)
```

**URLs de ejemplo:**
- `http://localhost:5001/assets/images/album-cover.jpg`
- `http://localhost:5001/assets/music/track-01.mp3`