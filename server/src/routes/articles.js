import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const listSelect = `
  SELECT a.id, a.title, a.body, a.created_at,
         c.name AS category,
         u.name AS author,
         (SELECT COUNT(*) FROM comments cm WHERE cm.article_id = a.id) AS comment_count
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  JOIN users u ON u.id = a.author_id
`;

router.get('/', (req, res) => {
  const search = String(req.query.q || '').trim();
  const categoryName = String(req.query.category || '').trim();

  const conditions = [
    search && { sql: '(a.title LIKE ? OR a.body LIKE ?)', values: [`%${search}%`, `%${search}%`] },
    categoryName && { sql: 'c.name = ?', values: [categoryName] },
  ].filter(Boolean);

  const clause = conditions.length
    ? `WHERE ${conditions.map((c) => c.sql).join(' AND ')}`
    : '';
  const params = conditions.flatMap((c) => c.values);

  const rows = db
    .prepare(`${listSelect} ${clause} ORDER BY a.created_at DESC`)
    .all(...params);

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const article = db.prepare(`${listSelect} WHERE a.id = ?`).get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статтю не знайдено' });

  const comments = db
    .prepare(
      `SELECT cm.id, cm.body, cm.created_at, u.name AS author
       FROM comments cm JOIN users u ON u.id = cm.author_id
       WHERE cm.article_id = ? ORDER BY cm.created_at ASC`,
    )
    .all(req.params.id);

  res.json({ ...article, comments });
});

router.post('/', requireAuth, (req, res) => {
  const title = String(req.body?.title || '').trim();
  const body = String(req.body?.body || '').trim();
  const category_id = Number(req.body?.category_id);

  if (!title || !body || !category_id) {
    return res.status(400).json({ error: 'Заповніть заголовок, текст і категорію' });
  }

  const { lastInsertRowid } = db
    .prepare('INSERT INTO articles (title, body, category_id, author_id) VALUES (?, ?, ?, ?)')
    .run(title, body, category_id, req.user.id);

  res.status(201).json(db.prepare(`${listSelect} WHERE a.id = ?`).get(lastInsertRowid));
});

router.put('/:id', requireAuth, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статтю не знайдено' });
  if (article.author_id !== req.user.id) {
    return res.status(403).json({ error: 'Редагувати може лише автор' });
  }

  const title = String(req.body?.title || article.title).trim();
  const body = String(req.body?.body || article.body).trim();
  const category_id = Number(req.body?.category_id || article.category_id);

  db.prepare('UPDATE articles SET title = ?, body = ?, category_id = ? WHERE id = ?').run(
    title,
    body,
    category_id,
    req.params.id,
  );

  res.json(db.prepare(`${listSelect} WHERE a.id = ?`).get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статтю не знайдено' });
  if (article.author_id !== req.user.id) {
    return res.status(403).json({ error: 'Видаляти може лише автор' });
  }
  db.prepare('DELETE FROM comments WHERE article_id = ?').run(req.params.id);
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

router.post('/:id/comments', requireAuth, (req, res) => {
  const body = String(req.body?.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Порожній коментар' });

  const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Статтю не знайдено' });

  db.prepare('INSERT INTO comments (article_id, author_id, body) VALUES (?, ?, ?)').run(
    req.params.id,
    req.user.id,
    body,
  );

  const comments = db
    .prepare(
      `SELECT cm.id, cm.body, cm.created_at, u.name AS author
       FROM comments cm JOIN users u ON u.id = cm.author_id
       WHERE cm.article_id = ? ORDER BY cm.created_at ASC`,
    )
    .all(req.params.id);

  res.status(201).json(comments);
});

export default router;
