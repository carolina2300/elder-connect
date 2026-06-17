import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function logout() {
    clearAuth();
    navigate('/');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <Link to="/" className="text-xl font-bold text-emerald-600">
        ElderCare Connect
      </Link>

      {user ? (
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/posts" className="hover:text-emerald-600 transition-colors">Feed</Link>
          <Link to="/posts?author=me" className="hover:text-emerald-600 transition-colors">My Posts</Link>
          <Link to="/conversations" className="hover:text-emerald-600 transition-colors">Messages</Link>
          <Link to="/profile" className="hover:text-emerald-600 transition-colors">Profile</Link>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
