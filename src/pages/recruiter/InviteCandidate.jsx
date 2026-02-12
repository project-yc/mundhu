import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Loader, AlertCircle, CheckCircle, Users, Upload, Copy, Download, ArrowLeft, Mail, Trash2 } from 'lucide-react';
import { getAssessmentById, sendCandidateInvites } from '../../api/recruiter/assessment';

export default function InviteCandidate() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLinks, setInviteLinks] = useState([]);
  const [showInviteLinks, setShowInviteLinks] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch assessment on mount
  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssessmentById(assessmentId);
      setSelectedAssessment(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    
    if (!newCandidate.name.trim() || !newCandidate.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCandidate.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check for duplicate emails
    if (candidates.some(c => c.email === newCandidate.email)) {
      setError('This candidate already exists');
      return;
    }

    setCandidates([...candidates, { ...newCandidate, id: Date.now() }]);
    setNewCandidate({ name: '', email: '' });
    setError('');
  };

  const handleParseExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const parsedCandidates = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        const name = parts[0]?.trim();
        const email = parts[1]?.trim();

        if (name && email && emailRegex.test(email)) {
          const exists = candidates.some(c => c.email === email) || 
                        parsedCandidates.some(c => c.email === email);
          
          if (!exists) {
            parsedCandidates.push({ id: Date.now() + i, name, email });
          }
        }
      }

      if (parsedCandidates.length === 0) {
        setError('No valid candidates found in the file. Please check the format (Name, Email)');
        return;
      }

      setCandidates([...candidates, ...parsedCandidates]);
      setSuccess(`${parsedCandidates.length} candidate${parsedCandidates.length !== 1 ? 's' : ''} imported successfully!`);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to parse file. Please ensure it\'s a valid CSV file with format: Name, Email');
    }
  };

  const handleSendInvites = async () => {
    if (candidates.length === 0) {
      setError('Please add at least one candidate');
      return;
    }

    if (!selectedAssessment) {
      setError('No assessment selected');
      return;
    }

    setInviteLoading(true);
    setError('');

    try {
      const data = await sendCandidateInvites(selectedAssessment.id, candidates);
      
      const links = (data.data?.invites || []).map((item, idx) => ({
        id: idx,
        name: candidates[idx]?.name || 'Unknown',
        email: item.email,
        inviteLink: item.invite_link,
        status: 'invited'
      }));
      
      setInviteLinks(links);
      setShowInviteLinks(true);
      setSuccess('Invitations sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to send invitations. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = (link, linkId) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(linkId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const downloadInviteLinks = () => {
    const csvContent = [
      ['Candidate Name', 'Email', 'Invite Link'],
      ...inviteLinks.map(l => [
        `"${l.name}"`,
        `"${l.email}"`,
        `"${l.inviteLink}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `assessment_invites_${selectedAssessment.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeCandidateRow = (id) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const resetInviteFlow = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-100/60 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
        <Loader className="w-8 h-8 text-blue-500 animate-spin relative z-10" />
      </div>
    );
  }

  if (!selectedAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-100/60 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="backdrop-blur-2xl bg-white/70 rounded-3xl p-10 shadow-2xl shadow-rose-100/20 border border-white/30">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h1>
            <p className="text-gray-600 mb-6">The requested assessment could not be found</p>
            <button
              onClick={resetInviteFlow}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-100/60 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="backdrop-blur-2xl bg-white/60 border-b border-white/20 sticky top-0 z-40 shadow-lg shadow-blue-100/20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={resetInviteFlow}
              className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/40 hover:bg-white/60 border border-white/30 rounded-xl transition-all text-gray-700 font-semibold shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedAssessment.name}</h1>
              <p className="text-sm text-gray-600">Invite candidates to participate in this assessment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Messages */}
        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 backdrop-blur-xl bg-emerald-50/80 border border-emerald-200/50 rounded-2xl shadow-lg shadow-emerald-100/20 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 font-medium">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 backdrop-blur-xl bg-rose-50/80 border border-rose-200/50 rounded-2xl shadow-lg shadow-rose-100/20">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800 font-medium">{error}</p>
          </div>
        )}

        {!showInviteLinks ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Candidates List */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-2xl bg-white/70 rounded-3xl shadow-2xl shadow-blue-100/20 p-8 border border-white/30">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Invite Candidates
                </h2>

                {/* Add Candidate Form */}
                <div className="mb-8 p-6 backdrop-blur-xl bg-gradient-to-br from-blue-50/70 to-cyan-50/70 rounded-2xl border border-blue-200/50 shadow-lg shadow-blue-100/20">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Add Candidate Manually</h3>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      className="flex-1 px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all shadow-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                      className="flex-1 px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all shadow-sm"
                    />
                    <button
                      onClick={handleAddCandidate}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-blue-200/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 backdrop-blur-xl bg-gradient-to-br from-blue-50/70 to-cyan-50/70 text-gray-600 font-medium rounded-full">OR upload Excel</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-center gap-3 px-6 py-6 border-2 border-dashed border-blue-300/60 rounded-2xl cursor-pointer hover:border-blue-400 backdrop-blur-xl bg-white/40 hover:bg-white/60 transition-all shadow-sm hover:shadow-md">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">
                        Click to upload Excel file
                      </span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleParseExcel}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-3 text-xs text-gray-600 text-center font-medium">
                      📄 CSV format: Name, Email (one candidate per row)
                    </p>
                  </div>
                </div>

                {/* Candidates Table */}
                <div className="space-y-3">
                  {candidates.length > 0 ? (
                    <>
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold shadow-lg">
                          {candidates.length}
                        </span>
                        Candidate{candidates.length !== 1 ? 's' : ''} added
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-2.5 pr-2">
                        {candidates.map((candidate) => (
                          <div key={candidate.id} className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl hover:border-blue-300/60 hover:bg-white/80 transition-all shadow-sm hover:shadow-md">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{candidate.name}</p>
                              <p className="text-sm text-gray-600">{candidate.email}</p>
                            </div>
                            <button
                              onClick={() => removeCandidateRow(candidate.id)}
                              className="p-2.5 text-rose-500 hover:bg-rose-50/80 backdrop-blur-xl rounded-xl transition-all shadow-sm"
                              title="Remove candidate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-blue-200/60 rounded-2xl backdrop-blur-xl bg-white/40">
                      <Users className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium">No candidates added yet</p>
                      <p className="text-sm text-gray-500 mt-1">Add candidates manually or import from Excel</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-3xl shadow-2xl shadow-blue-100/20 p-8 border border-white/30 h-fit sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Assessment Summary</h3>
              <div className="space-y-3">
                <div className="p-4 backdrop-blur-xl bg-gradient-to-br from-blue-50/70 to-cyan-50/70 rounded-2xl border border-blue-200/50 shadow-sm">
                  <p className="text-xs text-blue-700 uppercase tracking-widest font-bold">Assessment</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">{selectedAssessment.name}</p>
                </div>
                
                <div className="p-4 backdrop-blur-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 rounded-2xl border border-indigo-200/50 shadow-sm">
                  <p className="text-xs text-indigo-700 uppercase tracking-widest font-bold">Duration</p>
                  <p className="text-lg font-bold text-indigo-900 mt-2">{selectedAssessment.duration_minutes} minutes</p>
                </div>
                
                <div className="p-4 backdrop-blur-xl bg-gradient-to-br from-cyan-50/70 to-blue-50/70 rounded-2xl border border-cyan-200/50 shadow-sm">
                  <p className="text-xs text-cyan-700 uppercase tracking-widest font-bold">Tasks</p>
                  <p className="text-lg font-bold text-cyan-900 mt-2">{selectedAssessment.tasks?.length || 0}</p>
                </div>

                <div className="p-4 backdrop-blur-xl bg-gradient-to-br from-sky-50/70 to-cyan-50/70 rounded-2xl border border-sky-200/50 shadow-sm">
                  <p className="text-xs text-sky-700 uppercase tracking-widest font-bold">Candidates</p>
                  <p className="text-lg font-bold text-sky-900 mt-2">{candidates.length}</p>
                </div>

                <button
                  onClick={handleSendInvites}
                  disabled={candidates.length === 0 || inviteLoading}
                  className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
                >
                  {inviteLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending Invites...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Invites
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Invite Links View */
          <div className="backdrop-blur-2xl bg-white/70 rounded-3xl shadow-2xl shadow-blue-100/20 p-8 border border-white/30">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">✅ Invitations Sent Successfully!</h2>
                <p className="text-gray-600 mt-2">Share these unique links with your candidates</p>
              </div>
              <button
                onClick={() => {
                  setCandidates([]);
                  setInviteLinks([]);
                  setShowInviteLinks(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                + Add More
              </button>
            </div>

            <div className="mb-6 flex gap-3">
              <button
                onClick={downloadInviteLinks}
                className="flex items-center gap-2 px-5 py-2.5 backdrop-blur-xl bg-white/60 border border-white/40 hover:bg-white/80 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {inviteLinks.map((link) => (
                <div key={link.id} className="p-5 backdrop-blur-xl bg-gradient-to-br from-blue-50/60 to-cyan-50/60 border border-blue-200/50 rounded-2xl hover:border-blue-300/70 transition-all shadow-sm hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900">{link.name}</p>
                      <p className="text-sm text-gray-600">{link.email}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 uppercase tracking-wide shadow-sm">
                      ✓ {link.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2.5 backdrop-blur-xl bg-white/70 border border-white/40 rounded-xl text-xs text-gray-700 break-all font-mono shadow-sm">
                      {link.inviteLink}
                    </code>
                    <button
                      onClick={() => copyToClipboard(link.inviteLink, link.id)}
                      className={`p-2.5 rounded-xl transition-all flex-shrink-0 shadow-sm ${
                        copiedLink === link.id
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 shadow-md'
                          : 'backdrop-blur-xl bg-white/70 border border-white/40 text-gray-700 hover:bg-white/90'
                      }`}
                      title={copiedLink === link.id ? 'Copied!' : 'Copy to clipboard'}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/30">
              <button
                onClick={resetInviteFlow}
                className="w-full py-3.5 px-4 backdrop-blur-xl bg-white/60 hover:bg-white/80 border border-white/40 text-gray-900 font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Back to Assessments
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}