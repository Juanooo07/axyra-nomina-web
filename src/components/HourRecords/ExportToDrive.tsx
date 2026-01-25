import { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useGoogleDriveAuthSimple } from '../../hooks/useGoogleDriveAuthSimple';
import { createDriveFolder, uploadFileToDrive } from '../../utils/googleDriveExport';
import { useAuth } from '../../contexts/AuthContext';

interface PeriodData {
  period?: string;
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

      // Obtener el token guardado
      const token = await getStoredToken();

      // Si no hay token, iniciar autenticación
      if (!token) {
        // Mostrar mensaje informando que se va a abrir Google
        const confirmed = window.confirm(
          'Se abrirá una ventana para autenticar con Google. ¿Deseas continuar?'
        );

        if (confirmed) {
          initiateGoogleAuth();
          return;
        }
        throw new Error('Autenticación cancelada');
      }

      // Crear blob con datos CSV (Excel compatible)
      const csvContent = generateCSVContent(periodData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const fileName = `Nomina_${periodName}_${new Date().toISOString().slice(0, 10)}.csv`;

      // Crear carpeta en Drive si no existe
      let folderId: string | null = null;
      try {
        folderId = await createDriveFolder(token.access_token, 'AXYRA - Nóminas');
      } catch (err) {
        console.warn('No se pudo crear carpeta, subiendo a raíz:', err);
      }

      // Subir archivo
      const fileId = await uploadFileToDrive(
        token.access_token,
        fileName,
        blob,
        folderId || undefined
      );

      if (!fileId) {
        throw new Error('No se pudo subir el archivo a Google Drive');
      }

      setSuccess(true);

      if (onExportSuccess) {
        onExportSuccess();
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al exportar a Drive';
      setError(message);
      console.error('Export to Drive Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCSVContent = (data: PeriodData): string => {
    // Crear contenido CSV válido
    const headers = ['Período', 'Fecha de Exportación', 'Datos JSON'];
    const row = [
      data.period || 'N/A',
      new Date().toLocaleDateString('es-CO'),
      JSON.stringify(data),
    ];

    // Escapar comillas en los campos
    const escapedRow = row.map((field) => {
      const strField = String(field || '');
      return `"${strField.replace(/"/g, '""')}"`;
    });

    return `${headers.join(',')}\n${escapedRow.join(',')}`;
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
