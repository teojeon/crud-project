// server.js (ES Module)
import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || 'db.json';

// 데이터베이스 초기화
const adapter = new JSONFile(DB_FILE);
const defaultData = { items: [] };
const db = new Low(adapter, defaultData);
await db.read();
db.data ||= defaultData;

const app = express();
app.use(cors());
app.use(express.json());

// CRUD 라우트
app.post('/items', async (req, res) => {
  const item = { id: Date.now(), ...req.body };
  db.data.items.push(item);
  await db.write();
  res.status(201).json(item);
});

app.get('/items', (req, res) => {
  res.json(db.data.items);
});

app.put('/items/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.data.items.findIndex(i => i.id === id);
  if (idx === -1) return res.sendStatus(404);
  db.data.items[idx] = { id, ...req.body };
  await db.write();
  res.json(db.data.items[idx]);
});

app.delete('/items/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.data.items = db.data.items.filter(i => i.id !== id);
  await db.write();
  res.sendStatus(204);
});

// 서버 시작
app.listen(PORT, () => console.log(`🖥 Server running at http://localhost:${PORT}`));
