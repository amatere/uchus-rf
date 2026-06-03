// ===== Slider =====
let currentSlide = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.querySelector('.slider-dots');

function initSlider() {
    if (slides.length === 0) return;
    
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('data-index', i);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }
    
    startAutoPlay();
}

function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
    currentSlide = index;
    
    document.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function changeSlide(direction) {
    let newIndex = currentSlide + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;
    goToSlide(newIndex);
    resetAutoPlay();
}

function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 3000);
}

function stopAutoPlay() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

function resetAutoPlay() {
    startAutoPlay();
}

// ===== Modal =====
function initModals() {
    document.querySelectorAll('.open-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const appId = this.getAttribute('data-appid');
            document.getElementById('reviewAppId').value = appId;
            document.getElementById('reviewModal').style.display = 'flex';
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

// ===== Client-side Validation =====
function initValidation() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const loginInput = registerForm.querySelector('#login');
        const passwordInput = registerForm.querySelector('#password');
        const fullnameInput = registerForm.querySelector('#fullname');
        const phoneInput = registerForm.querySelector('#phone');
        const emailInput = registerForm.querySelector('#email');
        
        if (loginInput) {
            loginInput.addEventListener('input', function() {
                const error = document.getElementById('loginError');
                const val = this.value;
                if (val.length < 6) {
                    error.textContent = 'Логин должен содержать минимум 6 символов';
                    this.classList.add('error');
                } else if (!/^[A-Za-z0-9]+$/.test(val)) {
                    error.textContent = 'Логин должен содержать только латинские буквы и цифры';
                    this.classList.add('error');
                } else {
                    error.textContent = '';
                    this.classList.remove('error');
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const error = document.getElementById('passwordError');
                if (this.value.length < 8) {
                    error.textContent = 'Пароль должен быть минимум 8 символов';
                    this.classList.add('error');
                } else {
                    error.textContent = '';
                    this.classList.remove('error');
                }
            });
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                const error = document.getElementById('phoneError');
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(this.value) || this.value.replace(/\D/g, '').length < 10) {
                    error.textContent = 'Введите корректный номер телефона';
                    this.classList.add('error');
                } else {
                    error.textContent = '';
                    this.classList.remove('error');
                }
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                const error = document.getElementById('emailError');
                if (!this.value.includes('@') || !this.value.includes('.')) {
                    error.textContent = 'Введите корректный email';
                    this.classList.add('error');
                } else {
                    error.textContent = '';
                    this.classList.remove('error');
                }
            });
        }
        
        if (fullnameInput) {
            fullnameInput.addEventListener('input', function() {
                const error = document.getElementById('fullnameError');
                if (this.value.trim().length < 5) {
                    error.textContent = 'Введите полное ФИО';
                    this.classList.add('error');
                } else {
                    error.textContent = '';
                    this.classList.remove('error');
                }
            });
        }
    }
}

// ===== Animation on scroll =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.application-card, .review-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ===== Init on DOM ready =====
document.addEventListener('DOMContentLoaded', function() {
    initSlider();
    initModals();
    initValidation();
    initScrollAnimations();
    
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});