const express = require('express');
const { register, login, updateProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/users', protect, getUsers);

module.exports = router;
