// ========================================
// AXYRA REPORTS SYSTEM
// Sistema de reportes avanzados con PDF/Excel
// ========================================

class AxyraReportsSystem {
  constructor() {
    this.reports = [];
    this.templates = {};
    this.isInitialized = false;

    this.init();
  }

  async init() {
    console.log('📊 Inicializando Sistema de Reportes AXYRA...');

    try {
      await this.loadLibraries();
      await this.loadTemplates();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('✅ Sistema de Reportes AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de reportes:', error);
    }
  }

  async loadLibraries() {
    // Cargar librerías dinámicamente
    const libraries = [
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    ];

    for (const lib of libraries) {
      await this.loadScript(lib);
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async loadTemplates() {
    this.templates = {
      payroll: {
        title: 'Reporte de Nómina',
        columns: ['Empleado', 'Cédula', 'Salario Base', 'Horas Extras', 'Descuentos', 'Neto a Pagar'],
        styles: {
          header: { fillColor: [30, 60, 114], textColor: 255, fontStyle: 'bold' },
          body: { textColor: 0, fontSize: 10 },
          alternateRow: { fillColor: [248, 249, 250] },
        },
      },
      employees: {
        title: 'Reporte de Empleados',
        columns: ['Nombre', 'Cédula', 'Cargo', 'Departamento', 'Salario', 'Estado'],
        styles: {
          header: { fillColor: [30, 60, 114], textColor: 255, fontStyle: 'bold' },
          body: { textColor: 0, fontSize: 10 },
          alternateRow: { fillColor: [248, 249, 250] },
        },
      },
      inventory: {
        title: 'Reporte de Inventario',
        columns: ['Producto', 'Categoría', 'Stock', 'Precio', 'Valor Total', 'Estado'],
        styles: {
          header: { fillColor: [30, 60, 114], textColor: 255, fontStyle: 'bold' },
          body: { textColor: 0, fontSize: 10 },
          alternateRow: { fillColor: [248, 249, 250] },
        },
      },
      hours: {
        title: 'Reporte de Horas Trabajadas',
        columns: ['Empleado', 'Fecha', 'Horas Ordinarias', 'Horas Extras', 'Total Horas', 'Salario'],
        styles: {
          header: { fillColor: [30, 60, 114], textColor: 255, fontStyle: 'bold' },
          body: { textColor: 0, fontSize: 10 },
          alternateRow: { fillColor: [248, 249, 250] },
        },
      },
    };
  }

  setupEventListeners() {
    // Escuchar eventos de generación de reportes
    document.addEventListener('generateReport', (event) => {
      this.generateReport(event.detail);
    });
  }

  // Métodos de generación de reportes
  async generatePayrollReport(data, options = {}) {
    try {
      const reportData = this.preparePayrollData(data);
      const template = this.templates.payroll;

      if (options.format === 'pdf') {
        return await this.generatePDFReport(reportData, template, options);
      } else if (options.format === 'excel') {
        return await this.generateExcelReport(reportData, template, options);
      } else {
        return await this.generatePDFReport(reportData, template, options);
      }
    } catch (error) {
      console.error('❌ Error generando reporte de nómina:', error);
      throw error;
    }
  }

  async generateEmployeesReport(data, options = {}) {
    try {
      const reportData = this.prepareEmployeesData(data);
      const template = this.templates.employees;

      if (options.format === 'pdf') {
        return await this.generatePDFReport(reportData, template, options);
      } else if (options.format === 'excel') {
        return await this.generateExcelReport(reportData, template, options);
      } else {
        return await this.generatePDFReport(reportData, template, options);
      }
    } catch (error) {
      console.error('❌ Error generando reporte de empleados:', error);
      throw error;
    }
  }

  async generateInventoryReport(data, options = {}) {
    try {
      const reportData = this.prepareInventoryData(data);
      const template = this.templates.inventory;

      if (options.format === 'pdf') {
        return await this.generatePDFReport(reportData, template, options);
      } else if (options.format === 'excel') {
        return await this.generateExcelReport(reportData, template, options);
      } else {
        return await this.generatePDFReport(reportData, template, options);
      }
    } catch (error) {
      console.error('❌ Error generando reporte de inventario:', error);
      throw error;
    }
  }

  async generateHoursReport(data, options = {}) {
    try {
      const reportData = this.prepareHoursData(data);
      const template = this.templates.hours;

      if (options.format === 'pdf') {
        return await this.generatePDFReport(reportData, template, options);
      } else if (options.format === 'excel') {
        return await this.generateExcelReport(reportData, template, options);
      } else {
        return await this.generatePDFReport(reportData, template, options);
      }
    } catch (error) {
      console.error('❌ Error generando reporte de horas:', error);
      throw error;
    }
  }

  // Preparar datos para reportes
  preparePayrollData(data) {
    return data.map((employee) => [
      employee.nombre || 'N/A',
      employee.cedula || 'N/A',
      this.formatCurrency(employee.salarioBase || 0),
      employee.horasExtras || 0,
      this.formatCurrency(employee.descuentos || 0),
      this.formatCurrency(employee.netoAPagar || 0),
    ]);
  }

  prepareEmployeesData(data) {
    return data.map((employee) => [
      employee.nombre || 'N/A',
      employee.cedula || 'N/A',
      employee.cargo || 'N/A',
      employee.departamento || 'N/A',
      this.formatCurrency(employee.salario || 0),
      employee.estado || 'N/A',
    ]);
  }

  prepareInventoryData(data) {
    return data.map((product) => [
      product.nombre || 'N/A',
      product.categoria || 'N/A',
      product.stock || 0,
      this.formatCurrency(product.precio || 0),
      this.formatCurrency((product.stock || 0) * (product.precio || 0)),
      product.estado || 'N/A',
    ]);
  }

  prepareHoursData(data) {
    return data.map((hour) => [
      hour.empleado || 'N/A',
      hour.fecha || 'N/A',
      hour.horasOrdinarias || 0,
      hour.horasExtras || 0,
      hour.totalHoras || 0,
      this.formatCurrency(hour.salario || 0),
    ]);
  }

  // Generar reporte PDF
  async generatePDFReport(data, template, options = {}) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar documento
    doc.setProperties({
      title: template.title,
      subject: 'Reporte AXYRA',
      author: 'AXYRA Sistema',
      creator: 'AXYRA Sistema',
    });

    // Agregar encabezado
    this.addPDFHeader(doc, template.title, options);

    // Agregar tabla
    doc.autoTable({
      head: [template.columns],
      body: data,
      styles: template.styles.body,
      headStyles: template.styles.header,
      alternateRowStyles: template.styles.alternateRow,
      startY: 50,
      margin: { top: 50, right: 20, bottom: 20, left: 20 },
    });

    // Agregar pie de página
    this.addPDFFooter(doc, options);

    // Generar nombre de archivo
    const fileName = `${template.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Descargar archivo
    doc.save(fileName);

    return { success: true, fileName };
  }

  // Generar reporte Excel
  async generateExcelReport(data, template, options = {}) {
    const XLSX = window.XLSX;

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet([template.columns, ...data]);

    // Configurar estilos
    ws['!cols'] = template.columns.map(() => ({ width: 20 }));

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    // Generar nombre de archivo
    const fileName = `${template.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  }

  // Métodos de utilidad para PDF
  addPDFHeader(doc, title, options) {
    // Logo
    doc.addImage('/logo.png', 'PNG', 20, 10, 20, 20);

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 50, 20);

    // Fecha
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, 50, 30);

    // Empresa
    doc.text('Villa Venecia', 50, 35);
  }

  addPDFFooter(doc, options) {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('Sistema AXYRA - Villa Venecia', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
    }
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Métodos de utilidad
  async exportToPDF(data, template, options = {}) {
    return await this.generatePDFReport(data, template, options);
  }

  async exportToExcel(data, template, options = {}) {
    return await this.generateExcelReport(data, template, options);
  }

  getAvailableTemplates() {
    return Object.keys(this.templates);
  }

  isReady() {
    return this.isInitialized;
  }
}

// Inicializar sistema de reportes
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraReports = new AxyraReportsSystem();
    console.log('✅ Sistema de Reportes AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de reportes:', error);
  }
});

// Exportar para uso global
window.AxyraReportsSystem = AxyraReportsSystem;
