import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Trash2, Check, Edit, Download, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { exportEmployeesToExcel, exportEmployeeToExcel } from '../../utils/excelExport';

interface Employee {
  id: string;
  user_id?: string;
  company_id?: string;
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

export function Employees() {
  const { user, selectedCompanyId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeePayments, setEmployeePayments] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    cedula: '',
    contract_type: 'TEMPORAL' as 'FIJO' | 'TEMPORAL',
    monthly_salary: '',
    comments: '',
    deduct_health: false,
    deduct_pension: false,
    deduct_transport: false,
    receives_transport_allowance: false,
  });

  useEffect(() => {
    if (user) {
      loadEmployees();
      loadEmployeePayments();
    }
  }, [user]);

  const loadEmployees = async () => {
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, user_id, company_id, full_name, cedula, contract_type, monthly_salary, comments, deduct_health, deduct_pension, deduct_transport, receives_transport_allowance, status')
        .eq('user_id', user.id)
        .order('full_name');

      if (error) {
        console.error('Error loading employees:', error);
        setError('Error al cargar empleados: ' + error.message);
        setEmployees([]);
        return;
      }

      setEmployees(data || []);
      await loadEmployeePayments();
    } catch (err: any) {
      console.error('Unexpected error loading employees:', err);
      setError('Error inesperado al cargar empleados: ' + (err.message || 'Sin detalles'));
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeePayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payroll_history')
        .select('employee_id, net_salary')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading employee payments:', error);
        setEmployeePayments({});
        return;
      }

      const payments = (data || []).reduce((acc: Record<string, number>, item: any) => {
        const employeeId = item.employee_id;
        const netSalary = Number(item.net_salary) || 0;
        if (!employeeId) return acc;
        acc[employeeId] = (acc[employeeId] || 0) + netSalary;
        return acc;
      }, {} as Record<string, number>);

      setEmployeePayments(payments);
    } catch (err: any) {
      console.error('Unexpected error loading employee payments:', err);
      setEmployeePayments({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.full_name || !formData.cedula || !formData.monthly_salary) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    const salary = parseFloat(formData.monthly_salary);
    if (isNaN(salary) || salary <= 0) {
      setError('El salario debe ser mayor que 0');
      return;
    }

    setLoading(true);

    try {
      const employeeData = {
        full_name: formData.full_name.trim(),
        cedula: formData.cedula.trim(),
        contract_type: formData.contract_type,
        monthly_salary: salary,
        comments: formData.comments.trim(),
        deduct_health: formData.contract_type === 'FIJO' ? formData.deduct_health : false,
        deduct_pension: formData.contract_type === 'FIJO' ? formData.deduct_pension : false,
        deduct_transport: formData.contract_type === 'FIJO' ? formData.deduct_transport : false,
        receives_transport_allowance: formData.receives_transport_allowance,
      };

      if (editingEmployee) {
        const { error: updateError } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (updateError) {
          console.error('Error updating employee:', updateError);
          setError('Error al actualizar el empleado: ' + updateError.message);
          setLoading(false);
          return;
        }

        setSuccess('Empleado actualizado exitosamente');
      } else {
        const { error: insertError } = await supabase.from('employees').insert({
          user_id: user.id,
          company_id: selectedCompanyId || undefined,
          ...employeeData,
          status: 'active',
        });

        if (insertError) {
          console.error('Error inserting employee:', insertError);
          setError('Error al registrar el empleado: ' + insertError.message);
          setLoading(false);
          return;
        }

        setSuccess('Empleado registrado exitosamente');
      }

      resetForm();
      loadEmployees();
      setShowForm(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error inesperado al procesar el empleado');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      cedula: '',
      contract_type: 'TEMPORAL',
      monthly_salary: '',
      comments: '',
      deduct_health: false,
      deduct_pension: false,
      deduct_transport: false,
      receives_transport_allowance: false,
    });
    setEditingEmployee(null);
    setError('');
    setSuccess('');
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      cedula: employee.cedula,
      contract_type: employee.contract_type,
      monthly_salary: employee.monthly_salary.toString(),
      comments: employee.comments || '',
      deduct_health: employee.deduct_health,
      deduct_pension: employee.deduct_pension,
      deduct_transport: employee.deduct_transport,
      receives_transport_allowance: employee.receives_transport_allowance,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este empleado? Esta acción no se puede deshacer.')) return;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Error al eliminar el empleado: ' + error.message);
      return;
    }

    setSuccess('Empleado eliminado exitosamente');
    await loadEmployees();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center animate-fadeInDown">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Empleados
          </h2>
          <p className="text-slate-600 text-lg">Gestiona los empleados de tu empresa</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (employees.length === 0) {
                alert('No hay empleados para exportar');
                return;
              }
              exportEmployeesToExcel(employees, employeePayments);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg font-semibold"
            title="Descargar Excel con todos los empleados"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fadeInScale">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 animate-fadeInUp">
          <h3 className="text-2xl font-bold text-blue-600 mb-6">
            {editingEmployee ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
          </h3>
          <p className="text-slate-600 mb-6">Complete todos los campos requeridos</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="transform transition-all hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-blue-700 mb-2 uppercase">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="transform transition-all hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-blue-700 mb-2 uppercase">
                  Cédula / Identificación *
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="transform transition-all hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-blue-700 mb-2 uppercase">
                  Tipo de Contrato *
                </label>
                <select
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as 'FIJO' | 'TEMPORAL' })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="FIJO">FIJO</option>
                  <option value="TEMPORAL">TEMPORAL</option>
                </select>
              </div>

              <div className="transform transition-all hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-blue-700 mb-2 uppercase">
                  Salario Base *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthly_salary}
                  onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ej: 1423500"
                  required
                />
              </div>
            </div>

            <div className="transform transition-all hover:scale-[1.01]">
              <label className="block text-sm font-semibold text-blue-700 mb-2 uppercase">
                Comentarios (Opcional)
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
                placeholder="Información adicional del empleado"
              />
            </div>

            {formData.contract_type === 'FIJO' && (
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200 animate-fadeInScale">
                <h4 className="text-lg font-bold text-blue-700 mb-4 uppercase">
                  Deducibles (Para empleados FIJO)
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 p-3 rounded-lg transition-all">
                    <input
                      type="checkbox"
                      checked={formData.deduct_health}
                      onChange={(e) => setFormData({ ...formData, deduct_health: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Descontar Salud (EPS)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 p-3 rounded-lg transition-all">
                    <input
                      type="checkbox"
                      checked={formData.deduct_pension}
                      onChange={(e) => setFormData({ ...formData, deduct_pension: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Descontar Pensión (AFP)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 p-3 rounded-lg transition-all">
                    <input
                      type="checkbox"
                      checked={formData.deduct_transport}
                      onChange={(e) => setFormData({ ...formData, deduct_transport: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Descontar Auxilio de Transporte</span>
                  </label>
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200 animate-fadeInScale">
              <h4 className="text-lg font-bold text-blue-700 mb-4 uppercase">
                Beneficios
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 p-3 rounded-lg transition-all">
                  <input
                    type="checkbox"
                    checked={formData.receives_transport_allowance}
                    onChange={(e) => setFormData({ ...formData, receives_transport_allowance: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">Recibe Auxilio de Transporte</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] hover:shadow-xl font-semibold text-lg flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{editingEmployee ? 'Actualizar Empleado' : 'Registrar Empleado'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold flex items-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fadeInUp">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Cédula</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Tipo Contrato</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Salario</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Deducibles</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay empleados registrados. Haz clic en "Nuevo Empleado" para comenzar.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{employee.full_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employee.cedula}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.contract_type === 'FIJO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {employee.contract_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 text-right">
                      {formatCurrency(employee.monthly_salary)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {employee.contract_type === 'FIJO' ? (
                        <div className="flex flex-col space-y-1">
                          {employee.deduct_health && <span className="text-xs">Salud</span>}
                          {employee.deduct_pension && <span className="text-xs">Pensión</span>}
                          {employee.deduct_transport && <span className="text-xs">Transporte</span>}
                          {!employee.deduct_health && !employee.deduct_pension && !employee.deduct_transport && (
                            <span className="text-xs text-slate-400">Ninguno</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => exportEmployeeToExcel(employee, employeePayments[employee.id] || 0)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Exportar este empleado a Excel"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="block md:hidden space-y-4 animate-fadeInUp">
        {employees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-slate-500">
            No hay empleados registrados. Haz clic en "Nuevo Empleado" para comenzar.
          </div>
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-md p-4 space-y-3">
              {/* Nombre Completo - Large text at top */}
              <div className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                {employee.full_name}
              </div>

              {/* Cédula */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Cédula:</span>
                <span className="text-sm text-slate-800">{employee.cedula}</span>
              </div>

              {/* Tipo de Contrato with badge */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Tipo de Contrato:</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    employee.contract_type === 'FIJO'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {employee.contract_type}
                </span>
              </div>

              {/* Salario Mensual formatted */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Salario Mensual:</span>
                <span className="text-sm font-bold text-slate-800">
                  {formatCurrency(employee.monthly_salary)}
                </span>
              </div>

              {/* Estado with badge */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Estado:</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    employee.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Action buttons at the bottom */}
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => exportEmployeeToExcel(employee, employeePayments[employee.id] || 0)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-all font-semibold text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
                <button
                  onClick={() => handleEdit(employee)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all font-semibold text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all font-semibold text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
