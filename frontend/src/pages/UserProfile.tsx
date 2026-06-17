import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { User, Review } from '../types';

function StarRating({ rating, size = 'text-base' }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          viewBox="0 0 24 24"
          className={`${size === 'text-base' ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${s <= rating ? 'fill-[#e0a93a]' : 'fill-[#dde7e0]'}`}
        >
          <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.7L12 17.8 5.9 20.9l1.5-6.7L2.2 9.6l6.9-.7z" />
        </svg>
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
    try {
      const { data } = await api.post(`/api/conversations?with=${id}`);
      navigate(`/conversations/${data.id}`);
    } catch {
      alert('Could not start conversation. Please try again.');
    }
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

  if (loading) return <div className="text-center py-20 text-[#7fa890] font-['Plus_Jakarta_Sans',sans-serif]">Loading…</div>;
  if (!profile) return null;

  const isOwnProfile = currentUser?.id === profile.id;
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 font-['Plus_Jakarta_Sans',sans-serif]">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-semibold text-[#4f6258] hover:text-[#234034] mb-6 flex items-center gap-1.5 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-3xl border border-[#e4eee7] p-6 mb-6">
        <div className="flex items-start gap-4">
          {profile.photo ? (
            <img src={profile.photo} className="w-20 h-20 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#dcecdf] flex items-center justify-center text-[#3f8c5f] text-3xl font-extrabold flex-shrink-0">
              {profile.name[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-[#1d3327]">{profile.name}</h1>
            <div className="text-sm text-[#7fa890] mb-1.5">
              {profile.userType === 'CARE_GIVER' ? 'Caregiver' : 'Care Seeker'}
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-sm text-[#4f6258]">
                  {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleContact}
              className="bg-[#4a9d72] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#41895f] transition-colors"
            >
              Message
            </button>
          )}
        </div>

        {profile.description && (
          <p className="text-sm text-[#2f4339] leading-relaxed mt-4">{profile.description}</p>
        )}
        {profile.phoneNumber && (
          <p className="text-sm text-[#7fa890] mt-2 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />
            </svg>
            {profile.phoneNumber}
          </p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-[#1d3327] mb-4">Reviews</h2>

        {!isOwnProfile && (
          <form onSubmit={handleReview} className="bg-white rounded-3xl border border-[#e4eee7] p-5 mb-4 flex flex-col gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${s} star${s !== 1 ? 's' : ''}`}
                >
                  <svg viewBox="0 0 24 24" className={`w-7 h-7 ${s <= reviewRating ? 'fill-[#e0a93a]' : 'fill-[#dde7e0]'}`}>
                    <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.7L12 17.8 5.9 20.9l1.5-6.7L2.2 9.6l6.9-.7z" />
                  </svg>
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a review…"
              className="w-full bg-white border border-[#e4eee7] rounded-xl px-3.5 py-2.5 text-sm text-[#1d3327] placeholder:text-[#9bb0a4] focus:outline-none focus:ring-2 focus:ring-[#4a9d72] focus:border-transparent transition"
            />
            {reviewError && (
              <p className="text-xs text-[#b3493a]">{reviewError}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !reviewText.trim()}
              className="self-end bg-[#4a9d72] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#41895f] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-[#7fa890]">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-[#e4eee7] rounded-3xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-[#9bb0a4]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.text && <p className="text-sm text-[#2f4339] leading-relaxed">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
