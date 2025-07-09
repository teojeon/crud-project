// server.js
const express = require('express');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer  = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true,
}));

app.use(session({
  secret: 'toonix-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60  // 1시간
  }
}));

// 업로드된 이미지를 제공할 정적 경로 설정
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// multer 설정: 저장 위치(public/uploads)와 파일명 규칙
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}_${name}${ext}`);
  }
});
const upload = multer({ storage });

const DB_PATH = './db.json';

// Helper: DB 로드/저장
function loadDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ✅ 회원가입
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const db = loadDB();
  const exists = db.users.find(u => u.email === email);
  if (exists) return res.status(400).json({ message: '이미 등록된 이메일입니다.' });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), email, password: hashed, role: 'user' };
  db.users.push(newUser);
  saveDB(db);
  req.session.userId = newUser.id;
  res.status(201).json({ message: '회원가입 성공', user: { email: newUser.email } });
});

// ✅ 로그인
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: '존재하지 않는 계정입니다.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

  req.session.userId = user.id;
  res.json({ message: '로그인 성공', user: { email: user.email } });
});

// ✅ 로그아웃
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: '로그아웃 완료' });
  });
});

// ✅ 현재 로그인된 사용자 확인
app.get('/me', (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(401).json({ message: '로그인 필요' });
  res.json({ email: user.email });
});

// ✅ 인증된 사용자만 접근 가능
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: '로그인이 필요합니다.' });
  next();
}

// ✅ 아이템 목록 조회
app.get('/items', requireLogin, (req, res) => {
  const db = loadDB();
  res.json(db.items);
});

// ✅ 아이템 생성 (이미지 업로드 포함)
app.post('/items', requireLogin, upload.single('image'), (req, res) => {
  const db = loadDB();
  const { name, description } = req.body;

  // 업로드된 파일이 있으면 URL을, 없으면 null
  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  const newItem = {
    id: Date.now(),
    name,
    description,
    imageUrl
  };
  db.items.push(newItem);
  saveDB(db);

  res.status(201).json(newItem);
});

// 서버 실행
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
