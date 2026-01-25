const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';

export interface GoogleAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Buscar carpeta existente en Google Drive por nombre
 */
export const findDriveFolder = async (
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string | null> => {
  try {
    const query = parentFolderId
      ? `name='${folderName}' and parents='${parentFolderId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name)&pageSize=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { files: Array<{ id: string; name: string }> };
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  } catch (error) {
    console.error('Error finding Drive folder:', error);
    return null;
  }
};

/**
 * Crear una carpeta en Google Drive (o retornar si ya existe)
 */
export const getOrCreateDriveFolder = async (
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string | null> => {
  try {
    // Primero, buscar si la carpeta ya existe
    const existingId = await findDriveFolder(accessToken, folderName, parentFolderId);
    if (existingId) {
      console.log(`Folder '${folderName}' already exists with ID:`, existingId);
      return existingId;
    }

    // Si no existe, crearla
    const fileMetadata: Record<string, unknown> = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const response = await fetch(`${GOOGLE_DRIVE_API}/files?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileMetadata),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { id: string };
    console.log(`Created folder '${folderName}' with ID:`, data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating Drive folder:', error);
    return null;
  }
};

/**
 * Crear una carpeta en Google Drive
 */
export const createDriveFolder = async (
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string | null> => {
  // Usar getOrCreateDriveFolder en su lugar
  return getOrCreateDriveFolder(accessToken, folderName, parentFolderId);
};

/**
 * Subir archivo a Google Drive
 */
export const uploadFileToDrive = async (
  accessToken: string,
  fileName: string,
  fileContent: Blob,
  parentFolderId?: string
): Promise<string | null> => {
  try {
    console.log('uploadFileToDrive: Starting upload:', {
      fileName,
      fileSize: fileContent.size,
      fileType: fileContent.type,
      parentFolderId,
    });

    const fileMetadata = {
      name: fileName,
      mimeType: 'text/csv',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    formData.append('file', fileContent, fileName);

    console.log('uploadFileToDrive: Uploading with FormData...');

    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?uploadType=multipart&supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    console.log('uploadFileToDrive: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive API error:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { id: string };
    console.log('uploadFileToDrive: File uploaded successfully, ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    return null;
  }
};

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
}

/**
 * Obtener lista de archivos del usuario en Drive
 */
export const getDriveFiles = async (accessToken: string): Promise<DriveFile[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?spaces=drive&fields=files(id,name,mimeType,createdTime)&pageSize=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { files: DriveFile[] };
    return data.files;
  } catch (error) {
    console.error('Error getting Drive files:', error);
    return [];
  }
};

/**
 * Compartir archivo en Google Drive
 */
export const shareFileOnDrive = async (
  accessToken: string,
  fileId: string,
  role: string = 'reader'
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files/${fileId}/permissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          type: 'anyone',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error sharing file on Drive:', error);
    return false;
  }
};
