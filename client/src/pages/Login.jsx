import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@campuspulse.local');
  const [password, setPassword] = useState('campus123');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 380, margin: '40px auto' }}>
      <h2>Увійти</h2>
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit">Увійти</button>
      </form>
      <p className="meta" style={{ marginTop: 14 }}>
        Немає акаунта? <Link to="/register">Зареєструватися</Link>
      </p>
    </div>
  );
}
