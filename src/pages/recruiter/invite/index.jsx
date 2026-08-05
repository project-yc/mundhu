// InviteScreen — select assessment, add candidates via individual entry, bulk paste, or CSV upload
import { useState, useEffect, useRef, Children, isValidElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import { getAllAssessments, sendCandidateInvites } from '../../../api/recruiter/assessment.jsx';
import { normalizeList } from '../reports/utils/reportRows.js';
import { AskAnythingBar } from '../../../components/recruiter/AskAnythingBar.jsx';

function AssessmentSelect({ assessments, selectedId, onSelect, loading }) {
  return (
    <div className="mb-5">
      <label htmlFor="assessment-select" className="mb-2 block text-[13px] font-medium text-text-primary">
        Assessment
      </label>
      <select
        id="assessment-select"
        value={selectedId}
        onChange={e => onSelect(e.target.value)}
        disabled={loading}
        className="h-10 w-full rounded-[8px] border border-border-subtle bg-white px-3 text-[14px] text-text-primary outline-none ring-0 focus:border-border-strong"
      >
        <option value="">{loading ? 'Loading assessments...' : 'Select assessment'}</option>
        {assessments.map(a => (
          <option key={a.id} value={String(a.id)}>{a.name}</option>
        ))}
      </select>
    </div>
  );
}

function TabsContent({ children }) {
  return <>{children}</>;
}

function InviteModeTabs({ mode, onModeChange, children }) {
  const tabs = [
    { key: 'individual', label: 'Individual' },
    { key: 'bulk', label: 'Bulk paste' },
    { key: 'csv', label: 'CSV upload' },
  ];
  const visibleContent = Children.toArray(children).filter(child => isValidElement(child) && child.props?.value === mode);
  const otherContent = Children.toArray(children).filter(child => !(isValidElement(child) && child.props?.value));

  return (
    <div className="rounded-[10px] border border-border-subtle bg-white">
      <div className="flex gap-2 border-b border-border-subtle p-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onModeChange(tab.key)}
            className={`rounded-[8px] px-3 py-2 text-[13px] font-medium transition ${
              mode === tab.key ? 'bg-neutral-900 text-white' : 'text-text-secondary hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {otherContent}
        {visibleContent}
      </div>
    </div>
  );
}

function InviteBanner({ children }) {
  if (!children) return null;
  return (
    <div className="mb-4 rounded-[8px] border border-border-subtle bg-slate-50 px-3 py-2 text-[13px] text-text-secondary">
      {children}
    </div>
  );
}

function IndividualTab({ rows, onAdd, onRemove }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const add = () => {
    if (!email.trim()) return;
    onAdd(name.trim(), email.trim());
    setName('');
    setEmail('');
  };

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Candidate name (optional)"
          className="h-10 rounded-[8px] border border-border-subtle px-3 text-[14px]"
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Candidate email"
          className="h-10 rounded-[8px] border border-border-subtle px-3 text-[14px]"
        />
        <button type="button" onClick={add} className="h-10 rounded-[8px] bg-neutral-900 px-4 text-[13px] font-medium text-white">
          Add
        </button>
      </div>

      {rows.length > 0 && (
        <div className="mt-4 space-y-2">
          {rows.map(row => (
            <div key={row.id} className="flex items-center justify-between rounded-[8px] border border-border-subtle px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-text-primary">{row.name || 'Unnamed candidate'}</p>
                <p className="truncate text-[12px] text-text-secondary">{row.email}</p>
              </div>
              <button type="button" onClick={() => onRemove(row.id)} className="text-text-secondary hover:text-red-600" aria-label="Remove candidate">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BulkPasteTab({ bulkText, onChange, onApply }) {
  return (
    <div>
      <textarea
        value={bulkText}
        onChange={e => onChange(e.target.value)}
        rows={8}
        placeholder={'John Doe <john@example.com>\nJane Doe, jane@example.com\nfoo@example.com'}
        className="w-full rounded-[8px] border border-border-subtle px-3 py-2 text-[14px]"
      />
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={onApply} className="h-10 rounded-[8px] bg-neutral-900 px-4 text-[13px] font-medium text-white">
          Apply to list
        </button>
      </div>
    </div>
  );
}

function UploadFileTab({ csvRows, csvFileName, csvFileSize, csvInputRef, onFile, onDrop, onClear }) {
  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="rounded-[10px] border border-dashed border-border-subtle bg-slate-50 p-5 text-center"
      >
        <Upload className="mx-auto mb-2 h-5 w-5 text-text-secondary" />
        <p className="text-[13px] text-text-secondary">Drag and drop a CSV file here, or choose one manually.</p>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          onChange={onFile}
          aria-label="Upload candidates CSV"
          className="mt-3 block w-full text-[13px]"
        />
      </div>

      {csvFileName && (
        <div className="mt-3 flex items-center justify-between rounded-[8px] border border-border-subtle px-3 py-2">
          <div>
            <p className="text-[13px] font-medium text-text-primary">{csvFileName}</p>
            <p className="text-[12px] text-text-secondary">{csvRows.length} rows parsed • {Math.round(csvFileSize / 1024)} KB</p>
          </div>
          <button type="button" onClick={onClear} className="text-[12px] text-text-secondary hover:text-red-600">Clear</button>
        </div>
      )}
    </div>
  );
}

function InviteActionRow({ onSend, onClear, sending, disabled, validCount, showClear }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <p className="text-[12px] text-text-secondary">{validCount} valid candidate{validCount === 1 ? '' : 's'} ready</p>
      <div className="flex gap-2">
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="h-10 rounded-[8px] border border-border-subtle px-4 text-[13px] font-medium text-text-secondary"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || sending}
          className="h-10 rounded-[8px] bg-neutral-900 px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send invites'}
        </button>
      </div>
    </div>
  );
}

function SuccessState({ success, selectedName, onReset }) {
  return (
    <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-5">
      <div className="mb-3 flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
        <div>
          <h2 className="text-[16px] font-semibold text-emerald-900">Invites sent</h2>
          <p className="text-[13px] text-emerald-800">
            {success.invited} candidate{success.invited === 1 ? '' : 's'} invited{selectedName ? ` for ${selectedName}` : ''}.
          </p>
        </div>
      </div>

      <button type="button" onClick={onReset} className="h-10 rounded-[8px] bg-emerald-700 px-4 text-[13px] font-medium text-white">
        Invite more candidates
      </button>
    </div>
  );
}

function makeRow(name, email) {
  return { id: Date.now() + Math.random(), name, email };
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
    const name = cols.find(c => !c.includes('@') && c.length > 0) || '';
    if (email) results.push({ id: Date.now() + Math.random() * (i + 1), name, email });
  }
  return results;
}

export default function InviteScreen() {
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState('individual');
  const [assessments, setAssessments] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('assessmentId') || '');
  const [assLoading, setAssLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvFileSize, setCsvFileSize] = useState(0);
  const csvInputRef = useRef(null);

  useEffect(() => {
    getAllAssessments()
      .then(payload => {
        const list = normalizeList(payload);
        setAssessments(list);
        if (!selectedId && list.length > 0) setSelectedId(String(list[0].id));
      })
      .catch(() => setError('Could not load assessments.'))
      .finally(() => setAssLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Row helpers ──────────────────────────────────────────────
  const addCandidateRow = (name, email) => setRows(r => [...r, makeRow(name, email)]);
  const removeRow = id => setRows(r => r.filter(row => row.id !== id));

  // ── Bulk parse ───────────────────────────────────────────────
  const applyBulk = () => {
    const parsed = bulkText.split('\n').map(parseEmailLine).filter(Boolean);
    if (parsed.length === 0) return;
    setRows(parsed.map(p => makeRow(p.name, p.email)));
    setMode('individual');
    setBulkText('');
  };

  // ── CSV file handler ─────────────────────────────────────────
  const readCsvFile = file => {
    if (!file) return;
    setCsvFileName(file.name);
    setCsvFileSize(file.size);
    const reader = new FileReader();
    reader.onload = ev => setCsvRows(parseCsvText(ev.target.result || ''));
    reader.readAsText(file);
  };

  const handleCsvFile = e => {
    const file = e.target.files?.[0];
    readCsvFile(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleCsvDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.csv')) return;
    readCsvFile(file);
  };

  const clearCsv = () => { setCsvRows([]); setCsvFileName(''); setCsvFileSize(0); };

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
      setRows([]);
      clearCsv();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to send invites.');
    } finally {
      setSending(false);
    }
  };

  const reset = () => { setSuccess(null); setRows([]); clearCsv(); };
  const clearAll = () => { setRows([]); clearCsv(); setBulkText(''); };

  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  const selectedName = safeAssessments.find(a => String(a.id) === selectedId)?.name;

  const bannerText = mode === 'bulk'
    ? 'Paste one candidate per line.'
    : validCount > 0
    ? `Inviting ${validCount} candidate${validCount !== 1 ? 's' : ''} to ${selectedName || 'this assessment'}.`
    : null;

  return (
    <div className="flex min-h-full flex-col bg-page">
      {/* Persistent global bar — same placement as dashboard, pipeline, reports and task library. */}
      <AskAnythingBar />

      <div className="min-h-0 flex-1 p-3 pt-0">
        <section className="min-h-[calc(100vh-76px)] rounded-[10px] border border-border-subtle bg-surface px-[39px] pb-[24px] pt-[42px]">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-[26px]">
              <h1 className="text-[20px] font-semibold text-text-primary">Invite candidates</h1>
              <p className="mt-[5px] text-[14px] text-text-secondary">
                Send assessment invitations via email. Each candidate receives a unique access link.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-5 flex items-center gap-3 rounded-[8px] border border-error-border bg-error-bg px-4 py-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-error" />
                <p className="text-[13px] text-error">{error}</p>
              </div>
            )}

            {success ? (
              <SuccessState success={success} selectedName={selectedName} onReset={reset} />
            ) : (
              <>
                <AssessmentSelect
                  assessments={safeAssessments}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  loading={assLoading}
                />

                <InviteModeTabs mode={mode} onModeChange={setMode}>
                  <InviteBanner>{bannerText}</InviteBanner>

                  <TabsContent value="individual">
                    <IndividualTab rows={rows} onAdd={addCandidateRow} onRemove={removeRow} />
                  </TabsContent>
                  <TabsContent value="bulk">
                    <BulkPasteTab bulkText={bulkText} onChange={setBulkText} onApply={applyBulk} />
                  </TabsContent>
                  <TabsContent value="csv">
                    <UploadFileTab
                      csvRows={csvRows}
                      csvFileName={csvFileName}
                      csvFileSize={csvFileSize}
                      csvInputRef={csvInputRef}
                      onFile={handleCsvFile}
                      onDrop={handleCsvDrop}
                      onClear={clearCsv}
                    />
                  </TabsContent>
                </InviteModeTabs>

                <InviteActionRow
                  onSend={handleSubmit}
                  onClear={clearAll}
                  sending={sending}
                  disabled={validCount === 0 || !selectedId}
                  validCount={validCount}
                  showClear={rows.length > 0 || csvRows.length > 0 || bulkText.trim().length > 0}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
