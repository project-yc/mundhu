import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Loader, AlertCircle, CheckCircle, Users, Upload, Copy, Download, ArrowLeft, Mail, Trash2 } from 'lucide-react';
import { getAssessmentById, sendCandidateInvites } from '../api/assessment';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!selectedAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Assessment Not Found</h1>
          <button
            onClick={resetInviteFlow}
            className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={resetInviteFlow}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-semibold"
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Messages */}
        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {!showInviteLinks ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Candidates List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  Invite Candidates
                </h2>

                {/* Add Candidate Form */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Add Candidate Manually</h3>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button
                      onClick={handleAddCandidate}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-600 font-medium">OR upload Excel</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-center gap-3 px-6 py-6 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-all">
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
                    <p className="mt-2 text-xs text-gray-600 text-center font-medium">
                      📄 CSV format: Name, Email (one candidate per row)
                    </p>
                  </div>
                </div>

                {/* Candidates Table */}
                <div className="space-y-3">
                  {candidates.length > 0 ? (
                    <>
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">
                          {candidates.length}
                        </span>
                        Candidate{candidates.length !== 1 ? 's' : ''} added
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {candidates.map((candidate) => (
                          <div key={candidate.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{candidate.name}</p>
                              <p className="text-sm text-gray-600">{candidate.email}</p>
                            </div>
                            <button
                              onClick={() => removeCandidateRow(candidate.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove candidate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No candidates added yet</p>
                      <p className="text-sm text-gray-500 mt-1">Add candidates manually or import from Excel</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 h-fit sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Assessment Summary</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 uppercase tracking-widest font-bold">Assessment</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">{selectedAssessment.name}</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 uppercase tracking-widest font-bold">Duration</p>
                  <p className="text-lg font-bold text-purple-900 mt-2">{selectedAssessment.duration_minutes} minutes</p>
                </div>
                
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-600 uppercase tracking-widest font-bold">Tasks</p>
                  <p className="text-lg font-bold text-emerald-900 mt-2">{selectedAssessment.tasks?.length || 0}</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-600 uppercase tracking-widest font-bold">Candidates</p>
                  <p className="text-lg font-bold text-orange-900 mt-2">{candidates.length}</p>
                </div>

                <button
                  onClick={handleSendInvites}
                  disabled={candidates.length === 0 || inviteLoading}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
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
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
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
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                + Add More
              </button>
            </div>

            <div className="mb-6 flex gap-3">
              <button
                onClick={downloadInviteLinks}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inviteLinks.map((link) => (
                <div key={link.id} className="p-5 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900">{link.name}</p>
                      <p className="text-sm text-gray-600">{link.email}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                      ✓ {link.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-xs text-gray-700 break-all font-mono">
                      {link.inviteLink}
                    </code>
                    <button
                      onClick={() => copyToClipboard(link.inviteLink, link.id)}
                      className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        copiedLink === link.id
                          ? 'bg-green-100 text-green-600 shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      title={copiedLink === link.id ? 'Copied!' : 'Copy to clipboard'}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={resetInviteFlow}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-colors"
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