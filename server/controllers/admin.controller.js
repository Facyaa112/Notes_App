const { readData } = require('../utils/file.utils');

const USERS_FILE = 'users.json';
const NOTES_FILE = 'notes.json';

/**
 * Получить всех пользователей
 */
async function getAllUsers(req, res) {
  try {
    const users = await readData(USERS_FILE);
    
    // Убираем пароли из ответа
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
    
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Получить статистику по пользователям
 */
async function getUserStats(req, res) {
  try {
    const users = await readData(USERS_FILE);
    const notes = await readData(NOTES_FILE);
    
    const stats = users.map(user => {
      const userNotes = notes.filter(note => note.userId === user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        notesCount: userNotes.length
      };
    });
    
    res.json(stats);
    
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

module.exports = {
  getAllUsers,
  getUserStats
};