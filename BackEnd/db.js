import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Store from './models/Store.js';
import Product from './models/Product.js';

const localDbPath = path.resolve('local_db.json');

// Ensure local JSON DB file exists
const initializeLocalDb = () => {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ users: [], reviews: [], stores: [], products: [] }, null, 2), 'utf-8');
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      let changed = false;
      if (!data.stores) {
        data.stores = [];
        changed = true;
      }
      if (!data.products) {
        data.products = [];
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (err) {
      // Ignore
    }
  }
};

initializeLocalDb();

const readLocalDb = () => {
  try {
    const data = fs.readFileSync(localDbPath, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      users: parsed.users || [],
      reviews: parsed.reviews || [],
      stores: parsed.stores || [],
      products: parsed.products || []
    };
  } catch (err) {
    return { users: [], reviews: [], stores: [], products: [] };
  }
};

const writeLocalDb = (data) => {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
};

let useLocalDb = false;

// Attempt to connect to MongoDB
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/seapedia';
  try {
    console.log(`Menghubungkan ke MongoDB di ${mongoUri}...`);
    // Connect with a 2-second timeout to prevent blocking startup
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('MongoDB terhubung sukses!');
    useLocalDb = false;
  } catch (err) {
    console.warn('\nGagal terhubung ke MongoDB:', err.message);
    console.warn('⚠️  BERALIH KE LOCAL JSON DATABASE FALLBACK (`local_db.json`)');
    console.warn('Aplikasi akan berjalan dalam mode "Works on Any Machine" tanpa MongoDB.\n');
    useLocalDb = true;
  }
};

// Define Mongoose User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: [String], default: ['Buyer'] },
  activeRole: { type: String, default: 'Buyer' },
  driverDetails: {
    fullName: { type: String },
    vehicleNumber: { type: String }
  },
  // ── Profile fields (added for Level 1 Personal Profile) ──
  // profilePhoto stores either a public URL or a base64 data URI.
  // Trade-off: base64 is simple (no storage infra needed) but inflates JSON/MongoDB
  // document size (~33% overhead). For Level 1 demo this is acceptable.
  // Real file upload (multer + cloud storage) can be swapped in later without
  // changing the API contract — the frontend always sends a string.
  profilePhoto: { type: String, default: '' },
  fullName:     { type: String, trim: true, default: '' },
  dateOfBirth:  { type: Date, default: null },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  phoneNumber:     { type: String, trim: true, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  createdAt:       { type: Date, default: Date.now }
});
const MongooseUser = mongoose.model('User', UserSchema);

