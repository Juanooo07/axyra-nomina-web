const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';

export interface GoogleAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Crear una carpeta en Google Drive
 */
export const createDriveFolder = async (
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string | null> => {
  try {
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
    return data.id;
  } catch (error) {
    console.error('Error creating Drive folder:', error);
    return null;
  }
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

    // Primero, crear el archivo con metadata
    const fileMetadata = {
      name: fileName,
      mimeType: 'text/csv',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    // Paso 1: Crear el archivo con metadata (sin contenido)
    console.log('uploadFileToDrive: Creating file with metadata...');
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
      console.error('Drive API create error:', errorText);
      throw new Error(`Failed to create file: ${errorText}`);
    }

    const fileData = await createResponse.json() as { id: string };
    const fileId = fileData.id;
    console.log('uploadFileToDrive: File created with ID:', fileId);

    // Paso 2: Subir el contenido del archivo
    console.log('uploadFileToDrive: Uploading file content...');
    const uploadResponse = await fetch(
      `${GOOGLE_DRIVE_API}/files/${fileId}?uploadType=media&supportsAllDrives=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/csv',
        },
        body: fileContent,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Drive API upload error:', errorText);
      throw new Error(`Failed to upload file: ${errorText}`);
    }

    console.log('uploadFileToDrive: File uploaded successfully, ID:', fileId);
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
