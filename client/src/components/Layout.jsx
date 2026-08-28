import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div className="topbar">
        <Link to="/" className="brand">CampusPulse</Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/new">Написати статтю</Link>
              <span>{user.name}</span>
              <button
                className="btn secondary"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Увійти</Link>
              <Link to="/register">Реєстрація</Link>
            </>
          )}
        </div>
      </div>
      <div className="container">{children}</div>
    </div>
  );
}

export function BackLink() {
  return <Link to="/" style={{ display: 'inline-block', marginBottom: 14, color: '#2f6fed' }}>&larr; До стрічки</Link>;
}
