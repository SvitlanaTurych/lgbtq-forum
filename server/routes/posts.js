import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto'; // Якщо у вас Node.js >= 16.14.0

const router = express.Router();

// Валідація поста за допомогою Zod
const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1)
});

// Отримання всіх постів
router.get('/', (req, res) => {
  const db = req.db;

  try {
    const posts = db.prepare(`
      SELECT 
        p.*,
        u.username as author_username,
        u.avatar as author_avatar,
        COUNT(c.id) as comment_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Створення нового поста
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, content } = postSchema.parse(req.body); // Валідація даних
    const db = req.db;
    const postId = crypto.randomUUID(); // Унікальний ідентифікатор поста
    
    db.prepare(`
      INSERT INTO posts (id, title, content, author_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(postId, title, content, req.user.id, new Date().toISOString());

    res.status(201).json({ id: postId, message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Отримання конкретного поста та його коментарів
router.get('/:id', (req, res) => {
  const db = req.db;

  try {
    const post = db.prepare(`
      SELECT 
        p.*,
        u.username as author_username,
        u.avatar as author_avatar
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = db.prepare(`
      SELECT 
        c.*,
        u.username as author_username,
        u.avatar as author_avatar
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `).all(req.params.id);

    res.json({ ...post, comments });
  } catch (error) {
    console.error('Error fetching post:', error.message);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export { router as postsRouter };
