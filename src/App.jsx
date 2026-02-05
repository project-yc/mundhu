import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Auth pages
import LandingPage from './pages/auth/LandingPage'
import LoginPage from './pages/auth/login'
import RegisterPage from './pages/auth/register'
import BusinessLoginPage from './pages/auth/BusinessLogin'
import UserLoginPage from './pages/auth/UserLogin'

// B2B (Recruiter) pages
import RecruiterDashboard from './pages/dashboard'
import InviteCandidate from './pages/InviteCandidate'
import VerifyCandidateInvite from './pages/VerifyCandidateInvite'

// B2C (Practitioner) pages
import ProblemList from './pages/problems/ProblemList'
import ProblemDetail from './pages/problems/ProblemDetail'

// Auth helpers
import { isAuthenticated, getUser } from './api/auth'

// Route guard for authenticated users
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />
}

// Route guard for B2B users only (recruiters)
function B2BRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login/business" replace />
  }
  const user = getUser()
  if (user?.account_type !== 'B2B') {
    // Non-B2B users go to problems
    return <Navigate to="/problems" replace />
  }
  return children
}

// Route based on account type
function DashboardRouter() {
  const user = getUser()
  
  // B2C users go to problems, B2B users go to recruiter dashboard
  if (user?.account_type === 'B2B') {
    return <RecruiterDashboard />
  }
  
  // Default to problems for B2C/HYBRID users
  return <Navigate to="/problems" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing - Choose Business or User */}
        <Route path="/" element={
          isAuthenticated() ? <DashboardRouter /> : <LandingPage />
        } />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/business" element={<BusinessLoginPage />} />
        <Route path="/login/user" element={<UserLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* B2C Routes - Problem Library (requires auth) */}
        <Route path="/problems" element={<PrivateRoute><ProblemList /></PrivateRoute>} />
        <Route path="/problems/:slug" element={<PrivateRoute><ProblemDetail /></PrivateRoute>} />
        
        {/* B2B Routes - Recruiter Dashboard (B2B users only) */}
        <Route path="/recruiter" element={<B2BRoute><RecruiterDashboard /></B2BRoute>} />
        <Route path="/:assessmentId/invite" element={<B2BRoute><InviteCandidate /></B2BRoute>} />
        
        {/* Candidate Invite (public - uses token) */}
        <Route path="/invite/:token" element={<VerifyCandidateInvite />} />
      </Routes>
    </Router>
  )
}
export default App