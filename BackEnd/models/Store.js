import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama toko wajib diisi'],
    unique: true,
    trim: true,
    minlength: [3, 'Nama toko minimal 3 karakter'],
    maxlength: [100, 'Nama toko maksimal 100 karakter']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Deskripsi maksimal 500 karakter'],
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// The unique: true constraint on 'owner' and 'name' fields automatically creates indexes.
// No additional manual index declarations are needed for owner and name.

const Store = mongoose.model('Store', storeSchema);
export default Store;
