const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = "db.sqlite";

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Create users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT
            )`, (err) => {
                if (err) {
                    console.error("Error creating users table", err.message);
                }
            });

            // Create student_progress table
            db.run(`CREATE TABLE IF NOT EXISTS student_progress (
                user_id INTEGER UNIQUE,
                totalStars INTEGER,
                totalXP INTEGER,
                streak INTEGER,
                currentStreak INTEGER,
                badges TEXT,
                progressData TEXT,
                currentYear INTEGER,
                currentDifficulty TEXT,
                questionNumber INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`, (err) => {
                if (err) {
                    console.error("Error creating student_progress table", err.message);
                }
            });

            // Create configuration table
            db.run(`CREATE TABLE IF NOT EXISTS configuration (
                key TEXT PRIMARY KEY,
                value TEXT
            )`, (err) => {
                if (err) {
                    console.error("Error creating configuration table", err.message);
                } else {
                    // Insert a default empty API key if it doesn't exist
                    db.run(`INSERT OR IGNORE INTO configuration (key, value) VALUES (?, ?)`, ['geminiApiKey', ''], (err) => {
                        if (err) {
                            console.error("Error setting default API key", err.message);
                        }
                    });
                }
            });
        });
    }
});

module.exports = db;
