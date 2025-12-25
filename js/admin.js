// js/admin-simple.js
// Админ-панель без проверок и паролей

document.addEventListener('DOMContentLoaded', function() {
    console.log('Админ-панель загружена');
    
    // Обновляем текущее время
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Инициализируем все компоненты
    initAdminPanel();
});

// Обновление текущего времени
function updateCurrentTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleString('ru-RU');
    }
}

// Инициализация админ-панели
function initAdminPanel() {
    // Инициализация вкладок
    initTabs();
    
    // Инициализация таблицы заказов
    initOrdersTable();
    
    // Инициализация управления меню
    initMenuManagement();
    
    // Инициализация управления категориями
    initCategoriesManagement();
    
    // Инициализация управления пользователями
    initUsersManagement();
    
    // Инициализация управления отзывами
    initReviewsManagement();
    
    // Инициализация аналитики
    initAnalytics();
    
    // Инициализация настроек
    initSettings();
    
    // Инициализация модальных окон
    initModals();
}

// Инициализация вкладок
function initTabs() {
    const tabLinks = document.querySelectorAll('.admin-nav__link');
    const tabs = document.querySelectorAll('.admin-tab');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок
            tabLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Скрываем все вкладки
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Показываем выбранную вкладку
            const tabId = this.getAttribute('data-tab');
            const tab = document.getElementById(`${tabId}-tab`);
            if (tab) {
                tab.classList.add('active');
            }
        });
    });
}

// Инициализация таблицы заказов
function initOrdersTable() {
    // Инициализация DataTable
    $('#orders-table').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/ru.json'
        },
        pageLength: 10,
        order: [[0, 'desc']]
    });
    
    // Фильтрация по статусу
    const statusFilter = document.getElementById('order-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            const table = $('#orders-table').DataTable();
            const value = this.value;
            
            if (value === 'all') {
                table.search('').columns().search('').draw();
            } else {
                table.column(4).search(value, true, false).draw();
            }
        });
    }
    
    // Экспорт заказов
    const exportBtn = document.getElementById('export-orders-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            showNotification('Экспорт заказов в CSV выполнен', 'success');
        });
    }
}

// Инициализация управления меню
function initMenuManagement() {
    const addDishBtn = document.getElementById('add-dish-btn');
    const searchInput = document.getElementById('menu-search');
    
    if (addDishBtn) {
        addDishBtn.addEventListener('click', function() {
            showNotification('Добавление нового блюда', 'info');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const dishes = document.querySelectorAll('.dish-card-admin');
            
            dishes.forEach(dish => {
                const title = dish.querySelector('.dish-card-admin__title').textContent.toLowerCase();
                const description = dish.querySelector('.dish-card-admin__description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    dish.style.display = 'flex';
                } else {
                    dish.style.display = 'none';
                }
            });
        });
    }
    
    // Фильтрация по категории
    const categoryFilter = document.getElementById('menu-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            const dishes = document.querySelectorAll('.dish-card-admin');
            
            dishes.forEach(dish => {
                const dishCategory = dish.querySelector('.dish-card-admin__category').textContent;
                
                if (category === 'all' || dishCategory === getCategoryName(category)) {
                    dish.style.display = 'flex';
                } else {
                    dish.style.display = 'none';
                }
            });
        });
    }
    
    // Обработчики кнопок блюд
    document.querySelectorAll('.edit-dish-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dishId = this.getAttribute('data-id');
            showNotification(`Редактирование блюда #${dishId}`, 'info');
        });
    });
    
    document.querySelectorAll('.delete-dish-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dishId = this.getAttribute('data-id');
            showConfirmModal(
                'Удаление блюда',
                'Вы уверены, что хотите удалить это блюдо?',
                function() {
                    showNotification(`Блюдо #${dishId} удалено`, 'success');
                }
            );
        });
    });
}

