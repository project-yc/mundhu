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
        <h1 className="text-[20px] font-bold text-text-primary font-display tracking-tight">Invite Candidates</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">Send assessment invitations via email. Each candidate receives a unique access link.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-[13px] text-error">{error}</p>
        </div>
      )}

      {/* ── Success state ─────────────────────────────────────── */}
      {success && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-success-bg border border-success-border flex items-center justify-center mb-5">
            <CheckCircle className="w-7 h-7 text-success" />
          </div>
          <h2 className="text-[20px] font-bold text-text-primary font-display mb-1">
            {success.invited} invite{success.invited !== 1 ? 's' : ''} sent
          </h2>
          <p className="text-[13px] text-text-secondary mb-6">
            Candidates will receive an email with their unique assessment link for{' '}
            <span className="text-text-secondary">{selectedName}</span>.
          </p>
          {success.results.length > 0 && (
            <div className="w-full max-w-md rounded-xl border border-border-default overflow-hidden mb-6 text-left">
              {success.results.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < success.results.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${r.status === 'sent' ? 'bg-success-bg text-success' : 'bg-error-bg text-error'}`}>
                    {r.status === 'sent' ? '✓' : '✕'}
                  </span>
                  <span className="text-[12px] text-text-primary flex-1 truncate">{r.email}</span>
                  {r.error && <span className="text-[11px] text-text-secondary truncate max-w-[140px]">{r.error}</span>}
                </div>
              ))}
            </div>
          )}
          <button onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-tint border border-brand-border text-brand text-[13px] font-semibold rounded-xl hover:bg-brand-tint-light transition-all">
            <UserPlus className="w-4 h-4" />Invite more
          </button>
        </div>
      )}

      {!success && (
        <>
          {/* Assessment selector */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-[0.14em] mb-2">Assessment</label>
            {assLoading ? (
              <div className="flex items-center gap-2 text-[13px] text-text-secondary"><Loader className="w-3.5 h-3.5 animate-spin" />Loading…</div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-border-default rounded-xl focus-within:border-border-strong transition-colors">
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-text-primary focus:outline-none cursor-pointer">
                  <option value="" className="bg-surface">Select an assessment…</option>
                  {assessments.map(a => <option key={a.id} value={a.id} className="bg-surface">{a.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Mode selector tabs */}
          <div className="flex items-center gap-1 bg-surface border border-border-default rounded-xl p-1 mb-5 w-fit">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold rounded-lg transition-all duration-150 ${
                  mode === key
                    ? 'bg-surface-muted text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-secondary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Mode: Individual ── */}
          {mode === 'individual' && (
            <div className="rounded-xl border border-border-default overflow-hidden mb-4">
              <div className="grid grid-cols-[1fr_1fr_32px] gap-2 px-4 py-2 bg-surface border-b border-border-default">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">Name</p>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">Email</p>
                <span />
              </div>
              <div className="divide-y divide-border-subtle">
                {rows.map(row => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center px-4 py-2.5 bg-page">
                    <input
                      type="text" placeholder="Full name (optional)"
                      value={row.name} onChange={e => updateRow(row.id, 'name', e.target.value)}
                      className="bg-surface border border-border-default rounded-lg px-3 py-2 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
                    />
                    <input
                      type="email" placeholder="email@company.com"
                      value={row.email} onChange={e => updateRow(row.id, 'email', e.target.value)}
                      className={`bg-surface border rounded-lg px-3 py-2 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                        row.email && !row.email.includes('@') ? 'border-error-border focus:border-[#F43F5E]' : 'border-border-default focus:border-border-strong'
                      }`}
                    />
                    <button
                      onClick={() => rows.length > 1 ? removeRow(row.id) : null}
                      disabled={rows.length === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-error-bg disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border-default">
                <button onClick={addRow} className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-secondary transition-colors">
                  <Plus className="w-3.5 h-3.5" />Add row
                </button>
                {rows.length > 1 && (
                  <button onClick={() => setRows([emptyRow()])} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-error transition-colors">
                    <Trash2 className="w-3 h-3" />Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Mode: Bulk Paste ── */}
          {mode === 'bulk' && (
            <div className="rounded-xl border border-border-default overflow-hidden mb-4">
              <div className="px-4 pt-4 pb-2 bg-surface">
                <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
                  Paste one candidate per line. Accepted formats:
                  <br />·{' '}<code className="text-text-secondary bg-page px-1 py-0.5 rounded text-[10px]">Alice Foo &lt;alice@co.com&gt;</code>
                  <br />·{' '}<code className="text-text-secondary bg-page px-1 py-0.5 rounded text-[10px]">Alice Foo, alice@co.com</code>
                  <br />·{' '}<code className="text-text-secondary bg-page px-1 py-0.5 rounded text-[10px]">alice@co.com</code>
                </p>
                <textarea
                  ref={pasteRef}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  rows={8}
                  className="w-full bg-page text-[12px] text-text-primary font-mono placeholder:text-text-muted border border-border-default rounded-lg p-3 focus:outline-none focus:border-border-strong resize-none"
                  placeholder={"Alice Foo <alice@example.com>\nBob Bar, bob@example.com\ncharlie@example.com"}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border-subtle">
                <span className="text-[11px] text-text-muted">
                  {bulkText.trim() ? `≈ ${bulkText.split('\n').filter(l => l.trim()).length} line${bulkText.split('\n').filter(l => l.trim()).length !== 1 ? 's' : ''}` : 'Paste emails above'}
                </span>
                <button onClick={applyBulk} disabled={!bulkText.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-tint border border-brand-border text-brand text-[12px] font-semibold rounded-lg hover:bg-brand-tint-light disabled:opacity-40 disabled:cursor-not-allowed transition-all">
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
                  className="flex flex-col items-center justify-center gap-4 py-10 border border-dashed border-border-default hover:border-brand/40 rounded-xl cursor-pointer transition-all duration-150 hover:bg-brand/[0.015] bg-page"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleCsvDrop}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border-default flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-text-muted" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-text-secondary">Drop a CSV file here</p>
                    <p className="text-[11px] text-text-muted mt-1">or click to browse</p>
                    <p className="text-[10px] text-text-faint mt-2">Format: <code className="text-text-muted">name,email</code> per row — header row is auto-detected</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-default rounded-lg hover:border-border-strong transition-colors">
                    <Upload className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-[12px] font-semibold text-text-secondary">Browse file</span>
                  </div>
                  <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleCsvFile} className="hidden" />
                </label>
              )}

              {/* CSV preview */}
              {csvRows.length > 0 && (
                <div className="rounded-xl border border-border-default overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border-default">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-brand" />
                      <span className="text-[12px] font-semibold text-text-primary">{csvFileName}</span>
                      <span className="text-[11px] text-text-secondary px-2 py-0.5 bg-surface-muted rounded">{csvRows.length} candidate{csvRows.length !== 1 ? 's' : ''} parsed</span>
                    </div>
                    <button onClick={clearCsv} className="text-[11px] text-text-muted hover:text-error transition-colors flex items-center gap-1">
                      <X className="w-3 h-3" />Remove
                    </button>
                  </div>

                  {/* Column heads */}
                  <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-page border-b border-border-subtle">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">Name</p>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">Email</p>
                  </div>

                  {/* Preview rows (capped at 8 for display) */}
                  <div className="divide-y divide-border-subtle max-h-[260px] overflow-y-auto">
                    {csvRows.slice(0, 50).map((row, i) => (
                      <div key={i} className="grid grid-cols-2 gap-4 px-4 py-2.5 bg-page hover:bg-surface transition-colors">
                        <p className="text-[12px] text-text-secondary truncate">{row.name || <span className="text-text-muted italic">—</span>}</p>
                        <p className="text-[12px] text-text-primary truncate">{row.email}</p>
                      </div>
                    ))}
                  </div>

                  {csvRows.length > 50 && (
                    <div className="px-4 py-2.5 bg-surface border-t border-border-default text-center">
                      <p className="text-[11px] text-text-secondary">+ {csvRows.length - 50} more candidates not shown</p>
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
            <p className="text-center text-[11px] text-text-secondary mt-2">
              Inviting <span className="text-text-secondary">{validCount}</span> candidate{validCount !== 1 ? 's' : ''} to{' '}
              <span className="text-text-secondary">{selectedName}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
