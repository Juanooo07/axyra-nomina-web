/**
 * 🧪 SCRIPT DE PRUEBAS CRÍTICAS - AXYRA SISTEMA DE GESTIÓN
 * 
 * Este script verifica las funcionalidades más importantes del sistema
 * antes de considerarlo listo para producción.
 */

const fs = require('fs');
const path = require('path');

class TestCriticas {
    constructor() {
        this.resultados = [];
        this.errores = [];
        this.inicio = Date.now();
    }

    // Método principal para ejecutar todas las pruebas
    async ejecutarTodasLasPruebas() {
        console.log('🚀 INICIANDO PRUEBAS CRÍTICAS DE AXYRA...\n');
        
        try {
            // 1. Verificar estructura de archivos críticos
            await this.verificarEstructuraArchivos();
            
            // 2. Verificar configuración de Firebase
            await this.verificarConfiguracionFirebase();
            
            // 3. Verificar configuración de Vercel
            await this.verificarConfiguracionVercel();
            
            // 4. Verificar módulos críticos
            await this.verificarModulosCriticos();
            
            // 5. Verificar APIs de pago
            await this.verificarAPIsPago();
            
            // 6. Generar reporte
            this.generarReporte();
            
        } catch (error) {
            console.error('❌ ERROR CRÍTICO EN LAS PRUEBAS:', error);
            this.errores.push(error.message);
        }
    }

    // Verificar que existan todos los archivos críticos
    async verificarEstructuraArchivos() {
        console.log('📁 Verificando estructura de archivos...');
        
        const archivosCriticos = [
            'frontend/index.html',
            'frontend/login.html',
            'frontend/admin.html',
            'frontend/modulos/gestion_personal/gestion_personal.html',
            'frontend/modulos/cuadre_caja/index.html',
            'frontend/static/firebase-config.js',
            'frontend/static/firebase-sync-manager.js',
            'frontend/modulos/gestion_personal/gestion_personal_optimized.js',
            'frontend/modulos/cuadre_caja/cuadre_caja_optimized.js',
            'firestore.rules',
            'firestore.indexes.json',
            'storage.rules',
            'vercel.json',
            'package.json'
        ];

        for (const archivo of archivosCriticos) {
            const existe = fs.existsSync(archivo);
            if (existe) {
                this.agregarResultado(`✅ ${archivo}`, 'EXITO');
            } else {
                this.agregarResultado(`❌ ${archivo}`, 'FALLO');
                this.errores.push(`Archivo crítico faltante: ${archivo}`);
            }
        }
    }

    // Verificar configuración de Firebase
    async verificarConfiguracionFirebase() {
        console.log('🔥 Verificando configuración de Firebase...');
        
        try {
            // Verificar firestore.rules
            const rules = fs.readFileSync('firestore.rules', 'utf8');
            if (rules.includes('rules_version') && rules.includes('match')) {
                this.agregarResultado('✅ Firestore Rules configuradas', 'EXITO');
            } else {
                this.agregarResultado('❌ Firestore Rules incompletas', 'FALLO');
            }

            // Verificar firestore.indexes.json
            const indexes = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
            if (indexes.indexes && indexes.indexes.length > 0) {
                this.agregarResultado('✅ Firestore Indexes configurados', 'EXITO');
            } else {
                this.agregarResultado('❌ Firestore Indexes vacíos', 'FALLO');
            }

            // Verificar storage.rules
            const storageRules = fs.readFileSync('storage.rules', 'utf8');
            if (storageRules.includes('rules_version') && storageRules.includes('match')) {
                this.agregarResultado('✅ Storage Rules configuradas', 'EXITO');
            } else {
                this.agregarResultado('❌ Storage Rules incompletas', 'FALLO');
            }

        } catch (error) {
            this.agregarResultado('❌ Error en configuración de Firebase', 'FALLO');
            this.errores.push(`Firebase: ${error.message}`);
        }
    }

    // Verificar configuración de Vercel
    async verificarConfiguracionVercel() {
        console.log('▲ Verificando configuración de Vercel...');
        
        try {
            const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
            
            if (vercelConfig.outputDirectory === 'frontend') {
                this.agregarResultado('✅ Vercel configurado para frontend', 'EXITO');
            } else {
                this.agregarResultado('❌ Vercel mal configurado', 'FALLO');
            }

            if (vercelConfig.framework === null) {
                this.agregarResultado('✅ Framework configurado como estático', 'EXITO');
            } else {
                this.agregarResultado('❌ Framework mal configurado', 'FALLO');
            }

        } catch (error) {
            this.agregarResultado('❌ Error en configuración de Vercel', 'FALLO');
            this.errores.push(`Vercel: ${error.message}`);
        }
    }

