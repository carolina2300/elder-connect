import { useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);

  const [name, setName] = useState(user?.name ?? '');
  const [description, setDescription] = useState(user?.description ?? '');
  const [photo, setPhoto] = useState(user?.photo ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const { data } = await api.patch(`/api/users/${user?.id}`, {
        name, description, photo, phoneNumber,
      });
      if (token) setAuth(token, data);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-[#e4eee7] rounded-xl px-3.5 py-2.5 text-sm text-[#1d3327] placeholder:text-[#9bb0a4] focus:outline-none focus:ring-2 focus:ring-[#4a9d72] focus:border-transparent transition";

  return (
    <div className="max-w-xl mx-auto px-6 py-10 font-['Plus_Jakarta_Sans',sans-serif]">
      <h1 className="text-2xl font-extrabold text-[#1d3327] tracking-tight mb-8">Edit Profile</h1>

      <div className="flex items-center gap-4 mb-8 bg-white border border-[#e4eee7] rounded-3xl p-5">
        {photo ? (
          <img src={photo} className="w-16 h-16 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#dcecdf] flex items-center justify-center text-[#3f8c5f] text-2xl font-extrabold">
            {user?.name?.[0]}
          </div>
        )}
        <div>
          <div className="font-bold text-[#1d3327]">{user?.name}</div>
          <div className="text-sm text-[#7fa890] mt-0.5">
            {user?.userType === 'CARE_GIVER' ? 'Caregiver' : 'Care Seeker'}
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-[#dcecdf] text-[#3f8c5f] text-sm font-medium rounded-xl px-4 py-3 mb-4">
          Profile updated.
        </div>
      )}
      {error && (
        <div className="bg-[#fbe9e7] text-[#b3493a] text-sm font-medium rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Phone number</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">About you</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Photo URL</label>
          <input
            type="url"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#4a9d72] text-white py-3 rounded-full font-bold hover:bg-[#41895f] transition-colors disabled:opacity-50 mt-1"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
