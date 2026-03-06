###############################################################################
# load-test.ps1 - Script de prueba de carga con BusyBox para demo HPA
#
# Uso:
#   .\load-test.ps1 start       -> Lanza pods BusyBox que generan carga
#   .\load-test.ps1 start-one <api>  -> Lanza carga solo contra una API
#                                       (employees|flights|spacemissions)
#   .\load-test.ps1 status      -> Muestra estado de los HPA y pods
#   .\load-test.ps1 stop        -> Elimina los pods de carga
#
###############################################################################

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "start-one", "status", "stop")]
    [string]$Action = "start",

    [Parameter(Position=1)]
    [string]$Api = ""
)

$NAMESPACE = "production"
# Numero de pods de carga por API (mas pods = mas carga)
$PODS_PER_API = 1
# Numero de procesos wget paralelos DENTRO de cada pod
$PARALLEL_WORKERS = 5

# Definicion de las APIs a testear
$APIs = @(
    @{ Name = "employees-api";     Endpoint = "/api/v1/employees" },
    @{ Name = "flights-api";       Endpoint = "/api/v1/flight" },
    @{ Name = "spacemissions-api"; Endpoint = "/api/v1/spacemissions" }
)

function Start-LoadTest {
    param([array]$TargetAPIs)

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  INICIANDO PRUEBA DE CARGA (BusyBox)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    foreach ($api in $TargetAPIs) {
        $name = $api.Name
        $endpoint = $api.Endpoint
        $url = "http://${name}:8080${endpoint}"

        Write-Host "[+] Lanzando carga contra $name -> $url" -ForegroundColor Yellow
        Write-Host "    $PODS_PER_API pods x $PARALLEL_WORKERS workers = $($PODS_PER_API * $PARALLEL_WORKERS) conexiones simultaneas" -ForegroundColor White

        for ($i = 1; $i -le $PODS_PER_API; $i++) {
            $podName = "load-test-$name-$i"

            # Eliminar pod anterior si existe
            kubectl delete pod $podName -n $NAMESPACE --ignore-not-found 2>$null | Out-Null

            # Lanzar pod BusyBox con multiples procesos wget en paralelo
            # Cada worker es un bucle infinito de wget ejecutado en background (&)
            $cmd = "for i in `$(seq 1 $PARALLEL_WORKERS); do while true; do wget -q -O- $url > /dev/null 2>&1; done & done; wait"

            kubectl run $podName `
                --namespace=$NAMESPACE `
                --image=busybox:1.36 `
                --restart=Never `
                -- /bin/sh -c $cmd

            Write-Host "    Pod '$podName' creado" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CARGA EN MARCHA" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Los pods BusyBox estan generando peticiones continuas." -ForegroundColor White
    Write-Host "El HPA tardara ~1-2 min en reaccionar y escalar." -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos utiles:" -ForegroundColor Magenta
    Write-Host "  .\load-test.ps1 status   -> Ver estado de HPA y replicas" -ForegroundColor White
    Write-Host "  .\load-test.ps1 stop     -> Parar la prueba de carga" -ForegroundColor White
    Write-Host ""
    Write-Host "Para monitorizar en tiempo real:" -ForegroundColor Magenta
    Write-Host "  kubectl get hpa -n production -w" -ForegroundColor White
    Write-Host ""
}

function Show-Status {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ESTADO DE HPA Y PODS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "--- HPA (Horizontal Pod Autoscaler) ---" -ForegroundColor Yellow
    kubectl get hpa -n $NAMESPACE
    Write-Host ""

    Write-Host "--- Pods de las APIs ---" -ForegroundColor Yellow
    kubectl get pods -n $NAMESPACE -l "app in (employees-api-pod,flights-api-pod,spacemissions-api-pod)" -o wide
    Write-Host ""

    Write-Host "--- Pods de carga (BusyBox) ---" -ForegroundColor Yellow
    kubectl get pods -n $NAMESPACE -l "run in (load-test-employees-api,load-test-flights-api,load-test-spacemissions-api)" -o wide 2>$null
    # Tambien buscar por nombre directamente
    kubectl get pods -n $NAMESPACE | Select-String "load-test"
    Write-Host ""

    Write-Host "--- Top pods (consumo CPU/Memoria) ---" -ForegroundColor Yellow
    kubectl top pods -n $NAMESPACE 2>$null
    Write-Host ""
}

function Stop-LoadTest {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  PARANDO PRUEBA DE CARGA" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    foreach ($api in $APIs) {
        for ($i = 1; $i -le $PODS_PER_API; $i++) {
            $podName = "load-test-$($api.Name)-$i"
            Write-Host "[-] Eliminando pod $podName..." -ForegroundColor Yellow
            kubectl delete pod $podName -n $NAMESPACE --ignore-not-found
        }
    }

    Write-Host ""
    Write-Host "Pods de carga eliminados." -ForegroundColor Green
    Write-Host "Los pods escalados tardaran ~5 min en reducirse (cooldown del HPA)." -ForegroundColor White
    Write-Host ""
}

# --- Main ---
switch ($Action) {
    "start" {
        Start-LoadTest -TargetAPIs $APIs
    }
    "start-one" {
        if ([string]::IsNullOrEmpty($Api)) {
            Write-Host "Especifica la API: employees, flights o spacemissions" -ForegroundColor Red
            Write-Host "Ejemplo: .\load-test.ps1 start-one employees" -ForegroundColor White
            exit 1
        }
        $target = $APIs | Where-Object { $_.Name -like "*$Api*" }
        if ($null -eq $target) {
            Write-Host "API '$Api' no encontrada. Opciones: employees, flights, spacemissions" -ForegroundColor Red
            exit 1
        }
        Start-LoadTest -TargetAPIs @($target)
    }
    "status" {
        Show-Status
    }
    "stop" {
        Stop-LoadTest
    }
}
