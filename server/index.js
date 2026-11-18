import 'dotenv/config';
import express from 'express';
import 'express-async-errors'; // forwards errors from async routes to the error handler
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const MySQLStore = MySQLStoreFactory(session);
const app = express();

app.use(express.json());
app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({}, pool), // sessions are stored in MySQL
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day. Set secure: true in production (HTTPS)
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error.' });
});

app.listen(process.env.PORT || 5000, () =>
  console.log('Server running on port', process.env.PORT || 5000)
);