const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const notesController = require('../controllers/notes.controller');

// Все маршруты защищены middleware authenticateToken
router.use(authenticateToken);

// GET /api/notes - получить все заметки пользователя
router.get('/', notesController.getNotes);

// POST /api/notes - создать заметку
router.post('/', notesController.createNote);

// PUT /api/notes/:id - обновить заметку
router.put('/:id', notesController.updateNote);

// DELETE /api/notes/:id - удалить заметку
router.delete('/:id', notesController.deleteNote);

module.exports = router;