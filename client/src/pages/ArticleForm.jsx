import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { BackLink } from '../components/Layout.jsx';

export function ArticleForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCategories().then((data) => {
      setCategories(data);
      if (!editing && data.length) setCategoryId(String(data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!editing) return;
    api.getArticle(id).then((a) => {
      setTitle(a.title);
      setBody(a.body);
      const match = categories.find((c) => c.name === a.category);
      if (match) setCategoryId(String(match.id));
    });
  }, [id, categories.length]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const payload = { title, body, category_id: Number(categoryId) };
    try {
      if (editing) {
        await api.updateArticle(id, payload);
        navigate(`/articles/${id}`);
      } else {
        const created = await api.createArticle(payload);
        navigate(`/articles/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <BackLink />
      <h2>{editing ? 'Редагування статті' : 'Нова стаття'}</h2>
      <form onSubmit={submit} className="card">
        <div className="field">
          <label>Заголовок</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Категорія</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Текст</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit">{editing ? 'Зберегти' : 'Опублікувати'}</button>
      </form>
    </div>
  );
}
