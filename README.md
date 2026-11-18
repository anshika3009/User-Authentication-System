# User Authentication System (React + Node.js + MySQL)

## Setup
1. Run `server/schema.sql` in MySQL.
2. Start the server:
   cd server
   cp .env.example .env     (set your DB password and SESSION_SECRET)
   npm install
   npm run dev              -> http://localhost:5000
3. Start the client (new terminal):
   cd client
   npm install
   npm run dev              -> http://localhost:5173
4. Open http://localhost:5173 and register.
5. To make a user an admin, run in MySQL:
   UPDATE users SET role='admin' WHERE email='you@example.com';
   (then log out and log in again)