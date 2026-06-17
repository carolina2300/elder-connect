import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Conversations from './pages/Conversations';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/create" element={<CreatePost />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/conversations/:id" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
