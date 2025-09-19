const express = require('express');
const { getPublicProfile, updatePublicProfile, getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/profile.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

/**
 * @route GET /api/profile/:id
 * @desc Get public profile for an artisan
 * @access Public
 */
router.get('/:id', getPublicProfile);

/**
 * @route PUT /api/profile
 * @desc Update public profile
 * @access Private
 */
router.put('/', verifyToken, upload.single('profileImage'), updatePublicProfile);

/**
 * @route GET /api/profile/:id/products
 * @desc Get all products for an artisan
 * @access Public
 */
router.get('/:id/products', getProducts);

/**
 * @route POST /api/profile/products
 * @desc Add a new product
 * @access Private
 */
router.post('/products', verifyToken, upload.array('productImages', 5), addProduct);

/**
 * @route PUT /api/profile/products/:id
 * @desc Update a product
 * @access Private
 */
router.put('/products/:id', verifyToken, upload.array('productImages', 5), updateProduct);

/**
 * @route DELETE /api/profile/products/:id
 * @desc Delete a product
 * @access Private
 */
router.delete('/products/:id', verifyToken, deleteProduct);

module.exports = router;