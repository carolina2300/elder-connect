import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function logout() {
    clearAuth();
    navigate('/');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-full transition-colors ${
      isActive
        ? 'bg-[#dcecdf] text-[#3f8c5f] font-bold'
        : 'text-[#4f6258] hover:bg-[#eef5ef] hover:text-[#234034]'
    }`;

  return (
    <nav className="bg-white border-b border-[#e4eee7] px-8 py-3 flex items-center justify-between flex-shrink-0 font-['Plus_Jakarta_Sans',sans-serif] sticky top-0 z-20">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[11px] bg-[#4a9d72] flex items-center justify-center text-[#eaf5ee]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
            <path d="M12 21c0-6 3-10 8-11-1 6-4 9-8 11z" />
            <path d="M12 21c0-5-2-8-6-9 1 5 3 7 6 9z" />
          </svg>
        </span>
        <span className="text-lg font-extrabold tracking-tight text-[#234034]">ElderCare Connect</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-1 text-sm font-semibold">
          <NavLink to="/posts" end className={linkClass}>Feed</NavLink>
          <Link
            to="/posts?author=me"
            className="px-3.5 py-2 rounded-full text-[#4f6258] hover:bg-[#eef5ef] hover:text-[#234034] transition-colors"
          >
            My Posts
          </Link>
          <NavLink to="/conversations" className={linkClass}>Messages</NavLink>
          <NavLink to="/profile" className={linkClass}>Profile</NavLink>
          <div className="w-px h-6 bg-[#e4eee7] mx-2" />
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-full text-[#9bb0a4] hover:text-[#b3493a] hover:bg-[#fbe9e7] transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Link
            to="/login"
            className="px-4 py-2 rounded-full text-[#4f6258] hover:bg-[#eef5ef] hover:text-[#234034] transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-[#4a9d72] text-white px-5 py-2 rounded-full hover:bg-[#41895f] transition-colors"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
