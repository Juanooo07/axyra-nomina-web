/**
 * Script de verificación post-despliegue
 * AXYRA Sistema de Gestión
 */

const https = require('https');
const http = require('http');

class ProductionVerification {
  constructor() {
    this.productionUrls = [
      'https://axyra.vercel.app',
      'https://axyra-sistema-gestion.vercel.app',
      'https://axyra-sistema-gestion-axyras-projects.vercel.app'
    ];
    
    this.testPages = [
      '/',
      '/modulos/gestion_personal/gestion_personal.html',
      '/login-optimized.html',
      '/dashboard-optimized.html'
    ];
    
    this.results = {
      urls: {},
      pages: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
  }

  async runVerification() {
    console.log('🚀 Iniciando verificación post-despliegue...\n');
    
    try {
      // Verificar URLs principales
      for (const url of this.productionUrls) {
        await this.verifyUrl(url);
      }
      
      // Verificar páginas específicas
      for (const url of this.productionUrls) {
        for (const page of this.testPages) {
          await this.verifyPage(url + page);
        }
      }
      
      // Generar reporte
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error durante la verificación:', error);
    }
  }

  async verifyUrl(baseUrl) {
    return new Promise((resolve) => {
      const url = new URL(baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'AXYRA-Production-Verifier/1.0'
        }
      };

      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.request(options, (res) => {
        const status = res.statusCode;
        const isSuccess = status >= 200 && status < 300;
        
        this.results.urls[baseUrl] = {
          status: status,
          success: isSuccess,
          message: isSuccess ? '✅ Accesible' : `❌ Error ${status}`
        };
        
        this.results.summary.totalTests++;
        if (isSuccess) {
          this.results.summary.passedTests++;
        } else {
          this.results.summary.failedTests++;
        }
        
        console.log(`${isSuccess ? '✅' : '❌'} ${baseUrl} - ${status}`);
        resolve();
      });

      req.on('error', (error) => {
        this.results.urls[baseUrl] = {
          status: 'ERROR',
          success: false,
          message: `❌ Error de conexión: ${error.message}`
        };
        
        this.results.summary.totalTests++;
        this.results.summary.failedTests++;
        
        console.log(`❌ ${baseUrl} - Error de conexión`);
        resolve();
      });

      req.on('timeout', () => {
        this.results.urls[baseUrl] = {
          status: 'TIMEOUT',
          success: false,
          message: '❌ Timeout'
        };
        
        this.results.summary.totalTests++;
        this.results.summary.failedTests++;
        
        console.log(`❌ ${baseUrl} - Timeout`);
        resolve();
      });

      req.setTimeout(10000);
      req.end();
    });
  }

  async verifyPage(fullUrl) {
    return new Promise((resolve) => {
      const url = new URL(fullUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'AXYRA-Production-Verifier/1.0'
        }
      };

      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.request(options, (res) => {
        const status = res.statusCode;
        const isSuccess = status >= 200 && status < 300;
        
        this.results.pages[fullUrl] = {
          status: status,
          success: isSuccess,
          message: isSuccess ? '✅ Accesible' : `❌ Error ${status}`
        };
        
        this.results.summary.totalTests++;
        if (isSuccess) {
          this.results.summary.passedTests++;
        } else {
          this.results.summary.failedTests++;
        }
        
        console.log(`${isSuccess ? '✅' : '❌'} ${fullUrl} - ${status}`);
        resolve();
      });

      req.on('error', (error) => {
        this.results.pages[fullUrl] = {
          status: 'ERROR',
          success: false,
          message: `❌ Error de conexión: ${error.message}`
        };
        
        this.results.summary.totalTests++;
        this.results.summary.failedTests++;
        
        console.log(`❌ ${fullUrl} - Error de conexión`);
        resolve();
      });

      req.on('timeout', () => {
        this.results.pages[fullUrl] = {
          status: 'TIMEOUT',
          success: false,
          message: '❌ Timeout'
        };
        
        this.results.summary.totalTests++;
        this.results.summary.failedTests++;
        
        console.log(`❌ ${fullUrl} - Timeout`);
        resolve();
      });

      req.setTimeout(10000);
      req.end();
    });
  }

  generateReport() {
    console.log('\n📊 REPORTE DE VERIFICACIÓN POST-DESPLIEGUE');
    console.log('=' .repeat(50));
    
    console.log('\n🌐 URLs PRINCIPALES:');
    Object.entries(this.results.urls).forEach(([url, result]) => {
      console.log(`  ${result.message} ${url}`);
    });
    
    console.log('\n📄 PÁGINAS ESPECÍFICAS:');
    Object.entries(this.results.pages).forEach(([url, result]) => {
      console.log(`  ${result.message} ${url}`);
    });
    
    console.log('\n📈 RESUMEN:');
    console.log(`  Total de pruebas: ${this.results.summary.totalTests}`);
    console.log(`  Exitosas: ${this.results.summary.passedTests}`);
    console.log(`  Fallidas: ${this.results.summary.failedTests}`);
    
    const successRate = (this.results.summary.passedTests / this.results.summary.totalTests) * 100;
    console.log(`  Tasa de éxito: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      console.log('\n🎉 ¡DESPLIEGUE EXITOSO! El sistema está funcionando correctamente en producción.');
    } else if (successRate >= 70) {
      console.log('\n⚠️ DESPLIEGUE PARCIALMENTE EXITOSO. Algunas páginas pueden tener problemas.');
    } else {
      console.log('\n❌ DESPLIEGUE CON PROBLEMAS. Revisar configuración y logs.');
    }
    
    console.log('\n🔗 URLs de producción:');
    this.productionUrls.forEach(url => {
      console.log(`  • ${url}`);
    });
  }
}

// Ejecutar verificación
const verifier = new ProductionVerification();
verifier.runVerification();

module.exports = ProductionVerification;
