const admin = require('firebase-admin');
const { admin: firebaseAdmin } = require('../config/firebase');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, and name are required',
      });
    }

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone,
    });

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      phone: phone || '',
      role: 'artisan',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create public profile in Firestore
    await admin.firestore().collection('profiles').doc(userRecord.uid).set({
      userId: userRecord.uid,
      name,
      bio: '',
      location: '',
      craft: '',
      profileImage: '',
      socialLinks: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to register user',
    });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  // Firebase Authentication is handled client-side
  // This endpoint is just for API consistency
  res.status(200).json({
    status: 'success',
    message: 'Login should be handled by Firebase Authentication on the client side',
  });
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      status: 'success',
      data: {
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get user profile',
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;

    // Update user in Firebase Authentication
    const updateAuthData = {};
    if (name) updateAuthData.displayName = name;
    if (phone) updateAuthData.phoneNumber = phone;

    if (Object.keys(updateAuthData).length > 0) {
      await admin.auth().updateUser(userId, updateAuthData);
    }

    // Update user in Firestore
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    await admin.firestore().collection('users').doc(userId).update(updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update user profile',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};