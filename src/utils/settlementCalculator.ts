export interface SettlementInput {
  fechaInicio: string;
  fechaFin: string;
  modalidad: 'DIAS' | 'HORAS';
  diasTrabajados?: number;
  horasTotales?: number;
  horasPorDia?: number;
  baseMode: 'SMMLV' | 'MANUAL';
  salarioBaseMensual?: number;
  aplicaAuxTransporte: boolean;
  incluirCesantias: boolean;
  incluirInteresesCesantias: boolean;
  incluirPrima: boolean;
  incluirVacaciones: boolean;
}

export interface YearBreakdown {
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

export interface SettlementResult {
  breakdownPorAnio: YearBreakdown[];
  totalGeneral: number;
  diasTotales: number;
  errors: string[];
}

const SMMLV_2026 = 1750905;
const AUX_TRANSP_2026 = 249095;

const SALARIOS_MINIMOS: { [key: number]: number } = {
  2024: 1300000,
  2025: 1423500,
  2026: SMMLV_2026,
  2027: 1850000,
};

const AUX_TRANSPORTE: { [key: number]: number } = {
  2024: 162000,
  2025: 200000,
  2026: AUX_TRANSP_2026,
  2027: 280000,
};

function getDaysInPeriod(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

function splitPeriodByYear(fechaInicio: string, fechaFin: string): Array<{ year: number; start: Date; end: Date; days: number }> {
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);

  const periods: Array<{ year: number; start: Date; end: Date; days: number }> = [];

  let currentDate = new Date(start);

  while (currentDate <= end) {
    const year = currentDate.getFullYear();
    const yearEnd = new Date(year, 11, 31);
    const periodEnd = yearEnd < end ? yearEnd : end;

    const days = getDaysInPeriod(currentDate, periodEnd);

    periods.push({
      year,
      start: new Date(currentDate),
      end: periodEnd,
      days,
    });

    currentDate = new Date(year + 1, 0, 1);
  }

  return periods;
}

export function calculateSettlement(input: SettlementInput): SettlementResult {
  const errors: string[] = [];

  if (!input.fechaInicio) {
    errors.push('La fecha de inicio es requerida');
  }

  if (!input.fechaFin) {
    errors.push('La fecha de fin es requerida');
  }

  if (input.fechaInicio && input.fechaFin) {
    const startDate = new Date(input.fechaInicio);
    const endDate = new Date(input.fechaFin);

    if (endDate < startDate) {
      errors.push('La fecha de fin debe ser mayor o igual a la fecha de inicio');
    }
  }

  if (input.modalidad === 'HORAS') {
    if (!input.horasTotales || input.horasTotales <= 0) {
      errors.push('Las horas totales deben ser mayores a 0');
    }
    if (!input.horasPorDia || input.horasPorDia <= 0) {
      errors.push('Las horas por día deben ser mayores a 0');
    }
  }

  if (input.baseMode === 'MANUAL') {
    if (!input.salarioBaseMensual || input.salarioBaseMensual <= 0) {
      errors.push('El salario base mensual debe ser mayor a 0');
    }
  }

  if (errors.length > 0) {
    return {
      breakdownPorAnio: [],
      totalGeneral: 0,
      diasTotales: 0,
      errors,
    };
  }

  const periods = splitPeriodByYear(input.fechaInicio, input.fechaFin);
  const breakdownPorAnio: YearBreakdown[] = [];

  let diasTotales = 0;

  for (const period of periods) {
    let diasDelTramo = period.days;

    if (input.modalidad === 'DIAS' && input.diasTrabajados !== undefined && input.diasTrabajados > 0) {
      const totalDiasNaturales = getDaysInPeriod(new Date(input.fechaInicio), new Date(input.fechaFin));
      const proporcion = period.days / totalDiasNaturales;
      diasDelTramo = Math.round(input.diasTrabajados * proporcion);
    } else if (input.modalidad === 'HORAS') {
      const totalDiasNaturales = getDaysInPeriod(new Date(input.fechaInicio), new Date(input.fechaFin));
      const proporcion = period.days / totalDiasNaturales;
      const horasDelTramo = (input.horasTotales || 0) * proporcion;
      diasDelTramo = Math.round(horasDelTramo / (input.horasPorDia || 8));
    }

    diasTotales += diasDelTramo;

    let salarioBase = 0;
    let auxTransporte = 0;

    if (input.baseMode === 'SMMLV') {
      salarioBase = SALARIOS_MINIMOS[period.year] || SMMLV_2026;
    } else {
      salarioBase = input.salarioBaseMensual || 0;
    }

    if (input.aplicaAuxTransporte) {
      auxTransporte = AUX_TRANSPORTE[period.year] || AUX_TRANSP_2026;
    }

    const sPrest = salarioBase + auxTransporte;

    const D = diasDelTramo;

    let cesantias = 0;
    let interesesCesantias = 0;
    let prima = 0;
    let vacaciones = 0;

    if (input.incluirCesantias) {
      cesantias = Math.round((sPrest * D) / 360);
    }

    if (input.incluirInteresesCesantias) {
      interesesCesantias = Math.round((cesantias * 0.12 * D) / 360);
    }

    if (input.incluirPrima) {
      prima = Math.round((sPrest * D) / 360);
    }

    if (input.incluirVacaciones) {
      vacaciones = Math.round((salarioBase * D) / 720);
    }

    const totalAnio = cesantias + interesesCesantias + prima + vacaciones;

    breakdownPorAnio.push({
      anio: period.year,
      dias: diasDelTramo,
      salarioBase: Math.round(salarioBase),
      auxTransporte: Math.round(auxTransporte),
      sPrest: Math.round(sPrest),
      cesantias,
      interesesCesantias,
      prima,
      vacaciones,
      totalAnio,
    });
  }

  const totalGeneral = breakdownPorAnio.reduce((sum, item) => sum + item.totalAnio, 0);

  return {
    breakdownPorAnio,
    totalGeneral: Math.round(totalGeneral),
    diasTotales,
    errors: [],
  };
}
