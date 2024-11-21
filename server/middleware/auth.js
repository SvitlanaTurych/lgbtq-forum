import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Секрет у змінній середовища

// Middleware для аутентифікації
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Читаємо заголовок Authorization
  const token = authHeader && authHeader.split(' ')[1]; // Витягуємо токен (Bearer <token>)

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET); // Перевіряємо токен
    req.user = { id: user.id, email: user.email }; // Додаємо інформацію користувача до запиту
    next();
  } catch (error) {
    console.error('Token verification error:', error.message); // Логування помилки
    res.status(403).json({ error: 'Invalid token' });
  }
}
