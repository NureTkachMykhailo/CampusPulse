import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { BackLink } from '../components/Layout.jsx';

export function Article() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  function load() {
    api.getArticle(id).then(setArticle);
  }

  useEffect(load, [id]);

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const comments = await api.addComment(id, commentText.trim());
      setArticle((prev) => ({ ...prev, comments }));
      setCommentText('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove() {
    if (!confirm('Видалити статтю?')) return;
    await api.deleteArticle(id);
    navigate('/');
  }

  if (!article) return <p>Завантаження...</p>;

  const isAuthor = user && user.name === article.author;

  return (
    <div>
      <BackLink />
      <span className="tag">{article.category}</span>
      <h1>{article.title}</h1>
      <div className="meta">
        {article.author} · {new Date(article.created_at).toLocaleDateString('uk-UA')}
      </div>
      <p style={{ lineHeight: 1.6, marginTop: 16 }}>{article.body}</p>

      {isAuthor && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button className="btn secondary" onClick={() => navigate(`/edit/${article.id}`)}>
            Редагувати
          </button>
          <button className="btn danger" onClick={remove}>Видалити</button>
        </div>
      )}

      <h3>Коментарі ({article.comments.length})</h3>
      {article.comments.map((c) => (
        <div key={c.id} className="comment">
          <strong>{c.author}</strong>
          <div className="meta">{new Date(c.created_at).toLocaleDateString('uk-UA')}</div>
          <p>{c.body}</p>
        </div>
      ))}

      {user ? (
        <form onSubmit={submitComment} style={{ marginTop: 16 }}>
          <textarea
            placeholder="Ваш коментар..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          {error && <div className="error">{error}</div>}
          <button className="btn" type="submit" style={{ marginTop: 8 }}>Надіслати</button>
        </form>
      ) : (
        <p className="meta">Увійдіть, щоб залишити коментар.</p>
      )}
    </div>
  );
}
