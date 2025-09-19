const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { uploadFile } = require('../config/storage');
const { getGeminiModel } = require('../config/vertexai');

/**
 * Generate a product story from text or audio input
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateStory = async (req, res) => {
  try {
    const userId = req.userId;
    let { text, productName, craftType } = req.body;
    
    // Check if this is an audio input
    if (req.file) {
      // TODO: Implement audio transcription using Google Cloud Speech-to-Text
      // For now, return an error
      return res.status(501).json({
        status: 'error',
        message: 'Audio transcription is not implemented yet',
      });
    }

    // Validate input
    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Text input is required',
      });
    }

    // Get the Gemini model
    const model = getGeminiModel();

    // Generate product description
    const descriptionPrompt = createDescriptionPrompt(text, productName, craftType);
    const descriptionResult = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: descriptionPrompt }] }],
    });
    const description = descriptionResult.response.text();

    // Generate social media captions
    const captionsPrompt = createCaptionsPrompt(text, productName, craftType);
    const captionsResult = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: captionsPrompt }] }],
    });
    const captionsText = captionsResult.response.text();
    
    // Parse captions from the response
    const captions = parseCaptions(captionsText);

    // Generate hashtags
    const hashtagsPrompt = createHashtagsPrompt(text, productName, craftType);
    const hashtagsResult = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: hashtagsPrompt }] }],
    });
    const hashtagsText = hashtagsResult.response.text();
    
    // Parse hashtags from the response
    const hashtags = parseHashtags(hashtagsText);

    // Save the story to Firestore
    const storyRef = await admin.firestore().collection('stories').add({
      userId,
      productName: productName || '',
      craftType: craftType || '',
      originalText: text,
      description,
      captions,
      hashtags,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Story generated successfully',
      data: {
        id: storyRef.id,
        description,
        captions,
        hashtags,
      },
    });
  } catch (error) {
    console.error('Generate story error:', error);
    // Clean up the temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate story',
    });
  }
};

/**
 * Generate social media captions and hashtags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateCaptions = async (req, res) => {
  try {
    const userId = req.userId;
    const { storyId, platform } = req.body;

    if (!storyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Story ID is required',
      });
    }

    // Get the story from Firestore
    const storyDoc = await admin.firestore().collection('stories').doc(storyId).get();

    if (!storyDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Story not found',
      });
    }

    const story = storyDoc.data();

    // Verify the story belongs to the user
    if (story.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this story',
      });
    }

    // Get the Gemini model
    const model = getGeminiModel();

    // Generate platform-specific captions
    const platformPrompt = createPlatformCaptionsPrompt(
      story.originalText,
      story.productName,
      story.craftType,
      platform
    );
    
    const platformResult = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: platformPrompt }] }],
    });
    
    const platformCaptions = platformResult.response.text();
    const parsedCaptions = parsePlatformCaptions(platformCaptions, platform);

    // Update the story with the new captions
    const updateData = {
      [`platformCaptions.${platform}`]: parsedCaptions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('stories').doc(storyId).update(updateData);

    return res.status(200).json({
      status: 'success',
      message: `Captions for ${platform} generated successfully`,
      data: {
        id: storyId,
        platform,
        captions: parsedCaptions,
      },
    });
  } catch (error) {
    console.error('Generate captions error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate captions',
    });
  }
};

/**
 * Get all stories for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStories = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all stories for the user from Firestore
    const storiesSnapshot = await admin.firestore()
      .collection('stories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const stories = [];
    storiesSnapshot.forEach((doc) => {
      stories.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
      });
    });

    return res.status(200).json({
      status: 'success',
      data: stories,
    });
  } catch (error) {
    console.error('Get stories error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get stories',
    });
  }
};

/**
 * Get a specific story by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStoryById = async (req, res) => {
  try {
    const userId = req.userId;
    const storyId = req.params.id;

    // Get the story from Firestore
    const storyDoc = await admin.firestore().collection('stories').doc(storyId).get();

    if (!storyDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Story not found',
      });
    }

    const story = storyDoc.data();

    // Verify the story belongs to the user
    if (story.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this story',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: storyDoc.id,
        ...story,
        createdAt: story.createdAt?.toDate() || null,
        updatedAt: story.updatedAt?.toDate() || null,
      },
    });
  } catch (error) {
    console.error('Get story by ID error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get story',
    });
  }
};

/**
 * Create a prompt for generating product description
 * @param {string} text - Original text input
 * @param {string} productName - Name of the product
 * @param {string} craftType - Type of craft
 * @returns {string} Prompt for Gemini
 */
const createDescriptionPrompt = (text, productName, craftType) => {
  return `
    You are an expert storyteller specializing in traditional Indian crafts and artisanal products.
    Create a rich, engaging product description (minimum 150 words) for the following product based on the artisan's input.
    
    The description should:
    1. Highlight the cultural significance and heritage of the craft
    2. Describe the craftsmanship and techniques used
    3. Mention the materials and their quality
    4. Explain what makes this product unique
    5. Include a brief story about the artisan or the tradition
    6. Use evocative language that appeals to conscious consumers
    
    Product Name: ${productName || 'Traditional handcrafted product'}
    Craft Type: ${craftType || 'Traditional Indian craft'}
    Artisan's Input: ${text}
    
    Format the description in paragraphs with proper spacing. Do not include any headings or bullet points.
  `;
};

