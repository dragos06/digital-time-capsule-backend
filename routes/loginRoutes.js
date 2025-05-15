import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

const router = express.Router();

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    
    const userResult = await pool.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).send('Invalid email or password');
    }

    // Create a JWT token
    const token = jwt.sign({ id: user.user_id, role: user.role_id }, 'your_secret_key', { expiresIn: '1h' });
    
    // Log user activity
    const logQuery = 'INSERT INTO user_activity_log (user_id, action) VALUES ($1, $2)';
    await pool.query(logQuery, [user.user_id, 'login']);

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

export default router;
