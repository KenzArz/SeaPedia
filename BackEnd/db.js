import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const localDbPath = path.resolve('local_db.json');

// Ensure local JSON DB file exists
const initializeLocalDb = () => {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ users: [], reviews: [] }, null, 2), 'utf-8');
  }
};

initializeLocalDb();

const readLocalDb = () => {
  try {
    const data = fs.readFileSync(localDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], reviews: [] };
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
  activeRole: { type: String, default: 'Buyer' }
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
  }
};
