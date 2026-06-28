import express from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import { verifyProductOwner } from '../middleware/ownershipCheck.js';

const router = express.Router();

router.post('/', authMiddleware, requireRole('Seller'), async (req, res) => {
  const { name, description, price, stock, image } = req.body;

  try {
    const store = await db.Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(400).json({
        success: false,
        message: 'Kamu harus membuat toko terlebih dahulu'
      });
    }

    if (!name || name.trim().length < 2 || name.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Nama produk wajib diisi (minimal 2 karakter, maksimal 200 karakter)'
      });
    }

    if (!description || description.trim() === '' || description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Deskripsi produk wajib diisi (maksimal 2000 karakter)'
      });
    }

    if (price === undefined || price === null || isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Harga wajib diisi dan tidak boleh bernilai negatif'
      });
    }

    if (stock === undefined || stock === null || isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stok wajib diisi dan tidak boleh bernilai negatif'
      });
    }

    const newProduct = await db.Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      image: image ? image.trim() : '',
      store: store._id || store.id,
      owner: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: newProduct
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk',
      error: err.message
    });
  }
});

router.get('/my-products', authMiddleware, requireRole('Seller'), async (req, res) => {
  try {
    const products = await db.Product.find({ owner: req.user.id, isActive: true });
    return res.status(200).json({
      success: true,
      message: 'Daftar produk Anda berhasil diambil',
      data: products
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar produk',
      error: err.message
    });
  }
});

router.put('/:id', authMiddleware, requireRole('Seller'), verifyProductOwner, async (req, res) => {
  const { name, description, price, stock, image } = req.body;

  if (name !== undefined && (name.trim().length < 2 || name.trim().length > 200)) {
    return res.status(400).json({
      success: false,
      message: 'Nama produk minimal 2 karakter dan maksimal 200 karakter'
    });
  }

  if (description !== undefined && (description.trim() === '' || description.trim().length > 2000)) {
    return res.status(400).json({
      success: false,
      message: 'Deskripsi produk tidak boleh kosong (maksimal 2000 karakter)'
    });
  }

  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Harga tidak boleh bernilai negatif'
    });
  }

  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Stok tidak boleh bernilai negatif'
    });
  }

  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (image !== undefined) updateData.image = image.trim();

    const updatedProduct = await db.Product.findByIdAndUpdate(req.params.id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil diperbarui',
      data: updatedProduct
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui produk',
      error: err.message
    });
  }
});

router.delete('/:id', authMiddleware, requireRole('Seller'), verifyProductOwner, async (req, res) => {
  try {
    await db.Product.findByIdAndUpdate(req.params.id, { isActive: false });

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk',
      error: err.message
    });
  }
});

router.get('/', async (req, res) => {
  const search = req.query.search || '';
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;

  try {
    const result = await db.Product.findWithPagination(
      { isActive: true },
      { search, page, limit }
    );

    return res.status(200).json({
      success: true,
      message: 'Katalog produk berhasil diambil',
      data: result.products,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil katalog produk',
      error: err.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await db.Product.findById(req.params.id);
    if (!product || product.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail produk berhasil diambil',
      data: product
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail produk',
      error: err.message
    });
  }
});

export default router;
