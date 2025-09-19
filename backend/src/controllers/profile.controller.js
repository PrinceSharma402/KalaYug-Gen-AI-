const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { uploadFile } = require('../config/storage');

/**
 * Get public profile for an artisan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPublicProfile = async (req, res) => {
  try {
    const profileId = req.params.id;

    // Get the profile from Firestore
    const profileDoc = await admin.firestore().collection('profiles').doc(profileId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    const profile = profileDoc.data();

    return res.status(200).json({
      status: 'success',
      data: {
        id: profileDoc.id,
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        craft: profile.craft,
        profileImage: profile.profileImage,
        socialLinks: profile.socialLinks,
      },
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get public profile',
    });
  }
};

/**
 * Update public profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePublicProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, bio, location, craft, socialLinks } = req.body;

    // Check if profile exists
    const profileDoc = await admin.firestore().collection('profiles').doc(userId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (craft) updateData.craft = craft;
    if (socialLinks) updateData.socialLinks = JSON.parse(socialLinks);

    // Handle profile image upload
    if (req.file) {
      const file = req.file;
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const destination = `users/${userId}/profile/${fileName}`;

      // Upload file to Google Cloud Storage
      const imageUrl = await uploadFile(file.path, destination);
      updateData.profileImage = imageUrl;
    }

    // Update profile in Firestore
    await admin.firestore().collection('profiles').doc(userId).update(updateData);

    // Also update name in users collection if provided
    if (name) {
      await admin.firestore().collection('users').doc(userId).update({
        name,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update public profile error:', error);
    // Clean up the temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update public profile',
    });
  }
};

/**
 * Get all products for an artisan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProducts = async (req, res) => {
  try {
    const profileId = req.params.id;

    // Get all products for the artisan from Firestore
    const productsSnapshot = await admin.firestore()
      .collection('products')
      .where('userId', '==', profileId)
      .orderBy('createdAt', 'desc')
      .get();

    const products = [];
    productsSnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
      });
    });

    return res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get products',
    });
  }
};

/**
 * Add a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, price, category, story } = req.body;

    // Validate input
    if (!name || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and description are required',
      });
    }

    // Handle product images upload
    const productImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const destination = `users/${userId}/products/${fileName}`;

        // Upload file to Google Cloud Storage
        const imageUrl = await uploadFile(file.path, destination);
        productImages.push(imageUrl);
      }
    }

    // Add product to Firestore
    const productRef = await admin.firestore().collection('products').add({
      userId,
      name,
      description,
      price: price || '',
      category: category || '',
      story: story || '',
      images: productImages,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product added successfully',
      data: {
        id: productRef.id,
        name,
        images: productImages,
      },
    });
  } catch (error) {
    console.error('Add product error:', error);
    // Clean up the temporary files if they exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add product',
    });
  }
};

/**
 * Update a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.id;
    const { name, description, price, category, story, removeImages } = req.body;

    // Get the product from Firestore
    const productDoc = await admin.firestore().collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    const product = productDoc.data();

    // Verify the product belongs to the user
    if (product.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this product',
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (story) updateData.story = story;

    // Handle removing images
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);
      updateData.images = product.images.filter(url => !imagesToRemove.includes(url));
    }

    // Handle adding new product images
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const destination = `users/${userId}/products/${fileName}`;

        // Upload file to Google Cloud Storage
        const imageUrl = await uploadFile(file.path, destination);
        newImages.push(imageUrl);
      }

      // Combine existing images (after removal) with new images
      updateData.images = [...(updateData.images || product.images), ...newImages];
    }

    // Update product in Firestore
    await admin.firestore().collection('products').doc(productId).update(updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Update product error:', error);
    // Clean up the temporary files if they exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update product',
    });
  }
};

/**
 * Delete a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.id;

    // Get the product from Firestore
    const productDoc = await admin.firestore().collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    const product = productDoc.data();

    // Verify the product belongs to the user
    if (product.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this product',
      });
    }

    // Delete product from Firestore
    await admin.firestore().collection('products').doc(productId).delete();

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete product',
    });
  }
};

module.exports = {
  getPublicProfile,
  updatePublicProfile,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};