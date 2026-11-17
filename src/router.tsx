import { createBrowserRouter } from 'react-router'
import { RequireMember } from './components/auth/RequireMember'
import { AppLayout } from './components/layout/AppLayout'
import { CategoriesPage } from './pages/CategoriesPage'
import { CreateTeamPage } from './pages/CreateTeamPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { InvitePage } from './pages/InvitePage'
import { LazyCalendarPage } from './pages/LazyCalendarPage'
import { LoginPage } from './pages/LoginPage'
import { MembersPage } from './pages/MembersPage'
import { NoAccessPage } from './pages/NoAccessPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

export const router = createBrowserRouter([
  { path: '/entrar', element: <LoginPage /> },
  { path: '/esqueci-senha', element: <ForgotPasswordPage /> },
  { path: '/nova-senha', element: <ResetPasswordPage /> },
  { path: '/criar-equipe', element: <CreateTeamPage /> },
  { path: '/sem-acesso', element: <NoAccessPage /> },
  { path: '/convite/:token', element: <InvitePage /> },
  {
    element: <RequireMember />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <LazyCalendarPage /> },
          { path: '/membros', element: <MembersPage /> },
          { path: '/categorias', element: <CategoriesPage /> },
        ],
      },
    ],
  },
])
