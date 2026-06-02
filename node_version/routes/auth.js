const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { getDB } = require('../db/database');

// GET /login
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/profile');
    res.render('login', { error: null });
});

// POST /login
router.post('/login', (req, res) => {
    const { login, password } = req.body;
    
    if (!login || !password) {
        return res.render('login', { error: 'Заполните все поля' });
    }
    
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE login = ?').get(login);
    
    if (!user) {
        return res.render('login', { error: 'Пользователь с таким логином не найден' });
    }
    
    if (!bcrypt.compareSync(password, user.password)) {
        return res.render('login', { error: 'Неверный пароль' });
    }
    
    req.session.user = {
        id: user.id,
        login: user.login,
        fullname: user.fullname,
        phone: user.phone,
        email: user.email,
        role: user.role
    };
    
    res.redirect(user.role === 'admin' ? '/admin' : '/profile');
});

// GET /register
router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/profile');
    res.render('register', { error: null, formData: null });
});

// POST /register
router.post('/register', (req, res) => {
    const { login, password, fullname, phone, email } = req.body;
    
    // Validation
    const errors = [];
    if (!login || !password || !fullname || !phone || !email) {
        errors.push('Заполните все поля');
    }
    if (login && login.length < 6) {
        errors.push('Логин должен содержать минимум 6 символов');
    }
    if (login && !/^[A-Za-z0-9]+$/.test(login)) {
        errors.push('Логин должен содержать только латинские буквы и цифры');
    }
    if (password && password.length < 8) {
        errors.push('Пароль должен быть минимум 8 символов');
    }
    
    if (errors.length > 0) {
        return res.render('register', { 
            error: errors.join('. '), 
            formData: { login, fullname, phone, email } 
        });
    }
    
    const db = getDB();
    
    // Check unique login
    const existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login);
    if (existing) {
        return res.render('register', { 
            error: 'Пользователь с таким логином уже существует', 
            formData: { login, fullname, phone, email } 
        });
    }
    
    // Create user
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (login, password, fullname, phone, email) VALUES (?, ?, ?, ?, ?)').run(
        login, hashedPassword, fullname, phone, email
    );
    
    // Auto-login after registration
    const newUser = db.prepare('SELECT * FROM users WHERE login = ?').get(login);
    req.session.user = {
        id: newUser.id,
        login: newUser.login,
        fullname: newUser.fullname,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role
    };
    
    res.redirect('/profile');
});

// GET /logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;