import api from '../utils/api.utils';
import ui from '../utils/ui.utils';

/**
 * Загрузить список пользователей
 */
async function loadUsers() {
    console.log('ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ...');
    
    try {
        // Показываем загрузку
        const usersList = document.getElementById('users-list');
        if (usersList) {
            usersList.innerHTML = '<div style="text-align: center; padding: 40px;">Загрузка пользователей...</div>';
        }
        
        // Получаем токен
        const token = localStorage.getItem('token');
        console.log('Токен:', token ? 'есть' : 'нет');
        
        // Делаем запрос напрямую через fetch
        const response = await fetch('/api/admin/users/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const users = await response.json();
        console.log('ПОЛУЧЕНЫ ПОЛЬЗОВАТЕЛИ:', users);
        
        // Отображаем пользователей
        displayUsers(users);
        
    } catch (error) {
        console.error('ОШИБКА загрузки пользователей:', error);
        const usersList = document.getElementById('users-list');
        if (usersList) {
            usersList.innerHTML = `<div style="color: red; text-align: center; padding: 40px;">
                Ошибка загрузки: ${error.message}
            </div>`;
        }
        ui.showError(error);
    }
}

/**
 * Отобразить пользователей в таблице
 */
function displayUsers(users) {
    const usersList = document.getElementById('users-list');
    
    if (!usersList) {
        console.error('Элемент users-list не найден!');
        return;
    }
    
    if (!users || users.length === 0) {
        usersList.innerHTML = '<div style="text-align: center; padding: 40px;">Пользователей не найдено</div>';
        return;
    }
    
    console.log('Отображение пользователей:', users.length);
    
    // Создаем таблицу
    let html = `
        <style>
            .admin-users-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                background-color: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
                font-family: Arial, sans-serif;
            }
            .admin-users-table th {
                background-color: #007bff;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: bold;
            }
            .admin-users-table td {
                padding: 12px;
                border-bottom: 1px solid #ddd;
            }
            .admin-users-table tr:last-child td {
                border-bottom: none;
            }
            .admin-users-table tr:hover {
                background-color: #f5f5f5;
            }
            .admin-badge {
                background-color: #dc3545;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
            }
            .user-badge {
                background-color: #28a745;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
            }
        </style>
        <table class="admin-users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Заметок</th>
                    <th>Дата регистрации</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        const userId = user.id || 'N/A';
        const userName = user.name || 'Без имени';
        const userEmail = user.email || 'Нет email';
        const userRole = user.role || 'user';
        const notesCount = user.notesCount || 0;
        
        let createdAt = 'Неизвестно';
        if (user.createdAt) {
            try {
                createdAt = new Date(user.createdAt).toLocaleString();
            } catch (e) {
                createdAt = user.createdAt;
            }
        }
        
        const badgeClass = userRole === 'admin' ? 'admin-badge' : 'user-badge';
        const roleText = userRole === 'admin' ? 'Администратор' : 'Пользователь';
        
        html += `
            <tr>
                <td>${escapeHtml(userId.substring(0, 8))}...</td>
                <td>${escapeHtml(userName)}</td>
                <td>${escapeHtml(userEmail)}</td>
                <td><span class="${badgeClass}">${roleText}</span></td>
                <td>${notesCount}</td>
                <td>${escapeHtml(createdAt)}</td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    usersList.innerHTML = html;
    console.log('Таблица отображена');
}

/**
 * Простое экранирование HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Инициализация модуля администратора
 */
function initAdminModule() {
    console.log('ИНИЦИАЛИЗАЦИЯ МОДУЛЯ АДМИНИСТРАТОРА');
    
    // Проверяем, админ ли пользователь
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.role === 'admin') {
                console.log('Пользователь админ, показываем вкладку');
                const adminTab = document.getElementById('admin-tab');
                if (adminTab) {
                    adminTab.style.display = 'inline-block';
                }
            }
        } catch (e) {
            console.error('Ошибка парсинга user:', e);
        }
    }
}

// ВАЖНО: экспортируем ОБЕ функции!
export default {
    loadUsers,      // ← ЭТО БЫЛО ПРОПУЩЕНО!
    initAdminModule
};