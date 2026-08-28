import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export function Home() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const initial = new URLSearchParams(location.search);
  const [q, setQ] = useState(initial.get('q') || '');
  const [category, setCategory] = useState(initial.get('category') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (q) params.q = q;
    if (category) params.category = category;
    api.getArticles(params).then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, [q, category]);

  return (
    <div>
      <div className="controls">
        <input
          placeholder="пошук за назвою або текстом..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">усі категорії</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p>Завантаження...</p>}
      {!loading && articles.length === 0 && <p>Нічого не знайдено.</p>}

      {articles.map((a) => (
        <Link key={a.id} to={`/articles/${a.id}`} className="card" style={{ display: 'block' }}>
          <span className="tag">{a.category}</span>
          <h3 style={{ margin: '4px 0' }}>{a.title}</h3>
          <p style={{ color: '#4b5563', margin: 0 }}>{a.body.slice(0, 140)}...</p>
          <div className="meta">
            {a.author} · {new Date(a.created_at).toLocaleDateString('uk-UA')} · {a.comment_count} коментарів
          </div>
        </Link>
      ))}
    </div>
  );
}
