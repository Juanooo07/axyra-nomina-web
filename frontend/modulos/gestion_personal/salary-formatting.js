// Sistema de formateo de salarios AXYRA
class AxyraSalaryFormatter {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('✅ AxyraSalaryFormatter inicializado');
  }

  setupEventListeners() {
    const camposSalario = [
      'salarioFijoEmpleado',
      'bonificacionesEmpleado', 
      'salarioReferenciaEmpleado'
    ];

    camposSalario.forEach(id => {
      const campo = document.getElementById(id);
      if (campo) {
        // Solo permitir números al escribir
        campo.addEventListener('input', (e) => {
          this.formatSalaryInput(e.target);
        });

        // Formatear al perder el foco
        campo.addEventListener('blur', (e) => {
          this.formatSalaryDisplay(e.target);
        });

        // Limpiar formato al ganar foco
        campo.addEventListener('focus', (e) => {
          this.clearSalaryFormat(e.target);
        });
      }
    });
  }

  formatSalaryInput(input) {
    // Solo permitir números
    let valor = input.value.replace(/[^\d]/g, '');
    input.value = valor;
  }

  formatSalaryDisplay(input) {
    let valor = input.value.replace(/[^\d]/g, '');
    if (valor.length > 0) {
      // Formatear con puntos para miles
      valor = parseInt(valor).toLocaleString('es-CO');
      input.value = valor;
    }
  }

  clearSalaryFormat(input) {
    // Limpiar formato para edición
    input.value = input.value.replace(/[^\d]/g, '');
  }

  getCleanValue(input) {
    // Obtener valor numérico limpio
    return input.value.replace(/[^\d]/g, '');
  }

  validateSalary(input) {
    const valor = this.getCleanValue(input);
    const numValue = parseFloat(valor);
    
    if (!valor || numValue <= 0) {
      input.style.borderColor = '#dc3545';
      return false;
    } else {
      input.style.borderColor = '#28a745';
      return true;
    }
  }
}

// Función global para formatear salario
window.formatearSalario = function(input) {
  const formatter = new AxyraSalaryFormatter();
  formatter.formatSalaryInput(input);
};

// Función global para limpiar formato de salario
window.limpiarFormatoSalario = function(input) {
  const formatter = new AxyraSalaryFormatter();
  return formatter.getCleanValue(input);
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new AxyraSalaryFormatter();
});
