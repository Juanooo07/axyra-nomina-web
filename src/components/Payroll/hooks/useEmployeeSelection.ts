import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Employee } from '../types';

export function useEmployeeSelection(selectedEmployeeId?: string) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  // Load employees when user changes
  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [user]);

  // Handle external employee selection
  useEffect(() => {
    if (selectedEmployeeId && employees.length > 0 && selectedEmployeeId !== selectedEmployee) {
      const exists = employees.some(emp => emp.id === selectedEmployeeId);
      if (exists) {
        setSelectedEmployee(selectedEmployeeId);
      }
    }
  }, [selectedEmployeeId, employees]);

  const loadEmployees = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, cedula, contract_type, monthly_salary, receives_transport_allowance, deduct_health, deduct_pension')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  return {
    employees,
    selectedEmployee,
    loading,
    loadEmployees,
    handleEmployeeChange,
    setSelectedEmployee
  };
}