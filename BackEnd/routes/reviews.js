import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { reviewerName, rating, comment } = req.body;

  if (!reviewerName || reviewerName.trim() === '') {
    return res.status(400).json({ message: 'Nama pengulas wajib diisi' });
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Rating harus berupa angka antara 1 dan 5' });
  }

  if (!comment || comment.trim() === '') {
    return res.status(400).json({ message: 'Komentar ulasan wajib diisi' });
  }

  try {
    const newReview = await db.Review.create({
      reviewerName: reviewerName.trim(),
      rating: numericRating,
      comment: comment.trim()
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengirimkan ulasan aplikasi' });
  }
});

router.get('/', async (req, res) => {
  try {
    const reviews = await db.Review.find();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil ulasan aplikasi' });
  }
});

export default router;
