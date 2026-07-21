import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashNavbar from './DashNavbar'

export default function PrivateRoutes() {
  const { currentUser } = useAuth()
  const location = useLocation()
  const shouldHideNavbar =
    location.pathname.startsWith('/document/') ||
    location.pathname === '/health-form-2' ||
    /^\/file(?:-hotich)?\/[^/]+(?:\/documents)?$/.test(location.pathname)

  return currentUser ? (
    <>
      {!shouldHideNavbar && <DashNavbar />}
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  )
}
