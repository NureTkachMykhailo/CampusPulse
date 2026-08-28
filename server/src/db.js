import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const db = new DatabaseSync(path.join(__dirname, '..', 'campus.db'));

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      author_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id),
      author_id INTEGER NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM articles').get().n;
  if (count > 0) return;

  const insertUser = db.prepare(
    'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
  );
  const demoHash = bcrypt.hashSync('campus123', 10);
  const demoId = insertUser.run('demo@campuspulse.local', 'Редакція CampusPulse', demoHash)
    .lastInsertRowid;

  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const categoryNames = ['Навчання', 'Гуртожиток', 'Спорт', 'Наука', 'Події'];
  const categoryIds = {};
  for (const name of categoryNames) {
    categoryIds[name] = insertCategory.run(name).lastInsertRowid;
  }

  const insertArticle = db.prepare(
    'INSERT INTO articles (title, body, category_id, author_id) VALUES (?, ?, ?, ?)',
  );

  const seedArticles = [
    {
      title: 'Як пережити сесію на ПЗПІ без нервового зриву',
      category: 'Навчання',
      body:
        'Сесія на факультеті програмної інженерії щороку лякає першокурсників, але виживають усі. ' +
        'Головне правило: не залишати конспекти на останню ніч. Розбивайте матеріал по днях, ' +
        'повторюйте лабораторні заздалегідь і не бійтеся піти до викладача на консультацію.',
    },
    {
      title: 'Гуртожиток №5: що варто знати новачкам',
      category: 'Гуртожиток',
      body:
        'Заселення, вахта, спільна кухня на поверсі — перші тижні в гуртожитку завжди трохи хаотичні. ' +
        'Ми зібрали короткий гайд: як домовитися із сусідом по кімнаті, де знайти прасувальну ' +
        'і чому варто одразу познайомитися зі старостою поверху.',
    },
    {
      title: 'Збірна університету з баскетболу вийшла у фінал',
      category: 'Спорт',
      body:
        'Студентська збірна ХНУРЕ здобула перемогу у півфіналі обласного чемпіонату. ' +
        'Фінальна гра відбудеться наступного тижня у спорткомплексі університету. ' +
        'Вхід для студентів вільний за наявності студентського квитка.',
    },
    {
      title: 'Студентський науковий гурток запускає новий проєкт',
      category: 'Наука',
      body:
        'Гурток машинного навчання оголосив набір учасників для проєкту з аналізу даних відкритих ' +
        'реєстрів. Досвід не обов’язковий: керівники гуртка проведуть кілька вступних занять ' +
        'з Python і базової статистики.',
    },
    {
      title: 'День відкритих дверей: чого чекати абітурієнтам',
      category: 'Події',
      body:
        'У суботу університет проведе день відкритих дверей для абітурієнтів і батьків. ' +
        'У програмі — екскурсії лабораторіями, зустрічі з деканами факультетів та коротка ' +
        'презентація студентського життя від активу.',
    },
  ];

  for (const a of seedArticles) {
    insertArticle.run(a.title, a.body, categoryIds[a.category], demoId);
  }
}
