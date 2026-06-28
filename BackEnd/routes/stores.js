import express from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const handleErrors = (err, res) => {
  console.error(err);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'name';
    const message = field === 'owner' 
      ? 'Akun Anda sudah terdaftar memiliki toko.' 
      : 'Nama toko tersebut sudah digunakan. Silakan pilih nama lain.';
    return res.status(409).json({
      success: false,
      message
    });
  }
  if (err.message && (err.message.includes('Nama toko sudah digunakan') || err.message.includes('Kamu sudah memiliki toko'))) {
    return res.status(409).json({
      success: false,
      message: err.message
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
    error: err.message
  });
};

router.post('/', authMiddleware, requireRole('Seller'), async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Nama toko wajib diisi'
    });
  }

  try {
    const existingStore = await db.Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: 'Kamu sudah memiliki toko'
      });
    }

    const nameTaken = await db.Store.findOne({ name: name.trim() });
    if (nameTaken) {
      return res.status(409).json({
        success: false,
        message: 'Nama toko sudah digunakan'
      });
    }

    const newStore = await db.Store.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      owner: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Toko berhasil dibuat',
      data: newStore
    });
  } catch (err) {
    return handleErrors(err, res);
  }
});

router.get('/my-store', authMiddleware, requireRole('Seller'), async (req, res) => {
  try {
    const store = await db.Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Kamu belum memiliki toko'
      });
    }

    const productCount = await db.Product.countDocuments({ store: store._id || store.id, isActive: true });

    return res.status(200).json({
      success: true,
      message: 'Informasi toko berhasil diambil',
      data: {
        ...store,
        productCount
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi toko',
      error: err.message
    });
  }
});

router.put('/my-store', authMiddleware, requireRole('Seller'), async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Nama toko wajib diisi'
    });
  }

  try {
    const store = await db.Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan'
      });
    }

    if (name.trim() !== store.name) {
      const nameTaken = await db.Store.findOne({ name: name.trim() });
      if (nameTaken) {
        return res.status(409).json({
          success: false,
          message: 'Nama toko sudah digunakan'
        });
      }
    }

    const updatedStore = await db.Store.findOneAndUpdate(
      { owner: req.user.id },
      { name: name.trim(), description: description ? description.trim() : '' }
    );

    return res.status(200).json({
      success: true,
      message: 'Toko berhasil diperbarui',
      data: updatedStore
    });
  } catch (err) {
    return handleErrors(err, res);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const store = await db.Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan'
      });
    }

    const productCount = await db.Product.countDocuments({ store: store._id || store.id, isActive: true });

    return res.status(200).json({
      success: true,
      message: 'Informasi toko berhasil diambil',
      data: {
        ...store,
        productCount
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi toko',
      error: err.message
    });
  }
});

export default router;
