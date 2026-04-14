import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/auth/login'
import SignupPage from './pages/auth/signup'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import InviteCandidate from './pages/recruiter/InviteCandidate'
import VerifyCandidateInvite from './pages/recruiter/VerifyCandidateInvite'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserDashboardPage from './users/pages/UserDashboardPage'
import UserSimulationsPage from './users/pages/UserSimulationsPage'
import UserSimulationDetailPage from './users/pages/UserSimulationDetailPage'
import SessionAnalyticsPage from './users/pages/SessionAnalyticsPage'
import ProtectedRoute from './utils/ProtectedRoute'
import AdminRoute from './utils/AdminRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
          element={<Navigate to="/user/dashboard" replace />} 
        />
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/simulations" 
          element={
            <ProtectedRoute>
              <UserSimulationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/simulations" 
          element={
            <ProtectedRoute>
              <UserSimulationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/simulations/:id" 
          element={
            <ProtectedRoute>
              <UserSimulationDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics/:sessionId" 
          element={
            <ProtectedRoute>
              <SessionAnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/dashboard" 
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