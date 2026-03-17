const jwt = require('jsonwebtoken');

// Секретный ключ для JWT (в реальном проекте хранить в .env файле)
const JWT_SECRET = 'your-secret-key-change-this-in-production';

/**
 * Middleware для проверки JWT токена
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный или просроченный токен' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware для проверки роли администратора
 */
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
  }
}

module.exports = {
  authenticateToken,
  isAdmin,
  JWT_SECRET
};