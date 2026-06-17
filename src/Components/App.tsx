import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.min.css'
import { ApiProvider } from '../contexts/ApiContext'
import AppContextProviders from '../contexts/AppContextProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import Dashboard from './Dashboard'
import FileDetail from './FileDetail'
import Files from './Files'
import ForgotPassword from './ForgotPassword'
import HealthForm from './HealthForm'
import Login from './Login'
import PrivateRoutes from './PrivateRoutes'
import Signup from './Signup'
import UpdateProfile from './UpdateProfile'
import UploadFile from './UploadFile'

const queryClient = new QueryClient()

function App() {
  const providers = [ToastProvider, AuthProvider, ApiProvider]
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContextProviders components={providers}>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route element={<Dashboard />} path="/" />
              <Route element={<Files />} path="/files" />
              <Route element={<FileDetail />} path="/file/:fileId" />
              <Route element={<HealthForm />} path="/health-form" />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/upload" element={<UploadFile />} />
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </AppContextProviders>
      </Router>
    </QueryClientProvider>
  )
}

export default App
