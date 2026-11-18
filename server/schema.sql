CREATE DATABASE IF NOT EXISTS auth_system CHARACTER SET utf8mb4;
USE auth_system;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  phone VARCHAR(15) NULL,
  date_of_birth DATE NULL,
  city VARCHAR(100) NULL,
  occupation ENUM('student','working','other') NULL,
  organization VARCHAR(150) NULL,
  bio VARCHAR(300) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- The sessions table is created automatically by express-mysql-session.
-- To make a user an admin:
-- UPDATE users SET role='admin' WHERE email='your@email.com';