const mysql = require('mysql');
const config = require('./config/config.json');

const db = mysql.createConnection({
    host: config.development.host,
    user: config.development.username,
    password: config.development.password
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');

    // 데이터베이스 생성
    db.query('CREATE DATABASE IF NOT EXISTS profilerDB', (err) => {
        if (err) throw err;
        console.log('Database created or already exists.');

        // 데이터베이스 선택
        db.query('USE profilerDB', (err) => {
            if (err) throw err;
        });
    });
});

module.exports = db;