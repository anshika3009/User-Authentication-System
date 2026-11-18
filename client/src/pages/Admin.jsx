import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { s } from '../styles.js';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = async (query = '') => {
    try {
      setUsers(await api(`/admin/users?q=${encodeURIComponent(query)}`));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api(`/admin/users/${id}`, 'DELETE');
      load(q);
    } catch (err) {
      setError(err.message);
    }
  };

  const heads = ['ID', 'Name', 'Email', 'Mobile', 'City', 'Occupation', 'College / Company', 'Role', 'Joined', ''];

  return (
    <div style={{ ...s.card, ...s.wide, maxWidth: 1100 }}>
      <h2>Admin Dashboard</h2>
      {error && <p style={s.err}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={s.input} placeholder="Search name, email or city" value={q}
          onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(q)} />
        <button style={{ ...s.btn, marginTop: 0 }} onClick={() => load(q)}>Search</button>
      </div>
      <p style={s.muted}>Total: {users.length} users</p>
      <table style={s.table}>
        <thead><tr>{heads.map((h) => <th key={h} style={s.cell}>{h}</th>)}</tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={s.cell}>{u.id}</td>
              <td style={s.cell}>{u.name}</td>
              <td style={s.cell}>{u.email}</td>
              <td style={s.cell}>{u.phone || '-'}</td>
              <td style={s.cell}>{u.city || '-'}</td>
              <td style={s.cell}>{u.occupation || '-'}</td>
              <td style={s.cell}>{u.organization || '-'}</td>
              <td style={s.cell}>{u.role}</td>
              <td style={s.cell}>{new Date(u.created_at).toLocaleDateString()}</td>
              <td style={s.cell}>
                {u.id !== user.id && <button style={s.danger} onClick={() => remove(u.id)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}