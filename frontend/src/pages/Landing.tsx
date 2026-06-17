import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-6">🌿</span>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Trusted Care,<br /> Close to Home
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          ElderCare Connect brings families and caregivers together. Find compassionate help
          for your loved ones or offer your caregiving services in your community.
        </p>
        <div className="flex gap-4">
          <Link
            to="/register"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Find a Caregiver
          </Link>
          <Link
            to="/register"
            className="border border-emerald-600 text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
          >
            Offer Services
          </Link>
        </div>
      </main>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12 pb-20 max-w-5xl mx-auto w-full">
        {[
          { icon: '🤝', title: 'Trusted Community', desc: 'Read reviews and connect with verified caregivers in your area.' },
          { icon: '💬', title: 'Direct Communication', desc: 'Chat directly with caregivers or families before committing.' },
          { icon: '📋', title: 'Flexible Services', desc: 'From companionship to post-surgery care — find exactly what you need.' },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
