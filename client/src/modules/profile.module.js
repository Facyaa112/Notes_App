import api from '../utils/api.utils';
import ui from '../utils/ui.utils';
import auth from './auth.module';

/**
 * Загрузить информацию о профиле
 */
async function loadProfile() {
    try {
        const profile = await api.get('/user/profile');
        
        const profileHtml = `
            <div class="profile-info">
                <p><strong>Имя:</strong> <span id="profile-name">${escapeHtml(profile.name)}</span></p>
                <p><strong>Email:</strong> <span id="profile-email">${escapeHtml(profile.email)}</span></p>
                <p><strong>Роль:</strong> ${profile.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                <p><strong>Всего заметок:</strong> ${profile.notesCount}</p>
                <p><strong>Дата регистрации:</strong> ${new Date(profile.createdAt).toLocaleString()}</p>
                
                <button id="edit-profile-btn" class="btn-primary">Редактировать профиль</button>
            </div>
        `;
        
        $('#profile-info').html(profileHtml);
        
        // Добавляем обработчик для кнопки редактирования
        $('#edit-profile-btn').on('click', () => showEditProfileForm(profile));
        
    } catch (error) {
        ui.showError(error);
    }
}

/**
 * Показать форму редактирования профиля
 */
function showEditProfileForm(profile) {
    const formHtml = `
        <div class="edit-profile-form">
            <h3>Редактирование профиля</h3>
            <form id="edit-profile">
                <div class="form-group">
                    <label for="edit-name">Имя:</label>
                    <input type="text" id="edit-name" value="${escapeHtml(profile.name)}" required>
                </div>
                <div class="form-group">
                    <label for="edit-email">Email:</label>
                    <input type="email" id="edit-email" value="${escapeHtml(profile.email)}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-success">Сохранить</button>
                    <button type="button" id="cancel-edit" class="btn-secondary">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    $('#profile-info').html(formHtml);
    
    // Обработчик сохранения
    $('#edit-profile').on('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            name: $('#edit-name').val(),
            email: $('#edit-email').val()
        };
        
        try {
            const updated = await api.put('/user/profile', updatedData);
            
            // Обновляем данные в localStorage
            const currentUser = auth.getCurrentUser();
            currentUser.name = updated.name;
            currentUser.email = updated.email;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            ui.showMessage('Профиль успешно обновлен', 'success');
            loadProfile(); // Перезагружаем профиль
        } catch (error) {
            ui.showError(error);
        }
    });
    
    // Обработчик отмены
    $('#cancel-edit').on('click', loadProfile);
}

/**
 * Сменить пароль
 */
async function changePassword(passwordData) {
    try {
        await api.post('/user/change-password', passwordData);
        ui.showMessage('Пароль успешно изменен', 'success');
        $('#change-password-form')[0].reset();
    } catch (error) {
        ui.showError(error);
    }
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
 * Инициализация модуля профиля
 */
function initProfileModule() {
    $('#change-password-form').on('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = $('#current-password').val();
        const newPassword = $('#new-password').val();
        const confirmPassword = $('#confirm-new-password').val();
        
        if (newPassword !== confirmPassword) {
            ui.showMessage('Новые пароли не совпадают', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            ui.showMessage('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        await changePassword({
            currentPassword,
            newPassword
        });
    });
    
    // Загружаем профиль при переходе на вкладку
    $('[data-app-tab="profile"]').on('click', loadProfile);
    
    // Загружаем профиль при авторизации
    $(document).on('user:authenticated', loadProfile);
}

export default {
    loadProfile,
    initProfileModule
};