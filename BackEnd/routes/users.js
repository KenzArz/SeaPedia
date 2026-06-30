import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
//  Helper: shape a user document into a safe public response
//  (never expose password or internal Mongoose fields)
// ─────────────────────────────────────────────────────────────
const safeUser = (user) => ({
  id:              user._id || user.id,
  username:        user.username,
  roles:           user.roles,
  activeRole:      user.activeRole,
  profilePhoto:    user.profilePhoto    ?? '',
  fullName:        user.fullName        ?? '',
  dateOfBirth:     user.dateOfBirth     ?? null,
  gender:          user.gender          ?? 'Prefer not to say',
  phoneNumber:     user.phoneNumber     ?? '',
  isEmailVerified: user.isEmailVerified ?? false,
});

// ─────────────────────────────────────────────────────────────
//  GET /api/users/me  — return current user's full profile
// ─────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.User.findOne({ _id: req.user.id });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    res.json({ success: true, data: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/users/me/roles  — return roles + activeRole only
//  Satisfies Level 1 requirement: "Return the list of roles
//  owned by the logged-in user"
// ─────────────────────────────────────────────────────────────
router.get('/me/roles', authMiddleware, async (req, res) => {
  try {
    const user = await db.User.findOne({ _id: req.user.id });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    res.json({
      success: true,
      data: {
        roles:      user.roles,
        activeRole: user.activeRole,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// ─────────────────────────────────────────────────────────────
//  PUT /api/users/me  — update profile bio fields only
//  Allowed: fullName, dateOfBirth, gender, phoneNumber
//  Blocked: username, password, roles, activeRole, email
// ─────────────────────────────────────────────────────────────
router.put('/me', authMiddleware, async (req, res) => {
  const { fullName, dateOfBirth, gender, phoneNumber } = req.body;

  // Validation
  if (fullName !== undefined) {
    if (typeof fullName !== 'string' || fullName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong' });
    }
    if (fullName.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Nama maksimal 100 karakter' });
    }
  }

  if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== '') {
    const parsed = new Date(dateOfBirth);
    if (isNaN(parsed.getTime())) {
      return res.status(400).json({ success: false, message: 'Format tanggal lahir tidak valid' });
    }
    if (parsed > new Date()) {
      return res.status(400).json({ success: false, message: 'Tanggal lahir tidak boleh di masa depan' });
    }
  }

  const VALID_GENDERS = ['Male', 'Female', 'Prefer not to say'];
  if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
    return res.status(400).json({ success: false, message: `Gender harus salah satu dari: ${VALID_GENDERS.join(', ')}` });
  }

  if (phoneNumber !== undefined && phoneNumber !== '') {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      return res.status(400).json({ success: false, message: 'Nomor telepon harus berupa 10–15 digit angka' });
    }
  }

  try {
    const patch = {};
    if (fullName    !== undefined) patch.fullName    = fullName.trim();
    if (dateOfBirth !== undefined) patch.dateOfBirth = dateOfBirth || null;
    if (gender      !== undefined) patch.gender      = gender;
    if (phoneNumber !== undefined) patch.phoneNumber = phoneNumber.trim();

    const updated = await db.User.updateProfile(req.user.id, patch);
    if (!updated) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    res.json({ success: true, data: safeUser(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat menyimpan profil' });
  }
});

// ─────────────────────────────────────────────────────────────
//  PUT /api/users/me/photo  — update profile photo
//
//  Accepts { photoUrl: string } — either:
//    • a public HTTPS URL  ("https://example.com/photo.jpg")
//    • a base64 data URI   ("data:image/jpeg;base64,...")
//
//  Trade-off note (base64 vs URL):
//    Base64 → no external storage needed, works offline, but adds ~33% size
//             overhead per document and is not suited for large files at scale.
//    URL    → lightweight, fast, but requires external hosting.
//  We accept both here so the frontend can use whichever is appropriate.
//  Max accepted size for base64: 7 MB raw string (~5 MB image after overhead).
// ─────────────────────────────────────────────────────────────
router.put('/me/photo', authMiddleware, async (req, res) => {
  const { photoUrl } = req.body;

  if (!photoUrl || typeof photoUrl !== 'string') {
    return res.status(400).json({ success: false, message: 'photoUrl wajib diisi' });
  }

  const isDataUri  = photoUrl.startsWith('data:image/');
  const isHttpUrl  = photoUrl.startsWith('http://') || photoUrl.startsWith('https://');

  if (!isDataUri && !isHttpUrl) {
    return res.status(400).json({ success: false, message: 'photoUrl harus berupa URL gambar atau data URI base64 yang valid' });
  }

  // Guard against absurdly large payloads (> ~7 MB string = ~5 MB image)
  if (photoUrl.length > 7 * 1024 * 1024) {
    return res.status(413).json({ success: false, message: 'Ukuran foto terlalu besar (maks 5 MB)' });
  }

  try {
    const updated = await db.User.updatePhoto(req.user.id, photoUrl);
    if (!updated) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    res.json({ success: true, data: safeUser(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat menyimpan foto' });
  }
});

export default router;
