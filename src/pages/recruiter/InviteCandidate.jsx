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
      <div className="min-h-screen bg-navy-50/40 flex items-center justify-center">
        <Loader className="w-6 h-6 text-navy-500 animate-spin" />
      </div>
    );
  }

  if (!selectedAssessment) {
    return (
      <div className="min-h-screen bg-navy-50/40 flex items-center justify-center">
        <div className="card-elevated p-10 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-navy-900 mb-1.5">Assessment Not Found</h1>
          <p className="text-sm text-navy-800/50 mb-5">The requested assessment could not be found</p>
          <button onClick={resetInviteFlow} className="btn-primary">
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50/40">
      {/* ── Header ───────────────────────────────────── */}
      <header className="bg-white border-b border-navy-900/8 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={resetInviteFlow}
            className="btn-ghost py-2 px-3 text-navy-800/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-5 w-px bg-navy-900/8"></div>
          <div>
            <h1 className="text-sm font-semibold text-navy-900">{selectedAssessment.name}</h1>
            <p className="text-[11px] text-navy-800/40">Invite candidates to this assessment</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {success && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200/60 rounded-card animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800 font-medium">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200/60 rounded-card animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="text-sm text-rose-800 font-medium">{error}</p>
          </div>
        )}

        {!showInviteLinks ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ── Main Panel: Candidates ──────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Add Candidate Form */}
              <div className="card-surface p-5">
                <h2 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-navy-500" />
                  Add Candidates
                </h2>

                <div className="bg-navy-50/50 border border-navy-900/6 rounded-lg p-4 mb-4">
                  <p className="section-label mb-3">Add Manually</p>
                  <div className="flex gap-2.5 mb-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      className="input-field flex-1"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleAddCandidate}
                      className="btn-primary px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-navy-900/8"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2.5 bg-navy-50/50 text-[11px] font-medium text-navy-800/40 uppercase tracking-wider">or upload</span>
                    </div>
                  </div>

                  <label className="flex items-center justify-center gap-2 px-4 py-4 border border-dashed border-navy-900/12 hover:border-navy-500/30 rounded-lg cursor-pointer transition-colors duration-150 group bg-white/60">
                    <Upload className="w-4 h-4 text-navy-500 group-hover:text-navy-700 transition-colors" />
                    <span className="text-sm font-medium text-navy-800/50 group-hover:text-navy-700 transition-colors">
                      Upload CSV file
                    </span>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleParseExcel}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-[11px] text-navy-800/35 text-center">CSV format: Name, Email (one per row)</p>
                </div>
              </div>

              {/* Candidates List */}
              <div className="card-surface p-5">
                {candidates.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="section-label">Candidates ({candidates.length})</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-1.5">
                      {candidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between px-3.5 py-2.5 bg-navy-50/40 border border-navy-900/4 rounded-lg hover:bg-navy-50 transition-colors duration-150">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-navy-900 truncate">{candidate.name}</p>
                            <p className="text-xs text-navy-800/40">{candidate.email}</p>
                          </div>
                          <button
                            onClick={() => removeCandidateRow(candidate.id)}
                            className="p-1.5 text-navy-800/25 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all duration-150 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 border border-dashed border-navy-900/8 rounded-lg">
                    <Users className="w-8 h-8 text-navy-800/15 mx-auto mb-2" />
                    <p className="text-sm text-navy-800/40 font-medium">No candidates added yet</p>
                    <p className="text-xs text-navy-800/25 mt-0.5">Add manually or import from CSV</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sidebar: Summary ────────────────── */}
            <div className="card-surface p-5 h-fit lg:sticky lg:top-24">
              <p className="section-label mb-4">Assessment Summary</p>
              
              <div className="space-y-2.5">
                <div className="bg-navy-50/50 border border-navy-900/6 rounded-lg px-3.5 py-3">
                  <p className="text-[11px] text-navy-800/40 font-medium uppercase tracking-wider">Assessment</p>
                  <p className="text-sm font-semibold text-navy-900 mt-1">{selectedAssessment.name}</p>
                </div>
                
                <div className="bg-navy-50/50 border border-navy-900/6 rounded-lg px-3.5 py-3">
                  <p className="text-[11px] text-navy-800/40 font-medium uppercase tracking-wider">Duration</p>
                  <p className="text-sm font-semibold text-navy-900 mt-1">{selectedAssessment.duration_minutes} minutes</p>
                </div>
                
                <div className="bg-navy-50/50 border border-navy-900/6 rounded-lg px-3.5 py-3">
                  <p className="text-[11px] text-navy-800/40 font-medium uppercase tracking-wider">Tasks</p>
                  <p className="text-sm font-semibold text-navy-900 mt-1">{selectedAssessment.tasks?.length || 0}</p>
                </div>

                <div className="bg-navy-100 border border-navy-500/10 rounded-lg px-3.5 py-3">
                  <p className="text-[11px] text-navy-700 font-medium uppercase tracking-wider">Candidates</p>
                  <p className="text-lg font-bold text-navy-900 mt-0.5">{candidates.length}</p>
                </div>
              </div>

              <button
                onClick={handleSendInvites}
                disabled={candidates.length === 0 || inviteLoading}
                className="btn-primary w-full justify-center mt-5"
              >
                {inviteLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Invites
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ── Invite Links View ────────────────────── */
          <div className="card-surface p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-navy-900">Invitations Sent</h2>
                <p className="text-sm text-navy-800/50 mt-0.5">Share these unique links with your candidates</p>
              </div>
              <button
                onClick={() => {
                  setCandidates([]);
                  setInviteLinks([]);
                  setShowInviteLinks(false);
                }}
                className="btn-secondary text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add More
              </button>
            </div>

            <div className="mb-4">
              <button
                onClick={downloadInviteLinks}
                className="btn-ghost text-xs text-navy-500"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {inviteLinks.map((link) => (
                <div key={link.id} className="bg-navy-50/40 border border-navy-900/6 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{link.name}</p>
                      <p className="text-xs text-navy-800/40">{link.email}</p>
                    </div>
                    <span className="badge-blue text-[10px]">
                      <CheckCircle className="w-3 h-3" />
                      {link.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-navy-900/6 rounded-md text-xs text-navy-800/60 break-all font-mono">
                      {link.inviteLink}
                    </code>
                    <button
                      onClick={() => copyToClipboard(link.inviteLink, link.id)}
                      className={`p-2 rounded-md transition-all duration-150 flex-shrink-0 ${
                        copiedLink === link.id
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-white border border-navy-900/8 text-navy-800/40 hover:text-navy-700 hover:border-navy-900/15'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-navy-900/6">
              <button
                onClick={resetInviteFlow}
                className="btn-secondary w-full justify-center"
              >
                Back to Assessments
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}