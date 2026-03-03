# DO2526-02 — Despliegue Unificado de Microservicios

Integración de las APIs del grupo en un despliegue unificado con Docker Compose y Kubernetes.

## Microservicios incluidos

| API | Puerto | Autor | Swagger |
|---|---|---|---|
| Employees | 8001 | rgavira123 | http://localhost:8001/docs |
| Flights | 8002 | rafpulcif | http://localhost:8002/docs |
| SpaceMissions | 8003 | Danielruizlopezcc | http://localhost:8003/docs |

**Frontend unificado**: http://localhost:3000

## Requisitos

- Docker y Docker Compose
- Kubernetes (Docker Desktop o similar) + kubectl — solo para despliegue en K8s
- Cuenta en Docker Hub — solo para despliegue en K8s

---

## Despliegue local con Docker Compose

```bash
docker-compose up --build -d
docker-compose logs -f
docker-compose down
```

---

## Despliegue en Kubernetes

Dos entornos independientes desplegados en namespaces separados:

| Entorno | URL |
|---|---|
| Producción | http://localhost:30080 |
| Preproducción | http://localhost:30081 |

### Configuración previa

Editar `k8s/Makefile` y establecer el usuario de Docker Hub:

```makefile
DOCKER_USER = tu-usuario-dockerhub
```

### Comandos

```bash
cd k8s/

make push-all          # Construir y subir imágenes a Docker Hub
make deploy-all        # Desplegar ambos entornos
make status-all        # Ver estado de los pods y servicios
make logs-production   # Ver logs del entorno de producción
make logs-preprod      # Ver logs del entorno de preproducción
make clean-all         # Eliminar ambos entornos
```

### Estructura de manifests

```
k8s/
├── Makefile
├── production/        # Namespace: production — NodePort 30080
│   ├── 00-namespace.yaml
│   ├── 01-mongodb-pv.yaml
│   ├── 02-mongodb-pvc.yaml
│   ├── 03-mongodb-deployment.yaml
│   ├── 04-mongodb-service.yaml
│   ├── 05-employees-api-deployment.yaml
│   ├── 06-employees-api-service.yaml
│   ├── 07-flights-api-deployment.yaml
│   ├── 08-flights-api-service.yaml
│   ├── 09-spacemissions-api-deployment.yaml
│   ├── 10-spacemissions-api-service.yaml
│   ├── 11-search-api-deployment.yaml
│   ├── 12-search-api-service.yaml
│   ├── 13-frontend-configmap.yaml
│   ├── 14-frontend-deployment.yaml
│   └── 15-frontend-service.yaml
└── preprod/           # Namespace: preprod — NodePort 30081
    └── (misma estructura)
```