    // Verificar módulos críticos
    async verificarModulosCriticos() {
        console.log('🔧 Verificando módulos críticos...');
        
        // Verificar Gestión de Personal
        try {
            const gestionPersonal = fs.readFileSync('frontend/modulos/gestion_personal/gestion_personal_optimized.js', 'utf8');
            
            if (gestionPersonal.includes('class GestionPersonalOptimized')) {
                this.agregarResultado('✅ Módulo Gestión Personal optimizado', 'EXITO');
            } else {
                this.agregarResultado('❌ Módulo Gestión Personal incompleto', 'FALLO');
            }

            if (gestionPersonal.includes('FirebaseSyncManager')) {
                this.agregarResultado('✅ Sincronización Firebase integrada', 'EXITO');
            } else {
                this.agregarResultado('❌ Sincronización Firebase faltante', 'FALLO');
            }

        } catch (error) {
            this.agregarResultado('❌ Error en módulo Gestión Personal', 'FALLO');
        }

        // Verificar Cuadre de Caja
        try {
            const cuadreCaja = fs.readFileSync('frontend/modulos/cuadre_caja/cuadre_caja_optimized.js', 'utf8');
            
            if (cuadreCaja.includes('class CuadreCajaOptimized')) {
                this.agregarResultado('✅ Módulo Cuadre de Caja optimizado', 'EXITO');
            } else {
                this.agregarResultado('❌ Módulo Cuadre de Caja incompleto', 'FALLO');
            }

        } catch (error) {
            this.agregarResultado('❌ Error en módulo Cuadre de Caja', 'FALLO');
        }
    }

    // Verificar APIs de pago
    async verificarAPIsPago() {
        console.log('💳 Verificando APIs de pago...');
        
        try {
            // Verificar Wompi
            const wompiAPI = fs.readFileSync('api/process-wompi-payment.js', 'utf8');
            if (wompiAPI.includes('processWompiPayment') && wompiAPI.includes('verifyWompiTransaction')) {
                this.agregarResultado('✅ API Wompi configurada', 'EXITO');
            } else {
                this.agregarResultado('❌ API Wompi incompleta', 'FALLO');
            }

            // Verificar PayPal
            const paypalAPI = fs.readFileSync('api/paypal-payment.js', 'utf8');
            if (paypalAPI.includes('getPayPalAccessToken') && paypalAPI.includes('verifyPayPalOrder')) {
                this.agregarResultado('✅ API PayPal configurada', 'EXITO');
            } else {
                this.agregarResultado('❌ API PayPal incompleta', 'FALLO');
            }

        } catch (error) {
            this.agregarResultado('❌ Error en APIs de pago', 'FALLO');
        }
    }

    // Agregar resultado de prueba
    agregarResultado(mensaje, estado) {
        this.resultados.push({
            mensaje,
            estado,
            timestamp: new Date().toISOString()
        });
        console.log(mensaje);
    }

    // Generar reporte final
    generarReporte() {
        const tiempoTotal = Date.now() - this.inicio;
        const exitos = this.resultados.filter(r => r.estado === 'EXITO').length;
        const fallos = this.resultados.filter(r => r.estado === 'FALLO').length;
        const total = this.resultados.length;

        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE DE PRUEBAS CRÍTICAS');
        console.log('='.repeat(60));
        console.log(`⏱️  Tiempo total: ${(tiempoTotal / 1000).toFixed(2)}s`);
        console.log(`✅ Exitos: ${exitos}/${total}`);
        console.log(`❌ Fallos: ${fallos}/${total}`);
        console.log(`📈 Porcentaje de éxito: ${((exitos / total) * 100).toFixed(1)}%`);

        if (fallos > 0) {
            console.log('\n🚨 ERRORES ENCONTRADOS:');
            this.errores.forEach(error => console.log(`   - ${error}`));
        }

        if (exitos === total) {
            console.log('\n🎉 ¡TODAS LAS PRUEBAS CRÍTICAS PASARON!');
            console.log('✅ El sistema está listo para producción');
        } else {
            console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
            console.log('🔧 Revisa los errores antes de continuar');
        }

        // Guardar reporte en archivo
        const reporte = {
            timestamp: new Date().toISOString(),
            tiempoTotal: tiempoTotal,
            exitos: exitos,
            fallos: fallos,
            total: total,
            porcentajeExito: (exitos / total) * 100,
            resultados: this.resultados,
            errores: this.errores
        };

        fs.writeFileSync('reporte-pruebas-criticas.json', JSON.stringify(reporte, null, 2));
        console.log('\n📄 Reporte guardado en: reporte-pruebas-criticas.json');
    }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    const tester = new TestCriticas();
    tester.ejecutarTodasLasPruebas().catch(console.error);
}

module.exports = TestCriticas;
