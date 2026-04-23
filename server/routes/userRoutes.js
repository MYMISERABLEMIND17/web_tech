const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, getUserPosts } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id',       protect, getProfile);
router.put('/:id',       protect, updateProfile);
router.get('/:id/posts', protect, getUserPosts);

module.exports = router;