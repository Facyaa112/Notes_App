// Временный скрипт для тестирования админ-панели
// Можно выполнить в консоли браузера

async function testAdminAPI() {
    const token = localStorage.getItem('token');
    console.log('Токен:', token);
    
    if (!token) {
        console.log('Нет токена авторизации');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/users/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Статус ответа:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Данные пользователей:', data);
        } else {
            const error = await response.json();
            console.log('Ошибка:', error);
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
    }
}

// Вызови в консоли браузера: testAdminAPI()