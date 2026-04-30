// NewAssessmentWizard — 2-step modal for creating an assessment + task
import { useState, useRef } from 'react';
import {
  X, Loader, AlertCircle, Check, Tag, FolderOpen, Upload, XCircle,
  Clock, ArrowRight, Code, GitBranch, FileCode, CheckCircle,
  Sparkles, MessageSquare, Zap, ZapOff,
} from 'lucide-react';
import JSZip from 'jszip';
import { createAssessment, createTask, uploadTaskZip } from '../../../api/recruiter/assessment.jsx';
import { StepTrack, Field, FInput, FTextarea, DURATION_PRESETS } from './shared/FormPrimitives.jsx';

export default function NewAssessmentWizard({ onClose, onCreated }) {
  const [wizardStep,    setWizardStep]    = useState(0);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError,   setWizardError]   = useState('');
  const [assessmentForm, setAssessmentForm] = useState({ name: '', description: '', duration_minutes: '', ai_level: 'full' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', tags: '', source_type: 'local', git_repo_url: '', git_branch: '' });

  const folderInputRef = useRef(null);
  const [folderUpload,   setFolderUpload]   = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState,    setUploadState]    = useState('idle');
  const [uploadError,    setUploadError]    = useState('');

  const resetUpload = () => {
    setFolderUpload(null); setUploadProgress(0); setUploadState('idle'); setUploadError('');
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const close = () => { resetUpload(); onClose(); };

  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    resetUpload();
    const rootDir = files[0].webkitRelativePath.split('/')[0] || 'task';
    setUploadState('zipping');
    try {
      const zip = new JSZip();
      for (const file of files) zip.file(file.webkitRelativePath || file.name, file);
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const zipFile = new File([blob], `${rootDir}.zip`, { type: 'application/zip' });
      setUploadState('uploading');
      const result = await uploadTaskZip(zipFile, pct => setUploadProgress(pct));
      setFolderUpload({
        fileName: rootDir,
        fileCount: files.length,
        s3_key: result.s3_key,
        starter_bundle_s3_key: result.starter_bundle_s3_key,
        grader_bundle_s3_key: result.grader_bundle_s3_key,
        task_manifest_json: result.task_manifest_json,
      });
      setUploadState('done');
    } catch (err) {
      setUploadState('error');
      setUploadError(err.message || 'Upload failed. Please try again.');
    }
  };

  const handleStep1Next = () => {
    if (!assessmentForm.name.trim() || !assessmentForm.description.trim() || !assessmentForm.duration_minutes) {
      setWizardError('Please fill in all required fields.'); return;
    }
    setWizardError(''); setWizardStep(1);
  };

  const handleFinalCreate = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      setWizardError('Please fill in task title and description.'); return;
    }
    if (taskForm.source_type === 'git' && !taskForm.git_repo_url.trim()) {
      setWizardError('Please enter a Git repository URL.'); return;
    }
    if (taskForm.source_type === 'local' && !folderUpload?.s3_key) {
      setWizardError('Please upload a folder for the local task source.'); return;
    }
    setWizardLoading(true); setWizardError('');
    try {
      const assessmentData = await createAssessment(
        assessmentForm.name,
        assessmentForm.description,
        parseInt(assessmentForm.duration_minutes),
        { ai_level: assessmentForm.ai_level },
      );
      const newAssessment = assessmentData.data || assessmentData;
      const tags = taskForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const additionalInfo = folderUpload?.s3_key ? { uploaded_folder: folderUpload.fileName, file_count: folderUpload.fileCount } : {};
      const taskData = await createTask(
        newAssessment.id, taskForm.title, taskForm.description, tags, [], additionalInfo,
        taskForm.source_type,
        taskForm.source_type === 'git' ? taskForm.git_repo_url : null,
        taskForm.source_type === 'git' ? taskForm.git_branch : null,
        folderUpload?.s3_key || null,
        folderUpload?.starter_bundle_s3_key || null,
        folderUpload?.grader_bundle_s3_key || null,
        folderUpload?.task_manifest_json || null,
      );
      const newTask = taskData.data || taskData;
      onCreated({ ...newAssessment, tasks: [newTask], candidate_counts: { total: 0, invited: 0, in_progress: 0, submitted: 0, expired: 0 } });
      close();
    } catch (err) {
      setWizardError(err.message || 'Failed to create assessment. Please try again.');
    } finally {
      setWizardLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 animate-fadeIn" onClick={close} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-[760px] bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] pointer-events-auto animate-slideInUp" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-[#27272A] flex-shrink-0">
            <div>
              <h2 className="text-[15px] font-bold text-[#FAFAFA] font-display">New Assessment</h2>
              <p className="text-[11px] text-[#52525B] mt-0.5">{wizardStep === 0 ? 'Step 1 of 2 — Define assessment basics' : 'Step 2 of 2 — Configure the task'}</p>
            </div>
            <button onClick={close} className="w-8 h-8 flex items-center justify-center text-[#52525B] hover:text-[#E4E4E7] hover:bg-[#1C1C20] rounded-lg transition-all duration-150">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left sidebar */}
            <div className="w-56 flex-shrink-0 hidden sm:flex flex-col gap-5 bg-[#0C0C0E] border-r border-[#27272A] p-5">
              <StepTrack current={wizardStep} />
              {wizardStep === 1 && assessmentForm.name && (
                <div className="p-3 rounded-xl border border-[#27272A] bg-[#111113] animate-fadeIn">
                  <p className="text-[10px] font-semibold text-[#06B6D4] uppercase tracking-wider mb-2">Assessment</p>
                  <p className="text-[13px] font-semibold text-[#E4E4E7] leading-snug">{assessmentForm.name}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#52525B]">
                    <Clock className="w-3 h-3" />{assessmentForm.duration_minutes} min
                  </div>
                </div>
              )}
              <div className="flex-1" />
              <div className="p-3 rounded-xl bg-[#111113] border border-[#27272A]">
                <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-wider mb-1.5">Note</p>
                <p className="text-[11px] text-[#3F3F46] leading-relaxed">Each assessment contains one task. Candidates receive a timed link.</p>
              </div>
            </div>

            {/* Form panel */}
            <div className="flex-1 overflow-y-auto min-w-0">
              <div className="p-7 space-y-6">
                {wizardError && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[#F43F5E]">{wizardError}</p>
                  </div>
                )}

                {/* Step 1 */}
                {wizardStep === 0 && (
                  <div className="space-y-5 animate-fadeIn">
                    <Field label="Assessment Name">
                      <FInput value={assessmentForm.name} onChange={e => setAssessmentForm({ ...assessmentForm, name: e.target.value })} placeholder="e.g., Senior Backend Engineer — Q2 2026" />
                    </Field>
                    <Field label="Description">
                      <FTextarea value={assessmentForm.description} onChange={e => setAssessmentForm({ ...assessmentForm, description: e.target.value })} placeholder="What skills and areas will this assessment evaluate?" rows={4} />
                    </Field>
                    <Field label="Duration">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {DURATION_PRESETS.map(p => (
                          <button key={p} type="button" onClick={() => setAssessmentForm({ ...assessmentForm, duration_minutes: String(p) })} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all duration-150 ${assessmentForm.duration_minutes === String(p) ? 'bg-[#083344] border-[#06B6D4] text-[#06B6D4]' : 'bg-transparent border-[#27272A] text-[#52525B] hover:border-[#3F3F46] hover:text-[#A1A1AA]'}`}>
                            {p}m
                          </button>
                        ))}
                      </div>
                      <FInput type="number" value={assessmentForm.duration_minutes} onChange={e => setAssessmentForm({ ...assessmentForm, duration_minutes: e.target.value })} placeholder="Or enter custom minutes…" min="1" />
                    </Field>
                    <Field label="AI Assistance">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'full',                label: 'Full Agent',          desc: 'Orchestrator + chat + inline completions', Icon: Sparkles },
                          { value: 'chat_only',           label: 'Chat + Inline',       desc: 'Chat (manual context) + inline completions', Icon: MessageSquare },
                          { value: 'inline_completions',  label: 'Inline Only',         desc: 'Code suggestions only — no chat panel',     Icon: Zap },
                          { value: 'none',                label: 'No AI',               desc: 'All AI features disabled',                  Icon: ZapOff },
                        ].map(({ value, label, desc, Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setAssessmentForm({ ...assessmentForm, ai_level: value })}
                            className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-150 ${
                              assessmentForm.ai_level === value
                                ? 'bg-[#083344] border-[#06B6D4]'
                                : 'bg-transparent border-[#27272A] hover:border-[#3F3F46]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon className={`w-3.5 h-3.5 ${assessmentForm.ai_level === value ? 'text-[#06B6D4]' : 'text-[#52525B]'}`} />
                              <span className={`text-[12px] font-bold ${assessmentForm.ai_level === value ? 'text-[#06B6D4]' : 'text-[#A1A1AA]'}`}>{label}</span>
                            </div>
                            <span className="text-[10px] text-[#52525B] leading-relaxed">{desc}</span>
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {/* Step 2 */}
                {wizardStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    <Field label="Task Title">
                      <FInput value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g., Debug the Payment Service" />
                    </Field>
                    <Field label="Task Description">
                      <FTextarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Describe what the candidate needs to implement, debug, or improve…" rows={4} />
                    </Field>
                    <Field label="Tags" optional>
                      <FInput value={taskForm.tags} onChange={e => setTaskForm({ ...taskForm, tags: e.target.value })} placeholder="Python, FastAPI, debugging — comma separated" />
                      {taskForm.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {taskForm.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#083344] border border-[#0E7490] text-[#06B6D4]">
                              <Tag className="w-2.5 h-2.5" />{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Field>
                    <Field label="Source Type" optional>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'local', label: 'Local Upload',   icon: FileCode  },
                          { value: 'git',   label: 'Git Repository', icon: GitBranch },
                        ].map(({ value, label, icon: Icon }) => (
                          <button key={value} type="button" onClick={() => { setTaskForm({ ...taskForm, source_type: value }); resetUpload(); }} className={`flex items-center justify-center gap-2 py-3 text-[13px] font-semibold rounded-xl border transition-all duration-150 ${taskForm.source_type === value ? 'bg-[#083344] border-[#06B6D4] text-[#06B6D4]' : 'bg-transparent border-[#27272A] text-[#52525B] hover:border-[#3F3F46] hover:text-[#A1A1AA]'}`}>
                            <Icon className="w-4 h-4" />{label}
                          </button>
                        ))}
                      </div>
                    </Field>

                    {taskForm.source_type === 'local' && (
                      <div className="rounded-xl border border-[#27272A] bg-[#0C0C0E] p-4">
                        <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.14em] mb-3">Task Folder <span className="text-[#F43F5E]">*</span></p>
                        {uploadState === 'idle' && (
                          <label className="flex flex-col items-center justify-center gap-3 py-8 border border-dashed border-[#27272A] hover:border-[#06B6D4]/40 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#06B6D4]/[0.02]">
                            <div className="w-10 h-10 rounded-xl bg-[#083344] border border-[#0E7490] flex items-center justify-center">
                              <FolderOpen className="w-5 h-5 text-[#06B6D4]" />
                            </div>
                            <div className="text-center">
                              <span className="text-[13px] font-semibold text-[#A1A1AA] block">Select project folder</span>
                              <span className="text-[11px] text-[#3F3F46]">All files will be compressed and uploaded securely</span>
                            </div>
                            <input ref={folderInputRef} type="file" webkitdirectory="true" multiple onChange={handleFolderSelect} className="hidden" />
                          </label>
                        )}
                        {(uploadState === 'zipping' || uploadState === 'uploading') && (
                          <div className="flex flex-col items-center gap-3 py-6">
                            <Loader className="w-5 h-5 text-[#06B6D4] animate-spin" />
                            <p className="text-[13px] font-medium text-[#A1A1AA]">{uploadState === 'zipping' ? 'Compressing files…' : `Uploading — ${uploadProgress}%`}</p>
                            {uploadState === 'uploading' && (
                              <div className="w-full h-1 bg-[#1C1C20] rounded-full overflow-hidden">
                                <div className="h-full bg-[#06B6D4] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            )}
                          </div>
                        )}
                        {uploadState === 'done' && (
                          <div className="flex items-center gap-3 px-4 py-3 bg-[#022C22] border border-[#065F46] rounded-xl animate-fadeIn">
                            <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#E4E4E7] truncate">{folderUpload?.fileName}/</p>
                              <p className="text-[11px] text-[#10B981]">{folderUpload?.fileCount} files uploaded</p>
                            </div>
                            <button onClick={resetUpload} className="p-1.5 text-[#52525B] hover:text-[#F43F5E] rounded-md transition-all duration-150 flex-shrink-0">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {uploadState === 'error' && (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="flex items-start gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl">
                              <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0 mt-0.5" />
                              <p className="text-[13px] text-[#F43F5E]">{uploadError}</p>
                            </div>
                            <button onClick={resetUpload} className="flex items-center gap-2 text-[12px] text-[#06B6D4] hover:underline">
                              <Upload className="w-3.5 h-3.5" /> Try again
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {taskForm.source_type === 'git' && (
                      <div className="rounded-xl border border-[#27272A] bg-[#0C0C0E] p-4 space-y-4 animate-fadeIn">
                        <Field label="Repository URL">
                          <FInput type="url" value={taskForm.git_repo_url} onChange={e => setTaskForm({ ...taskForm, git_repo_url: e.target.value })} placeholder="https://github.com/your-org/repo.git" />
                        </Field>
                        <Field label="Branch" optional>
                          <FInput value={taskForm.git_branch} onChange={e => setTaskForm({ ...taskForm, git_branch: e.target.value })} placeholder="main" />
                        </Field>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-7 py-4 border-t border-[#27272A] bg-[#0C0C0E] flex-shrink-0">
            {wizardStep === 1 ? (
              <button onClick={() => { setWizardStep(0); setWizardError(''); }} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-[#1C1C20] rounded-lg transition-all duration-150">← Back</button>
            ) : (
              <button onClick={close} className="px-4 py-2 text-[13px] font-medium text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#1C1C20] rounded-lg transition-all duration-150">Cancel</button>
            )}
            <button onClick={wizardStep === 0 ? handleStep1Next : handleFinalCreate} disabled={wizardLoading} className="flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0C0C0E] text-[13px] font-bold rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed">
              {wizardLoading ? (
                <><Loader className="w-4 h-4 animate-spin" />{wizardStep === 0 ? 'Saving…' : 'Creating…'}</>
              ) : wizardStep === 0 ? (
                <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
              ) : (
                <><Check className="w-4 h-4" /><span>Create Assessment</span></>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
