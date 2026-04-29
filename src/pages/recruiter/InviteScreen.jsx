// InviteScreen — select assessment, add candidates via individual rows, bulk paste, or CSV upload
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UserPlus, X, Plus, Send, Loader, CheckCircle,
  AlertCircle, ChevronDown, ClipboardPaste, Trash2, Upload, FileSpreadsheet,
} from 'lucide-react';
import { getAllAssessments, sendCandidateInvites } from '../../api/recruiter/assessment.jsx';

function emptyRow() {
  return { id: Date.now() + Math.random(), name: '', email: '' };
}

function parseEmailLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const angleMatch = trimmed.match(/^(.+?)\s*<([^>]+)>/);
  if (angleMatch) return { name: angleMatch[1].trim(), email: angleMatch[2].trim() };
  const commaMatch = trimmed.match(/^([^,@]+),\s*(\S+@\S+\.\S+)$/);
  if (commaMatch) return { name: commaMatch[1].trim(), email: commaMatch[2].trim() };
  const emailOnly = trimmed.match(/\S+@\S+\.\S+/);
  if (emailOnly) return { name: '', email: emailOnly[0] };
  return null;
}

// Parse CSV text; skips header row if first cell is "name" or "email"
function parseCsvText(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (i === 0 && (cols[0]?.toLowerCase() === 'name' || cols[0]?.toLowerCase() === 'email')) continue;
    const email = cols.find(c => c.includes('@'));
    const name  = cols.find(c => !c.includes('@') && c.length > 0) || '';
    if (email) results.push({ id: Date.now() + Math.random() * (i + 1), name, email });
  }
  return results;
}

const MODES = [
  { key: 'individual', label: 'Individual',  icon: UserPlus       },
  { key: 'bulk',       label: 'Bulk Paste',  icon: ClipboardPaste },
  { key: 'csv',        label: 'Upload CSV',  icon: FileSpreadsheet},
];

