import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = express.Router();
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const db = req.db;
    const userId = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO users (id, username, email, password)
      VALUES (?, ?, ?, ?)
    `).run(userId, username, email, hashedPassword);

    const user = {
      id: userId,
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${username}`
    };

    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const db = req.db;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avatars/svg?seed=${user.username}`
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export { router as authRouter };