const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

// Middleware: auth required
router.use((req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
});

// GET /apply
router.get('/', (req, res) => {
    const db = getDB();
    const courses = db.prepare('SELECT * FROM courses ORDER BY type, title').all();
    res.render('apply', { user: req.session.user, courses, error: null, success: null });
});

// POST /apply
router.post('/', (req, res) => {
    const { course_id, start_date, payment_method } = req.body;
    const userId = req.session.user.id;
    
    if (!course_id || !start_date || !payment_method) {
        const db = getDB();
        const courses = db.prepare('SELECT * FROM courses ORDER BY type, title').all();
        return res.render('apply', { user: req.session.user, courses, error: 'Заполните все поля', success: null });
    }
    
    const db = getDB();
    
    // Verify course exists
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
    if (!course) {
        const courses = db.prepare('SELECT * FROM courses ORDER BY type, title').all();
        return res.render('apply', { user: req.session.user, courses, error: 'Выбранный курс не найден', success: null });
    }
    
    db.prepare('INSERT INTO applications (user_id, course_id, start_date, payment_method) VALUES (?, ?, ?, ?)').run(
        userId, course_id, start_date, payment_method
    );
    
    const courses = db.prepare('SELECT * FROM courses ORDER BY type, title').all();
    res.render('apply', { user: req.session.user, courses, error: null, success: 'Заявка успешно отправлена! Ожидайте подтверждения администратора.' });
});

module.exports = router;