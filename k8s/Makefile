.PHONY: help build-all push-all \
        deploy-ingress-controller \
        deploy-production deploy-preprod deploy-all \
        status-production status-preprod status-all \
        logs-production logs-preprod \
        deploy-portainer portainer-url clean-portainer \
        clean-production clean-preprod clean-all

# ─── Edita esta variable una sola vez ─────────────────────────────────────────
DOCKER_USER  = rgavira123
# ──────────────────────────────────────────────────────────────────────────────

INGRESS_CONTROLLER_URL = https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml
METRICS_SERVER_URL = https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

help:
	@echo "Despliegue de DO2526-02 en Kubernetes - Dos entornos"
	@echo ""
	@echo "Construccion:"
	@echo "  make build-all                   - Construir todas las imagenes Docker"
	@echo "  make push-all                    - Subir todas las imagenes a Docker Hub"
	@echo ""
	@echo "Despliegue (primera vez: instalar el controlador primero):"
	@echo "  make deploy-ingress-controller   - Instalar nginx Ingress Controller"
	@echo "  make deploy-metrics-server       - Instalar Metrics Server (necesario para HPA)"
	@echo "  make deploy-production           - Desplegar entorno de produccion"
	@echo "  make deploy-preprod              - Desplegar entorno de preproduccion"
	@echo "  make deploy-all                  - Desplegar ambos entornos"
	@echo ""
	@echo "Estado:"
	@echo "  make status-production"
	@echo "  make status-preprod"
	@echo "  make status-all"
	@echo ""
	@echo "Logs:"
	@echo "  make logs-production"
	@echo "  make logs-preprod"
	@echo ""
	@echo "Portainer:"
	@echo "  make deploy-portainer            - Instalar Portainer"
	@echo "  make portainer-url               - Mostrar URL de Portainer"
	@echo "  make clean-portainer             - Eliminar Portainer"
	@echo ""
	@echo "Limpieza:"
	@echo "  make clean-production"
	@echo "  make clean-preprod"
	@echo "  make clean-all"
	@echo ""
	@echo "URLs de acceso (requiere /etc/hosts en local):"
	@echo "  Produccion:    http://production.localhost"
	@echo "  Preproduccion: http://preprod.localhost"
	@echo "  Portainer:     http://portainer.localhost"
	@echo ""
	@echo "Docker Hub: $(DOCKER_USER)"

# ─── Build ────────────────────────────────────────────────────────────────────

build-all:
	@echo "Construyendo imagenes..."
	cd ../employees-api    && docker build -t $(DOCKER_USER)/employees-api:latest .
	cd ../flights-api      && docker build -t $(DOCKER_USER)/flights-api:latest .
	cd ../spacemissions-api && docker build -t $(DOCKER_USER)/spacemissions-api:latest .
	cd ../search-api       && docker build -t $(DOCKER_USER)/search-api:latest .
	cd ../frontend         && docker build -t $(DOCKER_USER)/do2526-frontend:latest .
	@echo "Todas las imagenes construidas."

# ─── Push ─────────────────────────────────────────────────────────────────────

push-all: build-all
	@echo "Subiendo imagenes a Docker Hub..."
	docker push $(DOCKER_USER)/employees-api:latest
	docker push $(DOCKER_USER)/flights-api:latest
	docker push $(DOCKER_USER)/spacemissions-api:latest
	docker push $(DOCKER_USER)/search-api:latest
	docker push $(DOCKER_USER)/do2526-frontend:latest
	@echo "Todas las imagenes subidas."

# ─── Ingress Controller ───────────────────────────────────────────────────────

deploy-ingress-controller:
	@echo "=== Instalando nginx Ingress Controller ==="
	kubectl apply -f $(INGRESS_CONTROLLER_URL)
	@echo ""
	@echo "Esperando a que el controlador este listo..."
	kubectl wait --namespace ingress-nginx \
		--for=condition=ready pod \
		--selector=app.kubernetes.io/component=controller \
		--timeout=120s
	@echo "Ingress Controller listo."
	@echo ""
	@echo "Recuerda añadir a /etc/hosts:"
	@echo "  127.0.0.1 production.localhost preprod.localhost portainer.localhost"

deploy-metrics-server:
	@echo "=== Instalando Metrics Server ==="
	kubectl apply -f $(METRICS_SERVER_URL)
	@echo "Parcheando Metrics Server para permitir TLS inseguro (necesario en local)..."
	kubectl patch deployment metrics-server -n kube-system --type 'json' -p '[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
	@echo "Metrics Server instalado."

