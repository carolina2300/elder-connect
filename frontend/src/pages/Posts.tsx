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
      className="bg-white border border-[#e4eee7] rounded-3xl p-6 hover:shadow-[0_10px_30px_rgba(74,157,114,0.12)] transition-shadow flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            post.kind === 'CAREGIVER'
              ? 'bg-[#dcecdf] text-[#3f8c5f]'
              : 'bg-[#e2ecf3] text-[#3f6f9c]'
          }`}
        >
          {post.kind === 'CAREGIVER' ? 'Caregiver' : 'Seeking Care'}
        </span>
        <span className="text-xs text-[#9bb0a4]">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-[#2f4339] line-clamp-2 leading-relaxed">{post.description}</p>

      <div className="text-xs text-[#4f6258] flex items-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="#7fa890" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M12 21s-7-6.3-7-11a7 7 0 1114 0c0 4.7-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        {post.location.freguesia}, {post.location.concelho}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#3f8c5f]">{priceLabel(post)}</span>
        {qualifications && qualifications.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {qualifications.slice(0, 2).map((q) => (
              <span key={q} className="text-xs bg-[#eef5ef] text-[#4f6258] font-medium px-3 py-1 rounded-full">
                {QUALIFICATION_LABELS[q]}
              </span>
            ))}
            {qualifications.length > 2 && (
              <span className="text-xs text-[#9bb0a4]">+{qualifications.length - 2}</span>
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
  const [fetchError, setFetchError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const kindFilter = searchParams.get('kind') as PostKind | null;
  const authorFilter = searchParams.get('author');

  useEffect(() => {
    setLoading(true);
    setFetchError('');
    api.get('/api/posts').then(({ data }) => {
      setPosts(data);
      setLoading(false);
    }).catch(() => {
      setFetchError('Failed to load posts. Please try again.');
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
    <div className="max-w-4xl mx-auto px-6 py-10 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-[#1d3327] tracking-tight">
          {isMyPosts ? 'My Posts' : 'Care Feed'}
        </h1>
        <button
          onClick={() => navigate('/posts/create')}
          className="bg-[#4a9d72] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#41895f] transition-colors"
        >
          {user?.userType === 'CARE_GIVER' ? '+ Offer Services' : '+ Post Care Need'}
        </button>
      </div>

      {!isMyPosts && (
        <div className="flex gap-2 mb-8">
          {(['all', 'CAREGIVER', 'CARETAKER'] as const).map((k) => {
            const active = (k === 'all' && !kindFilter) || kindFilter === k;
            return (
              <button
                key={k}
                onClick={() => setKind(k === 'all' ? null : k)}
                className={`text-sm px-4 py-1.5 rounded-full font-semibold transition-colors ${
                  active
                    ? 'bg-[#4a9d72] text-white'
                    : 'bg-white text-[#4f6258] border border-[#e4eee7] hover:bg-[#f3f9f4]'
                }`}
              >
                {k === 'all' ? 'All' : k === 'CAREGIVER' ? 'Caregivers' : 'Seeking Care'}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="text-center text-[#7fa890] py-20">Loading…</div>
      ) : fetchError ? (
        <div className="text-center text-[#b3493a] py-20">{fetchError}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-[#7fa890] py-20">No posts found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
