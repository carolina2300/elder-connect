import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Post, User, Qualification } from '../types';

const QUALIFICATION_LABELS: Record<Qualification, string> = {
  HOUSE_CLEANING: 'House Cleaning',
  PERSONAL_HYGIENE: 'Personal Hygiene',
  COMPANION: 'Companion',
  DEMENTIA_CARE: 'Dementia Care',
  SENIOR_TRANSPORTATION: 'Transportation',
  ASSISTED_LIVING: 'Assisted Living',
  POST_SURGERY: 'Post-Surgery',
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: post } = await api.get(`/api/posts/${id}`);
        setPost(post);
        if (post.authorId) {
          const { data: author } = await api.get(`/api/users/${post.authorId}`);
          setAuthor(author);
        }
        setLoading(false);
      } catch {
        navigate('/posts');
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!post) return;
    setDeleting(true);
    try {
      await api.delete(`/api/posts/${post.id}`);
      navigate('/posts');
    } finally {
      setDeleting(false);
    }
  }

  async function handleContact() {
    if (!author) return;
    try {
      const { data } = await api.post(`/api/conversations?with=${author.id}`);
      navigate(`/conversations/${data.id}`);
    } catch {
      alert('Could not start conversation. Please try again.');
    }
  }

  if (loading) return <div className="text-center py-20 text-[#7fa890] font-['Plus_Jakarta_Sans',sans-serif]">Loading…</div>;
  if (!post) return null;

  const qualifications =
    post.kind === 'CAREGIVER' ? post.offeredQualifications : post.requiredQualifications;
  const isOwner = user?.id === post.authorId;
  const priceMin = (post.priceRange.minCents / 100).toFixed(0);
  const priceMax = (post.priceRange.maxCents / 100).toFixed(0);
  const priceUnit = post.priceRange.unit.replace('PER_', '/').toLowerCase();

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

      <div className="bg-white rounded-3xl border border-[#e4eee7] p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              post.kind === 'CAREGIVER'
                ? 'bg-[#dcecdf] text-[#3f8c5f]'
                : 'bg-[#e2ecf3] text-[#3f6f9c]'
            }`}
          >
            {post.kind === 'CAREGIVER' ? 'Caregiver Offer' : 'Seeking Care'}
          </span>
          <span className="text-xs text-[#9bb0a4]">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-[#2f4339] leading-relaxed">{post.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-[#eef5ef] rounded-2xl p-4">
            <div className="text-xs text-[#7fa890] mb-1">Location</div>
            <div className="font-bold text-[#234034]">
              {post.location.freguesia}, {post.location.concelho}
            </div>
            <div className="text-[#4f6258]">{post.location.distrito}</div>
          </div>
          <div className="bg-[#eef5ef] rounded-2xl p-4">
            <div className="text-xs text-[#7fa890] mb-1">Price</div>
            <div className="font-bold text-[#3f8c5f]">
              €{priceMin}–€{priceMax} {priceUnit}
            </div>
          </div>
          <div className="bg-[#eef5ef] rounded-2xl p-4">
            <div className="text-xs text-[#7fa890] mb-1">Duration</div>
            <div className="font-bold text-[#234034]">
              {post.duration.amount} {post.duration.unit.toLowerCase()}(s)
            </div>
          </div>
          {post.kind === 'CARETAKER' && post.startDate && (
            <div className="bg-[#eef5ef] rounded-2xl p-4">
              <div className="text-xs text-[#7fa890] mb-1">Period</div>
              <div className="font-bold text-[#234034]">
                {post.startDate} → {post.endDate}
              </div>
            </div>
          )}
          {post.kind === 'CAREGIVER' && post.earliestStartDate && (
            <div className="bg-[#eef5ef] rounded-2xl p-4">
              <div className="text-xs text-[#7fa890] mb-1">Available from</div>
              <div className="font-bold text-[#234034]">{post.earliestStartDate}</div>
            </div>
          )}
        </div>

        {qualifications && qualifications.length > 0 && (
          <div>
            <div className="text-xs text-[#7fa890] mb-2">
              {post.kind === 'CAREGIVER' ? 'Services offered' : 'Services needed'}
            </div>
            <div className="flex flex-wrap gap-2">
              {qualifications.map((q) => (
                <span key={q} className="text-xs bg-[#dcecdf] text-[#3f8c5f] px-3 py-1 rounded-full font-semibold">
                  {QUALIFICATION_LABELS[q]}
                </span>
              ))}
            </div>
          </div>
        )}

        {author && (
          <Link
            to={`/users/${author.id}`}
            className="flex items-center gap-3 border-t border-[#e4eee7] pt-4 hover:bg-[#eef5ef] rounded-2xl p-3 -mx-3 transition-colors"
          >
            {author.photo ? (
              <img src={author.photo} className="w-11 h-11 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#dcecdf] flex items-center justify-center text-[#3f8c5f] font-bold">
                {author.name[0]}
              </div>
            )}
            <div>
              <div className="font-bold text-[#234034] text-sm">{author.name}</div>
              <div className="text-xs text-[#7fa890]">View profile →</div>
            </div>
          </Link>
        )}

        <div className="flex gap-3 pt-2">
          {!isOwner && (
            <button
              onClick={handleContact}
              className="flex-1 bg-[#4a9d72] text-white py-3 rounded-full font-bold text-sm hover:bg-[#41895f] transition-colors"
            >
              Contact
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 border border-[#e8c4be] text-[#b3493a] py-3 rounded-full font-bold text-sm hover:bg-[#fbe9e7] transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete Post'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
