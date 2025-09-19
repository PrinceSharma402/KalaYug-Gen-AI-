const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { uploadFile } = require('../config/storage');
const { getImagenModel } = require('../config/vertexai');

/**
 * Upload an image for design generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file uploaded',
      });
    }

    const userId = req.userId;
    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const destination = `users/${userId}/designs/original/${fileName}`;

    // Upload file to Google Cloud Storage
    const imageUrl = await uploadFile(file.path, destination);

    // Save image reference to Firestore
    const designRef = await admin.firestore().collection('designs').add({
      userId,
      originalImage: imageUrl,
      generatedImages: [],
      status: 'uploaded',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Image uploaded successfully',
      data: {
        id: designRef.id,
        imageUrl,
      },
    });
  } catch (error) {
    console.error('Upload image error:', error);
    // Clean up the temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload image',
    });
  }
};

/**
 * Generate designs based on uploaded image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateDesigns = async (req, res) => {
  try {
    const userId = req.userId;
    const { designId, productType, count = 3 } = req.body;

    if (!designId || !productType) {
      return res.status(400).json({
        status: 'error',
        message: 'Design ID and product type are required',
      });
    }

    // Get the design from Firestore
    const designDoc = await admin.firestore().collection('designs').doc(designId).get();

    if (!designDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Design not found',
      });
    }

    const design = designDoc.data();

    // Verify the design belongs to the user
    if (design.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this design',
      });
    }

    // Update design status
    await admin.firestore().collection('designs').doc(designId).update({
      status: 'generating',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get the Imagen model
    const model = getImagenModel();

    // Generate designs using Imagen
    const generatedImages = [];
    const numDesigns = Math.min(count, 5); // Limit to 5 designs max

    for (let i = 0; i < numDesigns; i++) {
      // Create a prompt for the specific product type
      const prompt = createPromptForProductType(design.originalImage, productType);

      // Generate image using Imagen
      const result = await model.generateImage({
        prompt,
        sampleCount: 1,
      });

      // Get the generated image
      const generatedImage = result.images[0];

      // Save the generated image to Google Cloud Storage
      const fileName = `${uuidv4()}.png`;
      const destination = `users/${userId}/designs/generated/${fileName}`;
      
      // Convert base64 image to file and upload
      const tempFilePath = path.join(__dirname, `../../uploads/${fileName}`);
      fs.writeFileSync(tempFilePath, Buffer.from(generatedImage.base64, 'base64'));
      const imageUrl = await uploadFile(tempFilePath, destination);

      generatedImages.push({
        url: imageUrl,
        productType,
        createdAt: new Date().toISOString(),
      });
    }

    // Update design with generated images
    await admin.firestore().collection('designs').doc(designId).update({
      generatedImages: admin.firestore.FieldValue.arrayUnion(...generatedImages),
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      status: 'success',
      message: 'Designs generated successfully',
      data: {
        id: designId,
        generatedImages,
      },
    });
  } catch (error) {
    console.error('Generate designs error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate designs',
    });
  }
};

/**
 * Create a prompt for the specific product type
 * @param {string} originalImageUrl - URL of the original image
 * @param {string} productType - Type of product to generate
 * @returns {string} Prompt for Imagen
 */
const createPromptForProductType = (originalImageUrl, productType) => {
  const basePrompt = 'Create a photorealistic mockup of this traditional Indian design pattern';
  
  const productPrompts = {
    'bag': 'applied to a stylish handbag or tote bag. The design should be prominently featured on the bag, maintaining the authentic artisanal quality while making it appealing for modern consumers.',
    'scarf': 'applied to a luxurious silk scarf. The pattern should flow naturally across the fabric, highlighting the intricate details of the traditional design.',
    'cushion': 'applied to a decorative cushion or pillow cover. The design should be centered and scaled appropriately to showcase the craftsmanship.',
    'wallArt': 'transformed into a framed wall art piece. The design should be the focal point, with a complementary frame that enhances the traditional aesthetic.',
    'clothing': 'applied to contemporary clothing like a modern kurta or dress. The design should be integrated tastefully into the garment while preserving its cultural significance.',
  };

  const productPrompt = productPrompts[productType] || 'applied to a new product that maintains the authentic artisanal quality while making it appealing for modern consumers.';
  
  return `${basePrompt} ${productPrompt} The final image should be high-resolution, well-lit, and showcase the product from the most flattering angle.`;
};

/**
 * Get all designs for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesigns = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all designs for the user from Firestore
    const designsSnapshot = await admin.firestore()
      .collection('designs')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const designs = [];
    designsSnapshot.forEach((doc) => {
      designs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
      });
    });

    return res.status(200).json({
      status: 'success',
      data: designs,
    });
  } catch (error) {
    console.error('Get designs error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get designs',
    });
  }
};

/**
 * Get a specific design by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesignById = async (req, res) => {
  try {
    const userId = req.userId;
    const designId = req.params.id;

    // Get the design from Firestore
    const designDoc = await admin.firestore().collection('designs').doc(designId).get();

    if (!designDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Design not found',
      });
    }

    const design = designDoc.data();

    // Verify the design belongs to the user
    if (design.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this design',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: designDoc.id,
        ...design,
        createdAt: design.createdAt?.toDate() || null,
        updatedAt: design.updatedAt?.toDate() || null,
      },
    });
  } catch (error) {
    console.error('Get design by ID error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get design',
    });
  }
};

module.exports = {
  uploadImage,
  generateDesigns,
  getDesigns,
  getDesignById,
};