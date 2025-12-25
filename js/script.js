// ===== ОСНОВНОЙ КОД =====
document.addEventListener('DOMContentLoaded', function() {
    // ===== ПЕРЕМЕННЫЕ И СОСТОЯНИЕ =====
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let visitorsCount = parseInt(localStorage.getItem('visitorsCount')) || 1234;
    let khychinCount = parseInt(localStorage.getItem('khychinCount')) || 9876;
    
    // ===== ИНИЦИАЛИЗАЦИЯ =====
    init();
    
    // ===== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ =====
    function init() {
        // Обновление счетчиков посетителей
        updateCounters();
        
        // Обновление интерфейса в зависимости от авторизации
        updateAuthUI();
        
        // Обновление корзины
        updateCart();
        
        // Инициализация событий
        initEvents();
        
        // Запуск обновления счетчика каждые 5 секунд
        setInterval(updateVisitorCounter, 5000);
    }
    
    // ===== ОБНОВЛЕНИЕ СЧЕТЧИКОВ =====
    function updateCounters() {
        // Анимация счетчика хычинов
        animateCounter('khychin-counter', khychinCount);
        
        // Анимация счетчика посетителей
        animateCounter('visitor-counter', visitorsCount);
    }
    
    function updateVisitorCounter() {
        // Увеличиваем счетчик посетителей
        visitorsCount += Math.floor(Math.random() * 3) + 1;
        localStorage.setItem('visitorsCount', visitorsCount);
        
        // Анимация обновления
        animateCounter('visitor-counter', visitorsCount);
    }
    
    function animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        const increment = (targetValue - currentValue) / 50;
        let current = currentValue;
        
        function update() {
            current += increment;
            if ((increment > 0 && current >= targetValue) || 
                (increment < 0 && current <= targetValue)) {
                element.textContent = targetValue.toLocaleString();
                return;
            }
            
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(update);
        }
        
        update();
    }
    
    // ===== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА АВТОРИЗАЦИИ =====
    function updateAuthUI() {
        const authBlock = document.getElementById('auth-block');
        const guestBlock = document.getElementById('guest-block');
        const userIcon = document.getElementById('user-icon');
        
        if (currentUser) {
            // Пользователь авторизован
            if (authBlock) authBlock.style.display = 'block';
            if (guestBlock) guestBlock.style.display = 'none';
            if (userIcon) {
                userIcon.innerHTML = '<i class="fas fa-user-circle"></i>';
                userIcon.title = currentUser.name;
            }
        } else {
            // Гость
            if (authBlock) authBlock.style.display = 'none';
            if (guestBlock) guestBlock.style.display = 'block';
            if (userIcon) {
                userIcon.innerHTML = '<i class="fas fa-user"></i>';
                userIcon.title = 'Войти';
            }
        }
    }
    
    // ===== РАБОТА С КОРЗИНОЙ =====
    function updateCart() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
        
        // Обновление модалки корзины
        updateCartModal();
    }
    
    function updateCartModal() {
        const cartItems = document.getElementById('cart-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        const cartEmpty = document.getElementById('cart-empty');
        
        if (cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.innerHTML = '';
            cartTotalPrice.textContent = '0 ₽';
            return;
        }
        
        cartEmpty.style.display = 'none';
        
        let itemsHTML = '';
        let totalPrice = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            itemsHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item__info">
                        <div class="cart-item__name">${item.name}</div>
                        <div class="cart-item__price">${item.price} ₽ × ${item.quantity}</div>
                    </div>
                    <div class="cart-item__actions">
                        <span class="cart-item__quantity">${itemTotal} ₽</span>
                        <button class="cart-item__remove" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = itemsHTML;
        cartTotalPrice.textContent = `${totalPrice} ₽`;
        
        // Добавляем события для кнопок удаления
        document.querySelectorAll('.cart-item__remove').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFromCart(id);
            });
        });
    }
    
    function addToCart(id, name, price) {
        // Увеличиваем счетчик хычинов
        khychinCount += 1;
        localStorage.setItem('khychinCount', khychinCount);
        animateCounter('khychin-counter', khychinCount);
        
        // Ищем товар в корзине
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price: parseInt(price),
                quantity: 1
            });
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем интерфейс
        updateCart();
        
        // Показываем уведомление
        showNotification(`"${name}" добавлен в корзину`, 'success');
    }
    
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        showNotification('Товар удален из корзины', 'info');
    }
    
    // ===== ВАЛИДАЦИЯ ФОРМ =====
    function validateFIO(fio) {
        const regex = /^[А-ЯЁа-яё\s-]+$/;
        return regex.test(fio.trim());
    }
    
    function validateLogin(login) {
        const regex = /^[a-zA-Z]+$/;
        return regex.test(login.trim());
    }
    
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    }
    
    function validatePassword(password) {
        return password.length >= 6;
    }
    
    function validatePasswordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }
    
    // ===== УВЕДОМЛЕНИЯ =====
    function showNotification(message, type = 'info') {
        // Удаляем старое уведомление
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification__close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Закрытие по кнопке
        notification.querySelector('.notification__close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }
    
    // ===== СОБЫТИЯ =====
    function initEvents() {
        // Бургер-меню
        const burgerBtn = document.getElementById('burger-btn');
        const closeMenuBtn = document.getElementById('close-menu');
        const verticalNav = document.getElementById('vertical-nav');
        const overlay = document.getElementById('overlay');
        
        if (burgerBtn) {
            burgerBtn.addEventListener('click', () => {
                verticalNav.classList.add('open');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', closeMobileMenu);
        }
        
        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }
        
        function closeMobileMenu() {
            verticalNav.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.vertical-nav__link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Модальные окна
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const userIcon = document.getElementById('user-icon');
        const cartIcon = document.getElementById('cart-icon');
        
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const cartModal = document.getElementById('cart-modal');
        
        const closeLogin = document.getElementById('close-login');
        const closeRegister = document.getElementById('close-register');
        const closeCart = document.getElementById('close-cart');
        
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        
        // Открытие модалок
        function openModal(modal) {
            closeAllModals();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeModal(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        function closeAllModals() {
            closeModal(loginModal);
            closeModal(registerModal);
            closeModal(cartModal);
        }
        
        // События открытия
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(loginModal);
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(registerModal);
            });
        }
        
        if (userIcon) {
            userIcon.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentUser) {
                    window.location.href = 'profile.html';
                } else {
                    openModal(loginModal);
                }
            });
        }
        
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(cartModal);
            });
        }
        
        // События закрытия
        if (closeLogin) closeLogin.addEventListener('click', () => closeModal(loginModal));
        if (closeRegister) closeRegister.addEventListener('click', () => closeModal(registerModal));
        if (closeCart) closeCart.addEventListener('click', () => closeModal(cartModal));
        
        // Закрытие по клику на оверлей
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
        
        // Переключение между модалками
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(loginModal);
                openModal(registerModal);
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(registerModal);
                openModal(loginModal);
            });
        }
        
        // Добавление в корзину
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = this.getAttribute('data-price');
                
                if (!currentUser) {
                    showNotification('Пожалуйста, войдите в систему, чтобы добавлять товары в корзину', 'error');
                    openModal(loginModal);
                    return;
                }
                
                addToCart(id, name, price);
            });
        });
        
        // Оформление заказа
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    showNotification('Корзина пуста', 'error');
                    return;
                }
                
                // В реальном приложении здесь был бы переход к оформлению заказа
                showNotification('Заказ оформлен! С вами свяжется оператор для подтверждения.', 'success');
                
                // Очистка корзины
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
                
                // Закрытие модалки
                setTimeout(() => {
                    closeModal(cartModal);
                }, 2000);
            });
        }
        
        // Форма входа
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('login-username').value;
                const password = document.getElementById('login-password').value;
                
                // Сброс ошибок
                document.getElementById('login-username-error').textContent = '';
                document.getElementById('login-password-error').textContent = '';
                document.getElementById('login-username').classList.remove('error');
                document.getElementById('login-password').classList.remove('error');
                
                // Проверка логина и пароля
                if (username === 'admin' && password === 'admin') {
                    // Администратор
                    currentUser = {
                        id: 1,
                        username: 'admin',
                        name: 'Администратор',
                        email: 'admin@khychinnaya.ru',
                        role: 'admin'
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateAuthUI();
                    closeModal(loginModal);
                    showNotification('Добро пожаловать, Администратор!', 'success');
                    
                    // Перенаправление в админ-панель
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1000);
                    
                    return;
                }
                
                // Проверка обычных пользователей
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    currentUser = {
                        id: user.id,
                        username: user.username,
                        name: user.fio,
                        email: user.email,
                        role: 'user'
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateAuthUI();
                    closeModal(loginModal);
                    showNotification(`Добро пожаловать, ${user.fio.split(' ')[1]}!`, 'success');
                    
                    // Перенаправление в личный кабинет
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                } else {
                    // Ошибка авторизации
                    document.getElementById('login-username').classList.add('error');
                    document.getElementById('login-password').classList.add('error');
                    document.getElementById('login-username-error').textContent = 'Неверный логин или пароль';
                    document.getElementById('login-password-error').textContent = 'Неверный логин или пароль';
                    
                    // Анимация ошибки
                    loginForm.classList.add('error');
                    setTimeout(() => {
                        loginForm.classList.remove('error');
                    }, 500);
                }
            });
        }
        
        // Форма регистрации
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            // Валидация в реальном времени
            const fioInput = document.getElementById('reg-fio');
            const usernameInput = document.getElementById('reg-username');
            const emailInput = document.getElementById('reg-email');
            const passwordInput = document.getElementById('reg-password');
            const passwordConfirmInput = document.getElementById('reg-password-confirm');
            const agreementInput = document.getElementById('reg-agreement');
            
            // ФИО
            fioInput.addEventListener('input', function() {
                if (!validateFIO(this.value)) {
                    this.classList.add('error');
                    document.getElementById('reg-fio-error').style.opacity = '1';
                } else {
                    this.classList.remove('error');
                    document.getElementById('reg-fio-error').style.opacity = '0';
                }
            });
            
            // Логин
            usernameInput.addEventListener('input', function() {
                if (!validateLogin(this.value)) {
                    this.classList.add('error');
                    document.getElementById('reg-username-error').style.opacity = '1';
                } else {
                    this.classList.remove('error');
                    document.getElementById('reg-username-error').style.opacity = '0';
                }
            });
            
            // Email
            emailInput.addEventListener('input', function() {
                if (!validateEmail(this.value)) {
                    this.classList.add('error');
                    document.getElementById('reg-email-error').style.opacity = '1';
                } else {
                    this.classList.remove('error');
                    document.getElementById('reg-email-error').style.opacity = '0';
                }
            });
            
            // Пароль
            passwordInput.addEventListener('input', function() {
                if (!validatePassword(this.value)) {
                    this.classList.add('error');
                    document.getElementById('reg-password-error').textContent = 'Пароль должен быть не менее 6 символов';
                    document.getElementById('reg-password-error').style.opacity = '1';
                } else {
                    this.classList.remove('error');
                    document.getElementById('reg-password-error').style.opacity = '0';
                }
                
                // Проверка совпадения паролей
                if (passwordConfirmInput.value && !validatePasswordsMatch(this.value, passwordConfirmInput.value)) {
                    passwordConfirmInput.classList.add('error');
                    document.getElementById('reg-password-confirm-error').style.opacity = '1';
                } else if (passwordConfirmInput.value) {
                    passwordConfirmInput.classList.remove('error');
                    document.getElementById('reg-password-confirm-error').style.opacity = '0';
                }
            });
            
            // Подтверждение пароля
            passwordConfirmInput.addEventListener('input', function() {
                if (!validatePasswordsMatch(passwordInput.value, this.value)) {
                    this.classList.add('error');
                    document.getElementById('reg-password-confirm-error').style.opacity = '1';
                } else {
                    this.classList.remove('error');
                    document.getElementById('reg-password-confirm-error').style.opacity = '0';
                }
            });
            
            // Согласие
            agreementInput.addEventListener('change', function() {
                if (!this.checked) {
                    document.getElementById('reg-agreement-error').style.opacity = '1';
                } else {
                    document.getElementById('reg-agreement-error').style.opacity = '0';
                }
            });
            
            // Отправка формы
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                let isValid = true;
                
                // Валидация всех полей
                if (!validateFIO(fioInput.value)) {
                    fioInput.classList.add('error');
                    document.getElementById('reg-fio-error').style.opacity = '1';
                    isValid = false;
                }
                
                if (!validateLogin(usernameInput.value)) {
                    usernameInput.classList.add('error');
                    document.getElementById('reg-username-error').style.opacity = '1';
                    isValid = false;
                }
                
                if (!validateEmail(emailInput.value)) {
                    emailInput.classList.add('error');
                    document.getElementById('reg-email-error').style.opacity = '1';
                    isValid = false;
                }
                
                if (!validatePassword(passwordInput.value)) {
                    passwordInput.classList.add('error');
                    document.getElementById('reg-password-error').textContent = 'Пароль должен быть не менее 6 символов';
                    document.getElementById('reg-password-error').style.opacity = '1';
                    isValid = false;
                }
                
                if (!validatePasswordsMatch(passwordInput.value, passwordConfirmInput.value)) {
                    passwordConfirmInput.classList.add('error');
                    document.getElementById('reg-password-confirm-error').style.opacity = '1';
                    isValid = false;
                }
                
                if (!agreementInput.checked) {
                    document.getElementById('reg-agreement-error').style.opacity = '1';
                    isValid = false;
                }
                
                if (!isValid) {
                    // Анимация ошибки
                    registerForm.classList.add('error');
                    setTimeout(() => {
                        registerForm.classList.remove('error');
                    }, 500);
                    return;
                }
                
                // Проверка уникальности логина
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const usernameExists = users.find(u => u.username === usernameInput.value);
                
                if (usernameExists) {
                    usernameInput.classList.add('error');
                    document.getElementById('reg-username-error').textContent = 'Этот логин уже занят';
                    document.getElementById('reg-username-error').style.opacity = '1';
                    
                    // Анимация ошибки
                    registerForm.classList.add('error');
                    setTimeout(() => {
                        registerForm.classList.remove('error');
                    }, 500);
                    return;
                }
                
                // Создание пользователя
                const newUser = {
                    id: Date.now(),
                    fio: fioInput.value.trim(),
                    username: usernameInput.value.trim(),
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                    registrationDate: new Date().toISOString()
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                // Автоматический вход
                currentUser = {
                    id: newUser.id,
                    username: newUser.username,
                    name: newUser.fio,
                    email: newUser.email,
                    role: 'user'
                };
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateAuthUI();
                
                // Закрытие модалки и уведомление
                closeModal(registerModal);
                showNotification('Регистрация прошла успешно! Добро пожаловать!', 'success');
                
                // Перенаправление в личный кабинет
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            });
        }
        
        // Выход из системы
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                currentUser = null;
                localStorage.removeItem('currentUser');
                updateAuthUI();
                showNotification('Вы успешно вышли из системы', 'info');
                closeMobileMenu();
            });
        }
        
        // Форма подписки
        const subscribeForm = document.getElementById('subscribe-form');
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = this.querySelector('input[type="email"]').value;
                
                if (validateEmail(email)) {
                    showNotification('Спасибо за подписку! Проверьте вашу почту.', 'success');
                    this.reset();
                } else {
                    showNotification('Пожалуйста, введите корректный email', 'error');
                }
            });
        }
        
        // Стили для уведомлений
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 350px;
                z-index: 2000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification--success {
                border-left: 4px solid var(--success-color);
            }
            
            .notification--error {
                border-left: 4px solid var(--error-color);
            }
            
            .notification--info {
                border-left: 4px solid var(--primary-color);
            }
            
            .notification__content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification__content i {
                font-size: 1.2rem;
            }
            
            .notification__content i.fa-check-circle {
                color: var(--success-color);
            }
            
            .notification__content i.fa-exclamation-circle {
                color: var(--error-color);
            }
            
            .notification__content i.fa-info-circle {
                color: var(--primary-color);
            }
            
            .notification__close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #999;
                cursor: pointer;
                margin-left: 15px;
            }
            
            .notification__close:hover {
                color: #333;
            }
            
            @media (max-width: 768px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
});
// Скрипт для страницы меню
document.addEventListener('DOMContentLoaded', function() {
    // Фильтрация по категориям
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCategories = document.querySelectorAll('.menu-category');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Показываем/скрываем категории
            menuCategories.forEach(categoryElement => {
                if (category === 'all' || categoryElement.getAttribute('data-category') === category) {
                    categoryElement.style.display = 'block';
                    // Анимация появления
                    setTimeout(() => {
                        categoryElement.style.opacity = '1';
                        categoryElement.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    categoryElement.style.opacity = '0';
                    categoryElement.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        categoryElement.style.display = 'none';
                    }, 300);
                }
            });
            
            // Прокрутка к первой видимой категории
            if (category !== 'all') {
                const firstVisible = document.querySelector(`.menu-category[data-category="${category}"]`);
                if (firstVisible) {
                    window.scrollTo({
                        top: firstVisible.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Управление количеством товаров
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
            let value = parseInt(input.value);
            
            if (this.classList.contains('minus')) {
                if (value > 1) {
                    input.value = value - 1;
                }
            } else if (this.classList.contains('plus')) {
                if (value < 10) {
                    input.value = value + 1;
                }
            }
            
            // Анимация изменения
            input.classList.add('changed');
            setTimeout(() => {
                input.classList.remove('changed');
            }, 300);
        });
    });
    
    // Валидация ввода количества
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
            } else if (value > 10) {
                this.value = 10;
            }
        });
        
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });
    
    // Кнопки "В корзину" на странице меню
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            const quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
            const quantity = parseInt(quantityInput.value) || 1;
            
            if (!window.currentUser) {
                showNotification('Пожалуйста, войдите в систему, чтобы добавлять товары в корзину', 'error');
                document.getElementById('login-modal').classList.add('active');
                return;
            }
            
            // Добавляем товар в корзину несколько раз в зависимости от количества
            for (let i = 0; i < quantity; i++) {
                // Используем функцию addToCart из основного скрипта
                if (window.addToCart) {
                    window.addToCart(id, name, price);
                } else {
                    // Запасной вариант, если функция не доступна глобально
                    addToCartLocal(id, name, price);
                }
            }
            
            // Анимация кнопки
            this.innerHTML = '<i class="fas fa-check"></i> Добавлено';
            this.classList.add('added');
            
            setTimeout(() => {
                this.innerHTML = 'В корзину';
                this.classList.remove('added');
            }, 2000);
            
            // Сброс количества
            quantityInput.value = 1;
        });
    });
    
    // Функция для добавления в корзину (если основная функция не доступна)
    function addToCartLocal(id, name, price) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price: parseInt(price),
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем счетчик корзины
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
        
        // Показываем уведомление
        showNotification(`"${name}" добавлен в корзину`, 'success');
    }
    
    // Быстрый заказ
    const quickOrderBtn = document.getElementById('quick-order-btn');
    const quickOrderModal = document.getElementById('quick-order-modal');
    const closeQuickOrder = document.getElementById('close-quick-order');
    
    if (quickOrderBtn) {
        quickOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!window.currentUser) {
                showNotification('Пожалуйста, войдите в систему для оформления заказа', 'error');
                document.getElementById('login-modal').classList.add('active');
                return;
            }
            
            // Закрываем все модалки
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            
            // Открываем модалку быстрого заказа
            quickOrderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeQuickOrder) {
        closeQuickOrder.addEventListener('click', function() {
            quickOrderModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Форма быстрого заказа
    const quickOrderForm = document.getElementById('quick-order-form');
    if (quickOrderForm) {
        quickOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('quick-order-phone').value;
            const name = document.getElementById('quick-order-name').value;
            const comment = document.getElementById('quick-order-comment').value;
            
            // Простая валидация телефона
            const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
            
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                document.getElementById('quick-order-phone').classList.add('error');
                document.getElementById('quick-order-phone-error').textContent = 'Введите корректный номер телефона';
                document.getElementById('quick-order-phone-error').style.opacity = '1';
                return;
            }
            
            if (!name.trim()) {
                document.getElementById('quick-order-name').classList.add('error');
                document.getElementById('quick-order-name-error').textContent = 'Введите ваше имя';
                document.getElementById('quick-order-name-error').style.opacity = '1';
                return;
            }
            
            // Имитация отправки заказа
            setTimeout(() => {
                quickOrderModal.classList.remove('active');
                document.body.style.overflow = '';
                
                showNotification('Спасибо! Мы перезвоним вам в течение 15 минут.', 'success');
                
                // Очистка формы
                quickOrderForm.reset();
            }, 1000);
        });
    }
    
    // Анимация при прокрутке
    function animateOnScroll() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (itemTop < windowHeight * 0.9) {
                item.classList.add('visible');
            }
        });
    }
    
    // Инициализация анимации
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Вызов при загрузке
    
    // Стили для анимации элементов меню
    const style = document.createElement('style');
    style.textContent = `
        .page-header {
            padding: 120px 0 40px;
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--background-color) 100%);
            text-align: center;
        }
        
        .page-header__title {
            font-size: 2.5rem;
            color: var(--primary-dark);
            margin-bottom: 1rem;
        }
        
        .page-header__subtitle {
            font-size: 1.2rem;
            color: var(--text-light);
            max-width: 600px;
            margin: 0 auto;
        }
        
        .menu-filters {
            padding: 20px 0;
            background-color: var(--background-color);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 70px;
            z-index: 100;
        }
        
        .filters {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding: 10px 0;
            scrollbar-width: thin;
        }
        
        .filters::-webkit-scrollbar {
            height: 4px;
        }
        
        .filters::-webkit-scrollbar-track {
            background: var(--secondary-color);
        }
        
        .filters::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 2px;
        }
        
        .filter-btn {
            padding: 10px 20px;
            background-color: var(--secondary-color);
            border: 1px solid var(--border-color);
            border-radius: 30px;
            color: var(--text-color);
            font-weight: 500;
            cursor: pointer;
            white-space: nowrap;
            transition: var(--transition);
            flex-shrink: 0;
        }
        
        .filter-btn:hover {
            background-color: rgba(193, 154, 107, 0.1);
            border-color: var(--primary-color);
        }
        
        .filter-btn.active {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        .menu-section {
            padding: 40px 0 80px;
        }
        
        .menu-category {
            margin-bottom: 60px;
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .menu-category__title {
            font-size: 1.8rem;
            color: var(--primary-dark);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .menu-category__title i {
            color: var(--primary-color);
        }
        
        .menu-category__description {
            color: var(--text-light);
            margin-bottom: 30px;
            max-width: 800px;
        }
        
        .menu-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        .menu-item {
            background-color: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: var(--transition);
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .menu-item.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .menu-item__image {
            height: 200px;
            position: relative;
            overflow: hidden;
        }
        
        .menu-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .menu-item:hover .menu-img {
            transform: scale(1.05);
        }
        
        .menu-item__badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: var(--primary-color);
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .menu-item__badge.new {
            background-color: var(--success-color);
        }
        
        .menu-item__content {
            padding: 20px;
        }
        
        .menu-item__header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .menu-item__title {
            font-size: 1.3rem;
            margin-right: 15px;
        }
        
        .menu-item__price {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            flex-shrink: 0;
        }
        
        .menu-item__description {
            color: var(--text-light);
            margin-bottom: 15px;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .menu-item__details {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .menu-item__details i {
            margin-right: 5px;
            color: var(--primary-color);
        }
        
        .menu-item__actions {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        .quantity-selector {
            display: flex;
            align-items: center;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            overflow: hidden;
        }
        
        .quantity-btn {
            width: 36px;
            height: 36px;
            background-color: var(--secondary-color);
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }
        
        .quantity-btn:hover {
            background-color: var(--primary-color);
            color: white;
        }
        
        .quantity-input {
            width: 50px;
            height: 36px;
            border: none;
            text-align: center;
            font-size: 1rem;
            font-weight: 600;
            transition: var(--transition);
        }
        
        .quantity-input:focus {
            outline: none;
        }
        
        .quantity-input.changed {
            background-color: rgba(193, 154, 107, 0.1);
        }
        
        .add-to-cart-btn {
            flex: 1;
            padding: 10px 15px;
            font-size: 0.95rem;
        }
        
        .add-to-cart-btn.added {
            background-color: var(--success-color);
        }
        
        .add-to-cart-btn.added:hover {
            background-color: var(--success-color);
            transform: none;
        }
        
        .order-banner {
            padding: 60px 0;
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
            color: white;
            text-align: center;
        }
        
        .order-banner__title {
            font-size: 2rem;
            margin-bottom: 15px;
            color: white;
        }
        
        .order-banner__text {
            font-size: 1.1rem;
            margin-bottom: 30px;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
            opacity: 0.9;
        }
        
        .order-banner__actions {
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
        }
        
        @media (min-width: 768px) {
            .page-header__title {
                font-size: 3rem;
            }
            
            .menu-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .order-banner__actions {
                flex-direction: row;
                justify-content: center;
            }
        }
        
        @media (min-width: 1024px) {
            .menu-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        @media (min-width: 1200px) {
            .menu-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Показываем уведомления
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Запасной вариант
            alert(message);
        }
    }
});

// Скрипт для страницы "О нас"
document.addEventListener('DOMContentLoaded', function() {
    // Анимация статистики
    function animateStatistics() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 секунды
            const step = target / (duration / 16); // 60 FPS
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });
    }
    
    // Запуск анимации статистики при прокрутке
    function checkScrollForStats() {
        const statsSection = document.querySelector('.history__stats');
        if (!statsSection) return;
        
        const sectionTop = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.8) {
            animateStatistics();
            window.removeEventListener('scroll', checkScrollForStats);
        }
    }
    
    window.addEventListener('scroll', checkScrollForStats);
    checkScrollForStats(); // Проверяем при загрузке
    
    // Слайдер отзывов
    const reviewsTrack = document.querySelector('.reviews__track');
    const reviewsPrev = document.getElementById('reviews-prev');
    const reviewsNext = document.getElementById('reviews-next');
    const reviewCards = document.querySelectorAll('.review-card');
    
    if (reviewsTrack && reviewCards.length > 0) {
        let currentIndex = 0;
        const cardWidth = reviewCards[0].offsetWidth + 30; // Ширина карточки + gap
        
        function updateSlider() {
            reviewsTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            
            // Обновляем состояние кнопок
            reviewsPrev.disabled = currentIndex === 0;
            reviewsNext.disabled = currentIndex >= reviewCards.length - 1;
        }
        
        if (reviewsPrev) {
            reviewsPrev.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlider();
                }
            });
        }
        
        if (reviewsNext) {
            reviewsNext.addEventListener('click', () => {
                if (currentIndex < reviewCards.length - 1) {
                    currentIndex++;
                    updateSlider();
                }
            });
        }
        
        // Автопрокрутка отзывов
        let autoSlideInterval = setInterval(() => {
            if (currentIndex < reviewCards.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateSlider();
        }, 5000);
        
        // Останавливаем автопрокрутку при наведении
        reviewsTrack.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        reviewsTrack.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(() => {
                if (currentIndex < reviewCards.length - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0;
                }
                updateSlider();
            }, 5000);
        });
        
        // Адаптация под мобильные устройства
        let startX = 0;
        let currentTranslate = 0;
        
        reviewsTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            clearInterval(autoSlideInterval);
        });
        
        reviewsTrack.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            // Ограничиваем смещение
            const maxTranslate = (reviewCards.length - 1) * cardWidth;
            currentTranslate = Math.max(0, Math.min(currentIndex * cardWidth + diff, maxTranslate));
            reviewsTrack.style.transform = `translateX(-${currentTranslate}px)`;
        });
        
        reviewsTrack.addEventListener('touchend', () => {
            // Определяем ближайшую карточку
            const newIndex = Math.round(currentTranslate / cardWidth);
            currentIndex = Math.max(0, Math.min(newIndex, reviewCards.length - 1));
            updateSlider();
            
            // Возобновляем автопрокрутку
            autoSlideInterval = setInterval(() => {
                if (currentIndex < reviewCards.length - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0;
                }
                updateSlider();
            }, 5000);
        });
        
        // Инициализация слайдера
        updateSlider();
    }
    
    // Модалка отзыва
    const addReviewBtn = document.getElementById('add-review-btn');
    const reviewModal = document.getElementById('review-modal');
    const closeReview = document.getElementById('close-review');
    
    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!window.currentUser) {
                showNotification('Пожалуйста, войдите в систему, чтобы оставить отзыв', 'error');
                document.getElementById('login-modal').classList.add('active');
                return;
            }
            
            // Закрываем все модалки
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            
            // Открываем модалку отзыва
            reviewModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeReview) {
        closeReview.addEventListener('click', function() {
            reviewModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Форма отзыва
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        // Звездный рейтинг
        const starInputs = reviewForm.querySelectorAll('input[name="rating"]');
        const starLabels = reviewForm.querySelectorAll('.rating-input label');
        
        starLabels.forEach(label => {
            label.addEventListener('mouseenter', function() {
                const value = this.getAttribute('for').replace('star', '');
                highlightStars(value);
            });
            
            label.addEventListener('mouseleave', function() {
                const checked = reviewForm.querySelector('input[name="rating"]:checked');
                if (checked) {
                    highlightStars(checked.value);
                } else {
                    resetStars();
                }
            });
        });
        
        function highlightStars(value) {
            starLabels.forEach((label, index) => {
                if (5 - index <= value) {
                    label.querySelector('i').style.color = '#FFD700';
                } else {
                    label.querySelector('i').style.color = '#ddd';
                }
            });
        }
        
        function resetStars() {
            starLabels.forEach(label => {
                label.querySelector('i').style.color = '#ddd';
            });
        }
        
        // Отправка формы
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('review-name').value;
            const rating = reviewForm.querySelector('input[name="rating"]:checked');
            const text = document.getElementById('review-text').value;
            
            if (!name.trim()) {
                showNotification('Введите ваше имя', 'error');
                return;
            }
            
            if (!rating) {
                showNotification('Поставьте оценку', 'error');
                return;
            }
            
            if (!text.trim()) {
                showNotification('Напишите текст отзыва', 'error');
                return;
            }
            
            // Имитация отправки отзыва
            setTimeout(() => {
                reviewModal.classList.remove('active');
                document.body.style.overflow = '';
                
                showNotification('Спасибо за ваш отзыв! Он появится на сайте после модерации.', 'success');
                
                // Очистка формы
                reviewForm.reset();
                resetStars();
            }, 1000);
        });
    }
    
    // Форма обратной связи
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const phone = document.getElementById('contact-phone').value;
            const message = document.getElementById('contact-message').value;
            
            // Простая валидация
            if (!name.trim()) {
                showNotification('Введите ваше имя', 'error');
                return;
            }
            
            const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                showNotification('Введите корректный номер телефона', 'error');
                return;
            }
            
            if (!message.trim()) {
                showNotification('Напишите ваше сообщение', 'error');
                return;
            }
            
            // Имитация отправки
            setTimeout(() => {
                showNotification('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.', 'success');
                
                // Очистка формы
                contactForm.reset();
            }, 1000);
        });
    }
    
    // Анимация появления элементов при прокрутке
    function animateOnScroll() {
        const animatedElements = document.querySelectorAll('.tradition-card, .process-step, .team-member');
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.8) {
                element.classList.add('visible');
            }
        });
    }
    
    // Инициализация анимации
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Вызов при загрузке
    
    // Стили для страницы
    const style = document.createElement('style');
    style.textContent = `
        .page-header {
            padding: 120px 0 60px;
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--background-color) 100%);
            text-align: center;
        }
        
        .page-header__title {
            font-size: 2.5rem;
            color: var(--primary-dark);
            margin-bottom: 1rem;
        }
        
        .page-header__subtitle {
            font-size: 1.2rem;
            color: var(--text-light);
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* История */
        .history {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .history__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 50px;
            align-items: center;
        }
        
        .history__image {
            position: relative;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
        }
        
        .history__image img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .history__year {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 10px 20px;
            border-radius: var(--radius);
            font-weight: 600;
            font-size: 1.2rem;
        }
        
        .history__content p {
            margin-bottom: 1.5rem;
            color: var(--text-light);
            line-height: 1.7;
        }
        
        .history__stats {
            display: flex;
            justify-content: space-around;
            margin-top: 40px;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        /* Традиции */
        .traditions {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .traditions__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        .tradition-card {
            background-color: white;
            padding: 30px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            text-align: center;
            transition: var(--transition);
            opacity: 0;
            transform: translateY(20px);
        }
        
        .tradition-card.visible {
            opacity: 1;
            transform: translateY(0);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .tradition-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-hover);
        }
        
        .tradition-card__icon {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 20px;
        }
        
        .tradition-card__title {
            font-size: 1.3rem;
            margin-bottom: 15px;
            color: var(--primary-dark);
        }
        
        .tradition-card__description {
            color: var(--text-light);
            line-height: 1.6;
        }
        
        /* Что такое хычин */
        .what-is {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .what-is__content {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .what-is__text p {
            margin-bottom: 1.5rem;
            color: var(--text-light);
            line-height: 1.7;
        }
        
        .what-is__list {
            margin: 20px 0 30px 20px;
            color: var(--text-light);
        }
        
        .what-is__list li {
            margin-bottom: 10px;
            line-height: 1.6;
        }
        
        /* Процесс приготовления */
        .process {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .process__steps {
            max-width: 800px;
            margin: 0 auto;
            position: relative;
        }
        
        .process__steps::before {
            content: '';
            position: absolute;
            left: 30px;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: var(--primary-color);
            opacity: 0.3;
        }
        
        .process-step {
            display: flex;
            margin-bottom: 40px;
            position: relative;
            opacity: 0;
            transform: translateX(-20px);
        }
        
        .process-step.visible {
            opacity: 1;
            transform: translateX(0);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .process-step:last-child {
            margin-bottom: 0;
        }
        
        .process-step__number {
            width: 60px;
            height: 60px;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            margin-right: 30px;
            flex-shrink: 0;
            z-index: 1;
        }
        
        .process-step__content {
            flex: 1;
            padding-top: 10px;
        }
        
        .process-step__title {
            font-size: 1.3rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .process-step__description {
            color: var(--text-light);
            line-height: 1.6;
        }
        
        /* Команда */
        .team {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .team__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
        }
        
        .team-member {
            background-color: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: var(--transition);
            opacity: 0;
            transform: translateY(20px);
        }
        
        .team-member.visible {
            opacity: 1;
            transform: translateY(0);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .team-member:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-hover);
        }
        
        .team-member__photo {
            height: 250px;
            position: relative;
            overflow: hidden;
        }
        
        .team-member__photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .team-member:hover .team-member__photo img {
            transform: scale(1.05);
        }
        
        .team-member__social {
            position: absolute;
            bottom: 20px;
            right: 20px;
        }
        
        .team-member__social a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            color: var(--primary-color);
            font-size: 1.2rem;
            transition: var(--transition);
        }
        
        .team-member__social a:hover {
            background-color: var(--primary-color);
            color: white;
            transform: scale(1.1);
        }
        
        .team-member__info {
            padding: 25px;
        }
        
        .team-member__name {
            font-size: 1.4rem;
            margin-bottom: 5px;
            color: var(--primary-dark);
        }
        
        .team-member__position {
            color: var(--primary-color);
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }
        
        .team-member__bio {
            color: var(--text-light);
            line-height: 1.6;
        }
        
        /* Отзывы */
        .reviews {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .reviews__slider {
            position: relative;
            max-width: 1200px;
            margin: 0 auto 40px;
            overflow: hidden;
        }
        
        .reviews__track {
            display: flex;
            gap: 30px;
            transition: transform 0.5s ease;
            padding: 10px 0;
        }
        
        .review-card {
            background-color: white;
            padding: 30px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            min-width: 100%;
            transition: var(--transition);
        }
        
        .review-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .review-card__header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .review-card__avatar {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-right: 15px;
        }
        
        .review-card__info {
            flex: 1;
        }
        
        .review-card__name {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .review-card__date {
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        .review-card__rating {
            color: #FFD700;
            font-size: 1.2rem;
        }
        
        .review-card__content {
            color: var(--text-light);
            line-height: 1.6;
        }
        
        .reviews__controls {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
        }
        
        .reviews__prev,
        .reviews__next {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: white;
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
            font-size: 1.2rem;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .reviews__prev:hover:not(:disabled),
        .reviews__next:hover:not(:disabled) {
            background-color: var(--primary-color);
            color: white;
        }
        
        .reviews__prev:disabled,
        .reviews__next:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .reviews__action {
            text-align: center;
            margin-top: 30px;
        }
        
        /* Форма обратной связи */
        .contact-form-section {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .contact-form__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 50px;
        }
        
        .contact-form__content p {
            margin-bottom: 30px;
            color: var(--text-light);
            line-height: 1.7;
        }
        
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .contact-info__item {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        
        .contact-info__item i {
            font-size: 1.2rem;
            color: var(--primary-color);
            margin-top: 3px;
        }
        
        .contact-info__label {
            font-size: 0.9rem;
            color: var(--text-light);
            margin-bottom: 3px;
        }
        
        .contact-info__value {
            font-weight: 600;
        }
        
        /* Звездный рейтинг в модалке */
        .rating-input {
            display: flex;
            flex-direction: row-reverse;
            justify-content: flex-end;
        }
        
        .rating-input input {
            display: none;
        }
        
        .rating-input label {
            font-size: 2rem;
            color: #ddd;
            cursor: pointer;
            transition: color 0.2s;
            padding: 0 5px;
        }
        
        .rating-input input:checked ~ label,
        .rating-input label:hover,
        .rating-input label:hover ~ label {
            color: #FFD700;
        }
        
        /* Адаптивность */
        @media (min-width: 768px) {
            .page-header__title {
                font-size: 3rem;
            }
            
            .history__grid {
                grid-template-columns: 1fr 1fr;
            }
            
            .traditions__grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .review-card {
                min-width: calc(50% - 15px);
            }
            
            .team__grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .contact-form__grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (min-width: 1024px) {
            .traditions__grid {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .review-card {
                min-width: calc(33.333% - 20px);
            }
            
            .team__grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Показываем уведомления
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Запасной вариант
            alert(message);
        }
    }
});
// Скрипт для страницы "Доставка и оплата"
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация карты
    function initMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;
        
        // Координаты ресторана (Москва, ул. Кавказская, 15)
        const restaurantCoords = [55.7558, 37.6173];
        
        // Создаем карту
        const map = L.map('map').setView(restaurantCoords, 11);
        
        // Добавляем слой OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Добавляем маркер ресторана
        const restaurantIcon = L.divIcon({
            html: '<i class="fas fa-utensils" style="color: #C19A6B; font-size: 24px;"></i>',
            iconSize: [30, 30],
            className: 'restaurant-marker'
        });
        
        L.marker(restaurantCoords, { icon: restaurantIcon })
            .addTo(map)
            .bindPopup('<b>Хычинная</b><br>ул. Кавказская, 15<br>Ежедневно 10:00 - 23:00')
            .openPopup();
        
        // Определяем зоны доставки (упрощенно)
        const zones = {
            nearest: {
                color: '#27AE60',
                coordinates: [
                    [55.76, 37.60], [55.76, 37.64], [55.74, 37.64],
                    [55.74, 37.60], [55.76, 37.60]
                ]
            },
            standard: {
                color: '#F39C12',
                coordinates: [
                    [55.78, 37.58], [55.78, 37.66], [55.72, 37.66],
                    [55.72, 37.58], [55.78, 37.58]
                ]
            },
            extended: {
                color: '#E74C3C',
                coordinates: [
                    [55.80, 37.56], [55.80, 37.68], [55.70, 37.68],
                    [55.70, 37.56], [55.80, 37.56]
                ]
            }
        };
        
        // Добавляем полигоны зон доставки
        Object.values(zones).forEach(zone => {
            L.polygon(zone.coordinates, {
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.1,
                weight: 2
            }).addTo(map);
        });
        
        // Сохраняем карту в глобальной области видимости для использования в калькуляторе
        window.deliveryMap = map;
    }
    
    // Инициализируем карту после загрузки страницы
    setTimeout(initMap, 100);
    
    // Аккордеон FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.faq-question__icon');
            
            // Закрываем другие открытые вопросы
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                    item.querySelector('.faq-question__icon').style.transform = 'rotate(0deg)';
                }
            });
            
            // Переключаем текущий вопрос
            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            } else {
                answer.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Калькулятор доставки
    const calculatorForm = document.getElementById('delivery-calculator-form');
    const resultZone = document.getElementById('result-zone');
    const resultPrice = document.getElementById('result-price');
    const resultTime = document.getElementById('result-time');
    const resultTotal = document.getElementById('result-total');
    
    // Зоны доставки и их параметры
    const deliveryZones = {
        'nearest': {
            name: 'Ближайшая зона',
            minOrder: 500,
            deliveryPrice: 0,
            deliveryTime: '30-45 минут',
            color: '#27AE60'
        },
        'standard': {
            name: 'Стандартная зона',
            minOrder: 700,
            deliveryPrice: 150,
            deliveryTime: '45-60 минут',
            color: '#F39C12'
        },
        'extended': {
            name: 'Расширенная зона',
            minOrder: 1000,
            deliveryPrice: 250,
            deliveryTime: '60-90 минут',
            color: '#E74C3C'
        },
        'outside': {
            name: 'За пределами зоны',
            minOrder: 1500,
            deliveryPrice: 500,
            deliveryTime: '90+ минут',
            color: '#95A5A6'
        }
    };
    
    // Функция для определения зоны по адресу (упрощенно)
    function determineZone(address) {
        // В реальном приложении здесь был бы запрос к геокодеру
        // Для демонстрации используем простую логику
        const addressLower = address.toLowerCase();
        
        if (addressLower.includes('центр') || 
            addressLower.includes('преображен') || 
            addressLower.includes('сокол')) {
            return 'nearest';
        } else if (addressLower.includes('север') || 
                   addressLower.includes('южн') || 
                   addressLower.includes('восток') || 
                   addressLower.includes('запад')) {
            return 'standard';
        } else if (addressLower.includes('подмоск') || 
                   addressLower.includes('новый') || 
                   addressLower.includes('удален')) {
            return 'extended';
        } else {
            return 'outside';
        }
    }
    
    // Функция расчета стоимости доставки
    function calculateDelivery(orderAmount, zone) {
        const zoneData = deliveryZones[zone];
        
        if (orderAmount < zoneData.minOrder) {
            return {
                success: false,
                message: `Минимальная сумма заказа для ${zoneData.name.toLowerCase()} — ${zoneData.minOrder} ₽`
            };
        }
        
        // Бесплатная доставка от 2000 ₽
        const deliveryCost = orderAmount >= 2000 ? 0 : zoneData.deliveryPrice;
        const total = orderAmount + deliveryCost;
        
        return {
            success: true,
            zone: zoneData.name,
            deliveryPrice: deliveryCost,
            deliveryTime: zoneData.deliveryTime,
            total: total,
            color: zoneData.color
        };
    }
    
    // Обработка формы калькулятора
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const address = document.getElementById('calculator-address').value;
            const amount = parseInt(document.getElementById('calculator-amount').value);
            
            if (!address.trim()) {
                showNotification('Введите адрес доставки', 'error');
                return;
            }
            
            if (isNaN(amount) || amount < 0) {
                showNotification('Введите корректную сумму заказа', 'error');
                return;
            }
            
            // Определяем зону
            const zone = determineZone(address);
            const result = calculateDelivery(amount, zone);
            
            // Отображаем результат
            if (result.success) {
                resultZone.textContent = result.zone;
                resultZone.style.color = result.color;
                
                resultPrice.textContent = result.deliveryPrice === 0 ? 'Бесплатно' : `${result.deliveryPrice} ₽`;
                resultPrice.style.color = result.deliveryPrice === 0 ? '#27AE60' : '#333';
                
                resultTime.textContent = result.deliveryTime;
                resultTotal.textContent = `${result.total} ₽`;
                
                // Анимация появления результата
                const resultCard = document.querySelector('.result-card');
                resultCard.classList.add('calculated');
                
                // Показываем уведомление о бесплатной доставке
                if (amount >= 2000) {
                    showNotification('🎉 Поздравляем! Вы получили бесплатную доставку!', 'success');
                }
            } else {
                showNotification(result.message, 'error');
                
                // Сбрасываем результаты
                resultZone.textContent = '—';
                resultPrice.textContent = '—';
                resultTime.textContent = '—';
                resultTotal.textContent = '—';
                resultZone.style.color = '';
                resultPrice.style.color = '';
            }
            
            // Анимация кнопки
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Рассчитывается...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
        
        // Динамическое обновление при изменении суммы
        const amountInput = document.getElementById('calculator-amount');
        if (amountInput) {
            amountInput.addEventListener('input', function() {
                // Ограничиваем максимальное значение
                if (parseInt(this.value) > 100000) {
                    this.value = 100000;
                }
                
                // Форматирование при вводе
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }
    }
    
    // Автозаполнение адреса (демо-функция)
    const addressInput = document.getElementById('calculator-address');
    if (addressInput) {
        // Сохраняем фокус при клике на подсказки
        addressInput.addEventListener('focus', function() {
            this.select();
        });
        
        // Демо-подсказки
        const demoAddresses = [
            'ул. Кавказская, 15 (Центр)',
            'ул. Ленина, 42 (Северный округ)',
            'пр. Мира, 89 (Южный округ)',
            'ш. Энтузиастов, 25 (Восточный округ)',
            'ул. Новостройка, 7 (Подмосковье)'
        ];
        
        // Показываем подсказку при фокусе
        addressInput.addEventListener('focus', function() {
            if (!this.value) {
                this.placeholder = 'Например: ' + demoAddresses[Math.floor(Math.random() * demoAddresses.length)];
            }
        });
        
        addressInput.addEventListener('blur', function() {
            this.placeholder = 'Например: ул. Кавказская, 15';
        });
    }
    
    // Анимация появления карточек
    function animateCardsOnScroll() {
        const cards = document.querySelectorAll('.zone-card, .step-card, .payment-card, .faq-item');
        
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight * 0.8) {
                card.classList.add('visible');
            }
        });
    }
    
    // Инициализация анимации
    window.addEventListener('scroll', animateCardsOnScroll);
    animateCardsOnScroll(); // Вызов при загрузке
    
    // Стили для страницы
    const style = document.createElement('style');
    style.textContent = `
        .page-header {
            padding: 120px 0 60px;
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--background-color) 100%);
            text-align: center;
        }
        
        .page-header__title {
            font-size: 2.5rem;
            color: var(--primary-dark);
            margin-bottom: 1rem;
        }
        
        .page-header__subtitle {
            font-size: 1.2rem;
            color: var(--text-light);
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Зоны доставки */
        .delivery-zones {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .zones__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .zone-card {
            background-color: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: var(--transition);
            opacity: 0;
            transform: translateY(20px);
        }
        
        .zone-card.visible {
            opacity: 1;
            transform: translateY(0);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .zone-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-hover);
        }
        
        .zone-card--free {
            border-top: 4px solid #27AE60;
        }
        
        .zone-card--standard {
            border-top: 4px solid #F39C12;
        }
        
        .zone-card--extended {
            border-top: 4px solid #E74C3C;
        }
        
        .zone-card__header {
            padding: 25px 25px 15px;
            text-align: center;
        }
        
        .zone-card__icon {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 15px;
        }
        
        .zone-card__title {
            font-size: 1.4rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .zone-card__time {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-color);
            padding: 5px 15px;
            background-color: var(--secondary-color);
            border-radius: 20px;
            display: inline-block;
        }
        
        .zone-card__body {
            padding: 0 25px 25px;
        }
        
        .zone-card__price {
            font-size: 2rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 10px;
            color: var(--primary-color);
        }
        
        .zone-card__min-order {
            text-align: center;
            color: var(--text-light);
            margin-bottom: 20px;
            font-size: 0.9rem;
        }
        
        .zone-card__list {
            list-style: none;
            padding: 0;
        }
        
        .zone-card__list li {
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-color);
        }
        
        .zone-card__list li:last-child {
            border-bottom: none;
        }
        
        .zones__note {
            background-color: var(--secondary-color);
            padding: 20px;
            border-radius: var(--radius);
            text-align: center;
            color: var(--text-color);
        }
        
        .zones__note p {
            margin-bottom: 10px;
        }
        
        .zones__note p:last-child {
            margin-bottom: 0;
        }
        
        /* Как заказать */
        .how-to-order {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .steps__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        .step-card {
            display: flex;
            background-color: white;
            border-radius: var(--radius);
            padding: 25px;
            box-shadow: var(--shadow);
            transition: var(--transition);
            opacity: 0;
            transform: translateX(-20px);
        }
        
        .step-card.visible {
            opacity: 1;
            transform: translateX(0);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .step-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .step-card__number {
            width: 50px;
            height: 50px;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            margin-right: 25px;
            flex-shrink: 0;
        }
        
        .step-card__content {
            flex: 1;
        }
        
        .step-card__title {
            font-size: 1.3rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .step-card__description {
            color: var(--text-light);
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .step-card__link {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .step-card__link:hover {
            color: var(--primary-dark);
        }
        
        /* Способы оплаты */
        .payment-methods {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .payment__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        .payment-card {
            background-color: white;
            padding: 30px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            text-align: center;
            transition: var(--transition);
            opacity: 0;
            transform: translateY(20px);
        }
        
        .payment-card.visible {
            opacity: 1;
            transform: translateY(0);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .payment-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-hover);
        }
        
        .payment-card__icon {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 20px;
        }
        
        .payment-card__title {
            font-size: 1.3rem;
            margin-bottom: 15px;
            color: var(--primary-dark);
        }
        
        .payment-card__description {
            color: var(--text-light);
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .payment-card__badges {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .badge {
            background-color: var(--secondary-color);
            color: var(--primary-color);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        /* Карта доставки */
        .delivery-map {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .map__header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .map__container {
            margin-bottom: 30px;
            border-radius: var(--radius);
            overflow: hidden;
        }
        
        .map__legend {
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }
        
        .legend-text {
            color: var(--text-color);
        }
        
        /* FAQ */
        .faq {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .faq__accordion {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .faq-item {
            margin-bottom: 15px;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            opacity: 0;
            transform: translateY(10px);
        }
        
        .faq-item.visible {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .faq-question {
            width: 100%;
            padding: 20px 25px;
            background-color: white;
            border: none;
            text-align: left;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: inherit;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--primary-dark);
            transition: var(--transition);
        }
        
        .faq-question:hover {
            background-color: var(--secondary-color);
        }
        
        .faq-question__text {
            flex: 1;
            margin-right: 15px;
        }
        
        .faq-question__icon {
            transition: transform 0.3s ease;
            color: var(--primary-color);
        }
        
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            background-color: white;
        }
        
        .faq-item.active .faq-answer {
            max-height: 1000px;
        }
        
        .faq-answer p,
        .faq-answer ul,
        .faq-answer ol {
            padding: 0 25px 20px;
            color: var(--text-light);
            line-height: 1.7;
        }
        
        .faq-answer ul,
        .faq-answer ol {
            margin-left: 40px;
            margin-bottom: 15px;
        }
        
        .faq-answer li {
            margin-bottom: 8px;
        }
        
        /* Калькулятор доставки */
        .delivery-calculator {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .calculator__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 50px;
        }
        
        .calculator__content {
            text-align: center;
        }
        
        .calculator__description {
            color: var(--text-light);
            margin-bottom: 30px;
        }
        
        .input-with-unit {
            position: relative;
        }
        
        .input-unit {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-light);
        }
        
        .calculator__result {
            display: flex;
            justify-content: center;
        }
        
        .result-card {
            background-color: white;
            border-radius: var(--radius);
            padding: 30px;
            box-shadow: var(--shadow);
            width: 100%;
            max-width: 400px;
            transition: var(--transition);
        }
        
        .result-card.calculated {
            animation: pulse 0.5s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .result-card__title {
            font-size: 1.5rem;
            margin-bottom: 25px;
            color: var(--primary-dark);
            text-align: center;
        }
        
        .result-card__content {
            margin-bottom: 25px;
        }
        
        .result-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .result-item:last-child {
            border-bottom: none;
        }
        
        .result-item--total {
            font-weight: 700;
            font-size: 1.2rem;
            color: var(--primary-dark);
        }
        
        .result-label {
            color: var(--text-color);
        }
        
        .result-value {
            font-weight: 600;
            color: var(--primary-color);
        }
        
        .result-card__actions {
            text-align: center;
        }
        
        /* Контактная информация */
        .delivery-contact {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .contact__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 50px;
            align-items: center;
        }
        
        .contact__info p {
            color: var(--text-light);
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .contact-details {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .contact-detail {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        
        .contact-detail i {
            font-size: 1.2rem;
            color: var(--primary-color);
            margin-top: 3px;
        }
        
        .contact-detail__label {
            font-size: 0.9rem;
            color: var(--text-light);
            margin-bottom: 3px;
        }
        
        .contact-detail__value {
            font-weight: 600;
        }
        
        .contact__image {
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
        }
        
        .contact__image img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        /* Адаптивность */
        @media (min-width: 768px) {
            .page-header__title {
                font-size: 3rem;
            }
            
            .zones__grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .zone-card:last-child {
                grid-column: span 2;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .steps__grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .payment__grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .map__legend {
                flex-direction: row;
                justify-content: center;
                gap: 30px;
            }
            
            .calculator__grid {
                grid-template-columns: 1fr 1fr;
            }
            
            .contact__grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (min-width: 1024px) {
            .zones__grid {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .zone-card:last-child {
                grid-column: auto;
                max-width: none;
            }
            
            .steps__grid {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .payment__grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        
        /* Стили для карты */
        .restaurant-marker {
            background: none;
            border: none;
        }
        
        .leaflet-container {
            font-family: inherit;
        }
    `;
    document.head.appendChild(style);
    
    // Показываем уведомления
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Запасной вариант
            alert(message);
        }
    }
});

