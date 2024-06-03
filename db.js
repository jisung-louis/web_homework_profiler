const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // 사용자 이름
    password: '1234', // 비밀번호
    database: 'profilerDB' // 데이터베이스 이름
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database!');
});

module.exports = db;