import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk wajib diisi'],
    trim: true,
    minlength: [2, 'Nama produk minimal 2 karakter'],
    maxlength: [200, 'Nama produk maksimal 200 karakter']
  },
  description: {
    type: String,
    required: [true, 'Deskripsi produk wajib diisi'],
    trim: true,
    maxlength: [2000, 'Deskripsi maksimal 2000 karakter']
  },
  price: {
    type: Number,
    required: [true, 'Harga wajib diisi'],
    min: [0, 'Harga tidak boleh negatif']
  },
  stock: {
    type: Number,
    required: [true, 'Stok wajib diisi'],
    min: [0, 'Stok tidak boleh negatif'],
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index untuk performa query
productSchema.index({ store: 1 });
productSchema.index({ owner: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
