import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { PostKind, Qualification, DurationUnit, PriceUnit } from '../types';

const QUALIFICATIONS: Qualification[] = [
  'HOUSE_CLEANING', 'PERSONAL_HYGIENE', 'COMPANION',
  'DEMENTIA_CARE', 'SENIOR_TRANSPORTATION', 'ASSISTED_LIVING', 'POST_SURGERY',
];

const QUALIFICATION_LABELS: Record<Qualification, string> = {
  HOUSE_CLEANING: 'House Cleaning',
  PERSONAL_HYGIENE: 'Personal Hygiene',
  COMPANION: 'Companion',
  DEMENTIA_CARE: 'Dementia Care',
  SENIOR_TRANSPORTATION: 'Transportation',
  ASSISTED_LIVING: 'Assisted Living',
  POST_SURGERY: 'Post-Surgery',
};

const inputClass =
  "w-full bg-white border border-[#e4eee7] rounded-xl px-3.5 py-2.5 text-sm text-[#1d3327] placeholder:text-[#9bb0a4] focus:outline-none focus:ring-2 focus:ring-[#4a9d72] focus:border-transparent transition";

export default function CreatePost() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const kind: PostKind = user?.userType === 'CARE_GIVER' ? 'CAREGIVER' : 'CARETAKER';
  const [description, setDescription] = useState('');
  const [distrito, setDistrito] = useState('');
  const [concelho, setConcelho] = useState('');
  const [freguesia, setFreguesia] = useState('');
  const [minCents, setMinCents] = useState('');
  const [maxCents, setMaxCents] = useState('');
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('PER_HOUR');
  const [durationAmount, setDurationAmount] = useState('1');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('MONTH');
  const [selectedQuals, setSelectedQuals] = useState<Qualification[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [earliestStartDate, setEarliestStartDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleQual(q: Qualification) {
    setSelectedQuals((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const body: Record<string, unknown> = {
      kind,
      description,
      location: { distrito, concelho, freguesia },
      priceRange: {
        minCents: Math.round(parseFloat(minCents) * 100),
        maxCents: Math.round(parseFloat(maxCents) * 100),
        unit: priceUnit,
      },
      duration: { amount: parseInt(durationAmount), unit: durationUnit },
    };

    if (kind === 'CAREGIVER') {
      body.offeredQualifications = selectedQuals;
      if (earliestStartDate) body.earliestStartDate = earliestStartDate;
    } else {
      body.requiredQualifications = selectedQuals;
      if (startDate) body.startDate = startDate;
      if (endDate) body.endDate = endDate;
    }

    try {
      const { data } = await api.post('/api/posts', body);
      navigate(`/posts/${data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 font-['Plus_Jakarta_Sans',sans-serif]">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-semibold text-[#4f6258] hover:text-[#234034] mb-6 flex items-center gap-1.5 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-extrabold text-[#1d3327] tracking-tight mb-6">
        {kind === 'CAREGIVER' ? 'Offer Your Services' : 'Post a Care Need'}
      </h1>

      {error && (
        <div className="bg-[#fbe9e7] text-[#b3493a] text-sm font-medium rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Describe the care needed or services you offer…"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-2">Location</label>
          <div className="grid grid-cols-3 gap-2">
            <input required placeholder="Distrito" value={distrito} onChange={(e) => setDistrito(e.target.value)} className={inputClass} />
            <input required placeholder="Concelho" value={concelho} onChange={(e) => setConcelho(e.target.value)} className={inputClass} />
            <input required placeholder="Freguesia" value={freguesia} onChange={(e) => setFreguesia(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-2">Price range (€)</label>
          <div className="grid grid-cols-3 gap-2">
            <input required type="number" min="0" step="0.01" placeholder="Min" value={minCents} onChange={(e) => setMinCents(e.target.value)} className={inputClass} />
            <input required type="number" min="0" step="0.01" placeholder="Max" value={maxCents} onChange={(e) => setMaxCents(e.target.value)} className={inputClass} />
            <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as PriceUnit)} className={inputClass}>
              <option value="PER_HOUR">Per hour</option>
              <option value="PER_DAY">Per day</option>
              <option value="PER_WEEK">Per week</option>
              <option value="PER_MONTH">Per month</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-2">Duration</label>
          <div className="grid grid-cols-2 gap-2">
            <input required type="number" min="1" value={durationAmount} onChange={(e) => setDurationAmount(e.target.value)} className={inputClass} />
            <select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as DurationUnit)} className={inputClass}>
              <option value="WEEK">Week(s)</option>
              <option value="MONTH">Month(s)</option>
            </select>
          </div>
        </div>

        {kind === 'CAREGIVER' ? (
          <div>
            <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Available from</label>
            <input type="date" value={earliestStartDate} onChange={(e) => setEarliestStartDate(e.target.value)} className={inputClass} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2f4339] mb-1.5">End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-[#2f4339] mb-2">
            {kind === 'CAREGIVER' ? 'Services you offer' : 'Services needed'}
          </label>
          <div className="flex flex-wrap gap-2">
            {QUALIFICATIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => toggleQual(q)}
                className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                  selectedQuals.includes(q)
                    ? 'bg-[#4a9d72] text-white border-[#4a9d72]'
                    : 'bg-white border-[#e4eee7] text-[#4f6258] hover:border-[#4a9d72]'
                }`}
              >
                {QUALIFICATION_LABELS[q]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#4a9d72] text-white py-3 rounded-full font-bold hover:bg-[#41895f] transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting…' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}
