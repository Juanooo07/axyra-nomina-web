/**
 * 🚀 SCRIPT DE CONFIGURACIÓN DE PRODUCCIÓN - AXYRA
 * 
 * Este script configura el sistema para producción
 * y verifica que todo esté listo para el despliegue.
 */

const fs = require('fs');
const path = require('path');

class ProductionSetup {
    constructor() {
        this.checks = [];
        this.errors = [];
        this.warnings = [];
    }

    async runSetup() {
        console.log('🚀 CONFIGURANDO AXYRA PARA PRODUCCIÓN...\n');

        try {
            // 1. Verificar estructura de archivos
            await this.checkFileStructure();
            
            // 2. Verificar configuración de Firebase
            await this.checkFirebaseConfig();
            
            // 3. Verificar configuración de Vercel
            await this.checkVercelConfig();
            
            // 4. Verificar variables de entorno
            await this.checkEnvironmentVariables();
            
            // 5. Optimizar archivos para producción
            await this.optimizeForProduction();
            
            // 6. Generar reporte final
            this.generateReport();

        } catch (error) {
            console.error('❌ Error en configuración:', error);
            this.errors.push(error.message);
        }
    }

    async checkFileStructure() {
        console.log('📁 Verificando estructura de archivos...');
        
        const requiredFiles = [
            'frontend/index.html',
            'frontend/login.html',
            'frontend/admin.html',
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

        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                this.checks.push({ type: 'file', name: file, status: 'OK' });
            } else {
                this.errors.push(`Archivo faltante: ${file}`);
            }
        }
    }

    async checkFirebaseConfig() {
        console.log('🔥 Verificando configuración de Firebase...');
        
        try {
            // Verificar firestore.rules
            const rules = fs.readFileSync('firestore.rules', 'utf8');
            if (rules.includes('rules_version') && rules.includes('match')) {
                this.checks.push({ type: 'firebase', name: 'Firestore Rules', status: 'OK' });
            } else {
                this.errors.push('Firestore Rules incompletas');
            }

            // Verificar firestore.indexes.json
            const indexes = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
            if (indexes.indexes && indexes.indexes.length > 0) {
                this.checks.push({ type: 'firebase', name: 'Firestore Indexes', status: 'OK' });
            } else {
                this.errors.push('Firestore Indexes vacíos');
            }

            // Verificar storage.rules
            const storageRules = fs.readFileSync('storage.rules', 'utf8');
            if (storageRules.includes('rules_version') && storageRules.includes('match')) {
                this.checks.push({ type: 'firebase', name: 'Storage Rules', status: 'OK' });
            } else {
                this.errors.push('Storage Rules incompletas');
            }

        } catch (error) {
            this.errors.push(`Error en configuración de Firebase: ${error.message}`);
        }
    }

    async checkVercelConfig() {
        console.log('▲ Verificando configuración de Vercel...');
        
        try {
            const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
            
            if (vercelConfig.outputDirectory === 'frontend') {
                this.checks.push({ type: 'vercel', name: 'Output Directory', status: 'OK' });
            } else {
                this.warnings.push('Output directory no configurado correctamente');
            }

            if (vercelConfig.framework === null) {
                this.checks.push({ type: 'vercel', name: 'Framework Config', status: 'OK' });
            } else {
                this.warnings.push('Framework no configurado como estático');
            }

        } catch (error) {
            this.errors.push(`Error en configuración de Vercel: ${error.message}`);
        }
    }

    async checkEnvironmentVariables() {
        console.log('🔐 Verificando variables de entorno...');
        
        const requiredEnvVars = [
            'FIREBASE_PROJECT_ID',
            'FIREBASE_PRIVATE_KEY',
            'FIREBASE_CLIENT_EMAIL',
            'WOMPI_PUBLIC_KEY',
            'WOMPI_PRIVATE_KEY',
            'PAYPAL_CLIENT_ID',
            'PAYPAL_CLIENT_SECRET'
        ];

        // Nota: En producción, estas variables deben estar configuradas en Vercel
        this.checks.push({ 
            type: 'env', 
            name: 'Environment Variables', 
            status: 'INFO',
            message: 'Verificar que estén configuradas en Vercel'
        });
    }

    async optimizeForProduction() {
        console.log('⚡ Optimizando para producción...');
        
        try {
            // Crear archivo de configuración de producción
            const prodConfig = {
                production: true,
                debug: false,
                analytics: true,
                monitoring: true,
                backup: true,
                timestamp: new Date().toISOString()
            };

            fs.writeFileSync('frontend/static/production-config.js', 
                `window.PRODUCTION_CONFIG = ${JSON.stringify(prodConfig, null, 2)};`);
            
            this.checks.push({ type: 'optimization', name: 'Production Config', status: 'OK' });

            // Crear archivo de versión
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const versionInfo = {
                version: packageJson.version,
                buildDate: new Date().toISOString(),
                environment: 'production'
            };

            fs.writeFileSync('frontend/static/version.json', JSON.stringify(versionInfo, null, 2));
            this.checks.push({ type: 'optimization', name: 'Version Info', status: 'OK' });

        } catch (error) {
            this.warnings.push(`Error en optimización: ${error.message}`);
        }
    }

    generateReport() {
        const totalChecks = this.checks.length;
        const okChecks = this.checks.filter(c => c.status === 'OK').length;
        const errorCount = this.errors.length;
        const warningCount = this.warnings.length;

        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE DE CONFIGURACIÓN DE PRODUCCIÓN');
        console.log('='.repeat(60));
        console.log(`✅ Verificaciones exitosas: ${okChecks}/${totalChecks}`);
        console.log(`⚠️  Advertencias: ${warningCount}`);
        console.log(`❌ Errores: ${errorCount}`);

        if (this.errors.length > 0) {
            console.log('\n❌ ERRORES CRÍTICOS:');
            this.errors.forEach(error => console.log(`   - ${error}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  ADVERTENCIAS:');
            this.warnings.forEach(warning => console.log(`   - ${warning}`));
        }

        if (errorCount === 0) {
            console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
            console.log('✅ El sistema está listo para producción');
            console.log('\n📋 PRÓXIMOS PASOS:');
            console.log('1. Verificar variables de entorno en Vercel');
            console.log('2. Desplegar a Vercel: npm run deploy');
            console.log('3. Desplegar Firebase: npm run deploy:firebase');
            console.log('4. Ejecutar pruebas: npm run test');
            console.log('5. Monitorear salud: npm run test:health');
        } else {
            console.log('\n⚠️  CONFIGURACIÓN INCOMPLETA');
            console.log('🔧 Corrige los errores antes de continuar');
        }

        // Guardar reporte
        const report = {
            timestamp: new Date().toISOString(),
            totalChecks: totalChecks,
            okChecks: okChecks,
            errors: this.errors,
            warnings: this.warnings,
            ready: errorCount === 0
        };

        fs.writeFileSync('production-setup-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Reporte guardado en: production-setup-report.json');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const setup = new ProductionSetup();
    setup.runSetup().then(() => {
        process.exit(setup.errors.length === 0 ? 0 : 1);
    }).catch(error => {
        console.error('Error en setup:', error);
        process.exit(1);
    });
}

module.exports = ProductionSetup;
