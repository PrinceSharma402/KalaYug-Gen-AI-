const express = require('express');
const { uploadImage, generateDesigns, getDesigns, getDesignById } = require('../controllers/design.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

/**
 * @route POST /api/design/upload
 * @desc Upload an image for design generation
 * @access Private
 */
router.post('/upload', verifyToken, upload.single('image'), uploadImage);

/**
 * @route POST /api/design/generate
 * @desc Generate designs based on uploaded image
 * @access Private
 */
router.post('/generate', verifyToken, generateDesigns);

/**
 * @route GET /api/design
 * @desc Get all designs for a user
 * @access Private
 */
router.get('/', verifyToken, getDesigns);

/**
 * @route GET /api/design/:id
 * @desc Get a specific design by ID
 * @access Private
 */
router.get('/:id', verifyToken, getDesignById);

module.exports = router;