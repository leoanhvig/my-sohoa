import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.min.css'
import { ApiProvider } from '../contexts/ApiContext'
import AppContextProviders from '../contexts/AppContextProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import Dashboard from './Dashboard'
import DocumentDetail from './DocumentDetail'
import FileDetail from './FileDetail'
import Files from './Files'
import Login from './Login'
import PrivateRoutes from './PrivateRoutes'
import Signup from './Signup'
import UploadFile from './UploadFile'
import UploadedFiles from './UploadedFiles'

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
              <Route
                element={<DocumentDetail />}
                path="/document/:documentId"
              />
              <Route element={<Files />} path="/files" />
              <Route element={<FileDetail />} path="/file/:fileId" />
              {/* <Route element={<HealthForm />} path="/health-form" />
              <Route
                element={<HealthForm />}
                path="/health-form/update/:recordId"
              /> */}
              {/* <Route element={<HealthFormList />} path="/list-healthform" /> */}
              {/* <Route path="/update-profile" element={<UpdateProfile />} /> */}
              <Route path="/upload" element={<UploadFile />} />
              <Route path="/uploaded-files" element={<UploadedFiles />} />
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          </Routes>
        </AppContextProviders>
      </Router>
    </QueryClientProvider>
  )
}

export default App
