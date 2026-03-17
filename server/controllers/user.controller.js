const bcrypt = require('bcryptjs');
const { readData, writeData } = require('../utils/file.utils');
const { isValidEmail } = require('../utils/validation.utils');

const USERS_FILE = 'users.json';
const NOTES_FILE = 'notes.json';

/**
 * Получить профиль пользователя
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const users = await readData(USERS_FILE);
    const notes = await readData(NOTES_FILE);
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Считаем количество заметок пользователя
    const userNotes = notes.filter(note => note.userId === userId);
    
    // Отправляем данные без пароля
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      ...userWithoutPassword,
      notesCount: userNotes.length
    });
    
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Обновить профиль пользователя
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    const users = await readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Проверяем email на корректность
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Некорректный email' });
    }
    
    // Проверяем, не занят ли email другим пользователем
    if (email && email !== users[userIndex].email) {
      const existingUser = users.find(u => u.email === email && u.id !== userId);
      if (existingUser) {
        return res.status(400).json({ message: 'Email уже используется' });
      }
    }
    
    // Обновляем данные
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email
    };
    
    await writeData(USERS_FILE, users);
    
    // Отправляем ответ без пароля
    const { password, ...userWithoutPassword } = users[userIndex];
    
    res.json(userWithoutPassword);
    
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Сменить пароль
 */
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен быть не менее 6 символов' });
    }
    
    const users = await readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Проверяем текущий пароль
    const isValidPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный текущий пароль' });
    }
    
    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    
    await writeData(USERS_FILE, users);
    
    res.json({ message: 'Пароль успешно изменен' });
    
  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};