const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

/**
 * Initialize Google Cloud Storage
 * @returns {Storage} Google Cloud Storage instance
 */
const initializeStorage = () => {
  let storage;

  if (process.env.NODE_ENV === 'production') {
    // In production on Google Cloud, use default credentials
    storage = new Storage();
  } else {
    // For local development, use service account key file
    try {
      const keyFilePath = path.join(__dirname, '../../service-account-key.json');
      if (fs.existsSync(keyFilePath)) {
        storage = new Storage({
          keyFilename: keyFilePath,
        });
      } else {
        // Fallback to application default credentials
        storage = new Storage();
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
      // Fallback to application default credentials
      storage = new Storage();
    }
  }

  console.log('Google Cloud Storage initialized');
  return storage;
};

/**
 * Upload a file to Google Cloud Storage
 * @param {string} filePath - Path to the file to upload
 * @param {string} destination - Destination path in the bucket
 * @returns {Promise<string>} Public URL of the uploaded file
 */
const uploadFile = async (filePath, destination) => {
  const storage = initializeStorage();
  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

  try {
    // Upload the file to the bucket
    await bucket.upload(filePath, {
      destination,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make the file publicly accessible
    await bucket.file(destination).makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${destination}`;

    // Delete the local file after successful upload
    fs.unlinkSync(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Google Cloud Storage:', error);
    throw error;
  }
};

module.exports = {
  initializeStorage,
  uploadFile,
};