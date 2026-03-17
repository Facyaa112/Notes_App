import ui from '../utils/ui.utils';

const MAX_HISTORY = 10;
const STORAGE_KEY = 'actionHistory';

let history = [];
let currentIndex = -1;

/**
 * Загрузить историю из localStorage
 */
function loadHistory() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      history = JSON.parse(saved);
      currentIndex = history.length - 1;
    } catch (e) {
      console.error('Ошибка загрузки истории:', e);
      history = [];
      currentIndex = -1;
    }
  }
}

/**
 * Сохранить историю в localStorage
 */
function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Добавить действие в историю
 */
function addAction(action) {
  // Удаляем все действия после текущего индекса
  if (currentIndex < history.length - 1) {
    history = history.slice(0, currentIndex + 1);
  }
  
  // Добавляем новое действие
  history.push({
    ...action,
    timestamp: Date.now()
  });
  
  // Ограничиваем размер истории
  if (history.length > MAX_HISTORY) {
    history = history.slice(-MAX_HISTORY);
  }
  
  currentIndex = history.length - 1;
  saveHistory();
  
  updateUI();
}

/**
 * Отменить последнее действие
 */
function undo() {
  if (currentIndex < 0) {
    ui.showMessage('Нет действий для отмены', 'info');
    return;
  }
  
  const action = history[currentIndex];
  
  // В зависимости от типа действия выполняем отмену
  switch (action.type) {
    case 'CREATE':
      // Удаляем созданную заметку
      $.ajax({
        url: `/api/notes/${action.note.id}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        success: () => {
          ui.showMessage('Создание заметки отменено', 'success');
          currentIndex--;
          saveHistory();
          updateUI();
          $(document).trigger('notes:changed');
        }
      });
      break;
      
    case 'UPDATE':
      // Восстанавливаем старую версию
      $.ajax({
        url: `/api/notes/${action.noteId}`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(action.oldNote),
        success: () => {
          ui.showMessage('Изменения отменены', 'success');
          currentIndex--;
          saveHistory();
          updateUI();
          $(document).trigger('notes:changed');
        }
      });
      break;
      
    case 'DELETE':
      // Восстанавливаем удаленную заметку
      $.ajax({
        url: '/api/notes',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(action.note),
        success: () => {
          ui.showMessage('Удаление отменено', 'success');
          currentIndex--;
          saveHistory();
          updateUI();
          $(document).trigger('notes:changed');
        }
      });
      break;
  }
}

/**
 * Повторить отмененное действие
 */
function redo() {
  if (currentIndex >= history.length - 1) {
    ui.showMessage('Нет действий для повтора', 'info');
    return;
  }
  
  currentIndex++;
  const action = history[currentIndex];
  
  // Повторяем действие
  switch (action.type) {
    case 'CREATE':
      $.ajax({
        url: '/api/notes',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(action.note),
        success: () => {
          ui.showMessage('Действие повторено', 'success');
          saveHistory();
          updateUI();
          $(document).trigger('notes:changed');
        }
      });
      break;
      
    case 'UPDATE':
      $.ajax({
        url: `/api/notes/${action.noteId}`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(action.newNote),
        success: () => {
          ui.showMessage('Действие повторено', 'success');
          saveHistory();
          updateUI();
          $(document).trigger('notes:changed');
        }
      });
      break;
      
    case 'DELETE':
      $.ajax({
        url: `/api/notes/${action.note.id}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        success: () => {
          ui.showMessage('Действие повторено', 'success');
          saveHistory();
          updateUI();
          $(document).trigger('notes:changed');
        }
      });
      break;
  }
}

/**
 * Обновить UI кнопок
 */
function updateUI() {
  const undoBtn = $('#undo-btn');
  const redoBtn = $('#redo-btn');
  
  if (undoBtn.length) {
    undoBtn.prop('disabled', currentIndex < 0);
  }
  
  if (redoBtn.length) {
    redoBtn.prop('disabled', currentIndex >= history.length - 1);
  }
}

/**
 * Инициализация модуля истории
 */
function initUndoRedo() {
  loadHistory();
  
  // Добавляем кнопки на панель
  const nav = $('#main-nav');
  nav.append(`
    <button id="undo-btn" class="btn-secondary" ${currentIndex < 0 ? 'disabled' : ''}>↩ Отменить</button>
    <button id="redo-btn" class="btn-secondary" ${currentIndex >= history.length - 1 ? 'disabled' : ''}>↪ Повторить</button>
  `);
  
  // Обработчики кликов
  $('#undo-btn').on('click', undo);
  $('#redo-btn').on('click', redo);
  
  // Горячие клавиши
  $(document).on('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      redo();
    }
  });
  
  // Обновляем UI при изменении заметок
  $(document).on('notes:changed', updateUI);
}

export default {
  addAction,
  undo,
  redo,
  initUndoRedo
};