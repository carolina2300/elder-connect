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
    try {
      const { data } = await api.get(`/api/conversations/${id}/messages`);
      setMessages(data);
    } catch {
      // polling will retry
    }
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
    <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col h-full font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e4eee7]">
        <button
          onClick={() => navigate('/conversations')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#4f6258] hover:bg-[#eef5ef] transition-colors"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        {other?.photo ? (
          <img src={other.photo} className="w-9 h-9 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#dcecdf] flex items-center justify-center text-[#3f8c5f] font-bold text-sm">
            {other?.name?.[0] ?? '?'}
          </div>
        )}
        <span className="font-bold text-[#1d3327]">{other?.name ?? 'Chat'}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 py-2">
        {messages.map((m) => {
          const isMe = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-[#4a9d72] text-white rounded-br-md'
                    : 'bg-white border border-[#e4eee7] text-[#2f4339] rounded-bl-md'
                }`}
              >
                <p className="leading-relaxed">{m.body}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-[#cde6d8]' : 'text-[#9bb0a4]'}`}>
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
          className="flex-1 bg-white border border-[#e4eee7] rounded-full px-4 py-2.5 text-sm text-[#1d3327] placeholder:text-[#9bb0a4] focus:outline-none focus:ring-2 focus:ring-[#4a9d72] focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="bg-[#4a9d72] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#41895f] transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
