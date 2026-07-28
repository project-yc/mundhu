import { useState } from 'react';
import { AlertTriangle, ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import { Badge } from '../../../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import { PanelBlock } from '../SectionPanel';
import { ScoreGauge } from '../ScoreGauge';
import {
  DIMENSION_ORDER,
  formatDuration,
  formatPercent,
  formatTimelineTimestamp,
  getProctoringFlags,
  getScoreTone,
  getSignalTokens,
  humanizeReason,
  isLowConfidenceEpisode,
  needsHumanReview,
  selectCodingReport,
  sortTimeline,
} from '../../utils/codingReport';

function StatLine({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border-subtle py-[7px] last:border-0">
      <span className="text-[12px] leading-[16px] text-text-muted">{label}</span>
      <span className="text-[13px] font-bold text-text-primary">{value}</span>
    </div>
  );
}

/**
 * Block 1 — deterministic review gate.
 *
 * Sits above the AI summary deliberately. This is computed from session
 * evidence, not generated, and the product rule is that it stays separate from
 * (and above) anything the model wrote.
 */
function ReviewStatus({ reviewPolicy }) {
  if (!reviewPolicy) return null;
  const flagged = needsHumanReview(reviewPolicy);
  const reasons = reviewPolicy.reasons || [];

  if (!flagged) {
    return (
      <div className="flex items-center gap-[8px] rounded-[10px] border border-success-border bg-success-bg px-[12px] py-[9px]">
        <ShieldCheck className="h-[16px] w-[16px] flex-shrink-0 text-success" strokeWidth={2} />
        <p className="text-[13px] font-medium text-success">
          No review flags — session evidence is consistent.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-warning-border bg-warning-bg px-[12px] py-[11px]">
      <div className="flex items-center gap-[8px]">
        <AlertTriangle className="h-[16px] w-[16px] flex-shrink-0 text-warning" strokeWidth={2} />
        <p className="text-[13px] font-bold text-warning">Requires human review</p>
        {reviewPolicy.rank_eligible === false && (
          <Badge variant="warning" className="ml-auto">Not rank eligible</Badge>
        )}
      </div>
      {reasons.length > 0 && (
        <ul className="mt-[8px] space-y-[4px] pl-[24px]">
          {reasons.map(reason => (
            <li key={reason} className="list-disc text-[12px] leading-[17px] text-text-secondary">
              {humanizeReason(reason)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Block 2 — "Top skills / Labels" chips, from the coding task's tags. */
function SkillChips({ labels }) {
  if (!labels?.length) return null;
  return (
    <div className="flex flex-wrap gap-[8px]">
      {labels.map(label => (
        <span
          key={label}
          className="inline-flex h-[28px] items-center rounded-[6px] border border-border-default bg-surface px-[10px] text-[12px] font-medium text-text-primary"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

/**
 * Block 4 — rubric scoring. Rows are the four dimensions the backend actually
 * emits; the Figma's criterion names come from per-task rubrics, which aren't
 * exposed on the recruiter payload.
 */
function RubricTable({ dimensions }) {
  const rows = DIMENSION_ORDER.map(([key, label]) => [key, label, dimensions?.[key]]);
  if (rows.every(([, , dimension]) => !dimension)) return null;

  return (
    <div className="overflow-hidden rounded-[10px] border border-border-subtle">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-b-[var(--color-assessment-accent)] bg-warning-bg hover:bg-warning-bg">
            <TableHead className="w-[150px] px-[12px] text-[13px]">Criterion</TableHead>
            <TableHead className="w-[86px] px-[12px] text-[13px]">Score</TableHead>
            <TableHead className="px-[12px] text-[13px]">Evaluator note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([key, label, dimension]) => {
            // `evaluated: false` is meaningful — AI Collaboration is genuinely
            // excluded from the score when the session ran without AI access.
            const notEvaluated = !dimension || dimension.evaluated === false;
            const score = notEvaluated ? null : Math.round(Number(dimension.score) || 0);

            return (
              <TableRow key={key} className="border-t border-border-subtle align-top hover:bg-transparent">
                <TableCell className="h-auto px-[12px] py-[11px] text-[13px] font-semibold text-text-primary">
                  {label}
                </TableCell>
                <TableCell className="h-auto px-[12px] py-[11px]">
                  {notEvaluated ? (
                    <span className="text-[12px] text-text-muted">—</span>
                  ) : (
                    <span className={cn('text-[13px] font-bold', getScoreTone(score))}>
                      {String(score).padStart(2, '0')}/100
                    </span>
                  )}
                </TableCell>
                <TableCell className="h-auto px-[12px] py-[11px] text-[12px] leading-[17px] text-text-secondary">
                  {notEvaluated ? 'Not evaluated for this session.' : dimension.summary || '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** Block 9 — expanded by default, as the Figma panel shows it. */
function ActivityTimeline({ timeline }) {
  const [open, setOpen] = useState(true);
  if (!timeline?.length) return null;

  return (
    <PanelBlock>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        className="flex items-center gap-[6px] text-[14px] font-medium text-brand transition-colors hover:text-brand-hover"
      >
        {open ? 'Hide activity timeline' : 'Show activity timeline'}
        <ChevronDown className={cn('h-[15px] w-[15px] transition-transform', open && 'rotate-180')} strokeWidth={2} />
      </button>

      {open && (
        <ol className="mt-[14px] space-y-[16px] border-l border-border-default pl-[18px]">
          {sortTimeline(timeline).map((entry, index) => {
            const duration = formatDuration(entry.duration_seconds);
            const unlabelled = isLowConfidenceEpisode(entry);
            const timestamp = formatTimelineTimestamp(entry.time_range);

            return (
              <li key={`${entry.order ?? index}-${entry.label}`} className="relative">
                <span
                  className={cn(
                    'absolute -left-[23px] top-[5px] h-[9px] w-[9px] rounded-full border-2 border-surface',
                    unlabelled ? 'bg-border-strong' : 'bg-brand',
                  )}
                />

                <div className="flex flex-wrap items-baseline gap-x-[8px]">
                  <p className="text-[13px] font-bold leading-[17px] text-text-primary">{entry.label}</p>
                  {duration && <span className="text-[11px] text-text-muted">{duration}</span>}
                  {entry.event_count > 0 && (
                    <span className="text-[11px] text-text-muted">{entry.event_count} events</span>
                  )}
                  {/* The backend withholds a specific activity name below 0.75
                      confidence; say so instead of implying it knows. */}
                  {unlabelled && (
                    <span className="text-[11px] text-text-faint">unclassified</span>
                  )}
                </div>

                {timestamp && (
                  <p className="mt-[2px] text-[11px] leading-[15px] text-text-faint">{timestamp}</p>
                )}

                {entry.facts?.length > 0 && (
                  <ul className="mt-[5px] space-y-[2px]">
                    {entry.facts.map(fact => (
                      <li key={fact} className="text-[12px] leading-[17px] text-text-secondary">
                        {fact}
                      </li>
                    ))}
                  </ul>
                )}

                {entry.ai_prompt_excerpts?.length > 0 && (
                  <div className="mt-[7px] space-y-[5px]">
                    {entry.ai_prompt_excerpts.map((prompt, promptIndex) => (
                      <p
                        key={`prompt-${promptIndex}`}
                        className="rounded-[6px] border border-warning-border bg-warning-bg px-[10px] py-[6px] text-[11px] leading-[16px] text-warning"
                      >
                        Prompt: &ldquo;{prompt}&rdquo;
                      </p>
                    ))}
                  </div>
                )}

                {entry.error_messages?.length > 0 && (
                  <div className="mt-[7px] space-y-[4px]">
                    {entry.error_messages.map((message, errorIndex) => (
                      <p
                        key={`error-${errorIndex}`}
                        className="rounded-[6px] border border-error-border bg-error-bg px-[9px] py-[5px] text-[11px] leading-[16px] text-error"
                      >
                        {message}
                      </p>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </PanelBlock>
  );
}

export function CodingSectionPanel({ report }) {
  const coding = selectCodingReport(report);

  if (!coding.ready) {
    return (
      <div className="rounded-[10px] border border-border-subtle bg-surface-hover px-[14px] py-[18px] text-center">
        <p className="text-[13px] font-semibold text-text-primary">Coding analysis still running</p>
        <p className="mt-[4px] text-[12px] text-text-secondary">
          Dimension scores and evidence appear once the AI review finishes.
        </p>
      </div>
    );
  }

  const authorship = formatPercent(coding.authorship?.independent_authorship_ratio_net);
  const proctoringFlags = getProctoringFlags(coding.proctoring);

  return (
    <>
      <PanelBlock>
        <ReviewStatus reviewPolicy={coding.reviewPolicy} />
      </PanelBlock>

      {coding.aiReviewError && (
        <PanelBlock>
          <div className="rounded-[10px] border border-error-border bg-error-bg px-[12px] py-[9px]">
            <p className="text-[12px] leading-[17px] text-error">
              AI review did not complete — dimension scores may be partial.
            </p>
          </div>
        </PanelBlock>
      )}

      {coding.topInsight && (
        <PanelBlock title="AI summary">
          <p className="text-[13px] leading-[20px] text-text-secondary">{coding.topInsight}</p>
        </PanelBlock>
      )}

      {coding.taskLabels.length > 0 && (
        <PanelBlock title="Top skills / Labels">
          <SkillChips labels={coding.taskLabels} />
        </PanelBlock>
      )}

      <PanelBlock title="Detailed score">
        <div className="flex flex-col items-center gap-[18px] sm:flex-row sm:items-center">
          <ScoreGauge value={coding.score} caption="Coding section score" />
          <div className="min-w-0 flex-1">
            <StatLine label="Independent authorship" value={authorship} />
            <StatLine
              label="Coding tasks in this assessment"
              value={coding.sessionCount || null}
            />
            <StatLine
              label="Review status"
              value={needsHumanReview(coding.reviewPolicy) ? 'Needs review' : 'Clear'}
            />
          </div>
        </div>
      </PanelBlock>

      <PanelBlock title="Rubric scoring">
        <RubricTable dimensions={coding.dimensions} />
      </PanelBlock>

      {coding.evidence.length > 0 && (
        <PanelBlock title="Behavioral evidence">
          <ul className="space-y-[8px]">
            {coding.evidence.map((item, index) => (
              <li
                key={`${item.dimension || 'evidence'}-${index}`}
                className="flex gap-[9px] rounded-[10px] border border-border-subtle bg-surface px-[12px] py-[10px]"
              >
                <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand" />
                <p className="text-[12px] leading-[18px] text-text-secondary">
                  {item.observation || String(item)}
                </p>
              </li>
            ))}
          </ul>
        </PanelBlock>
      )}

      {coding.growthEdges.length > 0 && (
        <PanelBlock title="Growth edges">
          <ul className="space-y-[8px]">
            {coding.growthEdges.map((edge, index) => (
              <li
                key={`growth-${index}`}
                className="rounded-[10px] border border-warning-border bg-warning-bg px-[12px] py-[10px]"
              >
                <p className="text-[12px] leading-[18px] text-text-primary">
                  {typeof edge === 'object' ? edge.moment : edge}
                </p>
                {typeof edge === 'object' && edge.alternative && (
                  <p className="mt-[4px] text-[12px] leading-[18px] text-text-secondary">
                    {edge.alternative}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </PanelBlock>
      )}

      {coding.probes.length > 0 && (
        <PanelBlock title="Interview probes">
          <ol className="space-y-[8px]">
            {coding.probes.map((probe, index) => (
              <li
                key={`probe-${index}`}
                className="rounded-[10px] border border-border-subtle bg-surface px-[12px] py-[10px]"
              >
                <p className="text-[11px] font-bold text-brand">Q{index + 1}</p>
                <p className="mt-[3px] text-[12px] leading-[18px] text-text-secondary">{probe}</p>
              </li>
            ))}
          </ol>
        </PanelBlock>
      )}

      {coding.proctoring && (
        <PanelBlock title="Proctoring">
          {proctoringFlags.length === 0 ? (
            <p className="text-[12px] leading-[17px] text-text-muted">
              {coding.proctoring.summary || 'No proctoring flags detected.'}
            </p>
          ) : (
            <ul className="space-y-[8px]">
              {proctoringFlags.map(flag => {
                const tokens = getSignalTokens(flag.signal);
                return (
                  <li
                    key={flag.key}
                    className="flex gap-[9px] rounded-[10px] border border-border-subtle bg-surface px-[12px] py-[10px]"
                  >
                    <span className={cn('mt-[6px] h-[7px] w-[7px] flex-shrink-0 rounded-full', tokens.dot)} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold capitalize text-text-primary">{flag.label}</p>
                      {flag.detail && (
                        <p className="mt-[2px] text-[12px] leading-[17px] text-text-secondary">{flag.detail}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelBlock>
      )}

      <ActivityTimeline timeline={coding.timeline} />

      <PanelBlock>
        <button
          type="button"
          className="inline-flex h-[36px] items-center justify-center rounded-[8px] border border-border-default bg-surface px-[18px] text-[13px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
        >
          View code
        </button>
      </PanelBlock>
    </>
  );
}
