const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: 'uchus-rf-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make user available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const applyRoutes = require('./routes/apply');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/profile', profileRoutes);
app.use('/apply', applyRoutes);
app.use('/admin', adminRoutes);

// Home page redirect
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect(req.session.user.role === 'admin' ? '/admin' : '/profile');
    } else {
        res.redirect('/login');
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 — Учусь.РФ</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div class="app-container" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:844px;text-align:center;padding:20px;">
                <h1 style="font-size:4rem;color:var(--primary);margin-bottom:10px;">404</h1>
                <p style="color:var(--gray-500);margin-bottom:20px;">Страница не найдена</p>
                <a href="/" class="btn btn-primary">На главную</a>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Админ-панель: логин Admin26, пароль Demo20`);
});