const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

// Все маршруты защищены middleware authenticateToken и isAdmin
router.use(authenticateToken);
router.use(isAdmin);

// GET /api/admin/users - получить всех пользователей
router.get('/users', adminController.getAllUsers);

// GET /api/admin/users/stats - получить статистику по пользователям
router.get('/users/stats', adminController.getUserStats);

module.exports = router;