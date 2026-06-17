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
    api.get(`/api/posts/${id}`).then(({ data }) => {
      setPost(data);
      return api.get(`/api/users/${data.authorId}`);
    }).then(({ data }) => {
      setAuthor(data);
      setLoading(false);
    }).catch(() => navigate('/posts'));
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
    const { data } = await api.post(`/api/conversations?with=${author.id}`);
    navigate(`/conversations/${data.id}`);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (!post) return null;

  const qualifications =
    post.kind === 'CAREGIVER' ? post.offeredQualifications : post.requiredQualifications;
  const isOwner = user?.id === post.authorId;
  const priceMin = (post.priceRange.minCents / 100).toFixed(0);
  const priceMax = (post.priceRange.maxCents / 100).toFixed(0);
  const priceUnit = post.priceRange.unit.replace('PER_', '/').toLowerCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              post.kind === 'CAREGIVER'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {post.kind === 'CAREGIVER' ? 'Caregiver Offer' : 'Seeking Care'}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-gray-700">{post.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1">Location</div>
            <div className="font-medium text-gray-800">
              {post.location.freguesia}, {post.location.concelho}
            </div>
            <div className="text-gray-500">{post.location.distrito}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1">Price</div>
            <div className="font-medium text-emerald-700">
              €{priceMin}–€{priceMax} {priceUnit}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1">Duration</div>
            <div className="font-medium text-gray-800">
              {post.duration.amount} {post.duration.unit.toLowerCase()}(s)
            </div>
          </div>
          {post.kind === 'CARETAKER' && post.startDate && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Period</div>
              <div className="font-medium text-gray-800">
                {post.startDate} → {post.endDate}
              </div>
            </div>
          )}
          {post.kind === 'CAREGIVER' && post.earliestStartDate && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Available from</div>
              <div className="font-medium text-gray-800">{post.earliestStartDate}</div>
            </div>
          )}
        </div>

        {qualifications && qualifications.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-2">
              {post.kind === 'CAREGIVER' ? 'Services offered' : 'Services needed'}
            </div>
            <div className="flex flex-wrap gap-2">
              {qualifications.map((q) => (
                <span key={q} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                  {QUALIFICATION_LABELS[q]}
                </span>
              ))}
            </div>
          </div>
        )}

        {author && (
          <Link
            to={`/users/${author.id}`}
            className="flex items-center gap-3 border-t border-gray-100 pt-4 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
          >
            {author.photo ? (
              <img src={author.photo} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {author.name[0]}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-800 text-sm">{author.name}</div>
              <div className="text-xs text-gray-400">View profile →</div>
            </div>
          </Link>
        )}

        <div className="flex gap-3 pt-2">
          {!isOwner && (
            <button
              onClick={handleContact}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              Contact
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 border border-red-200 text-red-500 py-2 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete Post'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
