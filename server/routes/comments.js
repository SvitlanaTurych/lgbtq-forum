import express from 'express';
import crypto from 'crypto'; // Імпорт crypto для генерації UUID
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const commentSchema = z.object({
  content: z.string().min(1),
  postId: z.string()
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { content, postId } = commentSchema.parse(req.body);
    const db = req.db;

    // Перевірка наявності поста
    const postExists = db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE id = ?`).get(postId);
    if (!postExists || postExists.count === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentId = crypto.randomUUID();

    // Додавання нового коментаря
    db.prepare(`
      INSERT INTO comments (id, content, post_id, author_id)
      VALUES (?, ?, ?, ?)
    `).run(commentId, content, postId, req.user.id);

    // Отримання повної інформації про новий коментар
    const newComment = db.prepare(`
      SELECT 
        c.id, c.content, c.created_at,
        u.username as author_username, u.avatar as author_avatar
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `).get(commentId);

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error.message);
    res.status(400).json({ error: error.message });
  }
});

export { router as commentsRouter };
