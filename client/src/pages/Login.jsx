import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { s } from '../styles.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={s.card}>
      <h2>Login</h2>
      {location.state?.registered && <p style={s.ok}>Registered successfully! Please log in.</p>}
      {error && <p style={s.err}>{error}</p>}
      <form onSubmit={submit}>
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" name="email" value={form.email} onChange={change} required />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" name="password" value={form.password} onChange={change} required />
        <button style={s.btn}>Login</button>
      </form>
    </div>
  );
}