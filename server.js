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

const parseHandler      = require('./api/parse');
const submitHandler     = require('./api/submit');
const ordersHandler     = require('./api/orders');
const uploadHandler     = require('./api/upload');
const createLinkHandler = require('./api/create-link');
const accountHandler    = require('./api/account');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.post('/api/parse',       (req, res) => parseHandler(req, res));
app.post('/api/submit',      (req, res) => submitHandler(req, res));
app.all('/api/orders',       (req, res) => ordersHandler(req, res));
app.post('/api/upload',      (req, res) => uploadHandler(req, res));
app.post('/api/create-link', (req, res) => createLinkHandler(req, res));
app.get('/api/account',     (req, res) => accountHandler(req, res));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✅ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`👉 테스트: http://localhost:${PORT}/order.html\n`);
});
