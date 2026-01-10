import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/auth/login'
import RecruiterDashboard from './pages/dashboard'
import InviteCandidate from './pages/InviteCandidate'
import VerifyCandidateInvite from './pages/VerifyCandidateInvite'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RecruiterDashboard />} />
        <Route path="/:assessmentId/invite" element={<InviteCandidate />} />
        <Route path="/invite/:token" element={<VerifyCandidateInvite />} />
      </Routes>
    </Router>
  )
}
export default App