/**
 * Create a prompt for generating social media captions
 * @param {string} text - Original text input
 * @param {string} productName - Name of the product
 * @param {string} craftType - Type of craft
 * @returns {string} Prompt for Gemini
 */
const createCaptionsPrompt = (text, productName, craftType) => {
  return `
    You are a social media expert specializing in promoting traditional crafts and artisanal products.
    Create 3 distinct social media captions based on the artisan's input about their product.
    
    Each caption should:
    1. Be between 50-100 words
    2. Highlight different aspects of the product or craft
    3. Include a call-to-action
    4. Be engaging and shareable
    5. Appeal to conscious consumers who value authenticity and heritage
    
    Product Name: ${productName || 'Traditional handcrafted product'}
    Craft Type: ${craftType || 'Traditional Indian craft'}
    Artisan's Input: ${text}
    
    Format your response as 3 separate captions, each starting with "Caption 1:", "Caption 2:", and "Caption 3:".
    Do not include hashtags in these captions.
  `;
};

/**
 * Create a prompt for generating hashtags
 * @param {string} text - Original text input
 * @param {string} productName - Name of the product
 * @param {string} craftType - Type of craft
 * @returns {string} Prompt for Gemini
 */
const createHashtagsPrompt = (text, productName, craftType) => {
  return `
    You are a social media expert specializing in promoting traditional Indian crafts and artisanal products.
    Create 10-15 relevant hashtags for the following product based on the artisan's input.
    
    The hashtags should:
    1. Include a mix of popular and niche tags
    2. Be relevant to the craft, materials, and cultural heritage
    3. Include some location-based tags for India
    4. Include tags related to sustainable and ethical shopping
    5. Be formatted correctly for social media (no spaces, appropriate use of CamelCase for longer tags)
    
    Product Name: ${productName || 'Traditional handcrafted product'}
    Craft Type: ${craftType || 'Traditional Indian craft'}
    Artisan's Input: ${text}
    
    Format your response as a list of hashtags, each starting with #, separated by spaces.
  `;
};

/**
 * Create a prompt for generating platform-specific captions
 * @param {string} text - Original text input
 * @param {string} productName - Name of the product
 * @param {string} craftType - Type of craft
 * @param {string} platform - Social media platform
 * @returns {string} Prompt for Gemini
 */
const createPlatformCaptionsPrompt = (text, productName, craftType, platform) => {
  const platformSpecifics = {
    instagram: 'visual-focused, emotionally engaging, 3-5 sentences, with a question to encourage engagement',
    facebook: 'story-focused, slightly longer (4-6 sentences), personal tone, with context about the craft',
    twitter: 'concise, impactful, under 280 characters, with a strong call-to-action',
  };

  const platformGuidance = platformSpecifics[platform.toLowerCase()] || 'engaging, shareable, with a call-to-action';

  return `
    You are a social media expert specializing in promoting traditional Indian crafts and artisanal products.
    Create 3 distinct ${platform} captions based on the artisan's input about their product.
    
    Each caption should be ${platformGuidance}.
    
    Product Name: ${productName || 'Traditional handcrafted product'}
    Craft Type: ${craftType || 'Traditional Indian craft'}
    Artisan's Input: ${text}
    
    Format your response as 3 separate captions, each starting with "Caption 1:", "Caption 2:", and "Caption 3:".
    Include appropriate hashtags at the end of each caption.
  `;
};

/**
 * Parse captions from the Gemini response
 * @param {string} captionsText - Raw captions text from Gemini
 * @returns {Array} Array of caption strings
 */
const parseCaptions = (captionsText) => {
  const captions = [];
  const captionRegex = /Caption \d+:\s*([\s\S]*?)(?=Caption \d+:|$)/g;
  
  let match;
  while ((match = captionRegex.exec(captionsText)) !== null) {
    if (match[1].trim()) {
      captions.push(match[1].trim());
    }
  }
  
  return captions;
};

/**
 * Parse hashtags from the Gemini response
 * @param {string} hashtagsText - Raw hashtags text from Gemini
 * @returns {Array} Array of hashtag strings
 */
const parseHashtags = (hashtagsText) => {
  // Extract all hashtags from the text
  const hashtagRegex = /#[\w\d]+/g;
  const hashtags = hashtagsText.match(hashtagRegex) || [];
  
  return hashtags;
};

/**
 * Parse platform-specific captions from the Gemini response
 * @param {string} captionsText - Raw captions text from Gemini
 * @param {string} platform - Social media platform
 * @returns {Array} Array of caption objects with text and hashtags
 */
const parsePlatformCaptions = (captionsText, platform) => {
  const captions = [];
  const captionRegex = /Caption \d+:\s*([\s\S]*?)(?=Caption \d+:|$)/g;
  
  let match;
  while ((match = captionRegex.exec(captionsText)) !== null) {
    if (match[1].trim()) {
      const captionText = match[1].trim();
      
      // Extract hashtags from the caption
      const hashtagRegex = /#[\w\d]+/g;
      const hashtags = captionText.match(hashtagRegex) || [];
      
      // Remove hashtags from the caption text
      const textWithoutHashtags = captionText.replace(hashtagRegex, '').trim();
      
      captions.push({
        text: textWithoutHashtags,
        hashtags,
        platform,
      });
    }
  }
  
  return captions;
};

module.exports = {
  generateStory,
  generateCaptions,
  getStories,
  getStoryById,
};