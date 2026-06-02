// ===== Database (localStorage) =====
const DB = {
    _get(key, def) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); },
    _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
    
    getUsers() { return this._get('uchus_users', []); },
    saveUsers(users) { this._set('uchus_users', users); },
    
    getCourses() { return this._get('uchus_courses', []); },
    saveCourses(courses) { this._set('uchus_courses', courses); },
    
    getApplications() { return this._get('uchus_apps', []); },
    saveApplications(apps) { this._set('uchus_apps', apps); },
    
    getReviews() { return this._get('uchus_reviews', []); },
    saveReviews(reviews) { this._set('uchus_reviews', reviews); },
    
    getCurrentUser() { return this._get('uchus_current', null); },
    setCurrentUser(user) { this._set('uchus_current', user); },
    logout() { localStorage.removeItem('uchus_current'); },
    
    init() {
        if (this.getCourses().length === 0) {
            this.saveCourses([
                { id: 1, title: 'Повышение квалификации: Современные педагогические технологии', type: 'повышение квалификации', price: 15000 },
                { id: 2, title: 'Повышение квалификации: Цифровые компетенции преподавателя', type: 'повышение квалификации', price: 8000 },
                { id: 3, title: 'Профессиональная переподготовка: Управление персоналом', type: 'переподготовка', price: 35000 },
                { id: 4, title: 'Профессиональная переподготовка: Бухгалтерский учёт и аудит', type: 'переподготовка', price: 32000 },
                { id: 5, title: 'Охрана труда: Общие вопросы', type: 'охрана труда', price: 5000 },
                { id: 6, title: 'Охрана труда: Пожарная безопасность', type: 'охрана труда', price: 4000 },
                { id: 7, title: 'Охрана труда: Электробезопасность', type: 'охрана труда', price: 4000 }
            ]);
        }
        // Создаём админа, если нет
        const users = this.getUsers();
        if (!users.find(u => u.login === 'Admin26')) {
            users.push({
                id: Date.now() + 1,
                login: 'Admin26',
                password: 'Demo20',
                fullname: 'Администратор Системы',
                phone: '+7 (999) 999-99-99',
                email: 'admin@uchus.ru',
                role: 'admin'
            });
            this.saveUsers(users);
        }
    }
};

// ===== Slider =====
let currentSlide = 0;
let slideInterval;

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slider-dots');
    if (slides.length === 0) return;
    
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }
    startAutoPlay();
}

function goToSlide(index) {
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.slide')[index]?.classList.add('active');
    currentSlide = index;
    document.querySelectorAll('.slider-dot').forEach((dot, i) => dot.classList.toggle('active', i === index));
}

function changeSlide(dir) {
    const slides = document.querySelectorAll('.slide');
    let newIdx = currentSlide + dir;
    if (newIdx < 0) newIdx = slides.length - 1;
    if (newIdx >= slides.length) newIdx = 0;
    goToSlide(newIdx);
    resetAutoPlay();
}

function startAutoPlay() { stopAutoPlay(); slideInterval = setInterval(() => changeSlide(1), 3000); }
function stopAutoPlay() { if (slideInterval) { clearInterval(slideInterval); slideInterval = null; } }
function resetAutoPlay() { startAutoPlay(); }

// ===== Modals =====
function initModals() {
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(el => {
        el.addEventListener('click', function() { this.closest('.modal').style.display = 'none'; });
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) { if (e.target === this) this.style.display = 'none'; });
    });
}

// ===== Navigation helpers =====
function redirect(path) {
    window.location.href = path;
}

function checkAuth() {
    const user = DB.getCurrentUser();
    if (!user) redirect('login.html');
    return user;
}

function isLoggedIn() {
    return DB.getCurrentUser() !== null;
}

// ===== Init on page load =====
document.addEventListener('DOMContentLoaded', function() {
    DB.init();
    initSlider();
    initModals();
    
    // Set min date for date inputs
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
    }
    
    // Update nav based on auth
    const navLinks = document.querySelector('.nav-links');
    const user = DB.getCurrentUser();
    if (navLinks && user) {
        let html = `<a href="profile.html" class="nav-link">Личный кабинет</a>
                    <a href="apply.html" class="nav-link">Запись на курс</a>`;
        if (user.role === 'admin') {
            html += `<a href="admin.html" class="nav-link">Админ-панель</a>`;
        }
        html += `<a href="login.html" onclick="DB.logout()" class="nav-link btn-logout">Выйти</a>`;
        navLinks.innerHTML = html;
    } else if (navLinks) {
        navLinks.innerHTML = `<a href="login.html" class="nav-link">Войти</a>
                              <a href="register.html" class="nav-link btn-register">Регистрация</a>`;
    }
});