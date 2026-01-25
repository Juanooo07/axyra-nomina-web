interface CompanyInfo {
  company_name: string;
  company_nit: string;
  company_address: string;
  minimum_salary: number;
}

interface EmployeeInfo {
  full_name: string;
  cedula: string;
  contract_type: string;
  monthly_salary: number;
}

interface HourDetail {
  concept: string;
  hourValue: number;
  surchargeValue: number;
  totalValue: number;
  hours: number;
  subtotal: number;
}

export function generatePaymentReceipt(
  company: CompanyInfo,
  employee: EmployeeInfo,
  hourDetails: HourDetail[],
  totalHours: number,
  totalAmount: number
): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(/\//g, '-').replace(',', '_');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Orden de Trabajo</title>
  <style>
    @page {
      size: letter;
      margin: 1cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      margin: 0;
      padding: 20px;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 30px;
      font-weight: bold;
    }
    .header-info {
      margin-bottom: 20px;
    }
    .header-info p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f0f0f0;
      padding: 8px;
      text-align: left;
      border: none;
      font-weight: bold;
      font-size: 9pt;
    }
    td {
      padding: 6px 8px;
      border: none;
      text-align: left;
      font-size: 9pt;
    }
    .number {
      text-align: right;
    }
    .center {
      text-align: center;
    }
    .total-section {
      margin-top: 20px;
      font-size: 12pt;
    }
    .total-section p {
      margin: 8px 0;
      font-weight: bold;
    }
    .signature-section {
      margin-top: 50px;
    }
    .signature-section p {
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>ORDEN DE TRABAJO N° ${dateStr}</h1>

  <div class="header-info">
    <p><strong>EMPRESA:</strong> ${company.company_name.toUpperCase()}</p>
    <p><strong>NIT:</strong> ${company.company_nit}</p>
    <p><strong>DIRECCIÓN:</strong> ${company.company_address.toUpperCase()}</p>
    <br>
    <p><strong>PRESTADOR DEL SERVICIO:</strong> ${employee.full_name.toUpperCase()}</p>
    <p><strong>CÉDULA:</strong> ${employee.cedula}</p>
    <p><strong>TIPO DE CONTRATO:</strong> ${employee.contract_type}</p>
    <p><strong>SALARIO BASE LIQUIDACIÓN:</strong> ${formatCurrency(employee.monthly_salary)}</p>
    <p><strong>TOTAL HORAS TRABAJADAS:</strong> ${totalHours.toFixed(1)}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>CONCEPTO</th>
        <th class="number">VALOR HORA</th>
        <th class="number">VALOR RECARGO</th>
        <th class="number">VALOR TOTAL</th>
        <th class="center">HORAS</th>
        <th class="number">SUBTOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${hourDetails.map(detail => `
        <tr>
          <td>${detail.concept.toUpperCase()}</td>
          <td class="number">${formatCurrency(detail.hourValue)}</td>
          <td class="number">${formatCurrency(detail.surchargeValue)}</td>
          <td class="number">${formatCurrency(detail.totalValue)}</td>
          <td class="center">${detail.hours.toFixed(1)}</td>
          <td class="number">${formatCurrency(detail.subtotal)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total-section">
    <p>TOTAL (CON AUXILIO): ${formatCurrency(totalAmount)}</p>
    <p>TOTAL NETO A PAGAR: ${formatCurrency(totalAmount)}</p>
  </div>

  <div class="signature-section">
    <p>FIRMA DEL TRABAJADOR: __________________________</p>
    <p>CÉDULA: __________________________</p>
  </div>
</body>
</html>
`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export async function generateReceiptFromData(
  companyData: CompanyInfo,
  employeeData: EmployeeInfo,
  hourRecords: Array<{ hour_type_name: string; hours: number }>,
  surcharges: Array<{ hour_type_name: string; surcharge_percent: number }>
): Promise<void> {
  const monthlySalary = employeeData.monthly_salary;
  const baseHourValue = monthlySalary / 220;
  const isFijo = employeeData.contract_type === 'FIJO';

  const conceptMapping: Record<string, string> = {
    'Hora Ordinaria': 'ORDINARIAS',
    'Hora Extra Diurna': 'HORA EXTRA DIURNA',
    'Hora Nocturna': 'RECARGO NOCTURNO',
    'Hora Extra Nocturna': 'HORA EXTRA NOCTURNA',
    'Hora Diurna Dominical': 'HORA DIURNA DOMINICAL O FESTIVO',
    'Hora Extra Diurna Dominical': 'HORA EXTRA DIURNA DOMINICAL O FESTIVO',
    'Hora Nocturna Dominical': 'HORA NOCTURNA DOMINICAL O FESTIVO',
    'Hora Extra Nocturna Dominical': 'HORA EXTRA NOCTURNA DOMINICAL O FESTIVO'
  };

  const allConcepts = [
    'Hora Ordinaria',
    'Hora Extra Diurna',
    'Hora Nocturna',
    'Hora Extra Nocturna',
    'Hora Diurna Dominical',
    'Hora Extra Diurna Dominical',
    'Hora Nocturna Dominical',
    'Hora Extra Nocturna Dominical'
  ];

  const hourDetails: HourDetail[] = allConcepts.map(concept => {
    const record = hourRecords.find(r => r.hour_type_name === concept);
    const surcharge = surcharges.find(s => s.hour_type_name === concept);

    let hours = record?.hours || 0;
    const surchargePercent = surcharge?.surcharge_percent || 0;

    let hourValue = baseHourValue;
    let surchargeValue = baseHourValue * (surchargePercent / 100);
    let totalValue = hourValue + surchargeValue;
    let subtotal = 0;

    if (isFijo && concept === 'Hora Ordinaria') {
      hours = 88;
      const biweeklySalary = monthlySalary / 2;
      const ordinaryHourValue = biweeklySalary / 88;
      hourValue = ordinaryHourValue;
      surchargeValue = 0;
      totalValue = ordinaryHourValue;
      subtotal = biweeklySalary;
    } else if (isFijo && concept !== 'Hora Ordinaria') {
      hourValue = baseHourValue;
      surchargeValue = baseHourValue * (surchargePercent / 100);
      totalValue = hourValue + surchargeValue;
      subtotal = surchargeValue * hours;
    } else {
      subtotal = totalValue * hours;
    }

    return {
      concept: conceptMapping[concept] || concept,
      hourValue,
      surchargeValue,
      totalValue,
      hours,
      subtotal
    };
  });

  let totalHours = 0;
  let totalAmount = 0;

  if (isFijo) {
    totalHours = 88 + hourDetails.slice(1).reduce((sum, detail) => sum + detail.hours, 0);
    totalAmount = hourDetails.reduce((sum, detail) => sum + detail.subtotal, 0);
  } else {
    totalHours = hourDetails.reduce((sum, detail) => sum + detail.hours, 0);
    totalAmount = hourDetails.reduce((sum, detail) => sum + detail.subtotal, 0);
  }

  generatePaymentReceipt(companyData, employeeData, hourDetails, totalHours, totalAmount);
}

interface SettlementYearBreakdown {
  anio: number;
  dias: number;
  salarioBase: number;
  auxTransporte: number;
  sPrest: number;
  cesantias: number;
  interesesCesantias: number;
  prima: number;
  vacaciones: number;
  totalAnio: number;
}

interface SettlementData {
  employeeName: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: 'DIAS' | 'HORAS';
  diasTotales: number;
  baseMode: string;
  aplicaAuxTransporte: boolean;
  breakdownPorAnio: SettlementYearBreakdown[];
  totalGeneral: number;
  incluirCesantias: boolean;
  incluirInteresesCesantias: boolean;
  incluirPrima: boolean;
  incluirVacaciones: boolean;
}

export function generateSettlementPDF(data: SettlementData): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(/\//g, '-').replace(',', '_');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Liquidación - ${data.employeeName}</title>
  <style>
    @page {
      size: letter;
      margin: 1cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      margin: 0;
      padding: 20px;
    }
    h1 {
      text-align: center;
      font-size: 18pt;
      margin-bottom: 30px;
      font-weight: bold;
      color: #1e40af;
    }
    .header-info {
      margin-bottom: 30px;
      background-color: #f8fafc;
      padding: 15px;
      border-radius: 8px;
    }
    .header-info p {
      margin: 5px 0;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #1e40af;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #1e40af;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: bold;
      font-size: 9pt;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      font-size: 9pt;
    }
    tr:hover {
      background-color: #f8fafc;
    }
    .number {
      text-align: right;
    }
    .total-row {
      background-color: #1e40af;
      color: white;
      font-weight: bold;
    }
    .total-row td {
      border-bottom: none;
      padding: 12px 8px;
      font-size: 11pt;
    }
    .summary-box {
      background-color: #dbeafe;
      border: 2px solid #1e40af;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .summary-box p {
      margin: 5px 0;
      font-size: 12pt;
    }
    .footer {
      margin-top: 50px;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>LIQUIDACIÓN DE PRESTACIONES SOCIALES</h1>

  <div class="header-info">
    <p><strong>TRABAJADOR:</strong> ${data.employeeName.toUpperCase()}</p>
    <p><strong>FECHA DE INICIO:</strong> ${formatDate(data.fechaInicio)}</p>
    <p><strong>FECHA DE FIN:</strong> ${formatDate(data.fechaFin)}</p>
    <p><strong>MODALIDAD:</strong> ${data.modalidad}</p>
    <p><strong>TOTAL DÍAS:</strong> ${data.diasTotales} días</p>
    <p><strong>BASE SALARIAL:</strong> ${data.baseMode}</p>
    <p><strong>AUXILIO DE TRANSPORTE:</strong> ${data.aplicaAuxTransporte ? 'SÍ' : 'NO'}</p>
  </div>

  <div class="section-title">Desglose por Año</div>

  <table>
    <thead>
      <tr>
        <th>Año</th>
        <th class="number">Días</th>
        <th class="number">Salario Base</th>
        <th class="number">Aux. Transp.</th>
        <th class="number">S. Prest.</th>
        ${data.incluirCesantias ? '<th class="number">Cesantías</th>' : ''}
        ${data.incluirInteresesCesantias ? '<th class="number">Int. Ces.</th>' : ''}
        ${data.incluirPrima ? '<th class="number">Prima</th>' : ''}
        ${data.incluirVacaciones ? '<th class="number">Vacaciones</th>' : ''}
        <th class="number">Total Año</th>
      </tr>
    </thead>
    <tbody>
      ${data.breakdownPorAnio.map(year => `
        <tr>
          <td><strong>${year.anio}</strong></td>
          <td class="number">${year.dias}</td>
          <td class="number">${formatCurrency(year.salarioBase)}</td>
          <td class="number">${formatCurrency(year.auxTransporte)}</td>
          <td class="number">${formatCurrency(year.sPrest)}</td>
          ${data.incluirCesantias ? `<td class="number">${formatCurrency(year.cesantias)}</td>` : ''}
          ${data.incluirInteresesCesantias ? `<td class="number">${formatCurrency(year.interesesCesantias)}</td>` : ''}
          ${data.incluirPrima ? `<td class="number">${formatCurrency(year.prima)}</td>` : ''}
          ${data.incluirVacaciones ? `<td class="number">${formatCurrency(year.vacaciones)}</td>` : ''}
          <td class="number"><strong>${formatCurrency(year.totalAnio)}</strong></td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="${5 + (data.incluirCesantias ? 1 : 0) + (data.incluirInteresesCesantias ? 1 : 0) + (data.incluirPrima ? 1 : 0) + (data.incluirVacaciones ? 1 : 0)}" class="number">
          TOTAL GENERAL
        </td>
        <td class="number">${formatCurrency(data.totalGeneral)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="summary-box">
    <p><strong>TOTAL A PAGAR:</strong> ${formatCurrency(data.totalGeneral)}</p>
  </div>

  <div class="footer">
    <p>Documento generado el ${dateStr}</p>
    <p>Sistema de Gestión de Nómina - AXYRA</p>
  </div>
</body>
</html>
`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * Genera un PDF como Blob para subir a Google Drive
 * Mismo contenido que generatePaymentReceipt pero retorna Blob
 */
export async function generatePaymentReceiptBlob(
  company: CompanyInfo,
  employee: EmployeeInfo,
  hourDetails: HourDetail[],
  totalHours: number,
  totalAmount: number
): Promise<Blob> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Orden de Trabajo</title>
  <style>
    @page {
      size: letter;
      margin: 1cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      margin: 0;
      padding: 20px;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 30px;
      font-weight: bold;
    }
    .header-info {
      margin-bottom: 20px;
    }
    .header-info p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f0f0f0;
      padding: 8px;
      text-align: left;
      border: none;
      font-weight: bold;
      font-size: 9pt;
    }
    td {
      padding: 6px 8px;
      border: none;
      text-align: left;
      font-size: 9pt;
    }
    .number {
      text-align: right;
    }
    .center {
      text-align: center;
    }
    .total-section {
      margin-top: 20px;
      padding: 10px;
      border-top: 2px solid #000;
      font-weight: bold;
    }
    .signature-section {
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <h1>ORDEN DE TRABAJO</h1>

  <div class="header-info">
    <p><strong>EMPRESA:</strong> ${company.company_name}</p>
    <p><strong>NIT:</strong> ${company.company_nit}</p>
    <p><strong>DIRECCIÓN:</strong> ${company.company_address}</p>
  </div>

  <div class="header-info">
    <p><strong>TRABAJADOR:</strong> ${employee.full_name.toUpperCase()}</p>
    <p><strong>CÉDULA:</strong> ${employee.cedula}</p>
    <p><strong>TIPO DE CONTRATO:</strong> ${employee.contract_type}</p>
    <p><strong>SALARIO BASE LIQUIDACIÓN:</strong> ${formatCurrency(employee.monthly_salary)}</p>
    <p><strong>TOTAL HORAS TRABAJADAS:</strong> ${totalHours.toFixed(1)}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>CONCEPTO</th>
        <th class="number">VALOR HORA</th>
        <th class="number">VALOR RECARGO</th>
        <th class="number">VALOR TOTAL</th>
        <th class="center">HORAS</th>
        <th class="number">SUBTOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${hourDetails.map(detail => \`
        <tr>
          <td>\${detail.concept.toUpperCase()}</td>
          <td class="number">\${formatCurrency(detail.hourValue)}</td>
          <td class="number">\${formatCurrency(detail.surchargeValue)}</td>
          <td class="number">\${formatCurrency(detail.totalValue)}</td>
          <td class="center">\${detail.hours.toFixed(1)}</td>
          <td class="number">\${formatCurrency(detail.subtotal)}</td>
        </tr>
      \`).join('')}
    </tbody>
  </table>

  <div class="total-section">
    <p>TOTAL (CON AUXILIO): ${formatCurrency(totalAmount)}</p>
    <p>TOTAL NETO A PAGAR: ${formatCurrency(totalAmount)}</p>
  </div>

  <div class="signature-section">
    <p>FIRMA DEL TRABAJADOR: __________________________</p>
    <p>CÉDULA: __________________________</p>
  </div>
</body>
</html>
`;

  // Usar html2pdf para convertir a PDF
  const element = document.createElement('div');
  element.innerHTML = html;
  
  const opt = {
    margin: 10,
    filename: 'nomina.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'letter' }
  };

  // Importar html2pdf dinámicamente
  const html2pdf = (await import('html2pdf.js')).default;
  
  return new Promise((resolve, reject) => {
    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .output('blob')
      .then((blob: Blob) => {
        resolve(blob);
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
