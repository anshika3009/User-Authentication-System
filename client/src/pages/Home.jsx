import { useAuth } from '../AuthContext.jsx';
import { s } from '../styles.js';

export default function Home() {
  const { user } = useAuth();
  return (
    <div style={s.card}>
      <h2>Welcome</h2>
      <p>{user ? `Hello, ${user.name}!` : 'Please login or register to continue.'}</p>
    </div>
  );
}
