import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { User, Review } from '../types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/api/users/${id}`),
      api.get(`/api/users/${id}/reviews`),
    ]).then(([userRes, reviewRes]) => {
      setProfile(userRes.data);
      setReviews(reviewRes.data);
      setLoading(false);
    }).catch(() => navigate('/posts'));
  }, [id]);

  async function handleContact() {
    if (!id) return;
    const { data } = await api.post(`/api/conversations?with=${id}`);
    navigate(`/conversations/${data.id}`);
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/users/${id}/reviews`, {
        rating: reviewRating,
        text: reviewText,
      });
      setReviews((prev) => [data, ...prev]);
      setReviewText('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message ?? 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (!profile) return null;

  const isOwnProfile = currentUser?.id === profile.id;
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          {profile.photo ? (
            <img src={profile.photo} className="w-20 h-20 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-3xl font-bold flex-shrink-0">
              {profile.name[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
            <div className="text-sm text-gray-400 mb-1">
              {profile.userType === 'CARE_GIVER' ? '🩺 Caregiver' : '🧓 Care Seeker'}
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleContact}
              className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Message
            </button>
          )}
        </div>

        {profile.description && (
          <p className="text-sm text-gray-600 mt-4">{profile.description}</p>
        )}
        {profile.phoneNumber && (
          <p className="text-sm text-gray-400 mt-2">📞 {profile.phoneNumber}</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>

        {!isOwnProfile && (
          <form onSubmit={handleReview} className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-col gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className={`text-2xl transition-colors ${s <= reviewRating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a review…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {reviewError && (
              <p className="text-xs text-red-500">{reviewError}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !reviewText.trim()}
              className="self-end bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.text && <p className="text-sm text-gray-700">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