// Скрипт для страницы "Контакты"
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация карты
    function initMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;
        
        // Координаты ресторана (Москва, ул. Кавказская, 15)
        const restaurantCoords = [55.7994, 37.7159];
        
        // Создаем карту
        const map = L.map('map').setView(restaurantCoords, 17);
        
        // Добавляем слой OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Создаем кастомную иконку
        const restaurantIcon = L.divIcon({
            html: '<div class="map-marker"><i class="fas fa-utensils"></i></div>',
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            className: 'custom-marker'
        });
        
        // Добавляем маркер ресторана
        const marker = L.marker(restaurantCoords, { icon: restaurantIcon })
            .addTo(map)
            .bindPopup(`
                <div class="map-popup">
                    <h3>Хычинная</h3>
                    <p><i class="fas fa-map-marker-alt"></i> ул. Кавказская, 15</p>
                    <p><i class="fas fa-phone"></i> +7 (999) 123-45-67</p>
                    <p><i class="fas fa-clock"></i> 10:00 - 23:00</p>
                    <a href="https://yandex.ru/maps/?pt=37.7159,55.7994&z=17&l=map" target="_blank" class="btn btn--small" style="margin-top: 10px; display: inline-block;">
                        Построить маршрут
                    </a>
                </div>
            `)
            .openPopup();
        
        // Добавляем кружок радиуса
        L.circle(restaurantCoords, {
            color: '#C19A6B',
            fillColor: '#C19A6B',
            fillOpacity: 0.1,
            radius: 500 // 500 метров
        }).addTo(map);
        
        // Сохраняем карту для возможного дальнейшего использования
        window.contactMap = map;
    }
    
    // Инициализируем карту после загрузки страницы
    setTimeout(initMap, 100);
    
    // Форма обратной связи
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Маска для телефона
        const phoneInput = document.getElementById('contact-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value[0] === '7' || value[0] === '8') {
                        value = value.substring(1);
                    }
                    
                    let formatted = '+7 (';
                    
                    if (value.length > 0) {
                        formatted += value.substring(0, 3);
                    }
                    if (value.length > 3) {
                        formatted += ') ' + value.substring(3, 6);
                    }
                    if (value.length > 6) {
                        formatted += '-' + value.substring(6, 8);
                    }
                    if (value.length > 8) {
                        formatted += '-' + value.substring(8, 10);
                    }
                    
                    this.value = formatted;
                }
            });
        }
        
        // Валидация формы
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные формы
            const formData = {
                name: document.getElementById('contact-name').value.trim(),
                phone: document.getElementById('contact-phone').value.trim(),
                email: document.getElementById('contact-email').value.trim(),
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value.trim(),
                agreement: document.getElementById('contact-agreement').checked
            };
            
            // Валидация
            let isValid = true;
            let errorMessage = '';
            
            // Проверка имени
            if (!formData.name) {
                isValid = false;
                errorMessage = 'Введите ваше имя';
            }
            
            // Проверка телефона
            const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
            if (!phoneRegex.test(formData.phone)) {
                isValid = false;
                errorMessage = 'Введите корректный номер телефона';
            }
            
            // Проверка email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                isValid = false;
                errorMessage = 'Введите корректный email';
            }
            
            // Проверка темы
            if (!formData.subject) {
                isValid = false;
                errorMessage = 'Выберите тему обращения';
            }
            
            // Проверка сообщения
            if (!formData.message) {
                isValid = false;
                errorMessage = 'Введите сообщение';
            }
            
            // Проверка согласия
            if (!formData.agreement) {
                isValid = false;
                errorMessage = 'Необходимо согласие на обработку данных';
            }
            
            if (!isValid) {
                showNotification(errorMessage, 'error');
                return;
            }
            
            // Имитация отправки формы
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Успешная отправка
                showNotification('Сообщение успешно отправлено! Мы ответим вам в течение 24 часов.', 'success');
                
                // Очистка формы
                contactForm.reset();
                
                // Восстановление кнопки
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Плавная прокрутка к верху формы
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1500);
        });
    }
    
    // Раскрытие FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');
        const answer = item.querySelector('.faq-item__answer');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                // Закрываем другие открытые вопросы
                document.querySelectorAll('.faq-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                        activeItem.querySelector('.faq-item__answer').style.maxHeight = null;
                    }
                });
                
                // Переключаем текущий вопрос
                item.classList.toggle('active');
                
                if (item.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = null;
                }
            });
        }
    });
    
    // Копирование контактов по клику
    const contactTexts = document.querySelectorAll('.contact-item__text');
    
    contactTexts.forEach(textElement => {
        textElement.addEventListener('click', function() {
            const textToCopy = this.textContent.trim();
            
            // Используем современный Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // Визуальная обратная связь
                        const originalText = this.textContent;
                        this.textContent = 'Скопировано!';
                        this.style.color = '#27AE60';
                        
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.color = '';
                        }, 2000);
                        
                        showNotification('Контакт скопирован в буфер обмена', 'success');
                    })
                    .catch(err => {
                        console.error('Ошибка копирования: ', err);
                        showNotification('Не удалось скопировать контакт', 'error');
                    });
            } else {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    showNotification('Контакт скопирован в буфер обмена', 'success');
                } catch (err) {
                    console.error('Ошибка копирования: ', err);
                    showNotification('Не удалось скопировать контакт', 'error');
                }
                
                document.body.removeChild(textArea);
            }
        });
        
        // Добавляем курсор pointer для кликабельных элементов
        textElement.style.cursor = 'pointer';
        textElement.title = 'Нажмите, чтобы скопировать';
    });
    
    // Анимация появления элементов при прокрутке
    function animateOnScroll() {
        const elements = document.querySelectorAll('.contact-item, .department-card, .faq-item, .transport-option');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.85) {
                element.classList.add('visible');
            }
        });
    }
    
    // Инициализация анимации
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Вызов при загрузке
    
    // Быстрый набор телефона для мобильных устройств
    const phoneLinks = document.querySelectorAll('.department-contact span, .contact-item__text');
    
    phoneLinks.forEach(link => {
        const text = link.textContent.trim();
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        
        if (phoneRegex.test(text)) {
            // Для мобильных устройств делаем ссылку для звонка
            if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                const phoneNumber = text.replace(/\D/g, '');
                link.style.cursor = 'pointer';
                link.title = 'Нажмите для звонка';
                
                link.addEventListener('click', function(e) {
                    if (confirm(`Позвонить по номеру ${text}?`)) {
                        window.location.href = `tel:${phoneNumber}`;
                    }
                });
            }
        }
    });
    
    // Стили для страницы
    const style = document.createElement('style');
    style.textContent = `
        .page-header {
            padding: 120px 0 60px;
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--background-color) 100%);
            text-align: center;
        }
        
        .page-header__title {
            font-size: 2.5rem;
            color: var(--primary-dark);
            margin-bottom: 1rem;
        }
        
        .page-header__subtitle {
            font-size: 1.2rem;
            color: var(--text-light);
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Основная контактная информация */
        .contact-main {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .contact-main__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 50px;
        }
        
        .contact-info {
            order: 2;
        }
        
        .contact-map {
            order: 1;
            height: 500px;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
        }
        
        .contact-list {
            margin-bottom: 40px;
        }
        
        .contact-item {
            display: flex;
            margin-bottom: 30px;
            padding: 20px;
            background-color: white;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            transition: var(--transition);
            opacity: 0;
            transform: translateY(20px);
        }
        
        .contact-item.visible {
            opacity: 1;
            transform: translateY(0);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .contact-item:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .contact-item__icon {
            width: 60px;
            height: 60px;
            background-color: var(--secondary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;
        }
        
        .contact-item__icon i {
            font-size: 1.5rem;
            color: var(--primary-color);
        }
        
        .contact-item__content {
            flex: 1;
        }
        
        .contact-item__title {
            font-size: 1.2rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .contact-item__text {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 5px;
            color: var(--text-color);
            transition: color 0.2s;
        }
        
        .contact-item__text:hover {
            color: var(--primary-color);
        }
        
        .contact-item__subtext {
            font-size: 0.9rem;
            color: var(--text-light);
            margin-bottom: 10px;
        }
        
        .contact-social {
            background-color: white;
            padding: 30px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }
        
        .contact-social__title {
            font-size: 1.3rem;
            margin-bottom: 20px;
            color: var(--primary-dark);
            text-align: center;
        }
        
        .social-links {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .social-link {
            display: flex;
            align-items: center;
            padding: 15px;
            border-radius: var(--radius);
            text-decoration: none;
            color: white;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .social-link:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-hover);
        }
        
        .social-link i {
            font-size: 1.5rem;
            margin-right: 10px;
        }
        
        .social-link--vk {
            background-color: #4C75A3;
        }
        
        .social-link--telegram {
            background-color: #0088CC;
        }
        
        .social-link--instagram {
            background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
        }
        
        .social-link--whatsapp {
            background-color: #25D366;
        }
        
        /* Отделы и сотрудники */
        .contact-departments {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .departments__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        .department-card {
            background-color: white;
            padding: 30px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            text-align: center;
            transition: var(--transition);
            opacity: 0;
            transform: translateY(20px);
        }
        
        .department-card.visible {
            opacity: 1;
            transform: translateY(0);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .department-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-hover);
        }
        
        .department-card__icon {
            width: 70px;
            height: 70px;
            background-color: var(--secondary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        
        .department-card__icon i {
            font-size: 2rem;
            color: var(--primary-color);
        }
        
        .department-card__title {
            font-size: 1.3rem;
            margin-bottom: 15px;
            color: var(--primary-dark);
        }
        
        .department-card__description {
            color: var(--text-light);
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .department-card__contacts {
            margin-bottom: 20px;
        }
        
        .department-contact {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            color: var(--text-color);
        }
        
        .department-contact i {
            color: var(--primary-color);
            margin-right: 10px;
        }
        
        .department-card__hours {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .department-card__hours i {
            margin-right: 8px;
            color: var(--primary-color);
        }
        
        /* Форма обратной связи */
        .contact-form-section {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .contact-form__header {
            text-align: center;
            margin-bottom: 50px;
        }
        
        .contact-form {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 25px;
            margin-bottom: 25px;
        }
        
        .form-actions {
            text-align: center;
            margin-top: 30px;
        }
        
        .form-actions .btn {
            padding: 15px 40px;
            font-size: 1.1rem;
        }
        
        .form-actions .btn i {
            margin-right: 10px;
        }
        
        /* Часто задаваемые вопросы */
        .contact-faq {
            padding: 80px 0;
            background-color: var(--background-light);
        }
        
        .faq__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .faq-item {
            background-color: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            opacity: 0;
            transform: translateY(10px);
        }
        
        .faq-item.visible {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .faq-item__question {
            padding: 20px 25px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .faq-item__question:hover {
            background-color: var(--secondary-color);
        }
        
        .faq-item__question i {
            font-size: 1.5rem;
            color: var(--primary-color);
            margin-right: 15px;
        }
        
        .faq-item__question h3 {
            font-size: 1.1rem;
            color: var(--primary-dark);
            margin: 0;
        }
        
        .faq-item__answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .faq-item.active .faq-item__answer {
            max-height: 1000px;
        }
        
        .faq-item__answer p,
        .faq-item__answer ul {
            padding: 0 25px 25px;
            color: var(--text-light);
            line-height: 1.7;
        }
        
        .faq-item__answer ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        
        .faq-item__answer li {
            margin-bottom: 8px;
        }
        
        .payment-methods-list {
            display: flex;
            gap: 10px;
            margin: 15px 0;
            flex-wrap: wrap;
        }
        
        .payment-method {
            background-color: var(--secondary-color);
            color: var(--primary-color);
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        /* Как нас найти */
        .how-to-find {
            padding: 80px 0;
            background-color: var(--background-color);
        }
        
        .how-to-find__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 50px;
        }
        
        .transport-options {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }
        
        .transport-option {
            display: flex;
            align-items: flex-start;
            padding: 20px;
            background-color: white;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            transition: var(--transition);
            opacity: 0;
            transform: translateX(-20px);
        }
        
        .transport-option.visible {
            opacity: 1;
            transform: translateX(0);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .transport-option:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .transport-option__icon {
            width: 50px;
            height: 50px;
            background-color: var(--secondary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;
        }
        
        .transport-option__icon i {
            font-size: 1.5rem;
            color: var(--primary-color);
        }
        
        .transport-option__info {
            flex: 1;
        }
        
        .transport-option__title {
            font-size: 1.2rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .transport-option__description {
            color: var(--text-light);
            line-height: 1.6;
        }
        
        .how-to-find__image {
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
        }
        
        .how-to-find__image img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .image-caption {
            padding: 15px;
            background-color: var(--secondary-color);
            text-align: center;
            color: var(--text-color);
            font-style: italic;
        }
        
        /* Стили для карты */
        .map-marker {
            width: 50px;
            height: 50px;
            background-color: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border: 3px solid white;
        }
        
        .map-popup h3 {
            margin: 0 0 10px 0;
            color: var(--primary-dark);
        }
        
        .map-popup p {
            margin: 5px 0;
            color: var(--text-color);
        }
        
        .map-popup i {
            color: var(--primary-color);
            margin-right: 8px;
            width: 16px;
        }
        
        /* Адаптивность */
        @media (min-width: 768px) {
            .page-header__title {
                font-size: 3rem;
            }
            
            .contact-main__grid {
                grid-template-columns: 1fr 1fr;
            }
            
            .contact-info {
                order: 1;
            }
            
            .contact-map {
                order: 2;
            }
            
            .social-links {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .departments__grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .form-row {
                grid-template-columns: 1fr 1fr;
            }
            
            .faq__grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .how-to-find__grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (min-width: 1024px) {
            .departments__grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Показываем уведомления
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Запасной вариант
            alert(message);
        }
    }
});

// Скрипт для страницы "Личный кабинет"
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Пользователь не авторизован - перенаправляем на главную
        showNotification('Для доступа к личному кабинету необходимо войти в систему', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
    let orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    let favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
    let addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    let reviews = JSON.parse(localStorage.getItem('userReviews')) || [];
    let orderToDelete = null;
    
    // ===== ИНИЦИАЛИЗАЦИЯ =====
    initProfile();
    
    // ===== ОСНОВНЫЕ ФУНКЦИИ =====
    
    function initProfile() {
        // Заполняем информацию о пользователе
        populateUserInfo();
        
        // Загружаем данные пользователя
        loadUserData();
        
        // Инициализируем события
        initEvents();
        
        // Обновляем статистику
        updateUserStats();
    }
    
    function populateUserInfo() {
        // Заполняем информацию в профиле
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-email').textContent = currentUser.email;
        document.getElementById('profile-fio').textContent = currentUser.fio || currentUser.name;
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('profile-phone').textContent = currentUser.phone || 'Не указан';
        document.getElementById('profile-regdate').textContent = formatDate(currentUser.registrationDate || new Date().toISOString());
        
        // Заполняем форму редактирования
        document.getElementById('edit-fio').value = currentUser.fio || currentUser.name;
        document.getElementById('edit-phone').value = currentUser.phone || '';
        document.getElementById('edit-email').value = currentUser.email;
    }
    
    function loadUserData() {
        // Загружаем данные из localStorage
        loadOrders();
        loadFavorites();
        loadAddresses();
        loadReviews();
    }
    
    function updateUserStats() {
        // Обновляем статистику в сайдбаре
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('total-spent').textContent = totalSpent.toLocaleString() + ' ₽';
        
        // Обновляем бейджи
        const currentOrdersCount = orders.filter(order => 
            order.status === 'Новый' || order.status === 'Принят' || order.status === 'Готовится' || order.status === 'В доставке'
        ).length;
        
        document.getElementById('current-orders-badge').textContent = currentOrdersCount;
        document.getElementById('favorites-badge').textContent = favorites.length;
    }
    
    // ===== ЗАГРУЗКА ДАННЫХ =====
    
    function loadOrders() {
        // Загружаем заказы текущего пользователя
        const userOrders = orders.filter(order => order.userId === currentUser.id);
        
        // Разделяем на текущие и исторические
        const currentOrders = userOrders.filter(order => 
            order.status !== 'Доставлен' && order.status !== 'Отменен'
        );
        
        const historyOrders = userOrders.filter(order => 
            order.status === 'Доставлен' || order.status === 'Отменен'
        );
        
        // Отображаем текущие заказы
        renderCurrentOrders(currentOrders);
        
        // Отображаем историю заказов
        renderHistoryOrders(historyOrders);
    }
    
    function renderCurrentOrders(ordersList) {
        const container = document.getElementById('current-orders-list');
        
        if (!ordersList || ordersList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-basket"></i>
                    <h3>У вас нет текущих заказов</h3>
                    <p>Сделайте свой первый заказ, и он появится здесь</p>
                    <a href="menu.html" class="btn btn--primary">Перейти в меню</a>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        ordersList.forEach(order => {
            const statusClass = getStatusClass(order.status);
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const dateFormatted = formatDate(order.date);
            
            html += `
                <div class="order-card" data-order-id="${order.id}">
                    <div class="order-card__header">
                        <div class="order-info">
                            <h3 class="order-number">Заказ #${order.id.toString().padStart(4, '0')}</h3>
                            <div class="order-date">${dateFormatted}</div>
                        </div>
                        <div class="order-status">
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                    </div>
                    
                    <div class="order-card__body">
                        <div class="order-items">
                            <div class="order-items__count">${itemsCount} позиций</div>
                            <div class="order-items__list">
                                ${order.items.slice(0, 2).map(item => `
                                    <div class="order-item">${item.name} × ${item.quantity}</div>
                                `).join('')}
                                ${order.items.length > 2 ? `<div class="order-item">и ещё ${order.items.length - 2}...</div>` : ''}
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <div class="order-address">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${order.address}</span>
                            </div>
                            <div class="order-total">
                                <strong>${order.total.toLocaleString()} ₽</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-card__footer">
                        ${order.status === 'Новый' ? `
                            <button class="btn btn--small btn--danger cancel-order-btn" data-order-id="${order.id}">
                                Отменить заказ
                            </button>
                        ` : ''}
                        
                        ${order.status === 'Доставлен' ? `
                            <button class="btn btn--small btn--secondary review-order-btn" data-order-id="${order.id}">
                                Оставить отзыв
                            </button>
                        ` : ''}
                        
                        <button class="btn btn--small btn--secondary view-order-btn" data-order-id="${order.id}">
                            Подробнее
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    function renderHistoryOrders(ordersList) {
        const container = document.getElementById('history-orders-list');
        
        if (!ordersList || ordersList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>История заказов пуста</h3>
                    <p>Здесь будут отображаться ваши завершенные заказы</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        // Сортируем по дате (новые сверху)
        ordersList.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        ordersList.forEach(order => {
            const statusClass = getStatusClass(order.status);
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const dateFormatted = formatDate(order.date);
            
            html += `
                <div class="order-card order-card--history" data-order-id="${order.id}">
                    <div class="order-card__header">
                        <div class="order-info">
                            <h3 class="order-number">Заказ #${order.id.toString().padStart(4, '0')}</h3>
                            <div class="order-date">${dateFormatted}</div>
                        </div>
                        <div class="order-status">
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                    </div>
                    
                    <div class="order-card__body">
                        <div class="order-items">
                            <div class="order-items__count">${itemsCount} позиций</div>
                            <div class="order-items__list">
                                ${order.items.slice(0, 3).map(item => `
                                    <div class="order-item">${item.name} × ${item.quantity}</div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <div class="order-total">
                                <strong>${order.total.toLocaleString()} ₽</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-card__footer">
                        ${order.status === 'Доставлен' && !order.reviewed ? `
                            <button class="btn btn--small btn--secondary review-order-btn" data-order-id="${order.id}">
                                Оставить отзыв
                            </button>
                        ` : ''}
                        
                        ${order.status === 'Доставлен' && order.reviewed ? `
                            <span class="reviewed-badge">
                                <i class="fas fa-check-circle"></i> Отзыв оставлен
                            </span>
                        ` : ''}
                        
                        <button class="btn btn--small btn--secondary repeat-order-btn" data-order-id="${order.id}">
                            Повторить заказ
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    function loadFavorites() {
        const container = document.getElementById('favorites-list');
        
        if (!favorites || favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>Список избранного пуст</h3>
                    <p>Добавляйте любимые блюда, нажимая на сердечко в меню</p>
                    <a href="menu.html" class="btn btn--primary">Перейти в меню</a>
                </div>
            `;
            return;
        }
        
        let html = '<div class="favorites-grid">';
        
        favorites.forEach(item => {
            html += `
                <div class="favorite-item" data-item-id="${item.id}">
                    <div class="favorite-item__image">
                        <img src="${item.image}" alt="${item.name}">
                        <button class="remove-favorite-btn" data-item-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="favorite-item__info">
                        <h3 class="favorite-item__name">${item.name}</h3>
                        <div class="favorite-item__price">${item.price} ₽</div>
                        <div class="favorite-item__actions">
                            <button class="btn btn--small add-to-cart-favorite" data-item-id="${item.id}">
                                В корзину
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    function loadAddresses() {
        const container = document.getElementById('addresses-list');
        
        if (!addresses || addresses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>Адреса не добавлены</h3>
                    <p>Добавьте адреса для быстрого оформления заказов</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="addresses-grid">';
        
        addresses.forEach((address, index) => {
            const isDefault = address.default ? '<span class="default-badge">Основной</span>' : '';
            
            html += `
                <div class="address-card" data-address-index="${index}">
                    <div class="address-card__header">
                        <h3 class="address-name">${address.name}</h3>
                        ${isDefault}
                    </div>
                    <div class="address-card__body">
                        <p class="address-text">${address.city}, ${address.street}, д. ${address.house}${address.apartment ? ', кв. ' + address.apartment : ''}</p>
                        ${address.comment ? `<p class="address-comment"><strong>Комментарий:</strong> ${address.comment}</p>` : ''}
                    </div>
                    <div class="address-card__footer">
                        <button class="btn btn--small btn--secondary edit-address-btn" data-address-index="${index}">
                            Редактировать
                        </button>
                        <button class="btn btn--small btn--danger delete-address-btn" data-address-index="${index}">
                            Удалить
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    function loadReviews() {
        const container = document.getElementById('reviews-list');
        
        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <h3>У вас нет отзывов</h3>
                    <p>Оставьте отзыв о заказе, и он появится здесь</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        reviews.forEach(review => {
            const dateFormatted = formatDate(review.date);
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            html += `
                <div class="review-card">
                    <div class="review-card__header">
                        <div class="review-rating">
                            <span class="stars">${stars}</span>
                            <span class="rating-value">${review.rating}.0</span>
                        </div>
                        <div class="review-date">${dateFormatted}</div>
                    </div>
                    
                    <div class="review-card__body">
                        <h3 class="review-title">${review.title || 'Отзыв о заказе'}</h3>
                        <p class="review-text">${review.text}</p>
                        
                        ${review.orderId ? `
                            <div class="review-order">
                                <i class="fas fa-shopping-basket"></i>
                                Заказ #${review.orderId.toString().padStart(4, '0')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="review-card__footer">
                        <button class="btn btn--small btn--secondary edit-review-btn" data-review-id="${review.id}">
                            Редактировать
                        </button>
                        <button class="btn btn--small btn--danger delete-review-btn" data-review-id="${review.id}">
                            Удалить
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    
    function getStatusClass(status) {
        const statusClasses = {
            'Новый': 'status-badge--new',
            'Принят': 'status-badge--accepted',
            'Готовится': 'status-badge--cooking',
            'В доставке': 'status-badge--delivery',
            'Доставлен': 'status-badge--delivered',
            'Отменен': 'status-badge--cancelled'
        };
        
        return statusClasses[status] || 'status-badge--default';
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function showOrderDetails(orderId) {
        const order = orders.find(o => o.id === orderId && o.userId === currentUser.id);
        
        if (!order) {
            showNotification('Заказ не найден', 'error');
            return;
        }
        
        const itemsList = order.items.map(item => 
            `${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ₽`
        ).join('\n');
        
        const details = `
Заказ #${order.id.toString().padStart(4, '0')}
Статус: ${order.status}
Дата: ${formatDate(order.date)}
Адрес: ${order.address}
Способ оплаты: ${order.paymentMethod}
Комментарий: ${order.comment || 'Нет'}

Состав заказа:
${itemsList}

Итого: ${order.total.toLocaleString()} ₽
        `;
        
        alert(details);
    }
    
    // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
    
    function initEvents() {
        // Переключение вкладок
        const tabLinks = document.querySelectorAll('.profile-nav__link');
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Убираем активный класс у всех вкладок
                tabLinks.forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.profile-tab').forEach(tab => tab.classList.remove('active'));
                
                // Добавляем активный класс текущей вкладке
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // Редактирование профиля
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const editProfileForm = document.getElementById('edit-profile-form');
        const profileInfo = document.querySelector('.profile-info');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                profileInfo.style.display = 'none';
                editProfileForm.style.display = 'block';
                this.style.display = 'none';
            });
        }
        
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function() {
                profileInfo.style.display = 'block';
                editProfileForm.style.display = 'none';
                editProfileBtn.style.display = 'block';
            });
        }
        
        // Сохранение профиля
        const editProfileFormEl = document.getElementById('edit-profile-form');
        if (editProfileFormEl) {
            editProfileFormEl.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const fio = document.getElementById('edit-fio').value;
                const phone = document.getElementById('edit-phone').value;
                const email = document.getElementById('edit-email').value;
                const password = document.getElementById('edit-password').value;
                const passwordConfirm = document.getElementById('edit-password-confirm').value;
                
                // Валидация
                if (password && password !== passwordConfirm) {
                    showNotification('Пароли не совпадают', 'error');
                    return;
                }
                
                // Обновляем данные пользователя
                currentUser.fio = fio;
                currentUser.phone = phone;
                currentUser.email = email;
                currentUser.name = fio;
                
                if (password) {
                    currentUser.password = password;
                }
                
                // Обновляем в localStorage
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Обновляем в списке пользователей
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                
                // Обновляем отображение
                populateUserInfo();
                
                // Скрываем форму
                profileInfo.style.display = 'block';
                editProfileForm.style.display = 'none';
                editProfileBtn.style.display = 'block';
                
                showNotification('Профиль успешно обновлен', 'success');
            });
        }
        
        // Фильтрация заказов
        const orderFilter = document.getElementById('order-filter');
        const historyFilter = document.getElementById('history-filter');
        
        if (orderFilter) {
            orderFilter.addEventListener('change', function() {
                // В реальном приложении здесь была бы фильтрация
                showNotification('Применен фильтр: ' + this.options[this.selectedIndex].text, 'info');
            });
        }
        
        if (historyFilter) {
            historyFilter.addEventListener('change', function() {
                // В реальном приложении здесь была бы фильтрация
                showNotification('Применен фильтр: ' + this.options[this.selectedIndex].text, 'info');
            });
        }
        
        // Очистка избранного
        const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
        if (clearFavoritesBtn) {
            clearFavoritesBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите очистить весь список избранного?')) {
                    favorites = [];
                    localStorage.setItem('userFavorites', JSON.stringify(favorites));
                    loadFavorites();
                    updateUserStats();
                    showNotification('Список избранного очищен', 'success');
                }
            });
        }
        
        // Добавление адреса
        const addAddressBtn = document.getElementById('add-address-btn');
        const cancelAddressBtn = document.getElementById('cancel-address-btn');
        const addAddressForm = document.getElementById('add-address-form');
        const addressesList = document.getElementById('addresses-list');
        
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', function() {
                addressesList.style.display = 'none';
                addAddressForm.style.display = 'block';
                this.style.display = 'none';
            });
        }
        
        if (cancelAddressBtn) {
            cancelAddressBtn.addEventListener('click', function() {
                addressesList.style.display = 'block';
                addAddressForm.style.display = 'none';
                addAddressBtn.style.display = 'block';
            });
        }
        
        // Сохранение адреса
        const addAddressFormEl = document.getElementById('add-address-form');
        if (addAddressFormEl) {
            addAddressFormEl.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const newAddress = {
                    id: Date.now(),
                    name: document.getElementById('address-name').value,
                    city: document.getElementById('address-city').value,
                    street: document.getElementById('address-street').value,
                    house: document.getElementById('address-house').value,
                    apartment: document.getElementById('address-apartment').value,
                    comment: document.getElementById('address-comment').value,
                    default: document.getElementById('address-default').checked
                };
                
                // Если это основной адрес, снимаем флаг с других
                if (newAddress.default) {
                    addresses.forEach(addr => addr.default = false);
                }
                
                addresses.push(newAddress);
                localStorage.setItem('userAddresses', JSON.stringify(addresses));
                
                // Сброс формы
                addAddressFormEl.reset();
                
                // Обновление отображения
                loadAddresses();
                
                // Скрываем форму
                addressesList.style.display = 'block';
                addAddressForm.style.display = 'none';
                addAddressBtn.style.display = 'block';
                
                showNotification('Адрес успешно добавлен', 'success');
            });
        }
        
        // Фильтрация отзывов
        const reviewsFilter = document.getElementById('reviews-filter');
        if (reviewsFilter) {
            reviewsFilter.addEventListener('change', function() {
                showNotification('Применен фильтр: ' + this.options[this.selectedIndex].text, 'info');
            });
        }
        
        // Настройки
        const exportDataBtn = document.getElementById('export-data-btn');
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', function() {
                const userData = {
                    profile: currentUser,
                    orders: orders.filter(order => order.userId === currentUser.id),
                    favorites: favorites,
                    addresses: addresses,
                    reviews: reviews
                };
                
                const dataStr = JSON.stringify(userData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `khychinnaya_data_${currentUser.username}_${new Date().toISOString().split('T')[0]}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                showNotification('Данные успешно экспортированы', 'success');
            });
        }
        
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', function() {
                const deleteModal = document.getElementById('delete-account-modal');
                deleteModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        // Делегирование событий для динамически созданных элементов
        
        // Просмотр деталей заказа
        document.addEventListener('click', function(e) {
            if (e.target.closest('.view-order-btn')) {
                const orderId = parseInt(e.target.closest('.view-order-btn').getAttribute('data-order-id'));
                showOrderDetails(orderId);
            }
            
            // Отмена заказа
            if (e.target.closest('.cancel-order-btn')) {
                orderToDelete = parseInt(e.target.closest('.cancel-order-btn').getAttribute('data-order-id'));
                const deleteModal = document.getElementById('delete-order-modal');
                const order = orders.find(o => o.id === orderToDelete);
                
                if (order) {
                    document.getElementById('delete-order-number').textContent = '#' + order.id.toString().padStart(4, '0');
                    deleteModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
            
            // Повтор заказа
            if (e.target.closest('.repeat-order-btn')) {
                const orderId = parseInt(e.target.closest('.repeat-order-btn').getAttribute('data-order-id'));
                const order = orders.find(o => o.id === orderId);
                
                if (order) {
                    // Добавляем товары из заказа в корзину
                    order.items.forEach(item => {
                        if (window.addToCart) {
                            for (let i = 0; i < item.quantity; i++) {
                                window.addToCart(item.id, item.name, item.price);
                            }
                        }
                    });
                    
                    showNotification('Товары из заказа добавлены в корзину', 'success');
                    
                    // Перенаправляем в корзину
                    setTimeout(() => {
                        const cartModal = document.getElementById('cart-modal');
                        if (cartModal) {
                            cartModal.classList.add('active');
                            document.body.style.overflow = 'hidden';
                        }
                    }, 1000);
                }
            }
            
            // Удаление из избранного
            if (e.target.closest('.remove-favorite-btn')) {
                const itemId = e.target.closest('.remove-favorite-btn').getAttribute('data-item-id');
                favorites = favorites.filter(item => item.id !== itemId);
                localStorage.setItem('userFavorites', JSON.stringify(favorites));
                loadFavorites();
                updateUserStats();
                showNotification('Удалено из избранного', 'info');
            }
            
            // Добавление в корзину из избранного
            if (e.target.closest('.add-to-cart-favorite')) {
                const itemId = e.target.closest('.add-to-cart-favorite').getAttribute('data-item-id');
                const item = favorites.find(f => f.id === itemId);
                
                if (item && window.addToCart) {
                    window.addToCart(item.id, item.name, item.price);
                    showNotification('Добавлено в корзину', 'success');
                }
            }
            
            // Удаление адреса
            if (e.target.closest('.delete-address-btn')) {
                const index = parseInt(e.target.closest('.delete-address-btn').getAttribute('data-address-index'));
                
                if (confirm('Вы уверены, что хотите удалить этот адрес?')) {
                    addresses.splice(index, 1);
                    localStorage.setItem('userAddresses', JSON.stringify(addresses));
                    loadAddresses();
                    showNotification('Адрес удален', 'success');
                }
            }
            
            // Редактирование адреса
            if (e.target.closest('.edit-address-btn')) {
                const index = parseInt(e.target.closest('.edit-address-btn').getAttribute('data-address-index'));
                const address = addresses[index];
                
                // Заполняем форму редактирования
                document.getElementById('address-name').value = address.name;
                document.getElementById('address-city').value = address.city;
                document.getElementById('address-street').value = address.street;
                document.getElementById('address-house').value = address.house;
                document.getElementById('address-apartment').value = address.apartment || '';
                document.getElementById('address-comment').value = address.comment || '';
                document.getElementById('address-default').checked = address.default || false;
                
                // Показываем форму
                addressesList.style.display = 'none';
                addAddressForm.style.display = 'block';
                addAddressBtn.style.display = 'none';
                
                // Удаляем старый адрес при сохранении
                const form = document.getElementById('add-address-form');
                const originalSubmit = form.onsubmit;
                
                form.onsubmit = function(e) {
                    e.preventDefault();
                    
                    addresses.splice(index, 1); // Удаляем старый адрес
                    
                    // Добавляем новый
                    const newAddress = {
                        id: Date.now(),
                        name: document.getElementById('address-name').value,
                        city: document.getElementById('address-city').value,
                        street: document.getElementById('address-street').value,
                        house: document.getElementById('address-house').value,
                        apartment: document.getElementById('address-apartment').value,
                        comment: document.getElementById('address-comment').value,
                        default: document.getElementById('address-default').checked
                    };
                    
                    if (newAddress.default) {
                        addresses.forEach(addr => addr.default = false);
                    }
                    
                    addresses.push(newAddress);
                    localStorage.setItem('userAddresses', JSON.stringify(addresses));
                    
                    // Сброс
                    form.reset();
                    form.onsubmit = originalSubmit;
                    loadAddresses();
                    
                    addressesList.style.display = 'block';
                    addAddressForm.style.display = 'none';
                    addAddressBtn.style.display = 'block';
                    
                    showNotification('Адрес успешно обновлен', 'success');
                };
            }
        });
        
        // Модальные окна
        const deleteOrderModal = document.getElementById('delete-order-modal');
        const deleteAccountModal = document.getElementById('delete-account-modal');
        
        // Закрытие модалок
        document.querySelectorAll('.modal__close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Закрытие по клику на оверлей
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Подтверждение удаления заказа
        const confirmDeleteOrderBtn = document.getElementById('confirm-delete-order');
        const cancelDeleteOrderBtn = document.getElementById('cancel-delete-order');
        
        if (confirmDeleteOrderBtn) {
            confirmDeleteOrderBtn.addEventListener('click', function() {
                if (orderToDelete) {
                    const orderIndex = orders.findIndex(o => o.id === orderToDelete);
                    if (orderIndex !== -1) {
                        // Меняем статус заказа на "Отменен"
                        orders[orderIndex].status = 'Отменен';
                        localStorage.setItem('userOrders', JSON.stringify(orders));
                        
                        // Обновляем отображение
                        loadOrders();
                        updateUserStats();
                        
                        showNotification('Заказ успешно отменен', 'success');
                    }
                }
                
                deleteOrderModal.classList.remove('active');
                document.body.style.overflow = '';
                orderToDelete = null;
            });
        }
        
        if (cancelDeleteOrderBtn) {
            cancelDeleteOrderBtn.addEventListener('click', function() {
                deleteOrderModal.classList.remove('active');
                document.body.style.overflow = '';
                orderToDelete = null;
            });
        }
        
        // Подтверждение удаления аккаунта
        const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account');
        const cancelDeleteAccountBtn = document.getElementById('cancel-delete-account');
        
        if (confirmDeleteAccountBtn) {
            confirmDeleteAccountBtn.addEventListener('click', function() {
                const password = document.getElementById('delete-confirm-password').value;
                
                if (password !== currentUser.password) {
                    showNotification('Неверный пароль', 'error');
                    return;
                }
                
                // Удаляем аккаунт
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const updatedUsers = users.filter(u => u.id !== currentUser.id);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                
                // Удаляем данные пользователя
                localStorage.removeItem('currentUser');
                
                // Очищаем связанные данные
                localStorage.removeItem('userFavorites');
                localStorage.removeItem('userAddresses');
                localStorage.removeItem('userReviews');
                
                // Удаляем заказы пользователя
                const updatedOrders = orders.filter(o => o.userId !== currentUser.id);
                localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
                
                showNotification('Аккаунт успешно удален', 'success');
                
                // Перенаправляем на главную
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            });
        }
        
        if (cancelDeleteAccountBtn) {
            cancelDeleteAccountBtn.addEventListener('click', function() {
                deleteAccountModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Сохранение настроек
        const settingCheckboxes = document.querySelectorAll('.settings-option input[type="checkbox"]');
        settingCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // В реальном приложении здесь было бы сохранение настроек
                showNotification('Настройка сохранена', 'info');
            });
        });
    }
    
    // Стили для страницы
    const style = document.createElement('style');
    style.textContent = `
        .page-header {
            padding: 120px 0 60px;
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--background-color) 100%);
            text-align: center;
        }
        
        .page-header__title {
            font-size: 2.5rem;
            color: var(--primary-dark);
            margin-bottom: 1rem;
        }
        
        .page-header__subtitle {
            font-size: 1.2rem;
            color: var(--text-light);
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Основной контент личного кабинета */
        .profile-content {
            padding: 40px 0 80px;
            background-color: var(--background-color);
        }
        
        .profile__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
        }
        
        /* Боковая панель */
        .profile-sidebar {
            background-color: white;
            border-radius: var(--radius);
            padding: 30px;
            box-shadow: var(--shadow);
        }
        
        .user-info {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 30px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .user-avatar {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
        }
        
        .user-avatar i {
            font-size: 100px;
            color: var(--primary-color);
        }
        
        .user-details {
            text-align: center;
        }
        
        .user-name {
            font-size: 1.4rem;
            margin-bottom: 5px;
            color: var(--primary-dark);
        }
        
        .user-email {
            color: var(--text-light);
            margin-bottom: 20px;
        }
        
        .user-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            display: block;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .profile-nav__list {
            list-style: none;
            padding: 0;
            margin-bottom: 30px;
        }
        
        .profile-nav__item {
            margin-bottom: 5px;
        }
        
        .profile-nav__link {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            text-decoration: none;
            color: var(--text-color);
            border-radius: var(--radius);
            transition: var(--transition);
            position: relative;
        }
        
        .profile-nav__link i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
            color: var(--primary-color);
        }
        
        .profile-nav__link:hover {
            background-color: var(--secondary-color);
            color: var(--primary-color);
        }
        
        .profile-nav__link.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        .profile-nav__link.active i {
            color: white;
        }
        
        .badge {
            position: absolute;
            right: 15px;
            background-color: var(--primary-color);
            color: white;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
        }
        
        .profile-nav__link.active .badge {
            background-color: white;
            color: var(--primary-color);
        }
        
        .sidebar-help {
            background-color: var(--secondary-color);
            padding: 20px;
            border-radius: var(--radius);
            text-align: center;
        }
        
        .sidebar-help h4 {
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .sidebar-help p {
            color: var(--text-light);
            margin-bottom: 15px;
            font-size: 0.9rem;
        }
        
        /* Основная область */
        .profile-main {
            background-color: white;
            border-radius: var(--radius);
            padding: 30px;
            box-shadow: var(--shadow);
        }
        
        .profile-tab {
            display: none;
        }
        
        .profile-tab.active {
            display: block;
        }
        
        .tab-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .tab-title {
            font-size: 1.8rem;
            color: var(--primary-dark);
            margin: 0;
        }
        
        /* Профиль */
        .profile-info {
            max-width: 600px;
        }
        
        .info-row {
            display: flex;
            padding: 15px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            width: 200px;
            font-weight: 600;
            color: var(--text-color);
        }
        
        .info-value {
            flex: 1;
            color: var(--text-color);
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status-badge--active {
            background-color: #D4EDDA;
            color: #155724;
        }
        
        .status-badge--new {
            background-color: #D1ECF1;
            color: #0C5460;
        }
        
        .status-badge--accepted {
            background-color: #FFF3CD;
            color: #856404;
        }
        
        .status-badge--cooking {
            background-color: #F8D7DA;
            color: #721C24;
        }
        
        .status-badge--delivery {
            background-color: #CCE5FF;
            color: #004085;
        }
        
        .status-badge--delivered {
            background-color: #D4EDDA;
            color: #155724;
        }
        
        .status-badge--cancelled {
            background-color: #F8D7DA;
            color: #721C24;
        }
        
        .profile-edit-form {
            max-width: 600px;
            margin-top: 30px;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        
        /* Заказы */
        .filter-orders {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .form-input--small {
            padding: 8px 12px;
            font-size: 0.9rem;
        }
        
        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-light);
        }
        
        .empty-state i {
            font-size: 4rem;
            color: var(--secondary-color);
            margin-bottom: 20px;
        }
        
        .empty-state h3 {
            font-size: 1.5rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .empty-state p {
            margin-bottom: 20px;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .order-card {
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            overflow: hidden;
            transition: var(--transition);
        }
        
        .order-card:hover {
            box-shadow: var(--shadow);
        }
        
        .order-card__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background-color: var(--background-light);
            border-bottom: 1px solid var(--border-color);
        }
        
        .order-info {
            flex: 1;
        }
        
        .order-number {
            font-size: 1.2rem;
            margin-bottom: 5px;
            color: var(--primary-dark);
        }
        
        .order-date {
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .order-card__body {
            padding: 20px;
        }
        
        .order-items {
            margin-bottom: 20px;
        }
        
        .order-items__count {
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--text-color);
        }
        
        .order-items__list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .order-item {
            background-color: var(--secondary-color);
            padding: 5px 10px;
            border-radius: var(--radius-small);
            font-size: 0.9rem;
            color: var(--text-color);
        }
        
        .order-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .order-address {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .order-address i {
            color: var(--primary-color);
        }
        
        .order-total {
            font-size: 1.3rem;
            color: var(--primary-color);
        }
        
        .order-card__footer {
            padding: 15px 20px;
            background-color: var(--background-light);
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .reviewed-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 8px 15px;
            background-color: #D4EDDA;
            color: #155724;
            border-radius: var(--radius);
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        /* Избранное */
        .favorites-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .favorite-item {
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            overflow: hidden;
            transition: var(--transition);
        }
        
        .favorite-item:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow);
        }
        
        .favorite-item__image {
            height: 150px;
            position: relative;
            overflow: hidden;
        }
        
        .favorite-item__image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .remove-favorite-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background-color: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            color: var(--error-color);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }
        
        .remove-favorite-btn:hover {
            background-color: var(--error-color);
            color: white;
        }
        
        .favorite-item__info {
            padding: 15px;
        }
        
        .favorite-item__name {
            font-size: 1.1rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .favorite-item__price {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 15px;
        }
        
        /* Адреса */
        .addresses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .address-card {
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 20px;
            transition: var(--transition);
        }
        
        .address-card:hover {
            box-shadow: var(--shadow);
        }
        
        .address-card__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .address-name {
            font-size: 1.2rem;
            margin: 0;
            color: var(--primary-dark);
        }
        
        .default-badge {
            background-color: var(--primary-color);
            color: white;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .address-card__body {
            margin-bottom: 20px;
        }
        
        .address-text {
            color: var(--text-color);
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .address-comment {
            color: var(--text-light);
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .address-card__footer {
            display: flex;
            gap: 10px;
        }
        
        .address-form {
            max-width: 600px;
            margin-top: 30px;
        }
        
        /* Отзывы */
        .reviews-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .review-card {
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 20px;
            transition: var(--transition);
        }
        
        .review-card:hover {
            box-shadow: var(--shadow);
        }
        
        .review-card__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .review-rating {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stars {
            color: #FFD700;
            font-size: 1.2rem;
        }
        
        .rating-value {
            font-weight: 700;
            color: var(--primary-dark);
        }
        
        .review-date {
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .review-card__body {
            margin-bottom: 20px;
        }
        
        .review-title {
            font-size: 1.1rem;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }
        
        .review-text {
            color: var(--text-color);
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .review-order {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 5px 10px;
            background-color: var(--secondary-color);
            border-radius: var(--radius-small);
            color: var(--text-color);
            font-size: 0.9rem;
        }
        
        .review-order i {
            color: var(--primary-color);
        }
        
        .review-card__footer {
            display: flex;
            gap: 10px;
        }
        
        /* Настройки */
        .settings-sections {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }
        
        .settings-section__title {
            font-size: 1.3rem;
            margin-bottom: 20px;
            color: var(--primary-dark);
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .settings-options {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .settings-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background-color: var(--background-light);
            border-radius: var(--radius);
        }
        
        .settings-option__info h4 {
            margin-bottom: 5px;
            color: var(--text-color);
        }
        
        .settings-option__info p {
            color: var(--text-light);
            font-size: 0.9rem;
            margin: 0;
        }
        
        /* Переключатель (toggle switch) */
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 30px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: var(--primary-color);
        }
        
        input:checked + .slider:before {
            transform: translateX(30px);
        }
        
        /* Опасная зона */
        .danger-zone {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .danger-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background-color: #FFF5F5;
            border: 1px solid #FED7D7;
            border-radius: var(--radius);
        }
        
        .danger-option__info h4 {
            margin-bottom: 5px;
            color: #C53030;
        }
        
        .danger-option__info p {
            color: #9B2C2C;
            font-size: 0.9rem;
            margin: 0;
        }
        
        .btn--danger {
            background-color: #E53E3E;
            color: white;
        }
        
        .btn--danger:hover {
            background-color: #C53030;
        }
        
        /* Модальные окна */
        .modal__text {
            margin-bottom: 20px;
            color: var(--text-color);
            line-height: 1.6;
        }
        
        .modal__warning {
            color: #E53E3E;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .modal__list {
            margin-left: 20px;
            margin-bottom: 20px;
            color: var(--text-color);
        }
        
        .modal__list li {
            margin-bottom: 8px;
        }
        
        .modal__actions {
            display: flex;
            gap: 15px;
            margin-top: 25px;
        }
        
        /* Адаптивность */
        @media (min-width: 768px) {
            .page-header__title {
                font-size: 3rem;
            }
            
            .profile__grid {
                grid-template-columns: 300px 1fr;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
        }
        
        @media (min-width: 1024px) {
            .favorites-grid {
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            }
        }
    `;
    document.head.appendChild(style);
    
    // Показываем уведомления
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Запасной вариант
            alert(message);
        }
    }
});
