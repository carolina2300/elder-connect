import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#eef5ef] px-6 text-center font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      <div className="absolute -top-20 -left-16 w-[280px] h-[280px] rounded-full bg-[#dcecdf]" />
      <div className="absolute -bottom-24 -right-16 w-[340px] h-[340px] rounded-full bg-[#e2eee3]" />

      <div className="relative">
        <div className="w-16 h-16 rounded-[22px] bg-[#4a9d72] flex items-center justify-center text-[#eaf5ee] mx-auto mb-7 shadow-[0_10px_24px_rgba(74,157,114,0.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M12 21c0-6 3-10 8-11-1 6-4 9-8 11z" />
            <path d="M12 21c0-5-2-8-6-9 1 5 3 7 6 9z" />
          </svg>
        </div>
        <h1 className="text-5xl font-extrabold tracking-[-0.03em] text-[#1d3327] mb-4 text-balance">
          ElderCare Connect
        </h1>
        <p className="text-lg text-[#4f6258] mb-9 max-w-md mx-auto leading-relaxed">
          Connecting families with trusted caregivers, close to home.
        </p>
        <div className="flex gap-3.5 justify-center">
          <Link
            to="/posts"
            className="bg-[#4a9d72] text-white px-8 py-3.5 rounded-full text-base font-bold shadow-[0_10px_24px_rgba(74,157,114,0.3)] hover:bg-[#41895f] transition-colors"
          >
            Browse care
          </Link>
          <Link
            to="/register"
            className="bg-white text-[#234034] px-8 py-3.5 rounded-full text-base font-bold hover:bg-[#f3f9f4] transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}
