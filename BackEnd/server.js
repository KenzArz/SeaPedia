import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/reviews.js';
import storeRoutes from './routes/stores.js';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('API Seapedia berjalan lancar!');
});

app.listen(PORT, () => {
  console.log(`Server Express Seapedia berjalan di port ${PORT}`);
});
