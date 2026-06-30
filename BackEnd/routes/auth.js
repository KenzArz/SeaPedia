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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  try {
    const existingUser = await db.User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.User.create({
      username,
      password: hashedPassword,
      roles: ['Buyer'],
      activeRole: 'Buyer'
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
      activeRole: user.activeRole,
      createdAt: user.createdAt ?? null,
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

router.post('/add-role/seller', authMiddleware, async (req, res) => {
  const { storeName } = req.body;

  if (!storeName || storeName.trim() === '') {
    return res.status(400).json({ message: 'Nama toko wajib diisi' });
  }

  try {
    const user = await db.User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const existingStoreOwner = await db.Store.findOne({ owner: req.user.id });
    if (existingStoreOwner || user.roles.includes('Seller')) {
      return res.status(400).json({ message: 'Anda sudah terdaftar sebagai Seller atau memiliki toko' });
    }

    const existingStoreName = await db.Store.findOne({ name: storeName.trim() });
    if (existingStoreName) {
      return res.status(400).json({ message: 'Nama toko sudah digunakan' });
    }

    const updatedRoles = [...user.roles];
    if (!updatedRoles.includes('Seller')) {
      updatedRoles.push('Seller');
    }

    const updatedUser = await db.User.updateUser(user._id || user.id, {
      roles: updatedRoles,
      activeRole: 'Seller'
    });

    if (!updatedUser) {
      return res.status(500).json({ message: 'Gagal memperbarui peran user' });
    }

    await db.Store.create({
      name: storeName.trim(),
      description: '',
      owner: updatedUser._id || updatedUser.id
    });

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
    res.status(500).json({ message: 'Terjadi kesalahan server saat menambahkan peran Seller' });
  }
});

router.post('/add-role/driver', authMiddleware, async (req, res) => {
  const { fullName, vehicleNumber } = req.body;

  if (!fullName || fullName.trim() === '') {
    return res.status(400).json({ message: 'Nama lengkap wajib diisi' });
  }
  if (!vehicleNumber || vehicleNumber.trim() === '') {
    return res.status(400).json({ message: 'Nomor kendaraan wajib diisi' });
  }

  try {
    const user = await db.User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.roles.includes('Driver')) {
      return res.status(400).json({ message: 'Anda sudah terdaftar sebagai Driver' });
    }

    const updatedRoles = [...user.roles];
    if (!updatedRoles.includes('Driver')) {
      updatedRoles.push('Driver');
    }

    const updatedUser = await db.User.updateUser(user._id || user.id, {
      roles: updatedRoles,
      activeRole: 'Driver',
      driverDetails: {
        fullName: fullName.trim(),
        vehicleNumber: vehicleNumber.trim()
      }
    });

    if (!updatedUser) {
      return res.status(500).json({ message: 'Gagal memperbarui peran user' });
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
    res.status(500).json({ message: 'Terjadi kesalahan server saat menambahkan peran Driver' });
  }
});

export default router;
