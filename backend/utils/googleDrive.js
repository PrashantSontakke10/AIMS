import { google } from "googleapis";
import stream from "stream";

let driveClient = null;

/**
 * Lazily initializes and returns the Google Drive API client.
 * Supports both OAuth2 User Authentication and Service Account JWT Authentication.
 */
const getDriveClient = () => {
  if (driveClient) {
    return driveClient;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // Option 1: Authenticate as a real Google user using OAuth2 (Ideal for personal @gmail.com accounts to bypass quota limits)
  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    driveClient = google.drive({ version: "v3", auth: oauth2Client });
    return driveClient;
  }

  // Option 2: Service Account JWT Authentication
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY || "";
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";

  if (!privateKey || !clientEmail) {
    throw new Error(
      "Google Drive configuration is incomplete. Provide either (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) for OAuth2, or (GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL) for Service Account."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"]
  });

  driveClient = google.drive({ version: "v3", auth });
  return driveClient;
};

/**
 * Searches for a folder by name inside a parent folder. If not found, creates it.
 * @param {string} folderName - Name of the folder (e.g. Course Title)
 * @param {string} parentFolderId - Google Drive ID of the parent folder
 * @returns {Promise<string>} - Folder ID in Google Drive
 */
export const findOrCreateFolder = async (folderName, parentFolderId) => {
  try {
    const drive = getDriveClient();
    const escapedName = folderName.replace(/'/g, "\\'");
    const query = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`;
    
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create the folder if it does not exist
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
      supportsAllDrives: true,
    });

    return folder.data.id;
  } catch (error) {
    console.error("Error in findOrCreateFolder:", error);
    throw new Error(`Failed to manage Google Drive folder: ${error.message}`);
  }
};

/**
 * Uploads a file buffer to Google Drive.
 * @param {Buffer} fileBuffer - Buffer of the uploaded file
 * @param {string} fileName - File name
 * @param {string} mimeType - File MIME type
 * @param {string} parentFolderId - Google Drive parent folder ID
 * @returns {Promise<object>} - Object containing fileId, webViewLink, and webContentLink
 */
export const uploadFile = async (fileBuffer, fileName, mimeType, parentFolderId) => {
  try {
    const drive = getDriveClient();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
      name: fileName,
      parents: [parentFolderId],
    };

    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };

    // Create the file in Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    const fileId = response.data.id;

    // Grant read permission to anyone so students can view/download
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });

    return {
      fileId,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (error) {
    console.error("Error uploading file to Drive:", error);
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
};

/**
 * Deletes a file from Google Drive.
 * @param {string} fileId - Google Drive File ID
 */
export const deleteFile = async (fileId) => {
  try {
    const drive = getDriveClient();
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
  } catch (error) {
    console.error(`Failed to delete file ${fileId} from Drive:`, error);
  }
};
