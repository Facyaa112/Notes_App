import api from '../utils/api.utils';
import ui from '../utils/ui.utils';
import undoRedo from './undo-redo.module';

let currentPage = 1;
let totalPages = 1;
let currentSearch = '';

/**
 * Загрузить заметки
 */
async function loadNotes(page = 1, search = currentSearch) {
    try {
        currentPage = page;
        currentSearch = search;
        
        const queryParams = new URLSearchParams({
            page,
            limit: 9,
            search
        });
        
        const data = await api.get(`/notes?${queryParams}`);
        
        totalPages = data.totalPages;
        renderNotes(data.notes);
        renderPagination();
        
    } catch (error) {
        ui.showError(error);
    }
}

/**
 * Отрендерить заметки
 */
function renderNotes(notes) {
    const notesList = $('#notes-list');
    notesList.empty();
    
    if (notes.length === 0) {
        notesList.html('<p class="no-notes">У вас пока нет заметок. Создайте первую!</p>');
        return;
    }
    
    notes.forEach(note => {
        const noteCard = $(`
            <div class="note-card" data-id="${note.id}">
                <h3>${escapeHtml(note.title)}</h3>
                <p>${escapeHtml(note.content.substring(0, 150))}${note.content.length > 150 ? '...' : ''}</p>
                ${note.imageUrl ? `
                    <div class="note-image-container">
                        <img src="${escapeHtml(note.imageUrl)}" class="note-image" alt="Изображение" 
                             onerror="this.style.display='none'">
                    </div>
                ` : ''}
                <div class="note-meta">
                    <small>${new Date(note.createdAt).toLocaleString()}</small>
                    ${note.updatedAt !== note.createdAt ? '<small>(ред.)</small>' : ''}
                </div>
                <div class="note-actions">
                    <button class="btn-edit" onclick="window.editNote('${note.id}')">Редактировать</button>
                    <button class="btn-danger" onclick="window.deleteNote('${note.id}')">Удалить</button>
                </div>
            </div>
        `);
        
        notesList.append(noteCard);
    });
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Отрендерить пагинацию
 */
function renderPagination() {
    const pagination = $('#pagination');
    pagination.empty();
    
    if (totalPages <= 1) return;
    
    // Кнопка "Назад"
    if (currentPage > 1) {
        pagination.append(`<button class="page-btn" data-page="${currentPage - 1}">← Назад</button>`);
    }
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            const btn = $(`<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`);
            pagination.append(btn);
        } else if (
            i === currentPage - 3 ||
            i === currentPage + 3
        ) {
            pagination.append('<span class="pagination-dots">...</span>');
        }
    }
    
    // Кнопка "Вперед"
    if (currentPage < totalPages) {
        pagination.append(`<button class="page-btn" data-page="${currentPage + 1}">Вперед →</button>`);
    }
    
    // Обработчики для кнопок пагинации
    $('.page-btn').on('click', function() {
        const page = $(this).data('page');
        loadNotes(page);
    });
}

/**
 * Создать новую заметку
 */
async function createNote(noteData) {
    try {
        const note = await api.post('/notes', noteData);
        
        // Добавляем в историю действий
        undoRedo.addAction({
            type: 'CREATE',
            note: note
        });
        
        ui.showMessage('Заметка создана', 'success');
        ui.hideModal('#note-modal');
        loadNotes();
        
    } catch (error) {
        ui.showError(error);
    }
}

/**
 * Обновить заметку
 */
async function updateNote(id, noteData) {
    try {
        // Получаем старую версию для истории
        const oldNote = await getNoteById(id);
        
        const updatedNote = await api.put(`/notes/${id}`, noteData);
        
        // Добавляем в историю действий
        undoRedo.addAction({
            type: 'UPDATE',
            noteId: id,
            oldNote: oldNote,
            newNote: updatedNote
        });
        
        ui.showMessage('Заметка обновлена', 'success');
        ui.hideModal('#note-modal');
        loadNotes();
        
    } catch (error) {
        ui.showError(error);
    }
}

/**
 * Удалить заметку
 */
async function deleteNote(id) {
    if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
        return;
    }
    
    try {
        // Получаем заметку для истории
        const note = await getNoteById(id);
        
        await api.delete(`/notes/${id}`);
        
        // Добавляем в историю действий
        undoRedo.addAction({
            type: 'DELETE',
            note: note
        });
        
        ui.showMessage('Заметка удалена', 'success');
        loadNotes();
        
    } catch (error) {
        ui.showError(error);
    }
}

/**
 * Получить заметку по ID
 */
async function getNoteById(id) {
    const data = await api.get('/notes?limit=1000');
    return data.notes.find(n => n.id === id);
}

/**
 * Открыть модальное окно для создания/редактирования заметки
 */
function openNoteModal(note = null) {
    if (note) {
        $('#modal-title').text('Редактировать заметку');
        $('#note-id').val(note.id);
        $('#note-title').val(note.title);
        $('#note-content').val(note.content);
        $('#note-image').val(note.imageUrl || '');
    } else {
        $('#modal-title').text('Новая заметка');
        $('#note-id').val('');
        $('#note-title').val('');
        $('#note-content').val('');
        $('#note-image').val('');
    }
    
    ui.showModal('#note-modal');
}

/**
 * Инициализация модуля заметок
 */
function initNotesModule() {
    console.log('Инициализация модуля заметок');
    
    // Делаем функции глобальными для вызова из HTML
    window.editNote = (id) => {
        console.log('Редактирование заметки:', id);
        getNoteById(id).then(note => openNoteModal(note));
    };
    
    window.deleteNote = (id) => {
        console.log('Удаление заметки:', id);
        deleteNote(id);
    };
    
    // Обработка формы заметки
    $('#note-form').on('submit', async (e) => {
        e.preventDefault();
        console.log('Сохранение заметки');
        
        const noteData = {
            title: $('#note-title').val(),
            content: $('#note-content').val(),
            imageUrl: $('#note-image').val() || null
        };
        
        // Валидация
        if (!noteData.title.trim()) {
            ui.showMessage('Заголовок не может быть пустым', 'error');
            return;
        }
        
        if (!noteData.content.trim()) {
            ui.showMessage('Содержание не может быть пустым', 'error');
            return;
        }
        
        const noteId = $('#note-id').val();
        
        if (noteId) {
            await updateNote(noteId, noteData);
        } else {
            await createNote(noteData);
        }
    });
    
    // Кнопка создания новой заметки
    $('#create-note-btn').on('click', () => {
        console.log('Создание новой заметки');
        openNoteModal();
    });
    
    // Поиск с debounce
    let searchTimeout;
    $('#search-notes').on('input', function() {
        clearTimeout(searchTimeout);
        const search = $(this).val();
        
        searchTimeout = setTimeout(() => {
            console.log('Поиск:', search);
            loadNotes(1, search);
        }, 300);
    });
    
    // Загружаем заметки при авторизации
    $(document).on('user:authenticated', () => {
        console.log('Загрузка заметок после авторизации');
        loadNotes();
    });
    
    // Перезагружаем заметки при изменении (для undo/redo)
    $(document).on('notes:changed', () => {
        console.log('Перезагрузка заметок после изменений');
        loadNotes(currentPage, currentSearch);
    });
}

export default {
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    initNotesModule
};