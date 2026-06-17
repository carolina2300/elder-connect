import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Message, User } from '../types';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<User | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    const { data } = await api.get(`/api/conversations/${id}/messages`);
    setMessages(data);
  }

  useEffect(() => {
    api.get('/api/conversations').then(({ data }) => {
      const conv = data.find((c: { id: string; participantAId: string; participantBId: string }) => c.id === id);
      if (!conv) { navigate('/conversations'); return; }
      const otherId = conv.participantAId === user?.id ? conv.participantBId : conv.participantAId;
      if (otherId) api.get(`/api/users/${otherId}`).then((r) => setOther(r.data));
    });

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/conversations/${id}/messages`, { body: body.trim() });
      setBody('');
      await fetchMessages();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/conversations')}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ←
        </button>
        {other?.photo ? (
          <img src={other.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
            {other?.name?.[0] ?? '?'}
          </div>
        )}
        <span className="font-semibold text-gray-800">{other?.name ?? 'Chat'}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 py-2">
        {messages.map((m) => {
          const isMe = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p>{m.body}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