# ─── Deploy ───────────────────────────────────────────────────────────────────

deploy-production:
	@echo "=== Desplegando entorno de PRODUCCION ==="
	@for f in production/*.yaml; do \
		sed "s|DOCKER_USER|$(DOCKER_USER)|g" $$f | kubectl apply -f -; \
	done
	@echo ""
	@echo "Produccion desplegada. Acceso en: http://production.localhost"
	@echo "Comprueba el estado con: make status-production"

deploy-preprod:
	@echo "=== Desplegando entorno de PREPRODUCCION ==="
	@for f in preprod/*.yaml; do \
		sed "s|DOCKER_USER|$(DOCKER_USER)|g" $$f | kubectl apply -f -; \
	done
	@echo ""
	@echo "Preproduccion desplegada. Acceso en: http://preprod.localhost"
	@echo "Comprueba el estado con: make status-preprod"

deploy-all: deploy-production deploy-preprod
	@echo ""
	@echo "=== Ambos entornos desplegados ==="
	@echo "  Produccion:    http://production.localhost"
	@echo "  Preproduccion: http://preprod.localhost"

# ─── Status ───────────────────────────────────────────────────────────────────

status-production:
	@echo "=== Estado PRODUCCION ==="
	@echo "--- Pods ---"
	kubectl get pods -n production
	@echo "--- Services ---"
	kubectl get services -n production
	@echo "--- Deployments ---"
	kubectl get deployments -n production
	@echo "--- HorizontalPodAutoscalers (HPA) ---"
	kubectl get hpa -n production
	@echo "--- Ingress ---"
	kubectl get ingress -n production
	@echo "--- PV / PVC ---"
	kubectl get pv mongodb-pv-production 2>/dev/null; kubectl get pvc -n production

status-preprod:
	@echo "=== Estado PREPRODUCCION ==="
	@echo "--- Pods ---"
	kubectl get pods -n preprod
	@echo "--- Services ---"
	kubectl get services -n preprod
	@echo "--- Deployments ---"
	kubectl get deployments -n preprod
	@echo "--- HorizontalPodAutoscalers (HPA) ---"
	kubectl get hpa -n preprod
	@echo "--- Ingress ---"
	kubectl get ingress -n preprod

status-all: status-production status-preprod

# ─── Logs ─────────────────────────────────────────────────────────────────────

logs-production:
	@for svc in mongodb-pod employees-api-pod flights-api-pod spacemissions-api-pod search-api-pod frontend-pod; do \
		echo "=== $$svc ==="; \
		kubectl logs -l app=$$svc -n production --tail=30 2>/dev/null; \
		echo ""; \
	done

logs-preprod:
	@for svc in mongodb-pod employees-api-pod flights-api-pod spacemissions-api-pod search-api-pod frontend-pod; do \
		echo "=== $$svc ==="; \
		kubectl logs -l app=$$svc -n preprod --tail=30 2>/dev/null; \
		echo ""; \
	done

# ─── Portainer ────────────────────────────────────────────────────────────────

deploy-portainer:
	@echo "=== Instalando Portainer ==="
	@for f in portainer/*.yaml; do \
		kubectl apply -f $$f; \
	done
	@echo ""
	@echo "Portainer desplegado."
	@echo "Ejecuta 'make portainer-url' para la URL de acceso."
	@echo "IMPORTANTE: tienes 5 minutos para crear el usuario admin en la UI."

portainer-url:
	@echo "Portainer: http://portainer.localhost"

clean-portainer:
	@echo "=== Eliminando Portainer ==="
	kubectl delete -f portainer/ --ignore-not-found=true
	kubectl delete namespace portainer --ignore-not-found=true
	@echo "Portainer eliminado."

# ─── Clean ────────────────────────────────────────────────────────────────────

clean-production:
	@echo "=== Eliminando entorno PRODUCCION ==="
	kubectl delete -f production/ --ignore-not-found=true
	kubectl delete pv mongodb-pv-production --ignore-not-found=true
	@echo "Entorno de produccion eliminado."

clean-preprod:
	@echo "=== Eliminando entorno PREPRODUCCION ==="
	kubectl delete -f preprod/ --ignore-not-found=true
	@echo "Entorno de preproduccion eliminado."

clean-all: clean-production clean-preprod
	@echo "Todos los entornos eliminados."
