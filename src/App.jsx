import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/auth/login'
import SignupPage from './pages/auth/signup'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import AssessmentDetailScreen from './pages/recruiter/AssessmentDetailScreen'
import RecruiterLayout from './pages/recruiter/RecruiterLayout'
import AssessmentsScreen from './pages/recruiter/AssessmentsScreen'
import PipelineScreen from './pages/recruiter/pipeline'
import CandidatesScreen from './pages/recruiter/CandidatesScreen'
import ReportsScreen from './pages/recruiter/ReportsScreen'
import ReportDetailScreen from './pages/recruiter/ReportDetailScreen'
import InviteScreen from './pages/recruiter/InviteScreen'
import InviteCandidate from './pages/recruiter/InviteCandidate'
import VerifyCandidateInvite from './pages/recruiter/VerifyCandidateInvite'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserDashboardPage from './users/pages/UserDashboardPage'
import UserSimulationsPage from './users/pages/UserSimulationsPage'
import UserSimulationDetailPage from './users/pages/UserSimulationDetailPage'
import SessionAnalyticsPage from './users/pages/SessionAnalyticsPage'
import UserSessionsPage from './users/pages/UserSessionsPage'
import UserAnalyticsPlaceholderPage from './users/pages/UserAnalyticsPlaceholderPage'
import UserAIInsightsPage from './users/pages/UserAIInsightsPage'
import UserSkillRoadmapPage from './users/pages/UserSkillRoadmapPage'
import UserSettingsPage from './users/pages/UserSettingsPage'
import ProtectedRoute from './utils/ProtectedRoute'
import AdminRoute from './utils/AdminRoute'

function RoleBasedRedirect() {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  if (!token) return <Navigate to="/login" replace />;
  if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
  if (userRole === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
}

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
          element={<RoleBasedRedirect />} 
        />
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/simulations" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserSimulationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/simulations" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserSimulationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/simulations/:id" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserSimulationDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sessions" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserSessionsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserAnalyticsPlaceholderPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-insights" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserAIInsightsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/skill-roadmap" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserSkillRoadmapPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserSettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics/:sessionId" 
          element={
            <ProtectedRoute requiredRole="USER">
              <SessionAnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/dashboard" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterLayout><RecruiterDashboard /></RecruiterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/assessments/:id" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterLayout><AssessmentDetailScreen /></RecruiterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/assessments" 
          element={<Navigate to="/recruiter/pipeline" replace />} 
        />
        <Route 
          path="/recruiter/pipeline" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterLayout><PipelineScreen /></RecruiterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/candidates" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterLayout><CandidatesScreen /></RecruiterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/reports" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterLayout><ReportsScreen /></RecruiterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/reports/:assessmentId/:sessionId" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterLayout><ReportDetailScreen /></RecruiterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/invite" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterLayout><InviteScreen /></RecruiterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/:assessmentId/invite" 
          element={
            <ProtectedRoute requiredRole="RECRUITER">
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