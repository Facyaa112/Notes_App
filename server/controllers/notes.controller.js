const { readData, writeData } = require('../utils/file.utils');

const NOTES_FILE = 'notes.json';
const USERS_FILE = 'users.json';

/**
 * Получить все заметки текущего пользователя
 */
async function getNotes(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const notes = await readData(NOTES_FILE);
    
    // Фильтруем заметки пользователя
    let userNotes = notes.filter(note => note.userId === userId);
    
    // Поиск по заголовку и содержимому
    if (search) {
      const searchLower = search.toLowerCase();
      userNotes = userNotes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Сортировка по дате создания (новые сверху)
    userNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Пагинация
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotes = userNotes.slice(startIndex, endIndex);
    
    res.json({
      notes: paginatedNotes,
      total: userNotes.length,
      page: parseInt(page),
      totalPages: Math.ceil(userNotes.length / parseInt(limit))
    });
    
  } catch (error) {
    console.error('Ошибка получения заметок:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Создать новую заметку
 */
async function createNote(req, res) {
  try {
    const userId = req.user.id;
    const { title, content, imageUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Заголовок и содержимое обязательны' });
    }
    
    const notes = await readData(NOTES_FILE);
    
    const newNote = {
      id: Date.now().toString(),
      userId,
      title,
      content,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    await writeData(NOTES_FILE, notes);
    
    res.status(201).json(newNote);
    
  } catch (error) {
    console.error('Ошибка создания заметки:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Обновить заметку
 */
async function updateNote(req, res) {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, imageUrl } = req.body;
    
    const notes = await readData(NOTES_FILE);
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Заметка не найдена' });
    }
    
    // Проверяем, принадлежит ли заметка пользователю
    if (notes[noteIndex].userId !== userId) {
      return res.status(403).json({ message: 'Нет прав для редактирования этой заметки' });
    }
    
    notes[noteIndex] = {
      ...notes[noteIndex],
      title: title || notes[noteIndex].title,
      content: content || notes[noteIndex].content,
      imageUrl: imageUrl !== undefined ? imageUrl : notes[noteIndex].imageUrl,
      updatedAt: new Date().toISOString()
    };
    
    await writeData(NOTES_FILE, notes);
    
    res.json(notes[noteIndex]);
    
  } catch (error) {
    console.error('Ошибка обновления заметки:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Удалить заметку
 */
async function deleteNote(req, res) {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    
    const notes = await readData(NOTES_FILE);
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Заметка не найдена' });
    }
    
    // Проверяем, принадлежит ли заметка пользователю
    if (notes[noteIndex].userId !== userId) {
      return res.status(403).json({ message: 'Нет прав для удаления этой заметки' });
    }
    
    notes.splice(noteIndex, 1);
    await writeData(NOTES_FILE, notes);
    
    res.json({ message: 'Заметка успешно удалена' });
    
  } catch (error) {
    console.error('Ошибка удаления заметки:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote
};