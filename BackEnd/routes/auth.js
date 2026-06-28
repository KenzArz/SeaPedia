import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'seapedia_secret_key_123';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      roles: user.roles,
      activeRole: user.activeRole
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

router.post('/register', async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ message: 'Minimal pilih satu peran (role)' });
  }

  const validRoles = ['Admin', 'Seller', 'Buyer', 'Driver'];
  const hasInvalidRole = roles.some(role => !validRoles.includes(role));
  if (hasInvalidRole) {
    return res.status(400).json({ message: 'Terdapat peran tidak valid' });
  }

  try {
    const existingUser = await db.User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const activeRole = roles[0];

    const newUser = await db.User.create({
      username,
      password: hashedPassword,
      roles,
      activeRole
    });

    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        username: newUser.username,
        roles: newUser.roles,
        activeRole: newUser.activeRole
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  try {
    const user = await db.User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Kredensial tidak valid' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Kredensial tidak valid' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        roles: user.roles,
        activeRole: user.activeRole
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server saat login' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json({
      id: user._id || user.id,
      username: user.username,
      roles: user.roles,
      activeRole: user.activeRole
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.post('/role', authMiddleware, async (req, res) => {
  const { activeRole } = req.body;

  if (!activeRole) {
    return res.status(400).json({ message: 'Peran aktif wajib ditentukan' });
  }

  if (!req.user.roles.includes(activeRole)) {
    return res.status(400).json({ message: 'Peran tersebut tidak terdaftar untuk akun Anda' });
  }

  try {
    const updatedUser = await db.User.updateActiveRole(req.user.id, activeRole);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User gagal diperbarui' });
    }

    const token = generateToken(updatedUser);

    res.json({
      token,
      user: {
        id: updatedUser._id || updatedUser.id,
        username: updatedUser.username,
        roles: updatedUser.roles,
        activeRole: updatedUser.activeRole
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui peran' });
  }
});

export default router;
