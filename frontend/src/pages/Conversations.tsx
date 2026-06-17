import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Conversation, User } from '../types';

export default function Conversations() {
  const user = useAuthStore((s) => s.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/conversations').then(async ({ data }) => {
      setConversations(data);

      const otherIds = [
        ...new Set(
          data.map((c: Conversation) =>
            c.participantAId === user?.id ? c.participantBId : c.participantAId
          )
        ),
      ] as string[];

      const userEntries = await Promise.all(
        otherIds.map((id) => api.get(`/api/users/${id}`).then((r) => [id, r.data] as const))
      );
      setUsers(Object.fromEntries(userEntries));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-[#7fa890] font-['Plus_Jakarta_Sans',sans-serif]">Loading…</div>;

  return (
    <div className="max-w-xl mx-auto px-6 py-10 font-['Plus_Jakarta_Sans',sans-serif]">
      <h1 className="text-2xl font-extrabold text-[#1d3327] tracking-tight mb-8">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center text-[#7fa890] py-20">No conversations yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((c) => {
            const otherId = c.participantAId === user?.id ? c.participantBId : c.participantAId;
            const other = users[otherId];
            return (
              <Link
                key={c.id}
                to={`/conversations/${c.id}`}
                className="flex items-center gap-4 bg-white border border-[#e4eee7] rounded-3xl p-5 hover:shadow-[0_10px_30px_rgba(74,157,114,0.12)] transition-shadow"
              >
                {other?.photo ? (
                  <img src={other.photo} className="w-11 h-11 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#dcecdf] flex items-center justify-center text-[#3f8c5f] font-bold flex-shrink-0">
                    {other?.name?.[0] ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#1d3327] text-sm">{other?.name ?? 'User'}</div>
                  {c.lastMessage && (
                    <div className="text-xs text-[#7fa890] truncate mt-0.5">{c.lastMessage.body}</div>
                  )}
                </div>
                {c.lastMessage && (
                  <div className="text-xs text-[#9bb0a4] flex-shrink-0">
                    {new Date(c.lastMessage.sentAt).toLocaleDateString()}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