export default function InviteScreen() {
  const [searchParams] = useSearchParams();

  const [mode,        setMode]        = useState('individual');
  const [assessments, setAssessments] = useState([]);
  const [selectedId,  setSelectedId]  = useState(searchParams.get('assessmentId') || '');
  const [assLoading,  setAssLoading]  = useState(true);
  const [rows,        setRows]        = useState([emptyRow()]);
  const [sending,     setSending]     = useState(false);
  const [success,     setSuccess]     = useState(null);
  const [error,       setError]       = useState('');
  const [bulkText,    setBulkText]    = useState('');
  const [csvRows,     setCsvRows]     = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const csvInputRef = useRef(null);
  const pasteRef    = useRef(null);

  useEffect(() => {
    getAllAssessments()
      .then(d => {
        const list = d.data || d;
        setAssessments(list);
        if (!selectedId && list.length > 0) setSelectedId(String(list[0].id));
      })
      .catch(() => setError('Could not load assessments.'))
      .finally(() => setAssLoading(false));
  }, []);

  // ── Row helpers ──────────────────────────────────────────────
  const addRow    = () => setRows(r => [...r, emptyRow()]);
  const removeRow = (id) => setRows(r => r.filter(row => row.id !== id));
  const updateRow = (id, field, val) =>
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: val } : row));

  // ── Bulk parse ───────────────────────────────────────────────
  const applyBulk = () => {
    const parsed = bulkText.split('\n').map(parseEmailLine).filter(Boolean);
    if (parsed.length === 0) return;
    setRows(parsed.map(p => ({ id: Date.now() + Math.random(), name: p.name, email: p.email })));
    setMode('individual');
    setBulkText('');
  };

  // ── CSV file handler ─────────────────────────────────────────
  const handleCsvFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setCsvRows(parseCsvText(ev.target.result || ''));
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleCsvDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.csv')) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setCsvRows(parseCsvText(ev.target.result || ''));
    reader.readAsText(file);
  };

  const clearCsv = () => { setCsvRows([]); setCsvFileName(''); };

  // ── Candidates to send ───────────────────────────────────────
  const candidatesToSend = mode === 'individual'
    ? rows.filter(r => r.email.trim().includes('@'))
    : mode === 'csv'
    ? csvRows.filter(r => r.email.trim().includes('@'))
    : [];
  const validCount = candidatesToSend.length;

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    if (!selectedId) { setError('Please select an assessment.'); return; }
    if (validCount === 0) { setError('Add at least one valid email address.'); return; }

    setSending(true);
    try {
      const res = await sendCandidateInvites(selectedId, candidatesToSend.map(r => ({ name: r.name, email: r.email.trim() })));
      const data = res.data || res;
      setSuccess({ invited: data.invited ?? validCount, results: data.results || [] });
      setRows([emptyRow()]);
      clearCsv();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to send invites.');
    } finally {
      setSending(false);
    }
  };

  const reset = () => { setSuccess(null); setRows([emptyRow()]); clearCsv(); };

  const selectedName = assessments.find(a => String(a.id) === selectedId)?.name;

  return (
    <div className="p-6 md:p-8 max-w-[760px]">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-[20px] font-bold text-[#FAFAFA] font-display tracking-tight">Invite Candidates</h1>
        <p className="text-[13px] text-[#52525B] mt-0.5">Send assessment invitations via email. Each candidate receives a unique access link.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl">
          <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
          <p className="text-[13px] text-[#F43F5E]">{error}</p>
        </div>
      )}

      {/* ── Success state ─────────────────────────────────────── */}
      {success && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#022C22] border border-[#065F46] flex items-center justify-center mb-5">
            <CheckCircle className="w-7 h-7 text-[#10B981]" />
          </div>
          <h2 className="text-[20px] font-bold text-[#FAFAFA] font-display mb-1">
            {success.invited} invite{success.invited !== 1 ? 's' : ''} sent
          </h2>
          <p className="text-[13px] text-[#52525B] mb-6">
            Candidates will receive an email with their unique assessment link for{' '}
            <span className="text-[#A1A1AA]">{selectedName}</span>.
          </p>
          {success.results.length > 0 && (
            <div className="w-full max-w-md rounded-xl border border-[#27272A] overflow-hidden mb-6 text-left">
              {success.results.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < success.results.length - 1 ? 'border-b border-[#1C1C20]' : ''}`}>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${r.status === 'sent' ? 'bg-[#022C22] text-[#10B981]' : 'bg-[#1C0813] text-[#F43F5E]'}`}>
                    {r.status === 'sent' ? '✓' : '✕'}
                  </span>
                  <span className="text-[12px] text-[#E4E4E7] flex-1 truncate">{r.email}</span>
                  {r.error && <span className="text-[11px] text-[#52525B] truncate max-w-[140px]">{r.error}</span>}
                </div>
              ))}
            </div>
          )}
          <button onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#083344] border border-[#0E7490] text-[#06B6D4] text-[13px] font-semibold rounded-xl hover:bg-[#0a3d52] transition-all">
            <UserPlus className="w-4 h-4" />Invite more
          </button>
        </div>
      )}

      {!success && (
        <>
          {/* Assessment selector */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-[#52525B] uppercase tracking-[0.14em] mb-2">Assessment</label>
            {assLoading ? (
              <div className="flex items-center gap-2 text-[13px] text-[#52525B]"><Loader className="w-3.5 h-3.5 animate-spin" />Loading…</div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#111113] border border-[#27272A] rounded-xl focus-within:border-[#3F3F46] transition-colors">
                <ChevronDown className="w-3.5 h-3.5 text-[#52525B] flex-shrink-0" />
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-[#E4E4E7] focus:outline-none cursor-pointer">
                  <option value="" className="bg-[#111113]">Select an assessment…</option>
                  {assessments.map(a => <option key={a.id} value={a.id} className="bg-[#111113]">{a.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Mode selector tabs */}
          <div className="flex items-center gap-1 bg-[#111113] border border-[#27272A] rounded-xl p-1 mb-5 w-fit">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold rounded-lg transition-all duration-150 ${
                  mode === key
                    ? 'bg-[#1C1C20] text-[#E4E4E7] shadow-sm'
                    : 'text-[#52525B] hover:text-[#A1A1AA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Mode: Individual ── */}
          {mode === 'individual' && (
            <div className="rounded-xl border border-[#27272A] overflow-hidden mb-4">
              <div className="grid grid-cols-[1fr_1fr_32px] gap-2 px-4 py-2 bg-[#111113] border-b border-[#27272A]">
                <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-[0.14em]">Name</p>
                <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-[0.14em]">Email</p>
                <span />
              </div>
              <div className="divide-y divide-[#1C1C20]">
                {rows.map(row => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center px-4 py-2.5 bg-[#0C0C0E]">
                    <input
                      type="text" placeholder="Full name (optional)"
                      value={row.name} onChange={e => updateRow(row.id, 'name', e.target.value)}
                      className="bg-[#111113] border border-[#27272A] rounded-lg px-3 py-2 text-[12px] text-[#E4E4E7] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#3F3F46] transition-colors"
                    />
                    <input
                      type="email" placeholder="email@company.com"
                      value={row.email} onChange={e => updateRow(row.id, 'email', e.target.value)}
                      className={`bg-[#111113] border rounded-lg px-3 py-2 text-[12px] text-[#E4E4E7] placeholder:text-[#3F3F46] focus:outline-none transition-colors ${
                        row.email && !row.email.includes('@') ? 'border-[#881337] focus:border-[#F43F5E]' : 'border-[#27272A] focus:border-[#3F3F46]'
                      }`}
                    />
                    <button
                      onClick={() => rows.length > 1 ? removeRow(row.id) : null}
                      disabled={rows.length === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#3F3F46] hover:text-[#F43F5E] hover:bg-[#1C0813] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-[#111113] border-t border-[#27272A]">
                <button onClick={addRow} className="flex items-center gap-1.5 text-[12px] text-[#52525B] hover:text-[#A1A1AA] transition-colors">
                  <Plus className="w-3.5 h-3.5" />Add row
                </button>
                {rows.length > 1 && (
                  <button onClick={() => setRows([emptyRow()])} className="flex items-center gap-1 text-[11px] text-[#3F3F46] hover:text-[#F43F5E] transition-colors">
                    <Trash2 className="w-3 h-3" />Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Mode: Bulk Paste ── */}
          {mode === 'bulk' && (
            <div className="rounded-xl border border-[#27272A] overflow-hidden mb-4">
              <div className="px-4 pt-4 pb-2 bg-[#111113]">
                <p className="text-[11px] text-[#52525B] mb-3 leading-relaxed">
                  Paste one candidate per line. Accepted formats:
                  <br />·{' '}<code className="text-[#A1A1AA] bg-[#0C0C0E] px-1 py-0.5 rounded text-[10px]">Alice Foo &lt;alice@co.com&gt;</code>
                  <br />·{' '}<code className="text-[#A1A1AA] bg-[#0C0C0E] px-1 py-0.5 rounded text-[10px]">Alice Foo, alice@co.com</code>
                  <br />·{' '}<code className="text-[#A1A1AA] bg-[#0C0C0E] px-1 py-0.5 rounded text-[10px]">alice@co.com</code>
                </p>
                <textarea
                  ref={pasteRef}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  rows={8}
                  className="w-full bg-[#0C0C0E] text-[12px] text-[#E4E4E7] font-mono placeholder:text-[#3F3F46] border border-[#27272A] rounded-lg p-3 focus:outline-none focus:border-[#3F3F46] resize-none"
                  placeholder={"Alice Foo <alice@example.com>\nBob Bar, bob@example.com\ncharlie@example.com"}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-[#111113] border-t border-[#1C1C20]">
                <span className="text-[11px] text-[#3F3F46]">
                  {bulkText.trim() ? `≈ ${bulkText.split('\n').filter(l => l.trim()).length} line${bulkText.split('\n').filter(l => l.trim()).length !== 1 ? 's' : ''}` : 'Paste emails above'}
                </span>
                <button onClick={applyBulk} disabled={!bulkText.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#083344] border border-[#0E7490] text-[#06B6D4] text-[12px] font-semibold rounded-lg hover:bg-[#0a3d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Apply & Preview
                </button>
              </div>
            </div>
          )}

          {/* ── Mode: CSV Upload ── */}
          {mode === 'csv' && (
            <div className="mb-4 space-y-3">
              {/* Drop zone */}
              {csvRows.length === 0 && (
                <label
                  className="flex flex-col items-center justify-center gap-4 py-10 border border-dashed border-[#27272A] hover:border-[#06B6D4]/40 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#06B6D4]/[0.015] bg-[#0C0C0E]"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleCsvDrop}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#111113] border border-[#27272A] flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-[#3F3F46]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-[#A1A1AA]">Drop a CSV file here</p>
                    <p className="text-[11px] text-[#3F3F46] mt-1">or click to browse</p>
                    <p className="text-[10px] text-[#27272A] mt-2">Format: <code className="text-[#3F3F46]">name,email</code> per row — header row is auto-detected</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#27272A] rounded-lg hover:border-[#3F3F46] transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#52525B]" />
                    <span className="text-[12px] font-semibold text-[#52525B]">Browse file</span>
                  </div>
                  <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleCsvFile} className="hidden" />
                </label>
              )}

              {/* CSV preview */}
              {csvRows.length > 0 && (
                <div className="rounded-xl border border-[#27272A] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#111113] border-b border-[#27272A]">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#06B6D4]" />
                      <span className="text-[12px] font-semibold text-[#E4E4E7]">{csvFileName}</span>
                      <span className="text-[11px] text-[#52525B] px-2 py-0.5 bg-[#1C1C20] rounded">{csvRows.length} candidate{csvRows.length !== 1 ? 's' : ''} parsed</span>
                    </div>
                    <button onClick={clearCsv} className="text-[11px] text-[#3F3F46] hover:text-[#F43F5E] transition-colors flex items-center gap-1">
                      <X className="w-3 h-3" />Remove
                    </button>
                  </div>

                  {/* Column heads */}
                  <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-[#0C0C0E] border-b border-[#1C1C20]">
                    <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-[0.14em]">Name</p>
                    <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-[0.14em]">Email</p>
                  </div>

                  {/* Preview rows (capped at 8 for display) */}
                  <div className="divide-y divide-[#1C1C20] max-h-[260px] overflow-y-auto">
                    {csvRows.slice(0, 50).map((row, i) => (
                      <div key={i} className="grid grid-cols-2 gap-4 px-4 py-2.5 bg-[#0C0C0E] hover:bg-[#111113] transition-colors">
                        <p className="text-[12px] text-[#A1A1AA] truncate">{row.name || <span className="text-[#3F3F46] italic">—</span>}</p>
                        <p className="text-[12px] text-[#E4E4E7] truncate">{row.email}</p>
                      </div>
                    ))}
                  </div>

                  {csvRows.length > 50 && (
                    <div className="px-4 py-2.5 bg-[#111113] border-t border-[#27272A] text-center">
                      <p className="text-[11px] text-[#52525B]">+ {csvRows.length - 50} more candidates not shown</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={sending || validCount === 0 || !selectedId}
            className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)', color: '#fff', boxShadow: '0 0 16px rgba(6,182,212,0.15)' }}
          >
            {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending…' : `Send ${validCount > 0 ? validCount : ''} Invite${validCount !== 1 ? 's' : ''}`}
          </button>

          {validCount > 0 && selectedId && (
            <p className="text-center text-[11px] text-[#52525B] mt-2">
              Inviting <span className="text-[#A1A1AA]">{validCount}</span> candidate{validCount !== 1 ? 's' : ''} to{' '}
              <span className="text-[#A1A1AA]">{selectedName}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
