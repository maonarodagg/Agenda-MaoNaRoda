import { createBrowserRouter } from 'react-router'
import { RequireMember } from './components/auth/RequireMember'
import { AppLayout } from './components/layout/AppLayout'
import { CreateTeamPage } from './pages/CreateTeamPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NoAccessPage } from './pages/NoAccessPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

export const router = createBrowserRouter([
  { path: '/entrar', element: <LoginPage /> },
  { path: '/esqueci-senha', element: <ForgotPasswordPage /> },
  { path: '/nova-senha', element: <ResetPasswordPage /> },
  { path: '/criar-equipe', element: <CreateTeamPage /> },
  { path: '/sem-acesso', element: <NoAccessPage /> },
  {
    element: <RequireMember />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: '/', element: <HomePage /> }],
      },
    ],
  },
])
