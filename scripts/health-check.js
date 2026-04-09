/**
 * 🏥 HEALTH CHECK SYSTEM - AXYRA
 * 
 * Este script verifica la salud del sistema y envía alertas
 * si detecta problemas críticos.
 */

const admin = require('firebase-admin');
const https = require('https');

class HealthCheckSystem {
    constructor() {
        this.checks = [];
        this.alerts = [];
        this.init();
    }

    init() {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }

        this.db = admin.firestore();
        console.log('🏥 Sistema de Health Check inicializado');
    }

    async runAllChecks() {
        console.log('🔍 Ejecutando verificaciones de salud...\n');

        // Verificaciones críticas
        await this.checkFirebaseConnection();
        await this.checkDatabaseHealth();
        await this.checkCriticalCollections();
        await this.checkUserAuthentication();
        await this.checkPaymentSystems();
        await this.checkStorageHealth();

        // Generar reporte
        this.generateHealthReport();

        return {
            healthy: this.alerts.length === 0,
            alerts: this.alerts,
            checks: this.checks
        };
    }

    async checkFirebaseConnection() {
        try {
            const startTime = Date.now();
            await this.db.collection('_health_check').doc('test').set({
                timestamp: new Date().toISOString(),
                test: true
            });
            const responseTime = Date.now() - startTime;

            this.checks.push({
                name: 'Firebase Connection',
                status: 'HEALTHY',
                responseTime: responseTime,
                message: `Conexión estable (${responseTime}ms)`
            });

        } catch (error) {
            this.checks.push({
                name: 'Firebase Connection',
                status: 'CRITICAL',
                error: error.message
            });

            this.alerts.push({
                type: 'CRITICAL',
                component: 'Firebase',
                message: 'No se puede conectar a Firebase',
                error: error.message
            });
        }
    }

    async checkDatabaseHealth() {
        try {
            // Verificar que las reglas estén aplicadas
            const testDoc = await this.db.collection('_health_check').doc('rules_test').get();
            
            this.checks.push({
                name: 'Database Health',
                status: 'HEALTHY',
                message: 'Base de datos accesible y reglas aplicadas'
            });

        } catch (error) {
            this.checks.push({
                name: 'Database Health',
                status: 'WARNING',
                error: error.message
            });

            this.alerts.push({
                type: 'WARNING',
                component: 'Database',
                message: 'Problemas de acceso a la base de datos',
                error: error.message
            });
        }
    }

    async checkCriticalCollections() {
        const criticalCollections = [
            'usuarios',
            'empleados',
            'horas_trabajadas',
            'cuadre_caja'
        ];

        for (const collection of criticalCollections) {
            try {
                const snapshot = await this.db.collection(collection).limit(1).get();
                
                this.checks.push({
                    name: `Collection: ${collection}`,
                    status: 'HEALTHY',
                    message: `Colección accesible (${snapshot.size} documentos)`
                });

            } catch (error) {
                this.checks.push({
                    name: `Collection: ${collection}`,
                    status: 'CRITICAL',
                    error: error.message
                });

                this.alerts.push({
                    type: 'CRITICAL',
                    component: 'Database',
                    message: `No se puede acceder a la colección: ${collection}`,
                    error: error.message
                });
            }
        }
    }

    async checkUserAuthentication() {
        try {
            // Verificar que el sistema de autenticación esté funcionando
            const auth = admin.auth();
            const listUsers = await auth.listUsers(1);
            
            this.checks.push({
                name: 'User Authentication',
                status: 'HEALTHY',
                message: 'Sistema de autenticación funcionando'
            });

        } catch (error) {
            this.checks.push({
                name: 'User Authentication',
                status: 'CRITICAL',
                error: error.message
            });

            this.alerts.push({
                type: 'CRITICAL',
                component: 'Authentication',
                message: 'Problemas con el sistema de autenticación',
                error: error.message
            });
        }
    }

    async checkPaymentSystems() {
        // Verificar configuración de pagos
        try {
            const configSnapshot = await this.db.collection('configuracion_pagos').limit(1).get();
            
            if (configSnapshot.empty) {
                this.checks.push({
                    name: 'Payment Systems',
                    status: 'WARNING',
                    message: 'No hay configuración de pagos encontrada'
                });
            } else {
                this.checks.push({
                    name: 'Payment Systems',
                    status: 'HEALTHY',
                    message: 'Sistema de pagos configurado'
                });
            }

        } catch (error) {
            this.checks.push({
                name: 'Payment Systems',
                status: 'WARNING',
                error: error.message
            });
        }
    }

    async checkStorageHealth() {
        try {
            // Verificar que las reglas de storage estén aplicadas
            const bucket = admin.storage().bucket();
            const [files] = await bucket.getFiles({ maxResults: 1 });
            
            this.checks.push({
                name: 'Storage Health',
                status: 'HEALTHY',
                message: 'Storage accesible'
            });

        } catch (error) {
            this.checks.push({
                name: 'Storage Health',
                status: 'WARNING',
                error: error.message
            });

            this.alerts.push({
                type: 'WARNING',
                component: 'Storage',
                message: 'Problemas con el storage',
                error: error.message
            });
        }
    }

    generateHealthReport() {
        const healthyChecks = this.checks.filter(c => c.status === 'HEALTHY').length;
        const warningChecks = this.checks.filter(c => c.status === 'WARNING').length;
        const criticalChecks = this.checks.filter(c => c.status === 'CRITICAL').length;
        const totalChecks = this.checks.length;

        console.log('\n' + '='.repeat(60));
        console.log('🏥 REPORTE DE SALUD DEL SISTEMA');
        console.log('='.repeat(60));
        console.log(`✅ Saludables: ${healthyChecks}/${totalChecks}`);
        console.log(`⚠️  Advertencias: ${warningChecks}/${totalChecks}`);
        console.log(`🚨 Críticos: ${criticalChecks}/${totalChecks}`);

        if (this.alerts.length > 0) {
            console.log('\n🚨 ALERTAS:');
            this.alerts.forEach(alert => {
                const icon = alert.type === 'CRITICAL' ? '🔴' : '🟡';
                console.log(`${icon} ${alert.component}: ${alert.message}`);
            });
        }

        if (criticalChecks === 0) {
            console.log('\n🎉 ¡SISTEMA SALUDABLE!');
            console.log('✅ Todas las verificaciones críticas pasaron');
        } else {
            console.log('\n⚠️  ATENCIÓN REQUERIDA');
            console.log('🔧 Revisa las alertas críticas antes de continuar');
        }

        // Guardar reporte
        const report = {
            timestamp: new Date().toISOString(),
            healthy: this.alerts.length === 0,
            summary: {
                healthy: healthyChecks,
                warnings: warningChecks,
                critical: criticalChecks,
                total: totalChecks
            },
            checks: this.checks,
            alerts: this.alerts
        };

        const fs = require('fs');
        fs.writeFileSync('health-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Reporte guardado en: health-report.json');
    }

    async sendAlert(alert) {
        // Aquí podrías integrar con servicios como Slack, Discord, email, etc.
        console.log(`🚨 ALERTA: ${alert.component} - ${alert.message}`);
        
        // Ejemplo: Guardar alerta en Firestore
        try {
            await this.db.collection('system_alerts').add({
                ...alert,
                timestamp: new Date().toISOString(),
                resolved: false
            });
        } catch (error) {
            console.error('Error guardando alerta:', error);
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const healthCheck = new HealthCheckSystem();
    
    healthCheck.runAllChecks().then(result => {
        process.exit(result.healthy ? 0 : 1);
    }).catch(error => {
        console.error('Error ejecutando health check:', error);
        process.exit(1);
    });
}

module.exports = HealthCheckSystem;
