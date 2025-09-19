const { VertexAI } = require('@google-cloud/vertexai');

/**
 * Initialize Google Cloud Vertex AI
 * @returns {VertexAI} Vertex AI instance
 */
const initializeVertexAI = () => {
  const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_LOCATION || 'us-central1',
  });

  console.log('Google Cloud Vertex AI initialized');
  return vertexAI;
};

/**
 * Get Imagen model for image generation
 * @returns {Object} Imagen model instance
 */
const getImagenModel = () => {
  const vertexAI = initializeVertexAI();
  return vertexAI.preview.getGenerativeModel({
    model: 'imagegeneration@002',
  });
};

/**
 * Get Gemini model for text generation
 * @returns {Object} Gemini model instance
 */
const getGeminiModel = () => {
  const vertexAI = initializeVertexAI();
  return vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.0-pro',
  });
};

module.exports = {
  initializeVertexAI,
  getImagenModel,
  getGeminiModel,
};