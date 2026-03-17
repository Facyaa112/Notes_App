const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// Все маршруты защищены middleware authenticateToken
router.use(authenticateToken);

// GET /api/user/profile - получить профиль
router.get('/profile', userController.getProfile);

// PUT /api/user/profile - обновить профиль
router.put('/profile', userController.updateProfile);

// POST /api/user/change-password - сменить пароль
router.post('/change-password', userController.changePassword);

module.exports = router;