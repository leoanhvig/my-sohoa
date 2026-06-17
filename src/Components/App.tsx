import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.min.css'
import { ApiProvider } from '../contexts/ApiContext'
import AppContextProviders from '../contexts/AppContextProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import Dashboard from './Dashboard'
import ForgotPassword from './ForgotPassword'
import Login from './Login'
import PrivateRoutes from './PrivateRoutes'
import Signup from './Signup'
import UpdateProfile from './UpdateProfile'
import UploadFile from './UploadFile'

function App() {
  const providers = [ToastProvider, AuthProvider, ApiProvider]
  return (
    <Router>
      <AppContextProviders components={providers}>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<Dashboard />} path="/" />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/upload" element={<UploadFile />} />
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </AppContextProviders>
    </Router>
  )
}

export default App
