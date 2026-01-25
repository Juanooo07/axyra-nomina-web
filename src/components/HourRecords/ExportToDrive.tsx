import { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useGoogleDriveAuthSimple } from '../../hooks/useGoogleDriveAuthSimple';
import { getOrCreateDriveFolder, uploadFileToDrive } from '../../utils/googleDriveExport';
import { useAuth } from '../../contexts/AuthContext';

interface PeriodData {
  period?: string;
  employee?: string;
  cedula?: string;
  [key: string]: unknown;
}

interface ExportToDriveProps {
  periodName: string;
  periodData: PeriodData;
  onExportSuccess?: () => void;
}

export const ExportToDrive = ({ periodName, periodData, onExportSuccess }: ExportToDriveProps) => {
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

      // Paso 2: Carpeta del período (ejemplo: "ENERO-2" o "2026-01-01_A_2026-01-31")
      const periodFolder = periodData.period?.replace(/\s+/g, '-').toUpperCase() || 'PERIODO';
      const periodFolderId = await getOrCreateDriveFolder(token.access_token, periodFolder, mainFolderId);
      if (!periodFolderId) throw new Error('No se pudo crear carpeta del período');
      console.log('Export: Period folder created:', periodFolderId);

      // Paso 3: Carpeta del empleado "NOMBRE_APELLIDO_CEDULA"
      const employeeName = periodData.employee?.toUpperCase().replace(/\s+/g, '_') || 'EMPLEADO';
      const employeeFolder = `${employeeName}_${periodData.cedula || '0'}`;
      const employeeFolderId = await getOrCreateDriveFolder(token.access_token, employeeFolder, periodFolderId);
      if (!employeeFolderId) throw new Error('No se pudo crear carpeta del empleado');
      console.log('Export: Employee folder created:', employeeFolderId);

      // Crear PDF con los datos
      const pdfBlob = await generatePDF(periodData);
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

  const generatePDF = async (data: PeriodData): Promise<Blob> => {
    // Crear HTML simple que se pueda imprimir como PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AXYRA - Nómina</h1>
        </div>
        <table>
          <tr><th>Campo</th><th>Valor</th></tr>
          <tr><td>Período</td><td>${data.period || 'N/A'}</td></tr>
          <tr><td>Empleado</td><td>${data.employee || 'N/A'}</td></tr>
          <tr><td>Cédula</td><td>${data.cedula || 'N/A'}</td></tr>
          <tr><td>Salario Neto</td><td>${data.netSalary || '0'}</td></tr>
          <tr><td>Fecha de Exportación</td><td>${new Date().toLocaleString('es-CO')}</td></tr>
        </table>
      </body>
      </html>
    `;

    // Convertir HTML a Blob como PDF simulado
    return new Blob([htmlContent], { type: 'application/pdf' });
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
