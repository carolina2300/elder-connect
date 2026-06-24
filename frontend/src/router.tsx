import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from '@/shared/components/layout/AppShell'
import { NotFoundPage } from '@/shared/components/layout/NotFoundPage'
import { LandingPage } from '@/features/landing/pages/LandingPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { RequireAuth } from '@/features/auth/guards/RequireAuth'
import { RequireRole } from '@/features/auth/guards/RequireRole'
import { MyProfilePage } from '@/features/profile/pages/MyProfilePage'
import { UserProfilePage } from '@/features/profile/pages/UserProfilePage'
import { CaretakerJobsSearchPage } from '@/features/search/pages/CaretakerJobsSearchPage'
import { CaregiverOffersSearchPage } from '@/features/search/pages/CaregiverOffersSearchPage'
import { PostDetailPage } from '@/features/posts/pages/PostDetailPage'
import { NewCaretakerPostPage } from '@/features/posts/pages/NewCaretakerPostPage'
import { NewCaregiverPostPage } from '@/features/posts/pages/NewCaregiverPostPage'
import { MessagesPage } from '@/features/messages/pages/MessagesPage'
import { PrivacyPolicyPage } from '@/features/legal/pages/PrivacyPolicyPage'
import { CookiePolicyPage } from '@/features/legal/pages/CookiePolicyPage'
import { useSessionStore } from '@/features/auth/session.store'

function NewPostRedirect() {
  const role = useSessionStore((s) => s.currentUser?.role)
  if (role === 'CARE_SEEKER') return <Navigate to="/posts/new/caretaker" replace />
  if (role === 'CARE_GIVER') return <Navigate to="/posts/new/caregiver" replace />
  return <Navigate to="/me" replace />
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'cookies', element: <CookiePolicyPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'me', element: <MyProfilePage /> },
          { path: 'users/:id', element: <UserProfilePage /> },
          { path: 'posts/new', element: <NewPostRedirect /> },
          { path: 'posts/:id', element: <PostDetailPage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'messages/:conversationId', element: <MessagesPage /> },
          {
            element: <RequireRole role="CARE_GIVER" />,
            children: [
              { path: 'search/caretakers', element: <CaretakerJobsSearchPage /> },
              { path: 'posts/new/caregiver', element: <NewCaregiverPostPage /> },
            ],
          },
          {
            element: <RequireRole role="CARE_SEEKER" />,
            children: [
              { path: 'search/caregivers', element: <CaregiverOffersSearchPage /> },
              { path: 'posts/new/caretaker', element: <NewCaretakerPostPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