// Получение названия категории по ID
function getCategoryName(id) {
    const categories = {
        '1': 'Хычины',
        '2': 'Напитки',
        '3': 'Закуски'
    };
    return categories[id] || 'Без категории';
}

// Инициализация управления категориями
function initCategoriesManagement() {
    const addCategoryBtn = document.getElementById('add-category-btn');
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            showNotification('Добавление новой категории', 'info');
        });
    }
    
    // Обработчики кнопок категорий
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            showNotification(`Редактирование категории #${categoryId}`, 'info');
        });
    });
    
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            showConfirmModal(
                'Удаление категории',
                'Вы уверены, что хотите удалить эту категорию?',
                function() {
                    showNotification(`Категория #${categoryId} удалена`, 'success');
                }
            );
        });
    });
}

// Инициализация управления пользователями
function initUsersManagement() {
    // Инициализация DataTable
    $('#users-table').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/ru.json'
        },
        pageLength: 10,
        order: [[0, 'desc']]
    });
    
    // Фильтрация по роли
    const roleFilter = document.getElementById('user-role-filter');
    if (roleFilter) {
        roleFilter.addEventListener('change', function() {
            const table = $('#users-table').DataTable();
            const value = this.value;
            
            if (value === 'all') {
                table.search('').columns().search('').draw();
            } else {
                table.column(3).search(value === 'admin' ? 'Админ' : 'Пользователь', true, false).draw();
            }
        });
    }
    
    // Добавление пользователя
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            showNotification('Добавление нового пользователя', 'info');
        });
    }
    
    // Обработчики кнопок пользователей
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            showNotification(`Редактирование пользователя #${userId}`, 'info');
        });
    });
    
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            showConfirmModal(
                'Удаление пользователя',
                'Вы уверены, что хотите удалить этого пользователя?',
                function() {
                    showNotification(`Пользователь #${userId} удален`, 'success');
                }
            );
        });
    });
}

// Инициализация управления отзывами
function initReviewsManagement() {
    // Фильтрация по оценке
    const ratingFilter = document.getElementById('review-rating-filter');
    if (ratingFilter) {
        ratingFilter.addEventListener('change', function() {
            const value = this.value;
            const reviews = document.querySelectorAll('.review-card-admin');
            
            reviews.forEach(review => {
                const rating = review.querySelector('.review-card-admin__rating').textContent;
                const starCount = (rating.match(/★/g) || []).length;
                
                if (value === 'all' || starCount == value) {
                    review.style.display = 'block';
                } else {
                    review.style.display = 'none';
                }
            });
        });
    }
    
    // Фильтрация по статусу
    const statusFilter = document.getElementById('review-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            const value = this.value;
            const reviews = document.querySelectorAll('.review-card-admin');
            
            reviews.forEach(review => {
                const status = review.querySelector('.review-status').textContent;
                const statusMap = {
                    'pending': 'На модерации',
                    'approved': 'Одобрен',
                    'rejected': 'Отклонен'
                };
                
                if (value === 'all' || status === statusMap[value]) {
                    review.style.display = 'block';
                } else {
                    review.style.display = 'none';
                }
            });
        });
    }
    
    // Обработчики кнопок отзывов
    document.querySelectorAll('.approve-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-id');
            const reviewCard = this.closest('.review-card-admin');
            const statusBadge = reviewCard.querySelector('.review-status');
            
            statusBadge.textContent = 'Одобрен';
            statusBadge.className = 'review-status status-approved';
            showNotification(`Отзыв #${reviewId} одобрен`, 'success');
        });
    });
    
    document.querySelectorAll('.reject-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-id');
            const reviewCard = this.closest('.review-card-admin');
            const statusBadge = reviewCard.querySelector('.review-status');
            
            statusBadge.textContent = 'Отклонен';
            statusBadge.className = 'review-status status-rejected';
            showNotification(`Отзыв #${reviewId} отклонен`, 'success');
        });
    });
    
    document.querySelectorAll('.delete-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-id');
            showConfirmModal(
                'Удаление отзыва',
                'Вы уверены, что хотите удалить этот отзыв?',
                function() {
                    showNotification(`Отзыв #${reviewId} удален`, 'success');
                }
            );
        });
    });
}

