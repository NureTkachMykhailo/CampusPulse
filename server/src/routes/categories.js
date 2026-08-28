import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

router.post('/', requireAuth, (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Назва категорії обов’язкова' });
  try {
    const { lastInsertRowid } = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json({ id: lastInsertRowid, name });
  } catch {
    res.status(409).json({ error: 'Категорія вже існує' });
  }
});

export default router;
