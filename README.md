# DO2526-02 — Despliegue Unificado de Microservicios

Integración de las APIs del grupo en un despliegue unificado con Docker Compose.

## Microservicios incluidos

| API | Puerto | Autor | Swagger |
|---|---|---|---|
| Employees | 8001 | rgavira123 | http://localhost:8001/docs |
| Flights | 8002 | rafpulcif | http://localhost:8002/docs |
| SpaceMissions | 8003 | Danielruizlopezcc | http://localhost:8003/docs |

**Frontend unificado**: http://localhost:3000

## Requisitos

- Docker y Docker Compose

## Despliegue local

```bash
# Construir y arrancar todos los servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Estructura del proyecto

```
DO2526-02/
├── docker-compose.yml          # Orquestación de todos los servicios
├── employees-api/              # API de Empleados (rgavira123)
│   ├── index.js
│   ├── db.js
│   ├── logger.js
│   ├── controllers/
│   ├── services/
│   ├── api/oas-doc.yaml
│   ├── Dockerfile
│   └── package.json
├── flights-api/                # API de Vuelos (rafpulcif)
│   ├── index.js
│   ├── data/db.js
│   ├── logger.js
│   ├── controllers/
│   ├── services/
│   ├── api/oas-doc.yaml
│   ├── Dockerfile
│   └── package.json
├── spacemissions-api/          # API de Misiones Espaciales (Danielruizlopezcc)
│   ├── index.js
│   ├── db.js
│   ├── logger.js
│   ├── controllers/
│   ├── services/
│   ├── api/oas-doc.yaml
│   ├── Dockerfile
│   └── package.json
└── frontend/                   # Frontend unificado
    ├── index.html
    ├── app.js
    ├── styles.css
    ├── nginx.conf
    └── Dockerfile
```