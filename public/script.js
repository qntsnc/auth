// Базовый URL API
const API_URL = 'http://localhost:8080/api';

// Функция для сохранения токена в localStorage
function saveToken(token) {
    localStorage.setItem('jwtToken', token);
}

// Функция для получения токена из localStorage
function getToken() {
    return localStorage.getItem('jwtToken');
}

// Функция для очистки токена
function clearToken() {
    localStorage.removeItem('jwtToken');
}

// Функция для отправки запросов на сервер
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}/${endpoint}`;
    
    // Добавляем заголовки по умолчанию
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    
    // Добавляем токен в заголовок Authorization, если он есть
    const token = getToken();
    if (token && endpoint !== 'login' && endpoint !== 'register') {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Произошла ошибка');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Функция для отображения ответа
function showResponse(elementId, message, isSuccess = true) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `response ${isSuccess ? 'success' : 'error'}`;
}

// Функция для переключения вкладок
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Удаляем активный класс у всех кнопок и панелей
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Добавляем активный класс нужной кнопке и панели
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Инициализация формы регистрации
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const data = await fetchAPI('register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            showResponse('register-response', data.message);
            form.reset();
        } catch (error) {
            showResponse('register-response', error.message, false);
        }
    });
}

// Инициализация формы входа
function setupLoginForm() {
    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const data = await fetchAPI('login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            saveToken(data.token);
            showResponse('login-response', `${data.message}. Токен сохранен.`);
            form.reset();
        } catch (error) {
            showResponse('login-response', error.message, false);
        }
    });
}

// Инициализация кнопки для получения защищенных данных
function setupProtectedButton() {
    const button = document.getElementById('get-protected');
    const responseElement = document.getElementById('protected-response');
    
    button.addEventListener('click', async () => {
        try {
            if (!getToken()) {
                throw new Error('Вы не авторизованы. Пожалуйста, войдите в систему.');
            }
            
            const data = await fetchAPI('protected');
            
            // Отображаем информацию о пользователе
            let html = `<div><strong>Пользователь:</strong> ${data.user}</div>`;
            html += `<div><strong>Сообщение:</strong> ${data.message}</div>`;
            
            // Отображаем защищенные элементы
            if (data.data && data.data.items) {
                html += '<div><strong>Защищенные элементы:</strong></div>';
                html += '<ul>';
                data.data.items.forEach(item => {
                    html += `<li class="protected-item">${item.id}. ${item.name}</li>`;
                });
                html += '</ul>';
            }
            
            responseElement.innerHTML = html;
            responseElement.className = 'response success';
        } catch (error) {
            if (error.message.includes('Недействительный токен')) {
                clearToken();
            }
            showResponse('protected-response', error.message, false);
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupRegisterForm();
    setupLoginForm();
    setupProtectedButton();
});