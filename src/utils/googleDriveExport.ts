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
    const fileMetadata = {
      name: fileName,
      mimeType: 'application/vnd.ms-excel',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    formData.append('file', fileContent, fileName);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { id: string };
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