// Define Mongoose Review Schema
const ReviewSchema = new mongoose.Schema({
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const MongooseReview = mongoose.model('Review', ReviewSchema);

// DB Helper Wrapper that delegates based on active database type
export const db = {
  User: {
    findOne: async (query) => {
      if (!useLocalDb) {
        return await MongooseUser.findOne(query);
      } else {
        const localData = readLocalDb();
        return localData.users.find(u => {
          return Object.keys(query).every(key => u[key] === query[key]);
        }) || null;
      }
    },
    create: async (userData) => {
      if (!useLocalDb) {
        return await MongooseUser.create(userData);
      } else {
        const localData = readLocalDb();
        const newUser = {
          _id: Math.random().toString(36).substring(2, 9),
          roles: ['Buyer'],
          activeRole: 'Buyer',
          createdAt: new Date().toISOString(),
          ...userData
        };
        // Check uniqueness of username
        if (localData.users.some(u => u.username === userData.username)) {
          throw new Error('Username sudah terdaftar');
        }
        localData.users.push(newUser);
        writeLocalDb(localData);
        return newUser;
      }
    },
    updateActiveRole: async (userId, activeRole) => {
      if (!useLocalDb) {
        return await MongooseUser.findByIdAndUpdate(userId, { activeRole }, { new: true });
      } else {
        const localData = readLocalDb();
        const user = localData.users.find(u => u._id === userId);
        if (user) {
          if (!user.roles.includes(activeRole)) {
            throw new Error('Peran tidak dimiliki oleh user');
          }
          user.activeRole = activeRole;
          writeLocalDb(localData);
        }
        return user;
      }
    },
    updateUser: async (userId, updateData) => {
      if (!useLocalDb) {
        return await MongooseUser.findByIdAndUpdate(userId, updateData, { new: true });
      } else {
        const localData = readLocalDb();
        const userIndex = localData.users.findIndex(u => u._id === userId);
        if (userIndex !== -1) {
          localData.users[userIndex] = {
            ...localData.users[userIndex],
            ...updateData
          };
          writeLocalDb(localData);
          return localData.users[userIndex];
        }
        return null;
      }
    },
    // Update profile fields (fullName, dateOfBirth, gender, phoneNumber).
    // Intentionally does NOT allow changing roles, activeRole, password, or username.
    updateProfile: async (userId, { fullName, dateOfBirth, gender, phoneNumber }) => {
      const patch = {};
      if (fullName   !== undefined) patch.fullName   = fullName;
      if (dateOfBirth !== undefined) patch.dateOfBirth = dateOfBirth;
      if (gender     !== undefined) patch.gender     = gender;
      if (phoneNumber !== undefined) patch.phoneNumber = phoneNumber;

      if (!useLocalDb) {
        return await MongooseUser.findByIdAndUpdate(userId, patch, { new: true });
      } else {
        const localData = readLocalDb();
        const idx = localData.users.findIndex(u => u._id === userId);
        if (idx === -1) return null;
        localData.users[idx] = { ...localData.users[idx], ...patch };
        writeLocalDb(localData);
        return localData.users[idx];
      }
    },
    // Update only the profilePhoto field (URL or base64 data URI).
    updatePhoto: async (userId, photoUrl) => {
      if (!useLocalDb) {
        return await MongooseUser.findByIdAndUpdate(userId, { profilePhoto: photoUrl }, { new: true });
      } else {
        const localData = readLocalDb();
        const idx = localData.users.findIndex(u => u._id === userId);
        if (idx === -1) return null;
        localData.users[idx].profilePhoto = photoUrl;
        writeLocalDb(localData);
        return localData.users[idx];
      }
    }
  },
  Review: {
    find: async () => {
      if (!useLocalDb) {
        return await MongooseReview.find().sort({ createdAt: -1 });
      } else {
        const localData = readLocalDb();
        return [...localData.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    },
    create: async (reviewData) => {
      if (!useLocalDb) {
        return await MongooseReview.create(reviewData);
      } else {
        const localData = readLocalDb();
        const newReview = {
          _id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
          ...reviewData
        };
        localData.reviews.push(newReview);
        writeLocalDb(localData);
        return newReview;
      }
    }
  },
  Store: {
    findOne: async (query) => {
      if (!useLocalDb) {
        return await Store.findOne(query).populate('owner', 'username').lean();
      } else {
        const localData = readLocalDb();
        const store = localData.stores.find(s => {
          return Object.keys(query).every(key => s[key] === query[key]);
        });
        if (!store) return null;
        const user = localData.users.find(u => u._id === store.owner);
        return {
          ...store,
          owner: user ? { _id: user._id, username: user.username } : null
        };
      }
    },
    create: async (storeData) => {
      if (!useLocalDb) {
        return await Store.create(storeData);
      } else {
        const localData = readLocalDb();
        const newStore = {
          _id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
          ...storeData
        };
        // Enforce uniqueness of name and owner
        if (localData.stores.some(s => s.name === storeData.name)) {
          const err = new Error('Nama toko sudah digunakan');
          err.code = 11000;
          throw err;
        }
        if (localData.stores.some(s => s.owner === storeData.owner)) {
          const err = new Error('Kamu sudah memiliki toko');
          err.code = 11000;
          throw err;
        }
        localData.stores.push(newStore);
        writeLocalDb(localData);
        return newStore;
      }
    },
    findOneAndUpdate: async (query, updateData, options = {}) => {
      if (!useLocalDb) {
        return await Store.findOneAndUpdate(query, updateData, { new: true, ...options }).populate('owner', 'username').lean();
      } else {
        const localData = readLocalDb();
        const storeIndex = localData.stores.findIndex(s => {
          return Object.keys(query).every(key => s[key] === query[key]);
        });
        if (storeIndex === -1) return null;
        
        // Enforce uniqueness of name if it's being updated
        if (updateData.name && updateData.name !== localData.stores[storeIndex].name) {
          if (localData.stores.some(s => s.name === updateData.name)) {
            const err = new Error('Nama toko sudah digunakan');
            err.code = 11000;
            throw err;
          }
        }
        
        localData.stores[storeIndex] = {
          ...localData.stores[storeIndex],
          ...updateData
        };
        writeLocalDb(localData);
        
        const store = localData.stores[storeIndex];
        const user = localData.users.find(u => u._id === store.owner);
        return {
          ...store,
          owner: user ? { _id: user._id, username: user.username } : null
        };
      }
    },
    findById: async (id) => {
      if (!useLocalDb) {
        return await Store.findById(id).populate('owner', 'username').lean();
      } else {
        const localData = readLocalDb();
        const store = localData.stores.find(s => s._id === id);
        if (!store) return null;
        const user = localData.users.find(u => u._id === store.owner);
        return {
          ...store,
          owner: user ? { _id: user._id, username: user.username } : null
        };
      }
    }
  },
  Product: {
    find: async (query) => {
      if (!useLocalDb) {
        return await Product.find(query).populate('store', 'name description').populate('owner', 'username').sort({ createdAt: -1 });
      } else {
        const localData = readLocalDb();
        let results = localData.products.filter(p => {
          return Object.keys(query).every(key => p[key] === query[key]);
        });
        
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return results.map(p => {
          const store = localData.stores.find(s => s._id === p.store);
          const user = localData.users.find(u => u._id === p.owner);
          return {
            ...p,
            store: store ? { _id: store._id, name: store.name, description: store.description } : null,
            owner: user ? { _id: user._id, username: user.username } : null
          };
        });
      }
    },
    findWithPagination: async (query, { search, page = 1, limit = 20 }) => {
      if (!useLocalDb) {
        const mQuery = { ...query };
        if (search) {
          mQuery.name = { $regex: search, $options: 'i' };
        }
        const total = await Product.countDocuments(mQuery);
        const products = await Product.find(mQuery)
          .populate('store', 'name description')
          .populate('owner', 'username')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        return { products, total, page, totalPages: Math.ceil(total / limit) };
      } else {
        const localData = readLocalDb();
        let results = localData.products.filter(p => {
          return Object.keys(query).every(key => p[key] === query[key]);
        });
        
        if (search) {
          const keyword = search.toLowerCase();
          results = results.filter(p => p.name.toLowerCase().includes(keyword));
        }
        
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const total = results.length;
        const startIdx = (page - 1) * limit;
        const paginated = results.slice(startIdx, startIdx + limit);
        
        const populated = paginated.map(p => {
          const store = localData.stores.find(s => s._id === p.store);
          const user = localData.users.find(u => u._id === p.owner);
          return {
            ...p,
            store: store ? { _id: store._id, name: store.name, description: store.description } : null,
            owner: user ? { _id: user._id, username: user.username } : null
          };
        });
        
        return { products: populated, total, page, totalPages: Math.ceil(total / limit) };
      }
    },
    findById: async (id) => {
      if (!useLocalDb) {
        return await Product.findById(id)
          .populate('store', 'name description owner')
          .populate('owner', 'username');
      } else {
        const localData = readLocalDb();
        const product = localData.products.find(p => p._id === id);
        if (!product) return null;
        const store = localData.stores.find(s => s._id === product.store);
        const user = localData.users.find(u => u._id === product.owner);
        
        let populatedStore = null;
        if (store) {
          const storeOwner = localData.users.find(u => u._id === store.owner);
          populatedStore = {
            _id: store._id,
            name: store.name,
            description: store.description,
            owner: storeOwner ? { _id: storeOwner._id, username: storeOwner.username } : store.owner
          };
        }
        
        return {
          ...product,
          store: populatedStore,
          owner: user ? { _id: user._id, username: user.username } : null
        };
      }
    },
    create: async (productData) => {
      if (!useLocalDb) {
        return await Product.create(productData);
      } else {
        const localData = readLocalDb();
        const newProduct = {
          _id: Math.random().toString(36).substring(2, 9),
          isActive: true,
          createdAt: new Date().toISOString(),
          ...productData
        };
        localData.products.push(newProduct);
        writeLocalDb(localData);
        return newProduct;
      }
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (!useLocalDb) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true });
      } else {
        const localData = readLocalDb();
        const idx = localData.products.findIndex(p => p._id === id);
        if (idx === -1) return null;
        localData.products[idx] = {
          ...localData.products[idx],
          ...updateData
        };
        writeLocalDb(localData);
        return localData.products[idx];
      }
    },
    countDocuments: async (query) => {
      if (!useLocalDb) {
        return await Product.countDocuments(query);
      } else {
        const localData = readLocalDb();
        return localData.products.filter(p => {
          return Object.keys(query).every(key => p[key] === query[key]);
        }).length;
      }
    }
  }
};
