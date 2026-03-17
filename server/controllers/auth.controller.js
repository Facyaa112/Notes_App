const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../utils/file.utils');
const { isValidEmail, validatePassword } = require('../utils/validation.utils');
const { JWT_SECRET } = require('../middleware/auth.middleware');

const USERS_FILE = 'users.json';

/**
 * Регистрация нового пользователя
 */
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    // Валидация входных данных
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Некорректный email' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Пароль не соответствует требованиям',
        errors: passwordValidation.errors 
      });
    }

    // Читаем существующих пользователей
    const users = await readData(USERS_FILE);

    // Проверяем, не занят ли email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role: users.length === 0 ? 'admin' : 'user', // Первый пользователь - админ
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    // Генерируем JWT токен
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        name: newUser.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Отправляем ответ без пароля
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'Регистрация прошла успешно',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Вход пользователя
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const users = await readData(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Генерируем токен
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Отправляем ответ без пароля
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Вход выполнен успешно',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

module.exports = {
  register,
  login
};