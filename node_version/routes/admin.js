const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

// Middleware: admin only
router.use((req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
});

// GET /admin
router.get('/', (req, res) => {
    const db = getDB();
    
    const allApplications = db.prepare(`
        SELECT a.*, u.login as user_login, u.fullname as user_name, c.title as course_title
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN courses c ON a.course_id = c.id
        ORDER BY a.created_at DESC
    `).all();
    
    const courses = db.prepare('SELECT * FROM courses ORDER BY title').all();
    
    res.render('admin', { 
        user: req.session.user, 
        allApplications, 
        courses 
    });
});

// POST /admin/update-status (AJAX)
router.post('/update-status', (req, res) => {
    const { id, status } = req.body;
    
    if (!id || !status || !['Новая', 'Идет обучение', 'Обучение завершено'].includes(status)) {
        return res.json({ success: false, message: 'Неверные данные' });
    }
    
    const db = getDB();
    const result = db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, id);
    
    if (result.changes > 0) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Заявка не найдена' });
    }
});

module.exports = router;