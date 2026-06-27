import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRelativeTime } from '../utils/dateHelper';
import "../styles/ReviewPage.css";

const API_URL = 'http://localhost:5000/api';

interface Review {
  _id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const ReviewPage: React.FC = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.username || '');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const [errors, setErrors] = useState<{ name?: string; rating?: string; comment?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.username);
    }
  }, [user?.username]);

  const fetchReviews = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${API_URL}/reviews`, { signal });
      if (!res.ok) throw new Error('Gagal mengambil data ulasan');
      const data = await res.json();
      setReviews(data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchReviews]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    if (!name.trim()) {
      tempErrors.name = 'Nama pengulas tidak boleh kosong';
    }
    if (rating === 0) {
      tempErrors.rating = 'Silakan pilih rating bintang Anda';
    }
    if (comment.trim().length < 10) {
      tempErrors.comment = 'Komentar minimal harus 10 karakter';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: name.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirimkan ulasan');
      }

      setSubmitSuccess(true);

      fetchReviews();

      resetTimerRef.current = setTimeout(() => {
        setSubmitSuccess(false);
        setRating(0);
        setComment('');
        if (!user) setName('');
      }, 2000);

    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan sistem. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarStyle = (reviewerName: string) => {
    const bgColors = ['#e0f2fe', '#f0fdf4', '#fff7ed', '#fff1f2', '#eef2ff', '#f5f5f7'];
    const textColors = ['#0369a1', '#15803d', '#c2410c', '#be123c', '#4f46e5', '#404040'];
    let hash = 0;
    for (let i = 0; i < reviewerName.length; i++) {
      hash = reviewerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % bgColors.length;
    return {
      backgroundColor: bgColors[idx],
      color: textColors[idx],
    };
  };

  return (
    <div className="review-page-container">
      <div className="review-page-content">
        <header className="review-page-header">
          <span className="review-badge">★ Ulasan Pengguna</span>
          <h1 className="review-main-title">Ceritakan pengalamanmu dengan SEAPEDIA</h1>
          <p className="review-sub-title">
            Ulasan ini ditujukan untuk membagikan pengalaman Anda selama menjelajahi platform SEAPEDIA, bukan mengenai produk atau transaksi tertentu.
          </p>
          <p className="review-clarification">
            Tamu dan pengguna terdaftar sama-sama bisa mengirim ulasan.
          </p>
        </header>

        <div className="review-grid-layout">
          <div className="review-col-form">
            <form onSubmit={handleSubmit} className="review-form-element">
              <div className="review-form-group">
                <label className="review-form-label">Nama Anda</label>
                <input
                  type="text"
                  className={`review-form-input ${errors.name ? 'review-form-input--error' : ''}`}
                  placeholder="Nama pengulas"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  disabled={user !== null}
                />
                {errors.name && <span className="review-field-error">{errors.name}</span>}
              </div>

              <div className="review-form-group">
                <label className="review-form-label">Rating Aplikasi</label>
                <div className="star-selector-row">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      type="button"
                      key={starValue}
                      className="star-selector-button"
                      onClick={() => {
                        setRating(starValue);
                        if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
                      }}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${starValue} Bintang`}
                    >
                      <span
                        className={`star-char ${
                          (hoverRating || rating) >= starValue ? 'star-char--active' : ''
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                {errors.rating && <span className="review-field-error">{errors.rating}</span>}
              </div>

              <div className="review-form-group">
                <label className="review-form-label">Komentar / Masukan</label>
                <textarea
                  rows={4}
                  className={`review-form-input review-form-textarea ${
                    errors.comment ? 'review-form-input--error' : ''
                  }`}
                  placeholder="Tulis ulasan pengalaman Anda menggunakan platform SEAPEDIA di sini..."
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }));
                  }}
                />
                {errors.comment && <span className="review-field-error">{errors.comment}</span>}
              </div>

              <button
                type="submit"
                className="btn-review-submit-page"
                disabled={isSubmitting || submitSuccess}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin-slow" /> Mengirimkan...
                  </>
                ) : (
                  'Kirim Ulasan'
                )}
              </button>

              <div className={`success-banner-inline ${submitSuccess ? 'success-banner-inline--show' : ''}`}>
                <CheckCircle size={18} />
                <span>Ulasan kamu berhasil dikirim!</span>
              </div>

              {submitError && (
                <div className="error-banner-inline">
                  <AlertTriangle size={18} />
                  <span>{submitError}</span>
                </div>
              )}
            </form>
          </div>

          <div className="review-col-list">
            <h3 className="review-list-heading">Semua Masukan Pengguna ({reviews.length})</h3>

            {isLoadingReviews ? (
              <div className="review-skeleton-list">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="review-skeleton-row">
                    <div className="review-skeleton-avatar" />
                    <div className="review-skeleton-body">
                      <div className="review-skeleton-title" />
                      <div className="review-skeleton-text" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="review-empty-state">
                <svg
                  className="review-empty-star"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p>Belum ada ulasan. Jadilah yang pertama!</p>
              </div>
            ) : (
              <div className="review-list-rows">
                {reviews.map((rev) => {
                  const avatarColor = getAvatarStyle(rev.reviewerName);
                  return (
                    <article key={rev._id} className="review-row-item">
                      <div className="review-row-avatar" style={avatarColor}>
                        {rev.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="review-row-content">
                        <header className="review-row-header">
                          <span className="review-row-name">{rev.reviewerName}</span>
                          <span className="review-row-date">
                            {getRelativeTime(rev.createdAt)}
                          </span>
                        </header>

                        <div className="review-row-stars" aria-label={`Rating: ${rev.rating} dari 5`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star-item-char ${star <= rev.rating ? 'star-item-char--active' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        <p className="review-row-comment">
                          {rev.comment}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
