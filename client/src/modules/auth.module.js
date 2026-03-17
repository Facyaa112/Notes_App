import api from '../utils/api.utils';
import ui from '../utils/ui.utils';
import cookieUtils from '../utils/cookie.utils';

// Ключ для localStorage
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Сохранить данные авторизации
 */
function setAuthData(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Очистить данные авторизации
 */
function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Получить текущего пользователя
 */
function getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Проверка авторизации
 */
function isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Проверка на администратора
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

/**
 * Регистрация
 */
async function register(userData) {
    try {
        const data = await api.post('/register', userData);
        setAuthData(data.token, data.user);
        ui.showMessage('Регистрация прошла успешно!', 'success');
        return data;
    } catch (error) {
        ui.showError(error);
        throw error;
    }
}

/**
 * Вход
 */
async function login(credentials, rememberMe = false) {
    try {
        const data = await api.post('/login', credentials);
        setAuthData(data.token, data.user);
        
        // Если "Запомнить меня" - сохраняем email в cookie
        if (rememberMe) {
            cookieUtils.setCookie('rememberedEmail', credentials.email, 30);
        } else {
            cookieUtils.deleteCookie('rememberedEmail');
        }
        
        ui.showMessage(`С возвращением, ${data.user.name}!`, 'success');
        return data;
    } catch (error) {
        ui.showError(error);
        throw error;
    }
}

/**
 * Выход
 */
function logout() {
    clearAuthData();
    ui.showMessage('Вы вышли из системы', 'info');
    window.location.reload();
}

/**
 * Инициализация форм авторизации
 */
function initAuthForms() {
    // Переключение между вкладками
    $('.tab-btn').on('click', function() {
        const tab = $(this).data('tab');
        
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        $('.form-container').removeClass('active');
        $(`#${tab}-form`).addClass('active');
    });
    
    // Обработка формы регистрации
    $('#register').on('submit', async (e) => {
        e.preventDefault();
        
        const password = $('#register-password').val();
        const confirm = $('#register-confirm').val();
        
        // Проверка совпадения паролей
        if (password !== confirm) {
            ui.showMessage('Пароли не совпадают', 'error');
            return;
        }
        
        const userData = {
            name: $('#register-name').val(),
            email: $('#register-email').val(),
            password: password
        };
        
        try {
            await register(userData);
            showAppSection();
        } catch (error) {
            // Ошибка уже обработана в ui.showError
        }
    });
    
    // Обработка формы входа
    $('#login').on('submit', async (e) => {
        e.preventDefault();
        
        const credentials = {
            email: $('#login-email').val(),
            password: $('#login-password').val()
        };
        
        const rememberMe = $('#remember-me').is(':checked');
        
        try {
            await login(credentials, rememberMe);
            showAppSection();
        } catch (error) {
            // Ошибка уже обработана в ui.showError
        }
    });
    
    // Выход
    $('#logout-btn').on('click', logout);
    
    // Проверяем сохраненный email при загрузке
    const rememberedEmail = cookieUtils.getCookie('rememberedEmail');
    if (rememberedEmail) {
        $('#login-email').val(rememberedEmail);
        $('#login-password').focus();
        ui.showMessage(`С возвращением, ${rememberedEmail}!`, 'info');
    }
}

/**
 * Показать секцию приложения (после авторизации)
 */
function showAppSection() {
    $('#auth-section').addClass('hidden');
    $('#app-section').removeClass('hidden');
    
    // Проверяем роль пользователя
    const user = getCurrentUser();
    console.log('Текущий пользователь:', user);
    
    // Сбрасываем активные вкладки
    $('.app-tab-btn').removeClass('active');
    $('.app-tab-content').removeClass('active');
    
    // Активируем вкладку заметок по умолчанию
    $('.app-tab-btn[data-app-tab="notes"]').addClass('active');
    $('#notes-tab').addClass('active');
    
    if (user && user.role === 'admin') {
        console.log('Пользователь - администратор, показываем админ-панель');
        $('#admin-tab').show();
        $('#admin-tab').removeClass('hidden');
    } else {
        console.log('Обычный пользователь, скрываем админ-панель');
        $('#admin-tab').hide();
        $('#admin-tab').addClass('hidden');
    }
    
    // Триггерим событие для загрузки данных
    $(document).trigger('user:authenticated');
}

/**
 * Проверить авторизацию при загрузке
 */
function checkAuthOnLoad() {
    if (isAuthenticated()) {
        showAppSection();
    }
}

export default {
    register,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    getCurrentUser,
    initAuthForms,
    checkAuthOnLoad
};