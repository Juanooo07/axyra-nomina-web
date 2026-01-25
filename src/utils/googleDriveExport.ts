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

    // Crear metadata para el archivo
    const fileMetadata = {
      name: fileName,
      mimeType: 'text/csv',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    // Crear boundary para multipart
    const boundary = Math.random().toString(36).substring(2, 15);

    // Convertir Blob a ArrayBuffer para manipulación
    const fileBuffer = await fileContent.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Construir body multipart manualmente
    const metadataStr = JSON.stringify(fileMetadata);
    const metadataBytes = new TextEncoder().encode(metadataStr);

    // Primera parte: metadata
    const part1 = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataStr}\r\n--${boundary}\r\nContent-Type: text/csv\r\n\r\n`;
    const part1Bytes = new TextEncoder().encode(part1);

    // Última parte: cierre
    const part2 = `\r\n--${boundary}--`;
    const part2Bytes = new TextEncoder().encode(part2);

    // Combinar todas las partes
    const bodyArray = new Uint8Array(
      part1Bytes.length + fileBytes.length + part2Bytes.length
    );
    bodyArray.set(part1Bytes);
    bodyArray.set(fileBytes, part1Bytes.length);
    bodyArray.set(part2Bytes, part1Bytes.length + fileBytes.length);

    console.log('uploadFileToDrive: Uploading with multipart...');

    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?uploadType=multipart&supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: bodyArray,
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
