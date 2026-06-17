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
    });
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center text-gray-400 py-20">No conversations yet.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => {
            const otherId = c.participantAId === user?.id ? c.participantBId : c.participantAId;
            const other = users[otherId];
            return (
              <Link
                key={c.id}
                to={`/conversations/${c.id}`}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow"
              >
                {other?.photo ? (
                  <img src={other.photo} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                    {other?.name?.[0] ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm">{other?.name ?? 'User'}</div>
                  {c.lastMessage && (
                    <div className="text-xs text-gray-400 truncate">{c.lastMessage.body}</div>
                  )}
                </div>
                {c.lastMessage && (
                  <div className="text-xs text-gray-300 flex-shrink-0">
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
