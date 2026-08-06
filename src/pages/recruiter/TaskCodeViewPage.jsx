// TaskCodeViewPage — read-only VS Code-style view of a technical task.
//
// Opens in its own tab from the Task Library and shows the exact starter repo a
// candidate is provisioned with, alongside the ticket that frames the work.
// Hidden tests, the reference solution and the internal task spec are never
// served to this page — see LibraryItemFilesView.
//
// The chrome deliberately mirrors VS Code (activity bar / explorer / tab strip /
// path breadcrumbs / status bar) and commits to a dark palette, departing from
// the light recruiter theme used elsewhere. Colours live in ./vscodeTheme.js.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronRight, ChevronDown, Files, BookText, X, Loader, AlertCircle,
  Lock, GitBranch, ExternalLink, FileCode2, FileJson, FileText, Database, File,
} from 'lucide-react';

import { getTaskFiles } from '../../api/recruiter/taskLibrary.js';
import { VSC, MONO_STACK, vscodeDark } from './vscodeTheme.js';

// ─── language wiring ──────────────────────────────────────────────────────────

const LANGUAGE_EXTENSIONS = {
  python,
  javascript: () => javascript({ jsx: true }),
  jsx: () => javascript({ jsx: true }),
  typescript: () => javascript({ jsx: true, typescript: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  sql,
  markdown,
  json,
  html,
  css: cssLang,
};

const LANGUAGE_LABELS = {
  python: 'Python', javascript: 'JavaScript', jsx: 'JavaScript JSX',
  typescript: 'TypeScript', tsx: 'TypeScript JSX', sql: 'SQL',
  markdown: 'Markdown', json: 'JSON', html: 'HTML', css: 'CSS', text: 'Plain Text',
};

// File-type icon + VS Code-ish icon tint, matched on extension.
const FILE_ICONS = [
  [/\.(py)$/i, FileCode2, '#519ABA'],
  [/\.(js|jsx|mjs|cjs)$/i, FileCode2, '#CBCB41'],
  [/\.(ts|tsx)$/i, FileCode2, '#519ABA'],
  [/\.(json|jsonl)$/i, FileJson, '#CBCB41'],
  [/\.(sql|csv)$/i, Database, '#F55385'],
  [/\.(md|txt|rst)$/i, FileText, '#519ABA'],
  [/\.(css|scss)$/i, FileCode2, '#563D7C'],
  [/\.(html|xml)$/i, FileCode2, '#E37933'],
  [/\.(sh|bash|yaml|yml|toml|ini|cfg)$/i, FileCode2, '#8DC149'],
];

function FileIcon({ path, className }) {
  const match = FILE_ICONS.find(([pattern]) => pattern.test(path));
  const Icon = match ? match[1] : File;
  return <Icon className={className} style={{ color: match ? match[2] : VSC.fgMuted }} />;
}

// ─── file tree ────────────────────────────────────────────────────────────────

/** Turn flat `a/b/c.py` paths into a nested, directories-first tree. */
function buildTree(files) {
  const root = { name: '', path: '', type: 'dir', children: new Map() };

  for (const file of files) {
    const segments = file.path.split('/');
    let node = root;
    segments.forEach((segment, i) => {
      if (i === segments.length - 1) {
        node.children.set(segment, { name: segment, path: file.path, type: 'file', file });
        return;
      }
      if (!node.children.has(segment)) {
        node.children.set(segment, {
          name: segment,
          path: segments.slice(0, i + 1).join('/'),
          type: 'dir',
          children: new Map(),
        });
      }
      node = node.children.get(segment);
    });
  }

  const sort = (node) => {
    if (node.type !== 'dir') return node;
    const children = [...node.children.values()].map(sort).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return { ...node, children };
  };

  return sort(root).children;
}

function TreeRow({ node, depth, activePath, expanded, onToggle, onSelect }) {
  const isDir = node.type === 'dir';
  const isOpen = isDir && expanded.has(node.path);
  const isActive = !isDir && node.path === activePath;
  const isReadable = isDir || node.file.content !== null;

  const row = (
    <button
      type="button"
      onClick={() => (isDir ? onToggle(node.path) : onSelect(node.path))}
      aria-expanded={isDir ? isOpen : undefined}
      aria-current={isActive ? 'true' : undefined}
      title={node.path}
      style={{
        paddingLeft: `${depth * 10 + 8}px`,
        background: isActive ? VSC.listSelected : 'transparent',
        color: isActive ? VSC.fgBright : isReadable ? '#CCCCCC' : VSC.fgFaint,
        fontFamily: 'inherit',
      }}
      className="group w-full flex items-center gap-1 h-[22px] pr-2 text-[13px] text-left transition-colors duration-75 hover:bg-[#2A2D2E] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#007FD4] focus-visible:ring-inset"
    >
      {isDir ? (
        isOpen
          ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: VSC.fgMuted }} />
          : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: VSC.fgMuted }} />
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}
      {isDir
        ? <span className="truncate">{node.name}</span>
        : (
          <>
            <FileIcon path={node.path} className="w-[15px] h-[15px] flex-shrink-0" />
            <span className="truncate">{node.name}</span>
            {!isReadable && <Lock className="w-3 h-3 ml-auto flex-shrink-0 opacity-50" />}
          </>
        )}
    </button>
  );

  return (
    <li>
      {row}
      {isDir && isOpen && (
        <ul>
          {node.children.map(child => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── brief panel ──────────────────────────────────────────────────────────────

const BRIEF_ORDER = ['TICKET.md', 'README.md', 'WORLD_BRIEF.md', 'docs/PRODUCT_NOTES.md', 'DECISIONS.md'];

// react-markdown escapes HTML by default — task bundles are user-supplied, so
// this stays as-is rather than moving to an innerHTML-based renderer.
const markdownComponents = {
  h1: p => <h1 className="text-[15px] font-semibold mt-5 mb-2 first:mt-0" style={{ color: VSC.fgBright }} {...p} />,
  h2: p => <h2 className="text-[14px] font-semibold mt-5 mb-2 pb-1 border-b" style={{ color: VSC.fgBright, borderColor: VSC.panelBorder }} {...p} />,
  h3: p => <h3 className="text-[13px] font-semibold mt-4 mb-1.5" style={{ color: '#CCCCCC' }} {...p} />,
  p: p => <p className="text-[13px] leading-relaxed my-2" style={{ color: '#CCCCCC' }} {...p} />,
  ul: p => <ul className="list-disc pl-5 my-2 space-y-1 text-[13px]" style={{ color: '#CCCCCC' }} {...p} />,
  ol: p => <ol className="list-decimal pl-5 my-2 space-y-1 text-[13px]" style={{ color: '#CCCCCC' }} {...p} />,
  li: p => <li className="leading-relaxed" {...p} />,
  strong: p => <strong className="font-semibold" style={{ color: VSC.fgBright }} {...p} />,
  em: p => <em className="italic" {...p} />,
  a: p => <a className="hover:underline" style={{ color: '#3794FF' }} target="_blank" rel="noopener noreferrer" {...p} />,
  blockquote: p => (
    <blockquote
      className="pl-3 my-3 text-[13px] italic border-l-[3px]"
      style={{ color: VSC.fgMuted, borderColor: '#454545' }}
      {...p}
    />
  ),
  code: ({ inline, ...p }) => inline
    ? <code className="px-1 py-0.5 rounded text-[12px]" style={{ background: '#2D2D2D', color: VSC.orange, fontFamily: MONO_STACK }} {...p} />
    : <code className="block p-3 rounded text-[12px] overflow-x-auto" style={{ background: '#1E1E1E', color: VSC.fg, fontFamily: MONO_STACK }} {...p} />,
  pre: p => <pre className="my-3 overflow-x-auto rounded" style={{ background: '#1E1E1E' }} {...p} />,
  table: p => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-[12px] border-collapse" {...p} />
    </div>
  ),
  th: p => <th className="border px-2 py-1.5 text-left font-semibold" style={{ borderColor: VSC.panelBorder, background: '#2D2D2D', color: VSC.fgBright }} {...p} />,
  td: p => <td className="border px-2 py-1.5 align-top" style={{ borderColor: VSC.panelBorder, color: '#CCCCCC' }} {...p} />,
  hr: p => <hr className="my-4" style={{ borderColor: VSC.panelBorder }} {...p} />,
};

// ─── small chrome pieces ──────────────────────────────────────────────────────

function ActivityButton({ active, label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className="relative w-12 h-12 flex items-center justify-center transition-colors duration-100"
      style={{ color: active ? VSC.fgBright : '#858585' }}
    >
      {active && <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: VSC.fgBright }} />}
      {icon}
    </button>
  );
}

function SidebarSectionHeader({ children, action }) {
  return (
    <div className="flex items-center justify-between h-[35px] px-5 flex-shrink-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: '#BBBBBB' }}>
        {children}
      </span>
      {action}
    </div>
  );
}

export default function TaskCodeViewPage() {
  const { itemId } = useParams();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTabs, setOpenTabs] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [briefOpen, setBriefOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getTaskFiles(itemId);
        if (cancelled) return;
        const data = res?.data || {};
        setPayload(data);
        if (data.entry_file) {
          setActivePath(data.entry_file);
          setOpenTabs([data.entry_file]);
        }
        // Expand every directory so the repo reads at a glance.
        setExpanded(new Set(
          (data.files || []).flatMap(f => {
            const parts = f.path.split('/').slice(0, -1);
            return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
          }),
        ));
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load this task.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [itemId]);

  const item = payload?.item;
  const files = useMemo(() => payload?.files || [], [payload]);
  const tree = useMemo(() => buildTree(files), [files]);
  const activeFile = files.find(f => f.path === activePath) || null;

  const docs = useMemo(() => {
    const readable = files.filter(f => f.language === 'markdown' && f.content);
    return readable.sort((a, b) => {
      const ai = BRIEF_ORDER.indexOf(a.path);
      const bi = BRIEF_ORDER.indexOf(b.path);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.path.localeCompare(b.path);
    });
  }, [files]);

  useEffect(() => {
    if (!activeDoc && docs.length) setActiveDoc(docs[0].path);
  }, [docs, activeDoc]);

  const extensions = useMemo(() => {
    const build = LANGUAGE_EXTENSIONS[activeFile?.language];
    return [...vscodeDark, EditorView.lineWrapping, ...(build ? [build()] : [])];
  }, [activeFile?.language]);

  const openFile = useCallback((path) => {
    setActivePath(path);
    setOpenTabs(prev => (prev.includes(path) ? prev : [...prev, path]));
  }, []);

  const closeTab = useCallback((path, event) => {
    event?.stopPropagation();
    setOpenTabs(prev => {
      const next = prev.filter(p => p !== path);
      setActivePath(current => {
        if (current !== path) return current;
        const index = prev.indexOf(path);
        return next[index] || next[index - 1] || null;
      });
      return next;
    });
  }, []);

  const toggleDir = useCallback((path) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  // ── loading / error ──
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 h-screen" style={{ background: VSC.editorBg, color: VSC.fgMuted }}>
        <Loader className="w-5 h-5 animate-spin" />
        <span className="text-[13px]">Loading task…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-screen px-6" style={{ background: VSC.editorBg }}>
        <AlertCircle className="w-10 h-10" style={{ color: VSC.red }} />
        <p className="text-[14px] font-semibold" style={{ color: VSC.fgBright }}>Couldn&apos;t open this task</p>
        <p className="text-[13px] text-center max-w-md" style={{ color: VSC.fgMuted }}>{error}</p>
        <Link
          to="/recruiter/task-library"
          className="text-[13px] px-3 py-1.5 rounded transition-colors duration-100 hover:brightness-110"
          style={{ background: VSC.accent, color: '#FFFFFF' }}
        >
          Back to Task Library
        </Link>
      </div>
    );
  }

  const isGit = payload?.source?.type === 'git';
  const repoName = item?.title || 'task';
  const pathSegments = activePath ? activePath.split('/') : [];
  const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: VSC.editorBg, color: VSC.fg }}>
      {/* ── Title bar ── */}
      <header
        className="flex-shrink-0 flex items-center gap-3 h-[35px] px-3 border-b"
        style={{ background: VSC.titleBarBg, borderColor: '#2B2B2B' }}
      >
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] min-w-0">
          <Link
            to="/recruiter/dashboard"
            className="hover:underline flex-shrink-0 transition-colors duration-100"
            style={{ color: '#CCCCCC' }}
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: VSC.fgFaint }} />
          <Link
            to="/recruiter/task-library"
            className="hover:underline flex-shrink-0 transition-colors duration-100"
            style={{ color: '#CCCCCC' }}
          >
            Task Library
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: VSC.fgFaint }} />
          <span className="truncate font-medium" style={{ color: VSC.fgBright }} title={repoName}>
            {repoName}
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {[item?.domain, item?.seniority, item?.difficulty, item?.language]
            .filter(Boolean)
            .map(value => (
              <span
                key={value}
                className="text-[11px] px-1.5 py-0.5 rounded capitalize"
                style={{ background: '#4D4D4D', color: '#CCCCCC' }}
              >
                {String(value).replace(/_/g, ' ')}
              </span>
            ))}
          {item?.estimated_time_minutes && (
            <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#4D4D4D', color: '#CCCCCC' }}>
              {item.estimated_time_minutes} min
            </span>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 min-h-0 flex">
        {/* Activity bar */}
        <nav
          className="w-12 flex-shrink-0 flex flex-col items-center"
          style={{ background: VSC.activityBg }}
          aria-label="Views"
        >
          <ActivityButton
            active={explorerOpen}
            label={explorerOpen ? 'Hide Explorer' : 'Show Explorer'}
            icon={<Files className="w-6 h-6" strokeWidth={1.5} />}
            onClick={() => setExplorerOpen(o => !o)}
          />
          <ActivityButton
            active={briefOpen}
            label={briefOpen ? 'Hide task brief' : 'Show task brief'}
            icon={<BookText className="w-6 h-6" strokeWidth={1.5} />}
            onClick={() => setBriefOpen(o => !o)}
          />
        </nav>

        {/* Explorer side bar */}
        {explorerOpen && (
          <aside
            className="w-[260px] flex-shrink-0 flex flex-col min-h-0 border-r"
            style={{ background: VSC.sidebarBg, borderColor: VSC.panelBorder }}
          >
            <SidebarSectionHeader>Explorer</SidebarSectionHeader>
            <div
              className="flex items-center gap-1 h-[22px] px-2 text-[11px] font-semibold uppercase tracking-wide flex-shrink-0"
              style={{ color: '#CCCCCC', background: '#37373D' }}
            >
              <ChevronDown className="w-4 h-4" style={{ color: VSC.fgMuted }} />
              <span className="truncate">{repoName}</span>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto py-1" aria-label="Task files">
              <ul>
                {tree.map(node => (
                  <TreeRow
                    key={node.path}
                    node={node}
                    depth={0}
                    activePath={activePath}
                    expanded={expanded}
                    onToggle={toggleDir}
                    onSelect={openFile}
                  />
                ))}
              </ul>
              {payload?.truncated && (
                <p className="px-3 py-2 text-[11px]" style={{ color: VSC.fgFaint }}>
                  Some files were omitted because the repo is large.
                </p>
              )}
            </nav>
          </aside>
        )}

        {/* Editor group */}
        <main className="flex-1 min-w-0 flex flex-col" style={{ background: VSC.editorBg }}>
          {isGit ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
              <GitBranch className="w-10 h-10" style={{ color: VSC.fgFaint }} />
              <p className="text-[14px] font-semibold" style={{ color: VSC.fgBright }}>
                This task lives in a Git repository
              </p>
              <p className="text-[13px]" style={{ color: VSC.fgMuted }}>
                {payload.source.git_repo_url}
                {payload.source.git_branch ? ` · ${payload.source.git_branch}` : ''}
              </p>
              <a
                href={payload.source.git_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[13px] px-3 py-1.5 rounded transition-colors duration-100 hover:brightness-110"
                style={{ background: VSC.accent, color: '#FFFFFF' }}
              >
                Open repository <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>
          ) : (
            <>
              {/* Tab strip */}
              <div
                className="flex-shrink-0 flex items-stretch overflow-x-auto"
                style={{ background: VSC.sidebarBg }}
                role="tablist"
              >
                {openTabs.map(path => {
                  const isActive = path === activePath;
                  return (
                    <div
                      key={path}
                      role="tab"
                      aria-selected={isActive}
                      tabIndex={0}
                      onClick={() => setActivePath(path)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActivePath(path)}
                      title={path}
                      className="group relative flex items-center gap-1.5 h-[35px] pl-3 pr-2 text-[13px] cursor-pointer border-r whitespace-nowrap select-none transition-colors duration-100"
                      style={{
                        background: isActive ? VSC.tabActiveBg : VSC.tabInactiveBg,
                        color: isActive ? VSC.fgBright : '#8F8F8F',
                        borderColor: '#252526',
                      }}
                    >
                      {isActive && (
                        <span className="absolute left-0 right-0 top-0 h-[1px]" style={{ background: VSC.accent }} />
                      )}
                      <FileIcon path={path} className="w-[15px] h-[15px] flex-shrink-0" />
                      <span>{path.split('/').pop()}</span>
                      <button
                        type="button"
                        onClick={e => closeTab(path, e)}
                        aria-label={`Close ${path}`}
                        className="ml-1 w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[#ffffff1a] transition-opacity duration-100"
                        style={{ opacity: isActive ? 1 : undefined }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Path breadcrumbs */}
              <div
                className="flex-shrink-0 flex items-center gap-1 h-[22px] px-4 text-[12px] overflow-x-auto"
                style={{ background: VSC.editorBg, color: VSC.fgMuted }}
                aria-label="File path"
              >
                {pathSegments.length > 0 ? pathSegments.map((segment, i) => (
                  <span key={`${segment}-${i}`} className="flex items-center gap-1 whitespace-nowrap">
                    {i > 0 && <ChevronRight className="w-3 h-3" style={{ color: VSC.fgFaint }} />}
                    {i === pathSegments.length - 1 && (
                      <FileIcon path={activePath} className="w-[13px] h-[13px]" />
                    )}
                    <span style={i === pathSegments.length - 1 ? { color: '#CCCCCC' } : undefined}>{segment}</span>
                  </span>
                )) : null}
              </div>

              {/* Editor */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeFile?.content != null ? (
                  <CodeMirror
                    key={activePath}
                    value={activeFile.content}
                    // h-full on the wrapper matters: @uiw/react-codemirror renders its
                    // own div around .cm-editor, and without a height there the
                    // editor's 100% resolves to auto and the content is clipped
                    // instead of scrolling.
                    className="h-full"
                    height="100%"
                    // Without this the component injects its own light theme,
                    // whose background rule beats ours and whitens the editor.
                    theme="none"
                    extensions={extensions}
                    editable={false}
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: true,
                      highlightActiveLine: false,
                      highlightActiveLineGutter: false,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      highlightSelectionMatches: false,
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: VSC.fgFaint }}>
                    <File className="w-8 h-8 opacity-40" />
                    <p className="text-[13px]">
                      {activeFile
                        ? (activeFile.skipped === 'too_large' ? 'This file is too large to preview.' : 'This file is binary.')
                        : 'Select a file from the Explorer.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Task brief — collapsible secondary side bar */}
        {briefOpen && (
          <aside
            className="w-[400px] flex-shrink-0 flex flex-col min-h-0 border-l"
            style={{ background: VSC.sidebarBg, borderColor: VSC.panelBorder }}
            aria-label="Task brief"
          >
            <SidebarSectionHeader
              action={
                <button
                  type="button"
                  onClick={() => setBriefOpen(false)}
                  aria-label="Close task brief"
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#ffffff1a] transition-colors duration-100"
                  style={{ color: '#CCCCCC' }}
                >
                  <X className="w-4 h-4" />
                </button>
              }
            >
              Task brief
            </SidebarSectionHeader>

            {docs.length > 1 && (
              <div className="flex items-center gap-0.5 px-3 pb-2 flex-shrink-0 overflow-x-auto">
                {docs.map(d => (
                  <button
                    key={d.path}
                    type="button"
                    onClick={() => setActiveDoc(d.path)}
                    className="px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors duration-100"
                    style={
                      d.path === (activeDoc || docs[0].path)
                        ? { background: VSC.listSelected, color: VSC.fgBright }
                        : { color: VSC.fgMuted }
                    }
                  >
                    {d.path.split('/').pop().replace(/\.md$/, '')}
                  </button>
                ))}
              </div>
            )}

            <div
              className="flex-1 min-h-0 overflow-y-auto px-4 py-3 border-t"
              style={{ borderColor: VSC.panelBorder }}
            >
              {(() => {
                const doc = docs.find(d => d.path === activeDoc) || docs[0];
                return doc
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{doc.content}</ReactMarkdown>
                  : <p className="text-[13px]" style={{ color: VSC.fgMuted }}>This task has no written brief.</p>;
              })()}
            </div>
          </aside>
        )}
      </div>

      {/* ── Status bar ── */}
      <footer
        className="flex-shrink-0 flex items-center gap-4 h-[22px] px-3 text-[12px]"
        style={{ background: VSC.statusBg, color: '#FFFFFF' }}
      >
        <span className="flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          Read-only
        </span>
        <span className="ml-auto flex items-center gap-4">
          {activeFile && (
            <>
              <span>{lineCount.toLocaleString()} lines</span>
              <span>{activeFile.size.toLocaleString()} bytes</span>
              <span>{LANGUAGE_LABELS[activeFile.language] || 'Plain Text'}</span>
            </>
          )}
          <span>{files.length} files</span>
        </span>
      </footer>
    </div>
  );
}
