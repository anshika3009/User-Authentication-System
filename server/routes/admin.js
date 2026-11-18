import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin); // every route below is admin-only

router.get('/users', async (req, res) => {
  const q = `%${(req.query.q || '').trim()}%`;
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, city, occupation, organization, role, created_at
     FROM users WHERE name LIKE ? OR email LIKE ? OR city LIKE ? ORDER BY id DESC`,
    [q, q, q]
  );
  res.json(rows);
});

router.delete('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.user.id) return res.status(400).json({ message: "You can't delete yourself." });
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
  res.json({ message: 'User deleted.' });
});

export default router;