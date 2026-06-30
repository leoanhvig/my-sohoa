import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.min.css'
import { ApiProvider } from '../contexts/ApiContext'
import AppContextProviders from '../contexts/AppContextProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import { useUserStore } from '../stores/userStore'
import Dashboard from './Dashboard'
import DocumentDetail from './DocumentDetail'
import FileDetail from './FileDetail'
import Files from './Files'
import HealthForm2 from './HealthForm2'
import Login from './Login'
import PrivateRoutes from './PrivateRoutes'
import Signup from './Signup'
import UploadFile from './UploadFile'
import UploadedFiles from './UploadedFiles'

const queryClient = new QueryClient()
const UPLOAD_ALLOWED_USER_NAME = 'nhaplieu01'

function UploadRoutesGuard({ children }: { children: JSX.Element }) {
  const userRecord = useUserStore((state) => state.userRecord)
  const isUserLoading = useUserStore((state) => state.loading)

  if (isUserLoading) {
    return null
  }

  if (userRecord?.user_name !== UPLOAD_ALLOWED_USER_NAME) {
    return <Navigate to="/" replace />
  }

  return children
}

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
                path="/file/:fileId/documents"
              />
              <Route element={<Files />} path="/files" />
              <Route element={<FileDetail />} path="/file/:fileId" />
              <Route
                path="/health-form-2"
                element={
                  <UploadRoutesGuard>
                    <HealthForm2 />
                  </UploadRoutesGuard>
                }
              />
              {/* <Route element={<HealthForm />} path="/health-form" />
              <Route
                element={<HealthForm />}
                path="/health-form/update/:recordId"
              /> */}
              {/* <Route element={<HealthFormList />} path="/list-healthform" /> */}
              {/* <Route path="/update-profile" element={<UpdateProfile />} /> */}
              <Route
                path="/upload"
                element={
                  <UploadRoutesGuard>
                    <UploadFile />
                  </UploadRoutesGuard>
                }
              />
              <Route
                path="/uploaded-files"
                element={
                  <UploadRoutesGuard>
                    <UploadedFiles />
                  </UploadRoutesGuard>
                }
              />
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
