#!/usr/bin/env pwsh

# Script para reemplazar console.log con axyraLogger
# Uso: ./replace-console-logs.ps1

$targetDirectory = "frontend\js"
$jsFiles = Get-ChildItem -Path $targetDirectory -Filter "*.js" -Recurse

$replacementCount = 0
$filesModified = 0

Write-Host "🔄 Iniciando reemplazo de console.log..." -ForegroundColor Cyan
Write-Host "Directorio objetivo: $targetDirectory`n" -ForegroundColor Gray

foreach ($file in $jsFiles) {
    $originalContent = Get-Content -Path $file.FullName -Raw
    $modifiedContent = $originalContent
    
    # Contadores por archivo
    $fileCount = 0
    
    # Reemplazo 1: console.log('mensaje con emoji')
    $pattern1 = "console\.log\('([^']+)'\)"
    $replacements1 = $modifiedContent | Select-String -Pattern $pattern1 -AllMatches
    if ($replacements1) {
        $modifiedContent = $modifiedContent -replace "console\.log\('([^']+)'\)", "axyraLogger.log('APP', `$1)"
        $fileCount += ($replacements1.Matches.Count)
    }
    
    # Reemplazo 2: console.log("mensaje")
    $pattern2 = 'console\.log\("([^"]+)"\)'
    $replacements2 = $modifiedContent | Select-String -Pattern $pattern2 -AllMatches
    if ($replacements2) {
        $modifiedContent = $modifiedContent -replace 'console\.log\("([^"]+)"\)', 'axyraLogger.log("APP", $1)'
        $fileCount += ($replacements2.Matches.Count)
    }
    
    # Reemplazo 3: console.error('mensaje')
    $modifiedContent = $modifiedContent -replace "console\.error\('([^']+)',([^)]+)\)", "axyraLogger.error('APP', `$1, `$2)"
    
    # Reemplazo 4: console.error("mensaje")
    $modifiedContent = $modifiedContent -replace 'console\.error\("([^"]+)",([^)]+)\)', 'axyraLogger.error("APP", $1, $2)'
    
    # Reemplazo 5: console.warn
    $modifiedContent = $modifiedContent -replace "console\.warn\('([^']+)'\)", "axyraLogger.warn('APP', `$1)"
    
    # Si hay cambios, guardar archivo
    if ($modifiedContent -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $modifiedContent -Encoding UTF8
        $filesModified++
        $replacementCount += $fileCount
        Write-Host "✅ Actualizado: $($file.Name) ($fileCount replacements)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Completado!" -ForegroundColor Green
Write-Host "📊 Archivos modificados: $filesModified" -ForegroundColor Cyan
Write-Host "📝 Total de reemplazos: $replacementCount" -ForegroundColor Cyan
