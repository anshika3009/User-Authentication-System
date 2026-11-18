import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const sessionUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const OCCUPATIONS = ['student', 'working', 'other'];

function ageOf(dob) {
  const d = new Date(dob), t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
}

// Shared validation for both registration and profile update
function validateDetails(b) {
  if (!(b.name || '').trim()) return 'Name is required.';
  if (!emailOk(b.email || '')) return 'Valid email is required.';
  if (!/^[6-9]\d{9}$/.test(b.phone || '')) return 'Enter a valid 10-digit mobile number.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date_of_birth || '') || isNaN(new Date(b.date_of_birth)))
    return 'Valid date of birth is required.';
  const age = ageOf(b.date_of_birth);
  if (age < 13 || age > 120) return 'Please enter a valid date of birth.';
  if (!(b.city || '').trim()) return 'City is required.';
  if (!OCCUPATIONS.includes(b.occupation)) return 'Please select what you do.';
  if ((b.bio || '').length > 300) return 'Bio must be 300 characters or less.';
  return null;
}

router.post('/register', async (req, res) => {
  const b = req.body;
  const err = validateDetails(b);
  if (err) return res.status(400).json({ message: err });
  if ((b.password || '').length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });

  const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [b.email.trim()]);
  if (exists.length) return res.status(409).json({ message: 'Email already registered.' });

  const hash = await bcrypt.hash(b.password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, phone, date_of_birth, city, occupation, organization, bio)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [b.name.trim(), b.email.trim(), hash, b.phone, b.date_of_birth, b.city.trim(),
     b.occupation, (b.organization || '').trim() || null, (b.bio || '').trim() || null]
  );
  res.status(201).json({ message: 'Registered successfully.' });
});

router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ message: 'Invalid email or password.' });

  // New session id on login (prevents session fixation)
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ message: 'Session error.' });
    req.session.user = sessionUser(user);
    res.json(req.session.user);
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ message: 'Logged out.' });
  });
});

// Returns the logged-in user (used to restore login state after a page refresh)
router.get('/me', (req, res) => {
  res.json(req.session.user || null);
});

// Full profile details for the Profile page
router.get('/profile', requireLogin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT name, email, phone, DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth,
            city, occupation, organization, bio, created_at
     FROM users WHERE id = ?`,
    [req.session.user.id]
  );
  res.json(rows[0]);
});

router.put('/profile', requireLogin, async (req, res) => {
  const b = req.body;
  const id = req.session.user.id;
  const err = validateDetails(b);
  if (err) return res.status(400).json({ message: err });
  if (b.password && b.password.length < 8)
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });

  const [dup] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ?', [b.email.trim(), id]);
  if (dup.length) return res.status(409).json({ message: 'Email already in use.' });

  await pool.query(
    `UPDATE users SET name=?, email=?, phone=?, date_of_birth=?, city=?, occupation=?, organization=?, bio=?
     WHERE id=?`,
    [b.name.trim(), b.email.trim(), b.phone, b.date_of_birth, b.city.trim(), b.occupation,
     (b.organization || '').trim() || null, (b.bio || '').trim() || null, id]
  );
  if (b.password) {
    const hash = await bcrypt.hash(b.password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
  }
  req.session.user = { ...req.session.user, name: b.name.trim(), email: b.email.trim() };
  res.json(req.session.user);
});

export default router;