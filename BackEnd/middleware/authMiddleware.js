import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seapedia_secret_key_123';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Autentikasi gagal: Token tidak disediakan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Autentikasi gagal: Token tidak valid atau kedaluwarsa' });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.activeRole !== role) {
      return res.status(403).json({ message: `Akses ditolak: Peran '${role}' diperlukan` });
    }
    next();
  };
};
