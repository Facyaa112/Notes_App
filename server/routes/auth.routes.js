const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// POST /api/register - регистрация
router.post('/register', register);

// POST /api/login - вход
router.post('/login', login);

module.exports = router;