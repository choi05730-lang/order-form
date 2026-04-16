const express = require('express');
const path = require('path');
const fs = require('fs');

// .env.local 로드
const envFile = path.join(__dirname, '.env.local');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
}

const parseHandler = require('./api/parse');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // HTML 파일 서빙

app.post('/api/parse', (req, res) => parseHandler(req, res));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✅ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`👉 테스트: http://localhost:${PORT}/order.html\n`);
});