// Инициализация аналитики
function initAnalytics() {
    // Инициализация графиков
    initCharts();
    
    // Генерация отчета
    const reportBtn = document.getElementById('generate-report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            showNotification('Отчет сгенерирован и скачан', 'success');
        });
    }
    
    // Изменение периода
    const periodSelect = document.getElementById('analytics-period');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            updateCharts(this.value);
        });
    }
}

// Инициализация графиков
function initCharts() {
    // График продаж
    const salesCtx = document.getElementById('sales-chart');
    if (salesCtx) {
        const salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['1-5', '6-10', '11-15', '16-20', '21-25', '26-30'],
                datasets: [{
                    label: 'Продажи (₽)',
                    data: [45000, 52000, 48000, 61000, 55000, 68000],
                    borderColor: '#C19A6B',
                    backgroundColor: 'rgba(193, 154, 107, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // График категорий
    const categoriesCtx = document.getElementById('categories-chart');
    if (categoriesCtx) {
        const categoriesChart = new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Хычины', 'Напитки', 'Закуски', 'Десерты'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: [
                        '#C19A6B',
                        '#8B4513',
                        '#FFF8E1',
                        '#E0D6C9'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Обновление графиков
function updateCharts(period) {
    console.log('Обновление графиков для периода:', period);
    // Здесь можно обновлять данные графиков в зависимости от периода
}

// Инициализация настроек
function initSettings() {
    const settingsForm = document.getElementById('general-settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Настройки сохранены', 'success');
        });
    }
}

// Инициализация модальных окон
function initModals() {
    // Модальное окно уведомления
    const notificationModal = document.getElementById('notification-modal');
    const closeNotification = document.getElementById('close-notification');
    const closeNotificationBtn = document.getElementById('close-notification-btn');
    
    if (closeNotification) {
        closeNotification.addEventListener('click', function() {
            if (notificationModal) notificationModal.classList.remove('active');
        });
    }
    
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', function() {
            if (notificationModal) notificationModal.classList.remove('active');
        });
    }
}

// Показать уведомление
function showNotification(message, type = 'success') {
    const modal = document.getElementById('notification-modal');
    const modalTitle = document.getElementById('notification-title');
    const modalText = document.getElementById('notification-text');
    
    if (!modal || !modalTitle || !modalText) {
        // Если модальное окно не найдено, показываем простой alert
        alert(message);
        return;
    }
    
    // Устанавливаем заголовок
    const titles = {
        'success': 'Успешно',
        'error': 'Ошибка',
        'info': 'Информация'
    };
    
    modalTitle.textContent = titles[type] || 'Уведомление';
    modalText.textContent = message;
    
    // Показываем модальное окно
    modal.classList.add('active');
}

// Показать модальное окно подтверждения
function showConfirmModal(title, text, confirmCallback) {
    // Создаем простое модальное окно подтверждения
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal__content">
            <h2 class="modal__title">${title}</h2>
            <div class="modal__text">${text}</div>
            <div class="modal__actions">
                <button class="btn btn--primary" id="confirm-action">Подтвердить</button>
                <button class="btn btn--secondary" id="cancel-action">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики кнопок
    modal.querySelector('#confirm-action').addEventListener('click', function() {
        document.body.removeChild(modal);
        if (confirmCallback) confirmCallback();
    });
    
    modal.querySelector('#cancel-action').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Обновление статистики
function updateStatistics() {
    // Можно добавить обновление статистики здесь
    // Например, обновлять данные каждые 30 секунд
}

// Автоматическое обновление
setInterval(updateStatistics, 30000);