import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim();
  const password = String(req.body?.password || '');

  if (!email || !name || password.length < 6) {
    return res.status(400).json({ error: 'Перевірте email, ім’я та пароль (мін. 6 символів)' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Такий email вже зареєстровано' });

  const hash = bcrypt.hashSync(password, 10);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)')
    .run(email, name, hash);

  const user = { id: lastInsertRowid, email, name };
  res.status(201).json({ token: signToken(user), user });
});

router.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Невірний email або пароль' });
  }

  const user = { id: row.id, email: row.email, name: row.name };
  res.json({ token: signToken(user), user });
});

export default router;
