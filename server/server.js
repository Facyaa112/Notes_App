const express = require('express');
const cors = require('cors');
const path = require('path');

// Импортируем маршруты
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы из папки client/public
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// Подключаем маршруты API
app.use('/api', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Базовый маршрут для проверки API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

// Для всех остальных маршрутов отдаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});