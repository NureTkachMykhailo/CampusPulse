const BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('campuspulse_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Помилка запиту');
  return data;
}

export const api = {
  getArticles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/articles${qs ? `?${qs}` : ''}`);
  },
  getArticle: (id) => request(`/articles/${id}`),
  createArticle: (body) => request('/articles', { method: 'POST', body: JSON.stringify(body) }),
  updateArticle: (id, body) =>
    request(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteArticle: (id) => request(`/articles/${id}`, { method: 'DELETE' }),
  addComment: (id, body) =>
    request(`/articles/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
  getCategories: () => request('/categories'),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
};
