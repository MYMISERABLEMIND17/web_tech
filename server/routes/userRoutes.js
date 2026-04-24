const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, getUserPosts, getAllUsers, toggleConnection, acceptConnection, rejectConnection, getMyRequests } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me/requests', protect, getMyRequests);
router.get('/', protect, getAllUsers);
router.get('/:id',       protect, getProfile);
router.put('/:id',       protect, updateProfile);
router.get('/:id/posts', protect, getUserPosts);
router.post('/:id/connect', protect, toggleConnection);
router.post('/:id/accept', protect, acceptConnection);
router.post('/:id/reject', protect, rejectConnection);

module.exports = router;