import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Post, PostKind, Qualification } from '../types';

const QUALIFICATION_LABELS: Record<Qualification, string> = {
  HOUSE_CLEANING: 'House Cleaning',
  PERSONAL_HYGIENE: 'Personal Hygiene',
  COMPANION: 'Companion',
  DEMENTIA_CARE: 'Dementia Care',
  SENIOR_TRANSPORTATION: 'Transportation',
  ASSISTED_LIVING: 'Assisted Living',
  POST_SURGERY: 'Post-Surgery',
};

function priceLabel(post: Post) {
  const min = (post.priceRange.minCents / 100).toFixed(0);
  const max = (post.priceRange.maxCents / 100).toFixed(0);
  const unit = post.priceRange.unit.replace('PER_', '/').toLowerCase();
  return `€${min}–€${max} ${unit}`;
}

function PostCard({ post }: { post: Post }) {
  const qualifications =
    post.kind === 'CAREGIVER' ? post.offeredQualifications : post.requiredQualifications;

  return (
    <Link
      to={`/posts/${post.id}`}
      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            post.kind === 'CAREGIVER'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {post.kind === 'CAREGIVER' ? 'Caregiver' : 'Seeking Care'}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-gray-700 line-clamp-2">{post.description}</p>

      <div className="text-xs text-gray-500">
        📍 {post.location.freguesia}, {post.location.concelho}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-emerald-700">{priceLabel(post)}</span>
        {qualifications && qualifications.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {qualifications.slice(0, 2).map((q) => (
              <span key={q} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {QUALIFICATION_LABELS[q]}
              </span>
            ))}
            {qualifications.length > 2 && (
              <span className="text-xs text-gray-400">+{qualifications.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const kindFilter = searchParams.get('kind') as PostKind | null;
  const authorFilter = searchParams.get('author');

  useEffect(() => {
    setLoading(true);
    api.get('/api/posts').then(({ data }) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const filtered = posts.filter((p) => {
    if (kindFilter && p.kind !== kindFilter) return false;
    if (authorFilter === 'me' && p.authorId !== user?.id) return false;
    return true;
  });

  function setKind(kind: PostKind | null) {
    const next = new URLSearchParams(searchParams);
    if (kind) next.set('kind', kind);
    else next.delete('kind');
    next.delete('author');
    setSearchParams(next);
  }

  const isMyPosts = authorFilter === 'me';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isMyPosts ? 'My Posts' : 'Care Feed'}
        </h1>
        <button
          onClick={() => navigate('/posts/create')}
          className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
        >
          {user?.userType === 'CARE_GIVER' ? '+ Offer Services' : '+ Post Care Need'}
        </button>
      </div>

      {!isMyPosts && (
        <div className="flex gap-2 mb-6">
          {(['all', 'CAREGIVER', 'CARETAKER'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k === 'all' ? null : k)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                (k === 'all' && !kindFilter) || kindFilter === k
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {k === 'all' ? 'All' : k === 'CAREGIVER' ? 'Caregivers' : 'Seeking Care'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-20">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-20">No posts found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
