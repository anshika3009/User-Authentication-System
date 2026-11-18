import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { s } from '../styles.js';

export default function Profile() {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Load the full profile from the server
  useEffect(() => {
    api('/auth/profile')
      .then((d) => setForm({
        name: d.name || '', email: d.email || '', phone: d.phone || '',
        date_of_birth: d.date_of_birth || '', city: d.city || '',
        occupation: d.occupation || '', organization: d.organization || '',
        bio: d.bio || '', password: '',
      }))
      .catch((e) => setError(e.message));
  }, []);

  if (!form) return <div style={s.card}>{error ? <p style={s.err}>{error}</p> : 'Loading...'}</div>;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await updateProfile(form);
      setForm({ ...form, password: '' });
      setMsg('Profile updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  const field = (label, name, props = {}) => (
    <>
      <label style={s.label}>{label}</label>
      <input style={s.input} name={name} value={form[name]} onChange={change} {...props} />
    </>
  );

  return (
    <div style={{ ...s.card, maxWidth: 480 }}>
      <h2>My Profile</h2>
      {msg && <p style={s.ok}>{msg}</p>}
      {error && <p style={s.err}>{error}</p>}
      <form onSubmit={submit}>
        {field('Name', 'name', { required: true })}
        {field('Email', 'email', { type: 'email', required: true })}
        {field('Mobile', 'phone', { maxLength: 10, required: true })}
        {field('Date of birth', 'date_of_birth', { type: 'date', required: true })}
        {field('City', 'city', { required: true })}
        <label style={s.label}>I am</label>
        <select style={s.input} name="occupation" value={form.occupation} onChange={change} required>
          <option value="">Select...</option>
          <option value="student">Student</option>
          <option value="working">Working</option>
          <option value="other">Other</option>
        </select>
        {field('College / Company', 'organization')}
        <label style={s.label}>Bio</label>
        <textarea style={{ ...s.input, minHeight: 70, fontFamily: 'inherit' }} name="bio"
          maxLength={300} value={form.bio} onChange={change} />
        {field('New password (leave blank to keep the current one)', 'password', { type: 'password' })}
        <button style={s.btn}>Save changes</button>
      </form>
    </div>
  );
}