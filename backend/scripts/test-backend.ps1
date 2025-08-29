# 1) Login
$body = @{ email = "victorge08@gmail.com"; password = "123456" } | ConvertTo-Json
$login = Invoke-RestMethod -Method POST "http://localhost:5012/api/auth/login" -ContentType "application/json" -Body $body

# 2) Token y header
$token = $login.token
$token
$H = @{ Authorization = "Bearer $token" }

# 3) Validar sesión
Invoke-RestMethod -Method GET "http://localhost:5012/api/auth/me" -Headers $H


Invoke-RestMethod -Method GET "http://localhost:5012/api/componentes?page=1&pageSize=10&sortBy=componente&sortDir=asc" -Headers $H


Invoke-RestMethod -Method GET "http://localhost:5012/api/componentes?limit=10&offset=0&q=mut" -Headers $H


$resp = Invoke-RestMethod -Method GET "http://localhost:5012/api/componentes?page=1&pageSize=10" -Headers $H
$resp | ConvertTo-Json -Depth 5


$resp.items | Format-Table id_componente, componente, fecha_auditoria -AutoSize




# =========================
# Configuración base
# =========================
$base = "http://localhost:5012/api"

# Credenciales (reemplaza por un usuario válido de tu BD)
$loginBody = @{
  email    = "tu_usuario@dominio.com"
  password = "tu_password"
} | ConvertTo-Json

# =========================
# 1) Login -> Token
# =========================
try {
  $login = Invoke-RestMethod -Method POST "$base/auth/login" `
    -ContentType "application/json" `
    -Body $loginBody
} catch {
  Write-Error "Fallo login: $($_.Exception.Message)"
  throw
}

$token = $login.token
if (-not $token) { throw "No se recibió token en /auth/login" }
$H = @{ Authorization = "Bearer $token" }

# Mostrar token (opcional)
$token

# =========================
# 2) Verificar sesión
# =========================
try {
  $me = Invoke-RestMethod -Method GET "$base/auth/me" -Headers $H
  "Usuario autenticado: $($me.email) (id: $($me.id_user))"
} catch {
  Write-Error "Fallo /auth/me: $($_.Exception.Message)"
  throw
}

# =========================
# 3) Probar listado de COMPONENTES (GET /componentes)
#    Parámetros: q, page, pageSize, sortBy, sortDir
# =========================
$qParams = @{
  q         = ""           # filtro por nombre (opcional)
  page      = 1
  pageSize  = 100
  sortBy    = "componente" # id_componente | componente | fecha_auditoria
  sortDir   = "asc"        # asc | desc
}

# Construir query string
$qs = ($qParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"

try {
  $componentes = Invoke-RestMethod -Method GET "$base/componentes?$qs" -Headers $H
  "Total componentes: $($componentes.total)"
  $componentes.items | Format-Table id_componente, componente, fecha_auditoria -AutoSize
} catch {
  Write-Error "Fallo GET /componentes: $($_.Exception.Message)"
  throw
}
