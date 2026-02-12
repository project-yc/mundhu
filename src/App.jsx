import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/auth/login'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import InviteCandidate from './pages/recruiter/InviteCandidate'
import VerifyCandidateInvite from './pages/recruiter/VerifyCandidateInvite'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './utils/ProtectedRoute'
import AdminRoute from './utils/AdminRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <RecruiterDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/:assessmentId/invite" 
          element={
            <ProtectedRoute>
              <InviteCandidate />
            </ProtectedRoute>
          } 
        />
        <Route path="/invite/:token" element={<VerifyCandidateInvite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
export default App