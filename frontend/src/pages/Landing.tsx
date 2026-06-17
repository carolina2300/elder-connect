import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21c0-6 3-10 8-11-1 6-4 9-8 11z" />
      <path d="M12 21c0-5-2-8-6-9 1 5 3 7 6 9z" />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.7L12 17.8 5.9 20.9l1.5-6.7L2.2 9.6l6.9-.7z" />
    </svg>
  );
}

const FEATURES = [
  {
    title: 'Trusted community',
    desc: 'Read reviews and connect with verified caregivers right in your area.',
    icon: (
      <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z M9 12l2 2 4-4" />
    ),
  },
  {
    title: 'Direct communication',
    desc: 'Chat directly with caregivers or families before you commit to anything.',
    icon: <path d="M21 11.5a8 8 0 01-11.6 7.1L3 21l2.4-6.4A8 8 0 1121 11.5z" />,
  },
  {
    title: 'Flexible services',
    desc: 'From companionship to post-surgery care — find exactly what you need.',
    icon: <path d="M5 4h14v17H5z M9 4V3h6v1M9 11h6M9 15h4" />,
  },
];

const STEPS = [
  { n: 1, title: 'Tell us your needs', desc: 'Describe the support your family needs and where — it only takes a minute.' },
  { n: 2, title: 'Meet verified carers', desc: 'Browse profiles, read real family reviews, and message before you decide.' },
  { n: 3, title: 'Begin with confidence', desc: 'Agree a schedule and rate, then stay connected through the platform.' },
];

const TESTIMONIALS = [
  { quote: 'We found someone for my mother in two days. Patient, kind, and she even speaks her dialect — it gave our whole family peace of mind.', name: 'Inês R.', role: 'Daughter · Porto', avatar: 'bg-[#d6e8db]' },
  { quote: 'As a caregiver, I love that families can read my reviews and message me first. Every match has felt like the right fit.', name: 'Marta C.', role: 'Caregiver · Cascais', avatar: 'bg-[#cfe4d5]' },
  { quote: 'My father needed post-surgery help quickly. Within a day we had someone reliable, just ten minutes away.', name: 'Tiago F.', role: 'Son · Braga', avatar: 'bg-[#d6e8db]' },
];

const BLOBS = [
  { w: 'w-[300px]', h: 'h-[210px]', bg: 'bg-[#d6e8db]', mt: 'mt-9', label: 'photo — tea together' },
  { w: 'w-[360px]', h: 'h-[256px]', bg: 'bg-[#cfe4d5]', mt: 'mt-0', label: 'photo — walk in the park' },
  { w: 'w-[300px]', h: 'h-[210px]', bg: 'bg-[#d6e8db]', mt: 'mt-9', label: 'photo — reading aloud' },
];

const stripe = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(74,157,114,0.1) 0 12px, transparent 12px 24px)',
};

