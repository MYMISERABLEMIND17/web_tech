const express = require('express');
const router  = express.Router();
const {
  getPosts,
  createPost,
  likePost,
  deletePost,
  addComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/',        protect, getPosts);
router.post('/',       protect, upload.single('image'), createPost);
router.put('/:id/like',protect, likePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id',  protect, deletePost);

module.exports = router;