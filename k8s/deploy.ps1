###############################################################################
# deploy.ps1 — Equivalente del Makefile para Windows (PowerShell)
# Uso:  .\deploy.ps1 <comando>
#
# Comandos disponibles:
#   deploy-ingress-controller   Instalar Nginx Ingress Controller
#   deploy-metrics-server       Instalar Metrics Server (necesario para HPA)
#   deploy-production           Desplegar entorno de producción
#   deploy-preprod              Desplegar entorno de preproducción
#   deploy-all                  Desplegar ambos entornos
#   deploy-portainer            Instalar Portainer
#   status-production           Ver estado de producción
#   status-preprod              Ver estado de preproducción
#   status-all                  Ver estado de ambos entornos
#   clean-production            Eliminar producción
#   clean-preprod               Eliminar preproducción
#   clean-all                   Eliminar ambos entornos
#   clean-portainer             Eliminar Portainer
#   hosts-check                 Comprobar entradas en el archivo hosts
###############################################################################

param(
    [Parameter(Position = 0)]
    [string]$Command = "help"
)

# ─── Configuración ────────────────────────────────────────────────────────────
$DOCKER_USER = "rgavira123"
$INGRESS_CONTROLLER_URL = "https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml"
$METRICS_SERVER_URL = "https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ─── Funciones auxiliares ─────────────────────────────────────────────────────

function Apply-YamlFolder {
    param([string]$Folder)
    $files = Get-ChildItem -Path "$ScriptDir\$Folder\*.yaml" | Sort-Object Name
    foreach ($f in $files) {
        Write-Host "  Aplicando $($f.Name) ..." -ForegroundColor Cyan
        $content = (Get-Content -Raw $f.FullName) -replace 'DOCKER_USER', $DOCKER_USER
        $content | kubectl apply -f -
    }
}

function Delete-YamlFolder {
    param([string]$Folder)
    $files = Get-ChildItem -Path "$ScriptDir\$Folder\*.yaml" | Sort-Object Name -Descending
    foreach ($f in $files) {
        Write-Host "  Eliminando $($f.Name) ..." -ForegroundColor Yellow
        $content = (Get-Content -Raw $f.FullName) -replace 'DOCKER_USER', $DOCKER_USER
        $content | kubectl delete -f - --ignore-not-found=true 2>$null
    }
}

# ─── Comandos ─────────────────────────────────────────────────────────────────

