import { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useGoogleDriveAuthSimple } from '../../hooks/useGoogleDriveAuthSimple';
import { getOrCreateDriveFolder, uploadFileToDrive } from '../../utils/googleDriveExport';
import { useAuth } from '../../contexts/AuthContext';
import { generatePaymentReceiptBlob } from '../../utils/pdfGenerator';

interface HourBreakdown {
  hour_type: string;
  hours: number;
  surcharge_percent: number;
  hourly_rate: number;
  total: number;
}

interface PeriodData {
  period?: string;
  employee?: string;
  cedula?: string;
  base_salary?: number;
  total_surcharges?: number;
  transport_allowance?: number;
  health_deduction?: number;
  pension_deduction?: number;
  total_deductions?: number;
  net_salary?: number;
  total_hours?: number;
  hour_breakdowns?: HourBreakdown[];
  [key: string]: unknown;
}

interface ExportToDriveProps {
  periodName: string;
  periodData: PeriodData;
  employeeInfo?: {
    full_name: string;
    cedula: string;
    contract_type: string;
    monthly_salary: number;
  };
  companyInfo?: {
    company_name: string;
    company_nit: string;
    company_address: string;
  };
  onExportSuccess?: () => void;
}

export const ExportToDrive = ({ 
  periodName, 
  periodData, 
  employeeInfo,
  companyInfo,
  onExportSuccess 
}: ExportToDriveProps) => {
  const { user } = useAuth();
  const { initiateGoogleAuth, getStoredToken } = useGoogleDriveAuthSimple();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExportToDrive = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Validar que tenemos los datos necesarios
      if (!employeeInfo || !companyInfo || !periodData.hour_breakdowns) {
        throw new Error('Datos incompletos para generar el PDF');
      }

      const token = await getStoredToken();

      if (!token) {
        const confirmed = window.confirm(
          'Se abrirá una ventana para autenticar con Google. ¿Deseas continuar?'
        );
        if (confirmed) {
          initiateGoogleAuth();
          return;
        }
        throw new Error('Autenticación cancelada');
      }

      // CREAR ESTRUCTURA DE CARPETAS AUTOMÁTICAMENTE
      console.log('Export: Creating folder structure...');

      // Paso 1: Carpeta principal "AXYRA - Nóminas"
      const mainFolderId = await getOrCreateDriveFolder(token.access_token, 'AXYRA - Nóminas');
      if (!mainFolderId) throw new Error('No se pudo crear carpeta principal');
      console.log('Export: Main folder created:', mainFolderId);

      // Paso 2: Carpeta del período
      const periodFolder = periodData.period?.replace(/\s+/g, '-').toUpperCase() || 'PERIODO';
      const periodFolderId = await getOrCreateDriveFolder(token.access_token, periodFolder, mainFolderId);
      if (!periodFolderId) throw new Error('No se pudo crear carpeta del período');
      console.log('Export: Period folder created:', periodFolderId);

      // Paso 3: Carpeta del empleado
      const employeeName = periodData.employee?.toUpperCase().replace(/\s+/g, '_') || 'EMPLEADO';
      const employeeFolder = `${employeeName}_${periodData.cedula || '0'}`;
      const employeeFolderId = await getOrCreateDriveFolder(token.access_token, employeeFolder, periodFolderId);
      if (!employeeFolderId) throw new Error('No se pudo crear carpeta del empleado');
      console.log('Export: Employee folder created:', employeeFolderId);

      // Generar PDF REAL usando la función de pago
      console.log('Export: Generating PDF from payroll data...');
      
      // Convertir hour_breakdowns a formato esperado por generatePaymentReceiptBlob
      const hourDetails = periodData.hour_breakdowns!.map(breakdown => ({
        concept: breakdown.hour_type,
        hourValue: breakdown.hourly_rate / (1 + breakdown.surcharge_percent / 100),
        surchargeValue: (breakdown.hourly_rate * breakdown.surcharge_percent) / 100,
        totalValue: breakdown.hourly_rate,
        hours: breakdown.hours,
        subtotal: breakdown.total,
      }));

      const pdfBlob = await generatePaymentReceiptBlob(
        {
          company_name: companyInfo.company_name,
          company_nit: companyInfo.company_nit,
          company_address: companyInfo.company_address,
          minimum_salary: 0
        },
        {
          full_name: employeeInfo.full_name,
          cedula: employeeInfo.cedula,
          contract_type: employeeInfo.contract_type,
          monthly_salary: employeeInfo.monthly_salary
        },
        hourDetails,
        periodData.total_hours || 0,
        periodData.net_salary || 0
      );

      const fileName = `Nomina_${periodName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

      console.log('Export: Uploading file to employee folder...');

      // Subir archivo en la carpeta del empleado
      const fileId = await uploadFileToDrive(
        token.access_token,
        fileName,
        pdfBlob,
        employeeFolderId
      );

      if (!fileId) {
        throw new Error('No se pudo subir el archivo a Google Drive');
      }

      console.log('Export: SUCCESS - File uploaded with ID:', fileId);
      setSuccess(true);

      if (onExportSuccess) {
        onExportSuccess();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al exportar a Drive';
      setError(message);
      console.error('Export to Drive Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={handleExportToDrive}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : success
            ? 'bg-green-500 text-white'
            : error
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        title="Exportar período a Google Drive"
      >
        {loading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Subiendo...
          </>
        ) : success ? (
          <>
            <span>✅</span>
            Exportado!
          </>
        ) : error ? (
          <>
            <span>⚠️</span>
            Error
          </>
        ) : (
          <>
            <Upload size={18} />
            A Drive
          </>
        )}
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
          ✓ Archivo subido exitosamente a Google Drive
        </div>
      )}
    </div>
  );
};
