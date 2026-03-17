import auth from './modules/auth.module';
import notes from './modules/notes.module';
import profile from './modules/profile.module';
import admin from './modules/admin.module';
import undoRedo from './modules/undo-redo.module';
import ui from './utils/ui.utils';

/**
 * Инициализация приложения
 */
function initApp() {
    console.log('Инициализация приложения...');
    
    // Инициализация модулей
    auth.initAuthForms();
    notes.initNotesModule();
    profile.initProfileModule();
    admin.initAdminModule();
    undoRedo.initUndoRedo();
    
    // Проверка авторизации
    auth.checkAuthOnLoad();
    
    // Переключение между вкладками приложения
    $('.app-tab-btn[data-app-tab]').on('click', function() {
        const tab = $(this).data('app-tab');
        
        console.log('Переключение на вкладку:', tab);
        
        // Убираем активный класс со всех кнопок
        $('.app-tab-btn').removeClass('active');
        
        // Добавляем активный класс текущей кнопке
        $(this).addClass('active');
        
        // Скрываем весь контент вкладок
        $('.app-tab-content').removeClass('active');
        
        // Показываем соответствующий контент
        if (tab === 'admin') {
            $('#admin-tab-content').addClass('active');
            console.log('Активирована админ-вкладка, загружаем пользователей...');
            // Загружаем пользователей
            admin.loadUsers();
        } else if (tab === 'profile') {
            $('#profile-tab').addClass('active');
            console.log('Активирована вкладка профиля, загружаем профиль...');
            // Загружаем профиль
            profile.loadProfile();
        } else {
            $(`#${tab}-tab`).addClass('active');
            // Загружаем заметки
            if (tab === 'notes') {
                console.log('Активирована вкладка заметок, загружаем заметки...');
                notes.loadNotes();
            }
        }
    });
    
    // Обработка кнопки выхода отдельно
    $('#logout-btn').on('click', function(e) {
        e.preventDefault();
        console.log('Выход из системы');
        auth.logout();
    });
    
    // Обработка закрытия модальных окон
    $('.close-modal').on('click', function() {
        $(this).closest('.modal').addClass('hidden');
    });
    
    // Закрытие модального окна при клике вне его
    $(window).on('click', function(e) {
        if ($(e.target).hasClass('modal')) {
            $(e.target).addClass('hidden');
        }
    });
    
    // Добавляем скрытое поле для ID заметки в модальное окно
    if ($('#note-form').find('#note-id').length === 0) {
        $('#note-form').prepend('<input type="hidden" id="note-id">');
    }
    
    // Добавляем обработчик для события admin-tab-activated (на всякий случай)
    $(document).on('admin-tab-activated', function() {
        console.log('Событие admin-tab-activated получено');
        if (auth.isAdmin()) {
            admin.loadUsers();
        }
    });
    
    // Отладка вкладок
    setTimeout(() => {
        console.log('=== ОТЛАДКА ===');
        console.log('Кнопки вкладок:', $('.app-tab-btn').length);
        console.log('Контент вкладок:', $('.app-tab-content').length);
        console.log('Активная кнопка:', $('.app-tab-btn.active').data('app-tab'));
        console.log('Активный контент:', $('.app-tab-content.active').attr('id'));
        
        const user = auth.getCurrentUser();
        console.log('Текущий пользователь:', user);
        console.log('isAdmin:', auth.isAdmin());
        
        if (user) {
            console.log('Роль пользователя:', user.role);
            console.log('Админ-вкладка видима:', $('#admin-tab').is(':visible'));
        }
        console.log('=== КОНЕЦ ОТЛАДКИ ===');
    }, 3000);
}

// Функция для ручного тестирования админ-панели (можно вызвать из консоли)
window.testAdmin = function() {
    console.log('Ручной тест админ-панели');
    console.log('isAdmin:', auth.isAdmin());
    if (auth.isAdmin()) {
        admin.loadUsers();
    } else {
        console.log('Пользователь не админ');
    }
};

// Запускаем приложение после загрузки DOM
$(document).ready(function() {
    console.log('DOM загружен, запускаем приложение');
    initApp();
});