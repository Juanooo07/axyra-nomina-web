import { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Employee } from '../types';
import { initializeFortnightDates } from '../utils';

interface PayrollSelectorProps {
  selectedEmployee: string;
  startDate: string;
  endDate: string;
  employees: Employee[];
  onEmployeeChange: (employeeId: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEmployeeSelect?: (employeeId: string | null) => void;
}

export function PayrollSelector({
  selectedEmployee,
  startDate,
  endDate,
  employees,
  onEmployeeChange,
  onStartDateChange,
  onEndDateChange,
  onEmployeeSelect
}: PayrollSelectorProps) {
  const { user } = useAuth();

  // Initialize dates to current fortnight (1st to 15th or 16th to end of month)
  useEffect(() => {
    const { startDate, endDate } = initializeFortnightDates();
    onStartDateChange(startDate);
    onEndDateChange(endDate);
  }, [onStartDateChange, onEndDateChange]);

  const handleEmployeeChange = (employeeId: string) => {
    onEmployeeChange(employeeId);
    if (onEmployeeSelect) {
      onEmployeeSelect(employeeId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Calculator className="mr-2" />
        Calculadora de Nómina
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline mr-1" size={16} />
            Empleado
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar empleado...</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name} - {employee.cedula}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-1" size={16} />
            Fecha Inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-1" size={16} />
            Fecha Fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}