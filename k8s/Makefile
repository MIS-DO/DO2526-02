.PHONY: help build-all push-all \
        deploy-production deploy-preprod deploy-all \
        status-production status-preprod status-all \
        logs-production logs-preprod \
        clean-production clean-preprod clean-all

# ─── Edita esta variable una sola vez ─────────────────────────────────────────
DOCKER_USER  = rafapulido03
# ──────────────────────────────────────────────────────────────────────────────

PROD_PORT    = 30080
PREPROD_PORT = 30081

help:
	@echo "Despliegue de DO2526-02 en Kubernetes - Dos entornos"
	@echo ""
	@echo "Construccion:"
	@echo "  make build-all               - Construir todas las imagenes Docker"
	@echo "  make push-all                - Subir todas las imagenes a Docker Hub"
	@echo ""
	@echo "Despliegue:"
	@echo "  make deploy-production       - Desplegar entorno de produccion"
	@echo "  make deploy-preprod          - Desplegar entorno de preproduccion"
	@echo "  make deploy-all              - Desplegar ambos entornos"
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
	@echo "Limpieza:"
	@echo "  make clean-production"
	@echo "  make clean-preprod"
	@echo "  make clean-all"
	@echo ""
	@echo "URLs de acceso:"
	@echo "  Produccion:    http://localhost:$(PROD_PORT)"
	@echo "  Preproduccion: http://localhost:$(PREPROD_PORT)"
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

# ─── Deploy ───────────────────────────────────────────────────────────────────

deploy-production:
	@echo "=== Desplegando entorno de PRODUCCION ==="
	@for f in production/*.yaml; do \
		sed "s|DOCKER_USER|$(DOCKER_USER)|g" $$f | kubectl apply -f -; \
	done
	@echo ""
	@echo "Produccion desplegada. Acceso en: http://localhost:$(PROD_PORT)"
	@echo "Comprueba el estado con: make status-production"

deploy-preprod:
	@echo "=== Desplegando entorno de PREPRODUCCION ==="
	@for f in preprod/*.yaml; do \
		sed "s|DOCKER_USER|$(DOCKER_USER)|g" $$f | kubectl apply -f -; \
	done
	@echo ""
	@echo "Preproduccion desplegada. Acceso en: http://localhost:$(PREPROD_PORT)"
	@echo "Comprueba el estado con: make status-preprod"

deploy-all: deploy-production deploy-preprod
	@echo ""
	@echo "=== Ambos entornos desplegados ==="
	@echo "  Produccion:    http://localhost:$(PROD_PORT)"
	@echo "  Preproduccion: http://localhost:$(PREPROD_PORT)"

# ─── Status ───────────────────────────────────────────────────────────────────

status-production:
	@echo "=== Estado PRODUCCION ==="
	@echo "--- Pods ---"
	kubectl get pods -n production
	@echo "--- Services ---"
	kubectl get services -n production
	@echo "--- Deployments ---"
	kubectl get deployments -n production
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
