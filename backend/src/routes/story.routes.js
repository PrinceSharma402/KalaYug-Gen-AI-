const express = require('express');
const { generateStory, generateCaptions, getStories, getStoryById } = require('../controllers/story.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

/**
 * @route POST /api/story/generate
 * @desc Generate a product story from text input
 * @access Private
 */
router.post('/generate', verifyToken, generateStory);

/**
 * @route POST /api/story/audio
 * @desc Generate a product story from audio input
 * @access Private
 */
router.post('/audio', verifyToken, upload.single('audio'), generateStory);

/**
 * @route POST /api/story/captions
 * @desc Generate social media captions and hashtags
 * @access Private
 */
router.post('/captions', verifyToken, generateCaptions);

/**
 * @route GET /api/story
 * @desc Get all stories for a user
 * @access Private
 */
router.get('/', verifyToken, getStories);

/**
 * @route GET /api/story/:id
 * @desc Get a specific story by ID
 * @access Private
 */
router.get('/:id', verifyToken, getStoryById);

module.exports = router;