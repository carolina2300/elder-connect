import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { UserType } from '../types';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserType>('CARE_SEEKER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/v1/auth/register', { name, email, password, role });
      setAuth(data.token, data.user);
      navigate('/posts');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-[#e4eee7] rounded-xl px-3.5 py-2.5 text-sm text-[#1d3327] placeholder:text-[#9bb0a4] focus:outline-none focus:ring-2 focus:ring-[#4a9d72] focus:border-transparent transition";

  const roleBtn = (active: boolean) =>
    `py-3 rounded-2xl text-sm font-bold border-2 transition-colors ${
      active
        ? 'border-[#4a9d72] bg-[#dcecdf] text-[#3f8c5f]'
        : 'border-[#e4eee7] bg-white text-[#7fa890] hover:border-[#bcd6c6]'
    }`;

  return (
    <div className="bg-[#eef5ef] min-h-screen px-4 py-20 flex items-start justify-center font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#4a9d72] flex items-center justify-center text-[#eaf5ee]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 21c0-6 3-10 8-11-1 6-4 9-8 11z" />
              <path d="M12 21c0-5-2-8-6-9 1 5 3 7 6 9z" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#234034]">ElderCare Connect</span>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(74,157,114,0.08)] border border-[#e4eee7] p-10">
          <h1 className="text-2xl font-extrabold text-[#1d3327] tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-[#7fa890] mb-6">Join the ElderCare community</p>

          {error && (
            <div className="bg-[#fbe9e7] text-[#b3493a] text-sm font-medium rounded-xl px-4 py-3 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole('CARE_SEEKER')} className={roleBtn(role === 'CARE_SEEKER')}>
                Seeking Care
              </button>
              <button type="button" onClick={() => setRole('CARE_GIVER')} className={roleBtn(role === 'CARE_GIVER')}>
                Offering Care
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Full name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#4a9d72] text-white py-3 rounded-full font-bold hover:bg-[#41895f] transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-[#4f6258] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3f8c5f] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
