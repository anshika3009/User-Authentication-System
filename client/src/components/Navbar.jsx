import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { s } from '../styles.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <nav style={s.nav}>
      <Link style={s.link} to="/">Home</Link>
      {user ? (
        <>
          <Link style={s.link} to="/profile">Profile</Link>
          {user.role === 'admin' && <Link style={s.link} to="/admin">Admin</Link>}
          <button style={s.link} onClick={handleLogout}>Logout ({user.name})</button>
        </>
      ) : (
        <>
          <Link style={s.link} to="/login">Login</Link>
          <Link style={s.link} to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
