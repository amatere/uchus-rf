const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

// Middleware: auth required
router.use((req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
});

// GET /profile
router.get('/', (req, res) => {
    const db = getDB();
    const userId = req.session.user.id;
    
    const applications = db.prepare(`
        SELECT a.*, c.title as course_title, c.type as course_type
        FROM applications a
        JOIN courses c ON a.course_id = c.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
    `).all(userId);
    
    const reviews = db.prepare(`
        SELECT r.*, c.title as course_title
        FROM reviews r
        JOIN applications a ON r.application_id = a.id
        JOIN courses c ON a.course_id = c.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `).all(userId);
    
    res.render('profile', { user: req.session.user, applications, reviews });
});

// POST /review
router.post('/review', (req, res) => {
    const { application_id, rating, comment } = req.body;
    const userId = req.session.user.id;
    
    if (!application_id || !rating) {
        return res.redirect('/profile');
    }
    
    const db = getDB();
    
    // Check application exists and belongs to user
    const app = db.prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?').get(application_id, userId);
    if (!app) {
        return res.redirect('/profile');
    }
    
    // Check review doesn't exist yet
    const existingReview = db.prepare('SELECT id FROM reviews WHERE application_id = ?').get(application_id);
    if (existingReview) {
        return res.redirect('/profile');
    }
    
    db.prepare('INSERT INTO reviews (user_id, application_id, rating, comment) VALUES (?, ?, ?, ?)').run(
        userId, application_id, parseInt(rating), comment || ''
    );
    
    res.redirect('/profile');
});

module.exports = router;