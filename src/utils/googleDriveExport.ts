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
    console.log('uploadFileToDrive: Step 1 - Creating file metadata');

    // Detectar tipo MIME basado en la extensión del archivo
    let mimeType = 'application/octet-stream';
    if (fileName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    } else if (fileName.endsWith('.csv')) {
      mimeType = 'text/csv';
    }

    // PASO 1: Crear archivo con metadata
    const fileMetadata = {
      name: fileName,
      mimeType: mimeType,
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const createResponse = await fetch(
      `${GOOGLE_DRIVE_API}/files?supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileMetadata),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Step 1 error:', errorText);
      throw new Error(`Create file failed: ${errorText}`);
    }

    const fileData = await createResponse.json() as { id: string };
    const fileId = fileData.id;
    console.log('uploadFileToDrive: Step 1 SUCCESS - File created with ID:', fileId);

    // PASO 2: Subir contenido con media upload
    console.log('uploadFileToDrive: Step 2 - Uploading content');

    const uploadResponse = await fetch(
      `${GOOGLE_DRIVE_API}/files/${fileId}?uploadType=media&supportsAllDrives=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': mimeType,
        },
        body: fileContent,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Step 2 error:', errorText);
      throw new Error(`Upload content failed: ${errorText}`);
    }

    console.log('uploadFileToDrive: Step 2 SUCCESS - File uploaded');
    console.log('uploadFileToDrive: COMPLETE - File ID:', fileId);
    return fileId;
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
