// ========================================
// GENERADOR DE COMPROBANTES DE TRABAJO - AXYRA
// ========================================
// Genera comprobantes de trabajo (órdenes de trabajo) con formato profesional

class AxyraWorkOrderGenerator {
    constructor() {
        this.hourlyRates = {
            ordinary: 6470,           // Hora ordinaria
            nightSurcharge: 2265,     // Recargo nocturno
            daySundaySurcharge: 4853, // Recargo diurno dominical
            nightSundaySurcharge: 7118, // Recargo nocturno dominical
            dayOvertime: 1618,        // Hora extra diurna
            nightOvertime: 4853,      // Hora extra nocturna
            daySundayHoliday: 5176,   // Hora diurna dominical/festivo
            daySundayOvertime: 6794,  // Hora extra diurna dominical/festivo
            nightSundayHoliday: 7118, // Hora nocturna dominical/festivo
            nightSundayOvertime: 11970 // Hora extra nocturna dominical/festivo
        };

        this.init();
    }

    init() {
        console.log('📄 Inicializando generador de comprobantes de trabajo...');
        this.setupEventListeners();
        console.log('✅ Generador de comprobantes de trabajo inicializado');
    }

    setupEventListeners() {
        // Event listener para generar comprobante
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-generate-work-order]')) {
                e.preventDefault();
                this.generateWorkOrder();
            }
        });

        // Event listener para imprimir comprobante
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-print-work-order]')) {
                e.preventDefault();
                this.printWorkOrder();
            }
        });

        // Event listener para descargar comprobante
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-download-work-order]')) {
                e.preventDefault();
                this.downloadWorkOrder();
            }
        });
    }

    generateWorkOrder(employeeData = null, hoursData = null) {
        try {
            console.log('📄 Generando comprobante de trabajo...');

            // Obtener datos del empleado y horas
            const employee = employeeData || this.getCurrentEmployeeData();
            const hours = hoursData || this.getCurrentHoursData();

            if (!employee || !hours) {
                this.showNotification('No se encontraron datos del empleado o las horas', 'error');
                return;
            }

            // Calcular totales
            const calculations = this.calculateWorkOrder(employee, hours);

            // Generar HTML del comprobante
            const workOrderHTML = this.createWorkOrderHTML(employee, hours, calculations);

            // Mostrar comprobante en modal
            this.showWorkOrderModal(workOrderHTML);

            console.log('✅ Comprobante de trabajo generado');
        } catch (error) {
            console.error('❌ Error generando comprobante:', error);
            this.showNotification('Error generando comprobante: ' + error.message, 'error');
        }
    }

    getCurrentEmployeeData() {
        // Intentar obtener datos del empleado desde el formulario actual
        const employeeSelect = document.getElementById('employeeSelect');
        const employeeName = document.getElementById('employeeName');
        const employeeId = document.getElementById('employeeId');
        const contractType = document.getElementById('contractType');
        const baseSalary = document.getElementById('baseSalary');

        if (employeeSelect && employeeSelect.value) {
            const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];
            return {
                name: selectedOption.textContent || 'Empleado',
                id: selectedOption.value || '000001',
                contractType: contractType ? contractType.value || 'TEMPORAL' : 'TEMPORAL',
                baseSalary: baseSalary ? parseFloat(baseSalary.value) || 1423500 : 1423500
            };
        }

        // Datos por defecto si no se encuentran
        return {
            name: 'JUAN DAVID',
            id: '000001',
            contractType: 'TEMPORAL',
            baseSalary: 1423500
        };
    }

    getCurrentHoursData() {
        // Obtener datos de horas desde el formulario
        const hoursData = {
            ordinary: parseFloat(document.getElementById('ordinaryHours')?.value || 0),
            nightSurcharge: parseFloat(document.getElementById('nightSurchargeHours')?.value || 0),
            daySundaySurcharge: parseFloat(document.getElementById('daySundaySurchargeHours')?.value || 0),
            nightSundaySurcharge: parseFloat(document.getElementById('nightSundaySurchargeHours')?.value || 0),
            dayOvertime: parseFloat(document.getElementById('dayOvertimeHours')?.value || 0),
            nightOvertime: parseFloat(document.getElementById('nightOvertimeHours')?.value || 0),
            daySundayHoliday: parseFloat(document.getElementById('daySundayHolidayHours')?.value || 0),
            daySundayOvertime: parseFloat(document.getElementById('daySundayOvertimeHours')?.value || 0),
            nightSundayHoliday: parseFloat(document.getElementById('nightSundayHolidayHours')?.value || 0),
            nightSundayOvertime: parseFloat(document.getElementById('nightSundayOvertimeHours')?.value || 0)
        };

        return hoursData;
    }

    calculateWorkOrder(employee, hours) {
        const calculations = [];
        let totalHours = 0;
        let totalAmount = 0;

        // Calcular cada tipo de hora
        const hourTypes = [
            { key: 'ordinary', label: 'ORDINARIAS', hours: hours.ordinary },
            { key: 'nightSurcharge', label: 'RECARGO NOCTURNO', hours: hours.nightSurcharge },
            { key: 'daySundaySurcharge', label: 'RECARGO DIURNO DOMINICAL', hours: hours.daySundaySurcharge },
            { key: 'nightSundaySurcharge', label: 'RECARGO NOCTURNO DOMINICAL', hours: hours.nightSundaySurcharge },
            { key: 'dayOvertime', label: 'HORA EXTRA DIURNA', hours: hours.dayOvertime },
            { key: 'nightOvertime', label: 'HORA EXTRA NOCTURNA', hours: hours.nightOvertime },
            { key: 'daySundayHoliday', label: 'HORA DIURNA DOMINICAL O FESTIVO', hours: hours.daySundayHoliday },
            { key: 'daySundayOvertime', label: 'HORA EXTRA DIURNA DOMINICAL O FESTIVO', hours: hours.daySundayOvertime },
            { key: 'nightSundayHoliday', label: 'HORA NOCTURNA DOMINICAL O FESTIVO', hours: hours.nightSundayHoliday },
            { key: 'nightSundayOvertime', label: 'HORA EXTRA NOCTURNA DOMINICAL O FESTIVO', hours: hours.nightSundayOvertime }
        ];

        hourTypes.forEach(type => {
            const hourlyRate = this.hourlyRates[type.key];
            const surchargeRate = this.getSurchargeRate(type.key);
            const totalRate = hourlyRate + surchargeRate;
            const subtotal = type.hours * totalRate;

            calculations.push({
                concept: type.label,
                hourlyValue: hourlyRate,
                surchargeValue: surchargeRate,
                totalValue: totalRate,
                hours: type.hours,
                subtotal: subtotal
            });

            totalHours += type.hours;
            totalAmount += subtotal;
        });

        return {
            calculations,
            totalHours,
            totalAmount
        };
    }

    getSurchargeRate(hourType) {
        const surchargeRates = {
            ordinary: 0,
            nightSurcharge: this.hourlyRates.nightSurcharge,
            daySundaySurcharge: this.hourlyRates.daySundaySurcharge,
            nightSundaySurcharge: this.hourlyRates.nightSundaySurcharge,
            dayOvertime: this.hourlyRates.dayOvertime,
            nightOvertime: this.hourlyRates.nightOvertime,
            daySundayHoliday: this.hourlyRates.daySundayHoliday,
            daySundayOvertime: this.hourlyRates.daySundayOvertime,
            nightSundayHoliday: this.hourlyRates.nightSundayHoliday,
            nightSundayOvertime: this.hourlyRates.nightSundayOvertime
        };

        return surchargeRates[hourType] || 0;
    }

    createWorkOrderHTML(employee, hours, calculations) {
        const companyConfig = window.axyraCompanyConfigSystem || {
            getCompanyName: () => 'VILLA VENECIA',
            getNIT: () => '901.234.567-8',
            getAddress: () => 'CRA. 43 SUCRE, VENECIA, ANTIOQUIA, COLOMBIA',
            formatCurrency: (amount) => `$${amount.toLocaleString('es-CO')}`,
            formatDate: (date) => new Date(date).toLocaleDateString('es-CO')
        };

        const currentDate = new Date();
        const workOrderNumber = this.generateWorkOrderNumber(currentDate);

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Orden de Trabajo - ${workOrderNumber}</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: white;
                        color: #333;
                        line-height: 1.4;
                    }
                    .work-order {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        border: 1px solid #ddd;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: #2c3e50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .header .work-order-number {
                        font-size: 18px;
                        margin-top: 10px;
                        opacity: 0.9;
                    }
                    .company-info {
                        background: #f8f9fa;
                        padding: 20px;
                        border-bottom: 2px solid #e9ecef;
                    }
                    .company-info h2 {
                        margin: 0 0 15px 0;
                        color: #2c3e50;
                        font-size: 20px;
                    }
                    .company-details {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    .company-details div {
                        margin-bottom: 8px;
                    }
                    .company-details strong {
                        color: #495057;
                    }
                    .employee-info {
                        padding: 20px;
                        background: #e3f2fd;
                        border-bottom: 2px solid #bbdefb;
                    }
                    .employee-info h3 {
                        margin: 0 0 15px 0;
                        color: #1565c0;
                        font-size: 18px;
                    }
                    .employee-details {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    .employee-details div {
                        margin-bottom: 8px;
                    }
                    .employee-details strong {
                        color: #0d47a1;
                    }
                    .hours-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .hours-table th,
                    .hours-table td {
                        padding: 12px 8px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    .hours-table th {
                        background: #f8f9fa;
                        font-weight: bold;
                        color: #495057;
                        font-size: 12px;
                    }
                    .hours-table td {
                        font-size: 12px;
                    }
                    .hours-table .concept {
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .hours-table .number {
                        text-align: right;
                    }
                    .hours-table .subtotal {
                        font-weight: bold;
                        color: #27ae60;
                    }
                    .total-section {
                        background: #f8f9fa;
                        padding: 20px;
                        border-top: 3px solid #27ae60;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        font-size: 16px;
                    }
                    .total-label {
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .total-amount {
                        font-weight: bold;
                        color: #27ae60;
                        font-size: 18px;
                    }
                    .signature-section {
                        margin-top: 40px;
                        padding: 20px;
                        border-top: 1px solid #ddd;
                    }
                    .signature-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                    }
                    .signature-field {
                        width: 45%;
                    }
                    .signature-field label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: bold;
                        color: #495057;
                    }
                    .signature-line {
                        border-bottom: 1px solid #333;
                        height: 30px;
                        margin-bottom: 5px;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background: #f8f9fa;
                        color: #6c757d;
                        font-size: 12px;
                    }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .work-order { box-shadow: none; border: none; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="work-order">
                    <div class="header">
                        <h1>ORDEN DE TRABAJO N°</h1>
                        <div class="work-order-number">${workOrderNumber}</div>
                    </div>

                    <div class="company-info">
                        <h2>INFORMACIÓN DE LA EMPRESA</h2>
                        <div class="company-details">
                            <div>
                                <strong>EMPRESA:</strong> ${companyConfig.getCompanyName()}
                            </div>
                            <div>
                                <strong>NIT:</strong> ${companyConfig.getNIT()}
                            </div>
                            <div>
                                <strong>DIRECCIÓN:</strong> ${companyConfig.getAddress()}
                            </div>
                            <div>
                                <strong>FECHA:</strong> ${companyConfig.formatDate(currentDate)}
                            </div>
                        </div>
                    </div>

                    <div class="employee-info">
                        <h3>INFORMACIÓN DEL PRESTADOR DEL SERVICIO</h3>
                        <div class="employee-details">
                            <div>
                                <strong>PRESTADOR DEL SERVICIO:</strong> ${employee.name}
                            </div>
                            <div>
                                <strong>CÉDULA:</strong> ${employee.id}
                            </div>
                            <div>
                                <strong>TIPO DE CONTRATO:</strong> ${employee.contractType}
                            </div>
                            <div>
                                <strong>SALARIO BASE LIQUIDACIÓN:</strong> ${companyConfig.formatCurrency(employee.baseSalary)}
                            </div>
                            <div>
                                <strong>TOTAL HORAS TRABAJADAS:</strong> ${calculations.totalHours.toFixed(1)}
                            </div>
                        </div>
                    </div>

                    <table class="hours-table">
                        <thead>
                            <tr>
                                <th>CONCEPTO</th>
                                <th>VALOR HORA</th>
                                <th>VALOR RECARGO</th>
                                <th>VALOR TOTAL</th>
                                <th>HORAS</th>
                                <th>SUBTOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calculations.calculations.map(calc => `
                                <tr>
                                    <td class="concept">${calc.concept}</td>
                                    <td class="number">${companyConfig.formatCurrency(calc.hourlyValue)}</td>
                                    <td class="number">${companyConfig.formatCurrency(calc.surchargeValue)}</td>
                                    <td class="number">${companyConfig.formatCurrency(calc.totalValue)}</td>
                                    <td class="number">${calc.hours.toFixed(1)}</td>
                                    <td class="number subtotal">${companyConfig.formatCurrency(calc.subtotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span class="total-label">TOTAL (CON AUXILIO):</span>
                            <span class="total-amount">${companyConfig.formatCurrency(calculations.totalAmount)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">TOTAL NETO A PAGAR:</span>
                            <span class="total-amount">${companyConfig.formatCurrency(calculations.totalAmount)}</span>
                        </div>
                    </div>

                    <div class="signature-section">
                        <div class="signature-row">
                            <div class="signature-field">
                                <label>FIRMA DEL TRABAJADOR</label>
                                <div class="signature-line"></div>
                                <div style="font-size: 12px; color: #6c757d;">${employee.name}</div>
                            </div>
                            <div class="signature-field">
                                <label>CÉDULA</label>
                                <div class="signature-line"></div>
                                <div style="font-size: 12px; color: #6c757d;">${employee.id}</div>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Este documento fue generado automáticamente por el Sistema AXYRA</p>
                        <p>Fecha de generación: ${currentDate.toLocaleString('es-CO')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    generateWorkOrderNumber(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}-${month}-${year}_${hour}-${minute}-${String(date.getSeconds()).padStart(2, '0')}`;
    }

    showWorkOrderModal(workOrderHTML) {
        const modal = document.createElement('div');
        modal.className = 'axyra-modal';
        modal.innerHTML = `
            <div class="axyra-modal-content" style="max-width: 90vw; max-height: 90vh; overflow: auto;">
                <div class="axyra-modal-header">
                    <h3>📄 Comprobante de Trabajo</h3>
                    <button class="axyra-modal-close" onclick="this.closest('.axyra-modal').remove()">&times;</button>
                </div>
                <div class="axyra-modal-body">
                    <div class="work-order-actions" style="margin-bottom: 20px; text-align: center;">
                        <button class="axyra-btn-primary" data-print-work-order>
                            <i class="fas fa-print"></i> Imprimir
                        </button>
                        <button class="axyra-btn-secondary" data-download-work-order>
                            <i class="fas fa-download"></i> Descargar PDF
                        </button>
                    </div>
                    <div id="work-order-content">
                        ${workOrderHTML}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    printWorkOrder() {
        const workOrderContent = document.getElementById('work-order-content');
        if (workOrderContent) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(workOrderContent.innerHTML);
            printWindow.document.close();
            printWindow.print();
        }
    }

    downloadWorkOrder() {
        // Implementar descarga como PDF usando jsPDF o similar
        this.showNotification('Función de descarga PDF en desarrollo', 'info');
    }

    showNotification(message, type = 'info') {
        if (window.axyraErrorHandler) {
            window.axyraErrorHandler.showNotification('Generador de Comprobantes', message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Inicializar generador de comprobantes cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.axyraWorkOrderGenerator) {
        window.axyraWorkOrderGenerator = new AxyraWorkOrderGenerator();
    }
});