export default function Landing() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/posts', { replace: true });
  }, [user]);

  return (
    <div className="bg-[#eef5ef] text-[#1f3328] font-['Plus_Jakarta_Sans',sans-serif] min-h-screen">
      {/* nav */}
      <nav className="flex items-center justify-between px-16 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-[13px] bg-[#4a9d72] flex items-center justify-center text-[#eaf5ee]">
            <Leaf className="w-[18px] h-[18px]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#234034]">ElderCare Connect</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-[#4f6258]">
          <a href="#how" className="hover:text-[#234034] transition-colors">How it works</a>
          <Link to="/posts" className="hover:text-[#234034] transition-colors">Caregivers</Link>
          <a href="#stories" className="hover:text-[#234034] transition-colors">Stories</a>
          <Link to="/login" className="hover:text-[#234034] transition-colors">Log in</Link>
          <Link to="/register" className="bg-[#234034] text-[#eaf5ee] px-[22px] py-[11px] rounded-full hover:bg-[#1c3329] transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <header className="relative px-16 pt-[60px] pb-20 text-center overflow-hidden max-w-7xl mx-auto">
        <div className="absolute -top-16 -left-10 w-[280px] h-[280px] rounded-full bg-[#dcecdf]" />
        <div className="absolute -bottom-24 -right-10 w-[340px] h-[340px] rounded-full bg-[#e2eee3]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white text-[#3f8c5f] px-4 py-2 rounded-full text-[13px] font-bold mb-7 shadow-[0_4px_14px_rgba(74,157,114,0.12)]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#4a9d72]" /> Caring neighbours, near you
          </div>
          <h1 className="text-6xl leading-[1.05] tracking-[-0.03em] font-extrabold mx-auto mb-6 max-w-[820px] text-[#1d3327] text-balance">
            Help for the people you love, from people who care.
          </h1>
          <p className="text-[19px] leading-relaxed text-[#4f6258] max-w-xl mx-auto mb-9">
            ElderCare Connect makes it warm and simple to find trusted caregivers nearby — or to share your
            own care with families in your community.
          </p>
          <div className="flex gap-3.5 justify-center">
            <Link to="/register" className="bg-[#4a9d72] text-white px-[34px] py-4 rounded-full text-base font-bold shadow-[0_10px_24px_rgba(74,157,114,0.3)] hover:bg-[#41895f] transition-colors">
              Find a caregiver
            </Link>
            <Link to="/register" className="bg-white text-[#234034] px-[34px] py-4 rounded-full text-base font-bold hover:bg-[#f3f9f4] transition-colors">
              Offer services
            </Link>
          </div>
        </div>
        <div className="relative flex justify-center gap-[22px] mt-14">
          {BLOBS.map((b) => (
            <div key={b.label} className={`${b.w} ${b.h} ${b.bg} ${b.mt} rounded-[28px]`} style={stripe} />
          ))}
        </div>
      </header>

      {/* value cards + how it works */}
      <section className="bg-white px-16 py-[72px]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#f3f9f4] rounded-3xl p-8">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[#dcecdf] flex items-center justify-center mb-[18px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3f8c5f" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold mb-2 text-[#1d3327]">{f.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#4f6258]">{f.desc}</p>
              </div>
            ))}
          </div>

          <div id="how" className="pt-20">
            <div className="text-center mb-12">
              <div className="text-[13px] font-bold tracking-[0.12em] uppercase text-[#7fa890] mb-3">How it works</div>
              <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-[#1d3327]">Care in three simple steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {STEPS.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#eef5ef] flex items-center justify-center mx-auto mb-[18px] text-[22px] font-extrabold text-[#4a9d72]">
                    {s.n}
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 text-[#1d3327]">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#4f6258]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section id="stories" className="px-16 py-[76px]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[38px] font-extrabold tracking-[-0.02em] mb-10 text-[#1d3327] text-center">
            Families and caregivers, in their words
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-3xl p-[30px]">
                <div className="flex gap-[3px] mb-4 text-[#e0a93a]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4" />
                  ))}
                </div>
                <p className="text-base leading-relaxed text-[#2f4339] mb-[22px]">“{t.quote}”</p>
                <div className="flex items-center gap-3">
                  <div className={`w-[42px] h-[42px] rounded-full ${t.avatar} shrink-0`} />
                  <div>
                    <div className="text-sm font-bold text-[#1d3327]">{t.name}</div>
                    <div className="text-[13px] text-[#7fa890]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-16 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#234034] rounded-[32px] p-16 text-center text-[#eaf5ee] relative overflow-hidden">
            <div className="absolute -top-10 -right-8 w-[200px] h-[200px] rounded-full bg-white/5" />
            <div className="absolute -bottom-16 -left-8 w-[220px] h-[220px] rounded-full bg-white/[0.04]" />
            <div className="relative">
              <h2 className="text-4xl font-extrabold tracking-[-0.02em] mb-3.5">Care starts with a hello.</h2>
              <p className="text-[17px] text-[#bcd6c6] mx-auto mb-7 max-w-md">
                Join thousands of families and caregivers across Portugal.
              </p>
              <div className="flex gap-3.5 justify-center">
                <Link to="/register" className="bg-white text-[#234034] px-[34px] py-4 rounded-full text-base font-bold hover:bg-[#eef5ef] transition-colors">
                  Find a caregiver
                </Link>
                <Link to="/register" className="bg-white/[0.12] text-[#eaf5ee] px-[34px] py-4 rounded-full text-base font-bold hover:bg-white/20 transition-colors">
                  Offer services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-white px-16 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-[#5a6f62]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[10px] bg-[#4a9d72] flex items-center justify-center text-[#eaf5ee]">
              <Leaf className="w-[15px] h-[15px]" />
            </div>
            <span className="font-extrabold text-[#234034]">ElderCare Connect</span>
          </div>
          <div className="flex gap-[26px]">
            <a href="#" className="hover:text-[#234034] transition-colors">About</a>
            <Link to="/posts" className="hover:text-[#234034] transition-colors">Caregivers</Link>
            <a href="#stories" className="hover:text-[#234034] transition-colors">Stories</a>
            <a href="#" className="hover:text-[#234034] transition-colors">Safety</a>
            <a href="#" className="hover:text-[#234034] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
