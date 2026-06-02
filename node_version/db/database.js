const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'uchus_rf.db');

let db;

function getDB() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initTables();
        seedData();
    }
    return db;
}

function initTables() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            duration TEXT,
            price REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            start_date DATE NOT NULL,
            payment_method TEXT NOT NULL,
            status TEXT DEFAULT 'Новая',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            application_id INTEGER NOT NULL UNIQUE,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
        );
    `);
}

function seedData() {
    // Check if admin exists
    const adminExists = db.prepare('SELECT id FROM users WHERE login = ?').get('Admin26');
    if (!adminExists) {
        const hashedPassword = bcrypt.hashSync('Demo20', 10);
        db.prepare('INSERT INTO users (login, password, fullname, phone, email, role) VALUES (?, ?, ?, ?, ?, ?)').run(
            'Admin26', hashedPassword, 'Администратор Системы', '+7 (999) 999-99-99', 'admin@uchus.ru', 'admin'
        );
    }

    // Check if courses exist
    const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
    if (courseCount === 0) {
        const courses = [
            ['Повышение квалификации: Современные педагогические технологии', 'повышение квалификации', 'Изучение современных методов и технологий в педагогике', '72 часа', 15000],
            ['Повышение квалификации: Цифровые компетенции преподавателя', 'повышение квалификации', 'Освоение цифровых инструментов для организации учебного процесса', '36 часов', 8000],
            ['Профессиональная переподготовка: Управление персоналом', 'переподготовка', 'Полный курс профессиональной переподготовки по управлению персоналом', '256 часов', 35000],
            ['Профессиональная переподготовка: Бухгалтерский учёт и аудит', 'переподготовка', 'Курс профессиональной переподготовки для бухгалтеров', '256 часов', 32000],
            ['Охрана труда: Общие вопросы', 'охрана труда', 'Базовый курс по охране труда для руководителей и специалистов', '40 часов', 5000],
            ['Охрана труда: Пожарная безопасность', 'охрана труда', 'Специализированный курс по пожарной безопасности на предприятии', '24 часа', 4000],
            ['Охрана труда: Электробезопасность', 'охрана труда', 'Курс по электробезопасности для работников с группой допуска', '24 часа', 4000],
        ];
        
        const insert = db.prepare('INSERT INTO courses (title, type, description, duration, price) VALUES (?, ?, ?, ?, ?)');
        courses.forEach(c => insert.run(...c));
    }
}

module.exports = { getDB };