#!/usr/bin/env node

/**
 * Script para reemplazar masivamente console.log con axyraLogger
 * Uso: node replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');

const targetDir = 'frontend/js';
const staticDir = 'frontend/static';

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
  errors: []
};

/**
 * Procesa archivos recursivamente
 */
function processDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        processFile(fullPath);
      }
    });
  } catch (error) {
    stats.errors.push(`Error leyendo directorio ${dir}: ${error.message}`);
  }
}

/**
 * Procesa un archivo individual
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileReplacements = 0;

    // Patrón 1: console.log('mensaje', variable)
    const pattern1 = /console\.log\('([^']+)',\s*(\w+)\)/g;
    content = content.replace(pattern1, (match, message, varName) => {
      fileReplacements++;
      stats.replacements++;
      return `axyraLogger.log('APP', '${message}', ${varName})`;
    });

    // Patrón 2: console.log('mensaje')
    const pattern2 = /console\.log\('([^']+)'\)/g;
    content = content.replace(pattern2, (match, message) => {
      fileReplacements++;
      stats.replacements++;
      return `axyraLogger.log('APP', '${message}')`;
    });

    // Patrón 3: console.log("mensaje")
    const pattern3 = /console\.log\("([^"]+)"\)/g;
    content = content.replace(pattern3, (match, message) => {
      fileReplacements++;
      stats.replacements++;
      return `axyraLogger.log('APP', "${message}")`;
    });

    // Patrón 4: console.log("mensaje", variable)
    const pattern4 = /console\.log\("([^"]+)",\s*(\w+)\)/g;
    content = content.replace(pattern4, (match, message, varName) => {
      fileReplacements++;
      stats.replacements++;
      return `axyraLogger.log('APP', "${message}", ${varName})`;
    });

    // Patrón 5: console.error('mensaje', error)
    const pattern5 = /console\.error\('([^']+)',\s*(\w+)\)/g;
    content = content.replace(pattern5, (match, message, varName) => {
      fileReplacements++;
      stats.replacements++;
      return `axyraLogger.error('APP', '${message}', ${varName})`;
    });

    // Patrón 6: console.error("mensaje", error)
    const pattern6 = /console\.error\("([^"]+)",\s*(\w+)\)/g;
    content = content.replace(pattern6, (match, message, varName) => {
      fileReplacements++;
      stats.replacements++;
      return `axyraLogger.error('APP', "${message}", ${varName})`;
    });

    // Patrón 7: console.warn
    const pattern7 = /console\.warn\('([^']+)'\)/g;
    content = content.replace(pattern7, (match, message) => {
      fileReplacements++;
      stats.replacements++;
      return `axyraLogger.warn('APP', '${message}')`;
    });

    // Si hay cambios, guardar
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      console.log(`✅ ${path.relative('.', filePath)} (${fileReplacements} reemplazos)`);
    }
  } catch (error) {
    stats.errors.push(`Error procesando ${filePath}: ${error.message}`);
  }
}

/**
 * Función principal
 */
function main() {
  console.log('🔄 Iniciando reemplazo masivo de console.log...\n');
  
  // Procesar ambos directorios
  [targetDir, staticDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`📁 Procesando: ${dir}`);
      processDirectory(dir);
    }
  });

  // Mostrar resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL REEMPLAZO');
  console.log('='.repeat(60));
  console.log(`✓ Archivos procesados: ${stats.filesProcessed}`);
  console.log(`✓ Archivos modificados: ${stats.filesModified}`);
  console.log(`✓ Total de reemplazos: ${stats.replacements}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n⚠️ Errores encontrados: ${stats.errors.length}`);
    stats.errors.forEach(err => console.log(`   - ${err}`));
  }
  
  console.log('\n🎉 ¡Completado!');
}

main();
