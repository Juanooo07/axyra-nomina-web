import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  full_name: string;
  cedula: string;
  contract_type: 'FIJO' | 'TEMPORAL';
  monthly_salary: number;
  comments: string;
  deduct_health: boolean;
  deduct_pension: boolean;
  deduct_transport: boolean;
  receives_transport_allowance: boolean;
  status: string;
}

interface PayrollData {
  employee_id: string;
  employee_name: string;
  employee_cedula: string;
  period: string;
  total_earned: number;
  transport_allowance: number;
  health_deduction: number;
  pension_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
}

/**
 * Exporta empleados a Excel con toda la información
 */
export function exportEmployeesToExcel(employees: Employee[], employeePayments: Record<string, number> = {}, employeeHours: Record<string, number> = {}): void {
  const wb = XLSX.utils.book_new();

  // HOJA 1: Resumen de Empleados
  const employeeSummary = employees.map((emp) => ({
    Nombre: emp.full_name,
    Cédula: emp.cedula,
    'Tipo Contrato': emp.contract_type,
    'Salario Base': emp.monthly_salary,
    'Total Horas': employeeHours[emp.id] || 0,
    'Total Pagos': employeePayments[emp.id] || 0,
    'Desc. Salud': emp.deduct_health ? 'Sí' : 'No',
    'Desc. Pensión': emp.deduct_pension ? 'Sí' : 'No',
    'Desc. Transporte': emp.deduct_transport ? 'Sí' : 'No',
    'Auxilio Transporte': emp.receives_transport_allowance ? 'Sí' : 'No',
    Estado: emp.status === 'active' ? 'Activo' : 'Inactivo',
    Comentarios: emp.comments || '',
  }));

  const wsEmployees = XLSX.utils.json_to_sheet(employeeSummary);

  // Formatear ancho de columnas
  const maxWidth = 20;
  const colWidths = [25, 15, 15, 15, 15, 15, 12, 12, 15, 15, 12, 20];
  wsEmployees['!cols'] = colWidths.map(w => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, wsEmployees, 'Empleados');

  // HOJA 2: Estadísticas de Empleados
  const totalPayments = employees.reduce((sum, emp) => sum + (employeePayments[emp.id] || 0), 0);
  const stats = [
    {
      'Total Empleados': employees.length,
      'Empleados Activos': employees.filter(e => e.status === 'active').length,
      'Empleados Inactivos': employees.filter(e => e.status === 'inactive').length,
      'Empleados Fijos': employees.filter(e => e.contract_type === 'FIJO').length,
      'Empleados Temporales': employees.filter(e => e.contract_type === 'TEMPORAL').length,
    },
    {
      'Salario Promedio': Math.round(employees.reduce((sum, e) => sum + e.monthly_salary, 0) / employees.length),
      'Salario Mínimo': Math.min(...employees.map(e => e.monthly_salary)),
      'Salario Máximo': Math.max(...employees.map(e => e.monthly_salary)),
      'Total Nómina Mensual': employees.reduce((sum, e) => sum + e.monthly_salary, 0),
      'Total Pagos Acumulados': totalPayments,
    },
    {
      'Promedio Total Pagos por Empleado': employees.length > 0 ? Math.round(totalPayments / employees.length) : 0,
    },
  ];

  const wsStats = XLSX.utils.json_to_sheet(stats);
  wsStats['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');

  // HOJA 3: Detalles de Deducibles
  const deductiblesDetail = employees
    .filter(e => e.contract_type === 'FIJO')
    .map((emp) => {
      const healthDeduction = emp.deduct_health ? Math.round(emp.monthly_salary * 0.04) : 0;
      const pensionDeduction = emp.deduct_pension ? Math.round(emp.monthly_salary * 0.04) : 0;
      const transportDeduction = emp.deduct_transport ? Math.round(emp.monthly_salary * 0.04) : 0;
      const totalDeductions = healthDeduction + pensionDeduction + transportDeduction;

      return {
        Nombre: emp.full_name,
        Cédula: emp.cedula,
        'Salario Base': emp.monthly_salary,
        'Desc. Salud (4%)': healthDeduction,
        'Desc. Pensión (4%)': pensionDeduction,
        'Desc. Transporte (4%)': transportDeduction,
        'Total Descuentos': totalDeductions,
        'Neto Mensual': emp.monthly_salary - totalDeductions,
        'Auxilio Transporte': emp.receives_transport_allowance ? 140000 : 0,
      };
    });

  const wsDeductibles = XLSX.utils.json_to_sheet(deductiblesDetail);
  wsDeductibles['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsDeductibles, 'Deducibles Fijos');

  // Generar archivo
  const fileName = `Empleados_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta un solo empleado a Excel con total acumulado de pagos
 */
export function exportEmployeeToExcel(employee: Employee, totalPayments: number, totalHours: number): void {
  const wb = XLSX.utils.book_new();

  const employeeData = [
    {
      Nombre: employee.full_name,
      Cédula: employee.cedula,
      'Tipo Contrato': employee.contract_type,
      'Salario Base': employee.monthly_salary,
      'Total Horas': totalHours,
      'Total Pagos': totalPayments,
      'Desc. Salud': employee.deduct_health ? 'Sí' : 'No',
      'Desc. Pensión': employee.deduct_pension ? 'Sí' : 'No',
      'Desc. Transporte': employee.deduct_transport ? 'Sí' : 'No',
      'Auxilio Transporte': employee.receives_transport_allowance ? 'Sí' : 'No',
      Estado: employee.status === 'active' ? 'Activo' : 'Inactivo',
      Comentarios: employee.comments || '',
    },
  ];

  const wsEmployee = XLSX.utils.json_to_sheet(employeeData);
  wsEmployee['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsEmployee, 'Empleado');

  if (employee.contract_type === 'FIJO') {
    const healthDeduction = employee.deduct_health ? Math.round(employee.monthly_salary * 0.04) : 0;
    const pensionDeduction = employee.deduct_pension ? Math.round(employee.monthly_salary * 0.04) : 0;
    const transportDeduction = employee.deduct_transport ? Math.round(employee.monthly_salary * 0.04) : 0;
    const totalDeductions = healthDeduction + pensionDeduction + transportDeduction;

    const deductiblesDetail = [
      {
        Nombre: employee.full_name,
        Cédula: employee.cedula,
        'Salario Base': employee.monthly_salary,
        'Desc. Salud (4%)': healthDeduction,
        'Desc. Pensión (4%)': pensionDeduction,
        'Desc. Transporte (4%)': transportDeduction,
        'Total Descuentos': totalDeductions,
        'Neto Mensual': employee.monthly_salary - totalDeductions,
        'Auxilio Transporte': employee.receives_transport_allowance ? 140000 : 0,
      },
    ];

    const wsDeductibles = XLSX.utils.json_to_sheet(deductiblesDetail);
    wsDeductibles['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, wsDeductibles, 'Deducibles');
  }

  const sanitizedFileName = employee.full_name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');
  const fileName = `${sanitizedFileName}_TotalPagos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta nóminas (payrolls) a Excel con información detallada por período
 */
export function exportPayrollToExcel(payrolls: PayrollData[], employees: Employee[]): void {
  const wb = XLSX.utils.book_new();

  // HOJA 1: Resumen de Nóminas
  const payrollSummary = payrolls.map((p) => ({
    Período: p.period,
    Empleado: p.employee_name,
    Cédula: p.employee_cedula,
    'Devengado': p.total_earned,
    'Auxilio Transporte': p.transport_allowance,
    'Desc. Salud': p.health_deduction,
    'Desc. Pensión': p.pension_deduction,
    'Otros Descuentos': p.other_deductions,
    'Total Descuentos': p.total_deductions,
    'Neto a Pagar': p.net_pay,
  }));

  const wsPayroll = XLSX.utils.json_to_sheet(payrollSummary);
  wsPayroll['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsPayroll, 'Nóminas');

  // HOJA 2: Resumen por Empleado
  const employeePayrollSummary = employees.map((emp) => {
    const employeePayrolls = payrolls.filter(p => p.employee_id === emp.id);
    const totalEarned = employeePayrolls.reduce((sum, p) => sum + p.total_earned, 0);
    const totalDeductions = employeePayrolls.reduce((sum, p) => sum + p.total_deductions, 0);
    const totalNetPay = employeePayrolls.reduce((sum, p) => sum + p.net_pay, 0);
    const periods = employeePayrolls.length;

    return {
      Empleado: emp.full_name,
      Cédula: emp.cedula,
      'Tipo Contrato': emp.contract_type,
      'Períodos Procesados': periods,
      'Total Devengado': totalEarned,
      'Total Descuentos': totalDeductions,
      'Total Neto': totalNetPay,
      'Promedio por Período': periods > 0 ? Math.round(totalNetPay / periods) : 0,
    };
  });

  const wsEmployeePayroll = XLSX.utils.json_to_sheet(employeePayrollSummary);
  wsEmployeePayroll['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsEmployeePayroll, 'Resumen por Empleado');

  // HOJA 3: Análisis por Período
  const periods = [...new Set(payrolls.map(p => p.period))].sort();
  const periodAnalysis = periods.map((period) => {
    const periodPayrolls = payrolls.filter(p => p.period === period);
    const totalEarned = periodPayrolls.reduce((sum, p) => sum + p.total_earned, 0);
    const totalTransport = periodPayrolls.reduce((sum, p) => sum + p.transport_allowance, 0);
    const totalDeductions = periodPayrolls.reduce((sum, p) => sum + p.total_deductions, 0);
    const totalNetPay = periodPayrolls.reduce((sum, p) => sum + p.net_pay, 0);

    return {
      Período: period,
      'Empleados Pagados': periodPayrolls.length,
      'Total Devengado': totalEarned,
      'Auxilio Transporte': totalTransport,
      'Total Descuentos': totalDeductions,
      'Neto Total a Pagar': totalNetPay,
    };
  });

  const wsPeriodAnalysis = XLSX.utils.json_to_sheet(periodAnalysis);
  wsPeriodAnalysis['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsPeriodAnalysis, 'Análisis por Período');

  // Generar archivo
  const fileName = `Nominas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta reporte combinado de empleados con datos de nómina
 */
export function exportComprehensiveReport(employees: Employee[], payrolls: PayrollData[]): void {
  const wb = XLSX.utils.book_new();

  // HOJA 1: Empleados con Total Acumulado
  const comprehensiveData = employees.map((emp) => {
    const employeePayrolls = payrolls.filter(p => p.employee_id === emp.id);
    const totalEarned = employeePayrolls.reduce((sum, p) => sum + p.total_earned, 0);
    const totalDeductions = employeePayrolls.reduce((sum, p) => sum + p.total_deductions, 0);
    const totalNetPay = employeePayrolls.reduce((sum, p) => sum + p.net_pay, 0);

    return {
      Nombre: emp.full_name,
      Cédula: emp.cedula,
      'Tipo Contrato': emp.contract_type,
      'Salario Base': emp.monthly_salary,
      'Períodos Registrados': employeePayrolls.length,
      'Total Ganado (Acumulado)': totalEarned,
      'Total Descuentos (Acumulado)': totalDeductions,
      'Total Neto (Acumulado)': totalNetPay,
      Estado: emp.status === 'active' ? 'Activo' : 'Inactivo',
    };
  });

  const wsComprehensive = XLSX.utils.json_to_sheet(comprehensiveData);
  wsComprehensive['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, wsComprehensive, 'Empleados + Nómina');

  // HOJA 2: Detalles Completos de Nóminas
  const payrollDetails = payrolls.map((p) => ({
    Período: p.period,
    Empleado: p.employee_name,
    Cédula: p.employee_cedula,
    'Devengado': p.total_earned,
    'Auxilio Transporte': p.transport_allowance,
    'Desc. Salud': p.health_deduction,
    'Desc. Pensión': p.pension_deduction,
    'Otros Desc.': p.other_deductions,
    'Total Desc.': p.total_deductions,
    'NETO A PAGAR': p.net_pay,
  }));

  const wsDetails = XLSX.utils.json_to_sheet(payrollDetails);
  wsDetails['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalles Nóminas');

  // HOJA 3: Resumen Estadístico
  const totalEarned = payrolls.reduce((sum, p) => sum + p.total_earned, 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.total_deductions, 0);
  const totalNetPay = payrolls.reduce((sum, p) => sum + p.net_pay, 0);
  const totalTransport = payrolls.reduce((sum, p) => sum + p.transport_allowance, 0);

  const stats = [
    {
      Concepto: 'Total Devengado',
      Valor: totalEarned,
    },
    {
      Concepto: 'Total Auxilio Transporte',
      Valor: totalTransport,
    },
    {
      Concepto: 'Total Descuentos',
      Valor: totalDeductions,
    },
    {
      Concepto: 'TOTAL NETO A PAGAR',
      Valor: totalNetPay,
    },
    {
      Concepto: 'Nómina Promedio por Empleado',
      Valor: Math.round(totalNetPay / employees.length),
    },
    {
      Concepto: 'Total Períodos Procesados',
      Valor: payrolls.length,
    },
  ];

  const wsStats = XLSX.utils.json_to_sheet(stats);
  wsStats['!cols'] = [{ wch: 30 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, wsStats, 'Resumen General');

  // Generar archivo
  const fileName = `Reporte_Completo_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Convierte PayrollHistory de Supabase al formato estándar de exportación
 */
export function convertPayrollHistoryToExportFormat(payrollHistory: any[]): PayrollData[] {
  return payrollHistory
    .filter(p => p.employee_name) // Filtrar registros sin nombre
    .map((p) => ({
      employee_id: p.employee_id || '',
      employee_name: p.employee_name || 'Desconocido',
      employee_cedula: p.employee_cedula || '',
      period: p.period_start && p.period_end ? `${p.period_start} A ${p.period_end}` : 'N/A',
      total_earned: (p.base_salary || 0) + (p.total_surcharges || 0),
      transport_allowance: p.transport_allowance || 0,
      health_deduction: p.health_deduction || 0,
      pension_deduction: p.pension_deduction || 0,
      other_deductions: p.other_deductions || 0,
      total_deductions: p.total_deductions || 0,
      net_pay: p.net_salary || 0,
    }));
}