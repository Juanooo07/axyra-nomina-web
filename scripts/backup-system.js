/**
 * 💾 SISTEMA DE RESPALDOS AUTOMÁTICOS - AXYRA
 * 
 * Este script maneja respaldos automáticos de Firestore
 * y otros datos críticos del sistema.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

class BackupSystem {
    constructor() {
        this.backupDir = 'backups';
        this.maxBackups = 30; // Mantener últimos 30 respaldos
        this.init();
    }

    init() {
        // Crear directorio de respaldos si no existe
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        // Inicializar Firebase Admin
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }

        this.db = admin.firestore();
        console.log('💾 Sistema de respaldos inicializado');
    }

    async createFullBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup_${timestamp}`;
        const backupPath = path.join(this.backupDir, backupName);

        console.log(`🔄 Creando respaldo completo: ${backupName}`);

        try {
            // Crear directorio del respaldo
            fs.mkdirSync(backupPath, { recursive: true });

            // Respaldar todas las colecciones críticas
            const collections = [
                'usuarios',
                'empleados', 
                'horas_trabajadas',
                'nominas',
                'cuadre_caja',
                'inventario',
                'facturas',
                'membresias',
                'pagos',
                'configuracion',
                'empresas'
            ];

            const backupData = {};

            for (const collection of collections) {
                console.log(`📦 Respaldando colección: ${collection}`);
                const snapshot = await this.db.collection(collection).get();
                
                backupData[collection] = [];
                snapshot.forEach(doc => {
                    backupData[collection].push({
                        id: doc.id,
                        data: doc.data(),
                        timestamp: new Date().toISOString()
                    });
                });
            }

            // Guardar respaldo en archivo JSON
            const backupFile = path.join(backupPath, 'data.json');
            fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

            // Crear metadatos del respaldo
            const metadata = {
                timestamp: new Date().toISOString(),
                backupName: backupName,
                collections: collections,
                totalDocuments: Object.values(backupData).reduce((sum, docs) => sum + docs.length, 0),
                size: this.getFileSize(backupFile)
            };

            const metadataFile = path.join(backupPath, 'metadata.json');
            fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

            // Limpiar respaldos antiguos
            await this.cleanOldBackups();

            console.log(`✅ Respaldo completado: ${backupName}`);
            console.log(`📊 Total de documentos: ${metadata.totalDocuments}`);
            console.log(`💾 Tamaño: ${metadata.size}`);

            return {
                success: true,
                backupName: backupName,
                metadata: metadata
            };

        } catch (error) {
            console.error('❌ Error creando respaldo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async restoreBackup(backupName) {
        const backupPath = path.join(this.backupDir, backupName);
        const dataFile = path.join(backupPath, 'data.json');

        if (!fs.existsSync(dataFile)) {
            throw new Error(`Respaldo no encontrado: ${backupName}`);
        }

        console.log(`🔄 Restaurando respaldo: ${backupName}`);

        try {
            const backupData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

            for (const [collection, documents] of Object.entries(backupData)) {
                console.log(`📦 Restaurando colección: ${collection}`);
                
                for (const doc of documents) {
                    await this.db.collection(collection).doc(doc.id).set(doc.data);
                }
            }

            console.log(`✅ Respaldo restaurado: ${backupName}`);
            return { success: true };

        } catch (error) {
            console.error('❌ Error restaurando respaldo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cleanOldBackups() {
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
                .sort()
                .reverse();

            if (backups.length > this.maxBackups) {
                const toDelete = backups.slice(this.maxBackups);
                
                for (const backup of toDelete) {
                    const backupPath = path.join(this.backupDir, backup);
                    fs.rmSync(backupPath, { recursive: true, force: true });
                    console.log(`🗑️ Respaldo eliminado: ${backup}`);
                }
            }
        } catch (error) {
            console.error('Error limpiando respaldos antiguos:', error);
        }
    }

    getFileSize(filePath) {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
        return `${fileSizeInMB} MB`;
    }

    listBackups() {
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
                .map(backup => {
                    const metadataFile = path.join(this.backupDir, backup, 'metadata.json');
                    if (fs.existsSync(metadataFile)) {
                        const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
                        return {
                            name: backup,
                            ...metadata
                        };
                    }
                    return { name: backup };
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return backups;
        } catch (error) {
            console.error('Error listando respaldos:', error);
            return [];
        }
    }

    async scheduleBackups() {
        // Crear respaldo diario a las 2:00 AM
        const scheduleBackup = () => {
            const now = new Date();
            const nextBackup = new Date();
            nextBackup.setHours(2, 0, 0, 0);
            
            if (nextBackup <= now) {
                nextBackup.setDate(nextBackup.getDate() + 1);
            }

            const timeUntilBackup = nextBackup.getTime() - now.getTime();
            
            setTimeout(async () => {
                await this.createFullBackup();
                scheduleBackup(); // Programar siguiente respaldo
            }, timeUntilBackup);

            console.log(`⏰ Próximo respaldo programado: ${nextBackup.toISOString()}`);
        };

        scheduleBackup();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const backupSystem = new BackupSystem();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'create':
            backupSystem.createFullBackup().then(result => {
                console.log('Resultado:', result);
                process.exit(result.success ? 0 : 1);
            });
            break;
            
        case 'list':
            const backups = backupSystem.listBackups();
            console.log('📋 Respaldos disponibles:');
            backups.forEach(backup => {
                console.log(`  - ${backup.name} (${backup.timestamp || 'Sin metadata'})`);
            });
            break;
            
        case 'schedule':
            console.log('⏰ Iniciando programación de respaldos...');
            backupSystem.scheduleBackups();
            break;
            
        default:
            console.log('Uso: node backup-system.js [create|list|schedule]');
            process.exit(1);
    }
}

module.exports = BackupSystem;
