const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const session = require('express-session');
const db = require('./db'); // db.js 파일을 가져옵니다

const app = express();
const port = 3000;

// 세션 설정
app.use(session({ secret: 'profiler secret', resave: false, saveUninitialized: true }));

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공 설정 (CSS, JS 등)
app.use(express.static(path.join(__dirname, 'public')));

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 테이블 생성 함수
function createTable(taskCount) {
    let columns = 'id INT AUTO_INCREMENT PRIMARY KEY, section INT, core VARCHAR(10)';
    for (let i = 1; i <= taskCount; i++) {
        columns += `, task${i} INT`;
    }
    const createTableQuery = `CREATE TABLE IF NOT EXISTS profiler_data (${columns})`;

    db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log('Profiler data table created or already exists.');
    });
}

// 라우트 설정
app.get('/', (req, res) => {
    res.render('index', { fileName: req.session.fileName || '' }); // index.ejs 파일을 렌더링
});

// 파일 업로드 라우트
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No files were uploaded.');
    }

    req.session.fileName = file.originalname; // 파일 이름 세션에 저장

    // 파일 처리 로직 추가 (데이터 분석 등)
    processFile(file.path)
        .then(() => {
            res.redirect('/'); // 업로드 후 홈 페이지로 리다이렉트
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error processing file');
        });
});

// 데이터 처리 및 분석 라우트
app.get('/data', (req, res) => {
    const query = 'SELECT * FROM profiler_data';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length === 0) {
            return res.json([]);
        }

        // 데이터 가공
        const data = processData(results);
        res.json(data);
    });
});

// 데이터 삭제 라우트
app.post('/delete', (req, res) => {
    const deleteQuery = 'DELETE FROM profiler_data';
    db.query(deleteQuery, (err) => {
        if (err) {
            return res.status(500).send('Error deleting data');
        }
        req.session.fileName = null; // 파일 이름 세션 초기화
        res.redirect('/');
    });
});

function processData(data) {
    const taskData = data.reduce((acc, row) => {
        const tasks = Object.keys(row).filter(key => key.startsWith('task')).map(key => row[key]);
        acc.push(tasks);
        return acc;
    }, []);

    const coreData = data.reduce((acc, row) => {
        const coreIndex = acc.findIndex(c => c.core === row.core);
        const tasks = Object.keys(row).filter(key => key.startsWith('task')).map(key => row[key]);
        if (coreIndex !== -1) {
            acc[coreIndex].tasks.push(tasks);
        } else {
            acc.push({ core: row.core, tasks: [tasks] });
        }
        return acc;
    }, []);

    const processStats = (array) => {
        const sums = array[0].map((_, i) => array.reduce((sum, row) => sum + row[i], 0));
        const mins = array[0].map((_, i) => Math.min(...array.map(row => row[i])));
        const maxs = array[0].map((_, i) => Math.max(...array.map(row => row[i])));
        const avgs = sums.map(sum => sum / array.length);

        // 표준편차 계산
        const stdDevs = sums.map((sum, i) => {
            const mean = sum / array.length;
            const variance = array.reduce((varSum, row) => varSum + Math.pow(row[i] - mean, 2), 0) / array.length;
            return Math.sqrt(variance);
        });

        return { mins, maxs, avgs, stdDevs };
    };

    const taskStats = processStats(taskData);

    const coreStats = coreData.map(core => ({
        core: core.core,
        ...processStats(core.tasks)
    }));

    return {
        tasks: taskStats,
        cores: coreStats
    };
}

// 파일 처리 및 데이터베이스 저장 함수
async function processFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let section = [];
    let sectionCount = 0;
    let taskCount = 0;
    for await (const line of rl) {
        if (line.trim() === '') {
            if (section.length > 0) {
                await processSection(section, sectionCount);
                section = [];
                sectionCount++;
            }
        } else {
            const values = line.split('\t').map(item => isNaN(Number(item)) ? item : Number(item));
            if (section.length === 0) {
                taskCount = values.length - 1;
                createTable(taskCount);
            }
            section.push(values);
        }
    }
    if (section.length > 0) {
        await processSection(section, sectionCount);
    }
}

async function processSection(section, sectionCount) {
    // 섹션 데이터를 데이터베이스에 삽입
    const taskCount = section[0].length - 1;
    const placeholders = new Array(taskCount).fill('?').join(', ');
    for (let i = 1; i < section.length; i++) {
        const [core, ...tasks] = section[i];
        const insertQuery = `
            INSERT INTO profiler_data (section, core, ${section[0].slice(1).map((_, i) => `task${i + 1}`).join(', ')})
            VALUES (?, ?, ${placeholders})
        `;
        db.query(insertQuery, [sectionCount, core, ...tasks], (err) => {
            if (err) throw err;
        });
    }
}

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});