import { useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token)!;

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
      setAuth(token, data);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <div className="flex items-center gap-4 mb-8">
        {photo ? (
          <img src={photo} className="w-16 h-16 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
            {user?.name?.[0]}
          </div>
        )}
        <div>
          <div className="font-semibold text-gray-800">{user?.name}</div>
          <div className="text-sm text-gray-400">
            {user?.userType === 'CARE_GIVER' ? '🩺 Caregiver' : '🧓 Care Seeker'}
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          Profile updated.
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">About you</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
          <input
            type="url"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
