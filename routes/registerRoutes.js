import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/pool.js';

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  
  // Check if the role is valid
  if (!['admin', 'regular'].includes(role)) {
    return res.status(400).send('Invalid role');
  }

  try {
    // Check if the email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).send('Email already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the users table
    const insertUserQuery = `
      INSERT INTO users (email, password, role_id)
      VALUES ($1, $2, (SELECT role_id FROM roles WHERE role_name = $3))
      RETURNING user_id, email
    `;
    const result = await pool.query(insertUserQuery, [email, hashedPassword, role]);

    return res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

export default router;