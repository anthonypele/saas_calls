# Conversaciones MVP

MVP para ver conversaciones desde PostgreSQL/Supabase con frontend en Vercel y backend Express compatible con Cloud Run.

## Funcionalidad

- Pagina `/conversaciones` con tabla en estilo oscuro.
- Backend `GET /api/conversations`.
- Lectura directa de la tabla PostgreSQL/Supabase `conversations`.
- Estados de carga, tabla vacia y error claro.
- Sin auth, IA, carga de audio ni datos mock para conversaciones.

## Columnas esperadas

| Base de datos | Frontend |
| --- | --- |
| `fecha` | Fecha |
| `duracion_segundos` | Duracion |
| `telefono` | Telefono |
| `agente` | Agente |
| `deudor` | Deudor |
| `sentimiento` | Sentimiento |
| `puntaje` | Puntaje |
| `interes_pago` | Interes en Pago |
| `falta_recursos` | Falta de recursos |
| `actitud_deudor` | Actitud del Deudor |
| `actitud_agente` | Actitud del Agente |

## Variables de entorno

Backend:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
CLIENT_URL=http://localhost:5173
PORT=3001
```

Frontend:

```bash
VITE_API_URL=http://localhost:3001
```

En Vercel, `VITE_API_URL` debe apuntar al servicio de Cloud Run. En Cloud Run, `DATABASE_URL` debe apuntar a PostgreSQL/Supabase.

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173/conversaciones`.

## Base de datos

Crear tabla:

```bash
npm run db:setup
```

Insertar datos de ejemplo en la base de datos:

```bash
npm run db:seed
```

## Verificacion

```bash
npm run build
curl http://localhost:3001/health
curl http://localhost:3001/api/conversations
```
