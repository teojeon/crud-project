const express = require('express');
const { Low, JSONFile } = require('lowdb');
const app = express();
app.use(express.json());

// DB 세팅
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { items: [] };

// CREATE
app.post('/items', async (req, res) => {
  const item = { id: Date.now(), ...req.body };
  db.data.items.push(item);
  await db.write();
  res.status(201).json(item);
});

// READ
app.get('/items', (req, res) => {
  res.json(db.data.items);
});
// ... UPDATE, DELETE도 비슷하게 추가

app.listen(3000, () => console.log('서버 실행: http://localhost:3000'));