switch ($Command) {

    "help" {
        Write-Host ""
        Write-Host "=== DO2526-02 — Despliegue en Kubernetes (Windows) ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Uso:  .\deploy.ps1 <comando>"
        Write-Host ""
        Write-Host "Comandos:" -ForegroundColor Cyan
        Write-Host "  deploy-ingress-controller - Instalar Nginx Ingress Controller"
        Write-Host "  deploy-metrics-server     - Instalar Metrics Server (HPA)"
        Write-Host "  deploy-production         - Desplegar produccion"
        Write-Host "  deploy-preprod            - Desplegar preproduccion"
        Write-Host "  deploy-all                - Desplegar ambos entornos"
        Write-Host "  deploy-portainer          - Instalar Portainer"
        Write-Host "  status-production         - Estado de produccion"
        Write-Host "  status-preprod            - Estado de preproduccion"
        Write-Host "  status-all                - Estado de ambos"
        Write-Host "  clean-production          - Eliminar produccion"
        Write-Host "  clean-preprod             - Eliminar preproduccion"
        Write-Host "  clean-all                 - Eliminar ambos"
        Write-Host "  clean-portainer           - Eliminar Portainer"
        Write-Host "  hosts-check               - Comprobar /etc/hosts"
        Write-Host ""
        Write-Host "URLs (requiere hosts configurado):" -ForegroundColor Cyan
        Write-Host "  Produccion:    http://production.localhost"
        Write-Host "  Preproduccion: http://preprod.localhost"
        Write-Host "  Portainer:     http://portainer.localhost"
        Write-Host ""
        Write-Host "Docker Hub user: $DOCKER_USER"
        Write-Host ""
    }

    # ── Ingress Controller ────────────────────────────────────────────────────
    "deploy-ingress-controller" {
        Write-Host ""
        Write-Host "=== Instalando Nginx Ingress Controller ===" -ForegroundColor Green
        kubectl apply -f $INGRESS_CONTROLLER_URL
        Write-Host ""
        Write-Host "Esperando a que el controlador este listo (hasta 120s)..." -ForegroundColor Yellow
        kubectl wait --namespace ingress-nginx `
            --for=condition=ready pod `
            --selector=app.kubernetes.io/component=controller `
            --timeout=120s
        Write-Host ""
        Write-Host "Ingress Controller listo." -ForegroundColor Green
        Write-Host ""
        Write-Host "Recuerda anadir a C:\Windows\System32\drivers\etc\hosts:" -ForegroundColor Yellow
        Write-Host "  127.0.0.1 production.localhost preprod.localhost portainer.localhost"
        Write-Host ""
    }

    # ── Metrics Server (necesario para HPA) ───────────────────────────────────
    "deploy-metrics-server" {
        Write-Host ""
        Write-Host "=== Instalando Metrics Server ===" -ForegroundColor Green
        kubectl apply -f $METRICS_SERVER_URL
        Write-Host ""
        Write-Host "Parcheando Metrics Server para TLS inseguro (necesario en local)..." -ForegroundColor Yellow
        kubectl patch deployment metrics-server -n kube-system --type json `
            -p '[{\"op\": \"add\", \"path\": \"/spec/template/spec/containers/0/args/-\", \"value\": \"--kubelet-insecure-tls\"}]'
        Write-Host ""
        Write-Host "Metrics Server instalado." -ForegroundColor Green
        Write-Host "Esperando a que este listo..."
        kubectl wait --namespace kube-system `
            --for=condition=ready pod `
            --selector=k8s-app=metrics-server `
            --timeout=120s
        Write-Host "Metrics Server listo." -ForegroundColor Green
        Write-Host ""
    }

    # ── Deploy ────────────────────────────────────────────────────────────────
    "deploy-production" {
        Write-Host ""
        Write-Host "=== Desplegando entorno de PRODUCCION ===" -ForegroundColor Green
        Apply-YamlFolder "production"
        Write-Host ""
        Write-Host "Produccion desplegada -> http://production.localhost" -ForegroundColor Green
        Write-Host ""
    }

    "deploy-preprod" {
        Write-Host ""
        Write-Host "=== Desplegando entorno de PREPRODUCCION ===" -ForegroundColor Green
        Apply-YamlFolder "preprod"
        Write-Host ""
        Write-Host "Preproduccion desplegada -> http://preprod.localhost" -ForegroundColor Green
        Write-Host ""
    }

    "deploy-all" {
        Write-Host ""
        Write-Host "=== Desplegando AMBOS entornos ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "--- PRODUCCION ---" -ForegroundColor Cyan
        Apply-YamlFolder "production"
        Write-Host ""
        Write-Host "--- PREPRODUCCION ---" -ForegroundColor Cyan
        Apply-YamlFolder "preprod"
        Write-Host ""
        Write-Host "Ambos entornos desplegados." -ForegroundColor Green
        Write-Host "  Produccion:    http://production.localhost"
        Write-Host "  Preproduccion: http://preprod.localhost"
        Write-Host ""
    }

    "deploy-portainer" {
        Write-Host ""
        Write-Host "=== Instalando Portainer ===" -ForegroundColor Green
        Apply-YamlFolder "portainer"
        Write-Host ""
        Write-Host "Portainer desplegado -> http://portainer.localhost" -ForegroundColor Green
        Write-Host "IMPORTANTE: Tienes 5 minutos para crear el usuario admin." -ForegroundColor Yellow
        Write-Host ""
    }

    # ── Status ────────────────────────────────────────────────────────────────
    "status-production" {
        Write-Host ""
        Write-Host "=== Estado PRODUCCION ===" -ForegroundColor Green
        Write-Host "--- Pods ---" -ForegroundColor Cyan
        kubectl get pods -n production
        Write-Host "--- Services ---" -ForegroundColor Cyan
        kubectl get services -n production
        Write-Host "--- Deployments ---" -ForegroundColor Cyan
        kubectl get deployments -n production
        Write-Host "--- HPA ---" -ForegroundColor Cyan
        kubectl get hpa -n production
        Write-Host "--- Ingress ---" -ForegroundColor Cyan
        kubectl get ingress -n production
        Write-Host "--- PV / PVC ---" -ForegroundColor Cyan
        kubectl get pv mongodb-pv-production 2>$null
        kubectl get pvc -n production
        Write-Host ""
    }

    "status-preprod" {
        Write-Host ""
        Write-Host "=== Estado PREPRODUCCION ===" -ForegroundColor Green
        Write-Host "--- Pods ---" -ForegroundColor Cyan
        kubectl get pods -n preprod
        Write-Host "--- Services ---" -ForegroundColor Cyan
        kubectl get services -n preprod
        Write-Host "--- Deployments ---" -ForegroundColor Cyan
        kubectl get deployments -n preprod
        Write-Host "--- HPA ---" -ForegroundColor Cyan
        kubectl get hpa -n preprod
        Write-Host "--- Ingress ---" -ForegroundColor Cyan
        kubectl get ingress -n preprod
        Write-Host ""
    }

    "status-all" {
        & $MyInvocation.MyCommand.Path "status-production"
        & $MyInvocation.MyCommand.Path "status-preprod"
    }

    # ── Clean ─────────────────────────────────────────────────────────────────
    "clean-production" {
        Write-Host ""
        Write-Host "=== Eliminando entorno PRODUCCION ===" -ForegroundColor Yellow
        Delete-YamlFolder "production"
        kubectl delete pv mongodb-pv-production --ignore-not-found=true 2>$null
        Write-Host "Produccion eliminada." -ForegroundColor Green
        Write-Host ""
    }

    "clean-preprod" {
        Write-Host ""
        Write-Host "=== Eliminando entorno PREPRODUCCION ===" -ForegroundColor Yellow
        Delete-YamlFolder "preprod"
        Write-Host "Preproduccion eliminada." -ForegroundColor Green
        Write-Host ""
    }

    "clean-all" {
        & $MyInvocation.MyCommand.Path "clean-production"
        & $MyInvocation.MyCommand.Path "clean-preprod"
    }

    "clean-portainer" {
        Write-Host ""
        Write-Host "=== Eliminando Portainer ===" -ForegroundColor Yellow
        Delete-YamlFolder "portainer"
        kubectl delete namespace portainer --ignore-not-found=true 2>$null
        Write-Host "Portainer eliminado." -ForegroundColor Green
        Write-Host ""
    }

    # ── Hosts check ───────────────────────────────────────────────────────────
    "hosts-check" {
        Write-Host ""
        $hostsFile = "C:\Windows\System32\drivers\etc\hosts"
        $content = Get-Content $hostsFile -ErrorAction SilentlyContinue
        $needed = @("production.localhost", "preprod.localhost", "portainer.localhost")
        $missing = @()
        foreach ($h in $needed) {
            if (-not ($content | Select-String -SimpleMatch $h -Quiet)) {
                $missing += $h
            }
        }
        if ($missing.Count -eq 0) {
            Write-Host "Todas las entradas de hosts estan configuradas." -ForegroundColor Green
        } else {
            Write-Host "Faltan las siguientes entradas en $hostsFile :" -ForegroundColor Yellow
            Write-Host "  127.0.0.1 $($missing -join ' ')"
            Write-Host ""
            Write-Host "Anade esta linea al fichero hosts (ejecutar como Administrador):" -ForegroundColor Yellow
            Write-Host "  Add-Content $hostsFile '127.0.0.1 $($missing -join ' ')'"
        }
        Write-Host ""
    }

    default {
        Write-Host "Comando desconocido: $Command" -ForegroundColor Red
        Write-Host "Ejecuta '.\deploy.ps1 help' para ver los comandos disponibles."
    }
}
