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

Dos entornos independientes desplegados en namespaces separados, accesibles vía Nginx Ingress Controller:

| Entorno | URL |
|---|---|
| Producción | http://production.localhost |
| Preproducción | http://preprod.localhost |
| Portainer | http://portainer.localhost |

Los datos de producción persisten entre reinicios. Los datos de preproducción son efímeros (se eliminan al apagar los pods).

### Configuración previa

**1. Editar `k8s/Makefile`** y establecer el usuario de Docker Hub:

```makefile
DOCKER_USER = tu-usuario-dockerhub
```

**2. Añadir entradas a `/etc/hosts`** (solo entorno local):

```
127.0.0.1 production.localhost preprod.localhost portainer.localhost
```

### Primera vez (orden de ejecución)

```bash
cd k8s/

make push-all                  # Construir y subir imágenes a Docker Hub
make deploy-ingress-controller # Instalar Nginx Ingress Controller
make deploy-all                # Desplegar producción y preproducción
make deploy-portainer          # Instalar Portainer (opcional)
```

### Comandos

```bash
make build-all         # Construir imágenes Docker
make push-all          # Construir y subir imágenes a Docker Hub

make deploy-all        # Desplegar ambos entornos
make deploy-production # Desplegar solo producción
make deploy-preprod    # Desplegar solo preproducción

make status-all        # Ver estado de pods, servicios e ingress
make logs-production   # Ver logs del entorno de producción
make logs-preprod      # Ver logs del entorno de preproducción

make clean-all         # Eliminar ambos entornos
make clean-production  # Eliminar solo producción
make clean-preprod     # Eliminar solo preproducción

make deploy-portainer  # Instalar Portainer
make portainer-url     # Mostrar URL de Portainer
make clean-portainer   # Eliminar Portainer
```

### Portainer

Portainer actúa como panel de control del clúster con autenticación usuario/contraseña.

Tras ejecutar `make deploy-portainer`, acceder a http://portainer.localhost y crear el usuario administrador en los primeros 5 minutos.

### Estructura de manifests

```
k8s/
├── Makefile
├── production/        # Namespace: production
│   ├── 00-namespace.yaml
│   ├── 01-mongodb-pv.yaml       # PersistentVolume (datos persistentes)
│   ├── 02-mongodb-pvc.yaml
│   ├── 03-mongodb-deployment.yaml
│   ├── 04-mongodb-service.yaml
│   ├── 05-15-*.yaml             # APIs, frontend (deployments + services)
│   └── 16-ingress.yaml          # Ingress → production.localhost
├── preprod/           # Namespace: preprod
│   ├── 00-namespace.yaml
│   ├── 03-mongodb-deployment.yaml  # emptyDir (datos efímeros)
│   ├── 04-15-*.yaml             # APIs, frontend (deployments + services)
│   └── 16-ingress.yaml          # Ingress → preprod.localhost
└── portainer/         # Namespace: portainer
    ├── 01-namespace.yaml
    ├── 02-serviceaccount.yaml
    ├── 03-clusterrolebinding.yaml
    ├── 04-pvc.yaml
    ├── 05-deployment.yaml
    ├── 06-service.yaml
    └── 07-ingress.yaml          # Ingress → portainer.localhost
```
