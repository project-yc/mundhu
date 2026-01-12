import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/auth/login'
import RecruiterDashboard from './pages/dashboard'
import InviteCandidate from './pages/InviteCandidate'
import VerifyCandidateInvite from './pages/VerifyCandidateInvite'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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