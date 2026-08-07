import { cn } from '../../../../../lib/utils';
import { Skeleton } from '../../../../../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import { PanelBlock } from '../SectionPanel';
import { useAdaptiveSectionReport } from '../../hooks/useAdaptiveSectionReport';
import {
  describeCaps,
  formatCompetencyLabel,
  formatDuration,
  formatPercent,
  formatScoreValue,
  getRatioTone,
  joinRationales,
  splitAnswerTurns,
} from '../../utils/adaptiveReport';

/**
 * One tile per competency the run actually assessed. The engine targets a
 * different subset each time, so the count is dynamic — a fixed row of three
 * would misrepresent most runs.
 */
function CompetencyTiles({ competencies }) {
  if (!competencies.length) return null;

  return (
    <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3">
      {competencies.map(competency => {
        const tone = getRatioTone(competency.score, competency.max_score);
        return (
          <div
            key={competency.key}
            className="rounded-[10px] border border-border-subtle bg-surface-hover px-[12px] py-[10px]"
          >
            <p className="flex items-baseline gap-[3px]">
              <span className={cn('text-[20px] font-bold leading-none', tone.text)}>
                {formatScoreValue(competency.score)}
              </span>
              {/* The section header reports out of 100 while these are rubric
                  levels out of 4. Showing the percentage too means a recruiter
                  doesn't have to reconcile two scales in their head. */}
              <span className="text-[12px] font-medium text-text-muted">
                /{formatScoreValue(competency.max_score)}
              </span>
              {formatPercent(competency.score, competency.max_score) && (
                <span className="ml-[2px] text-[11px] font-medium text-text-faint">
                  ({formatPercent(competency.score, competency.max_score)})
                </span>
              )}
            </p>
            <p className="mt-[5px] text-[12px] leading-[16px] text-text-secondary">
              {formatCompetencyLabel(competency.key)}
            </p>
            {competency.caps_applied?.length > 0 && (
              <p className="mt-[4px] text-[11px] leading-[15px] text-warning">
                {describeCaps(competency.caps_applied)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Criterion table — rows are the competencies the engine scored. */
function CompetencyTable({ competencies }) {
  if (!competencies.length) return null;

  return (
    <div className="overflow-hidden rounded-[10px] border border-border-subtle">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-b-[var(--color-assessment-accent)] bg-warning-bg hover:bg-warning-bg">
            <TableHead className="w-[150px] px-[12px] text-[13px]">Competency</TableHead>
            <TableHead className="w-[70px] px-[12px] text-[13px]">Score</TableHead>
            <TableHead className="px-[12px] text-[13px]">Evaluator note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competencies.map(competency => {
            const tone = getRatioTone(competency.score, competency.max_score);
            return (
              <TableRow
                key={competency.key}
                className="border-t border-border-subtle align-top hover:bg-transparent"
              >
                <TableCell className="h-auto px-[12px] py-[11px] text-[13px] font-semibold text-text-primary">
                  {formatCompetencyLabel(competency.key)}
                </TableCell>
                <TableCell className={cn('h-auto px-[12px] py-[11px] text-[13px] font-bold', tone.text)}>
                  {formatScoreValue(competency.score)}/{formatScoreValue(competency.max_score)}
                </TableCell>
                <TableCell className="h-auto px-[12px] py-[11px] text-[12px] leading-[17px] text-text-secondary">
                  {joinRationales(competency.rationales) || '—'}
                  {competency.caps_applied?.length > 0 && (
                    <span className="mt-[5px] block text-[11px] font-medium text-warning">
                      {describeCaps(competency.caps_applied)}
                    </span>
                  )}
                  {/* The scorer cites the candidate's own words for each level
                      it awards; showing them makes the score auditable. */}
                  {competency.evidence?.length > 0 && (
                    <span className="mt-[6px] block border-l-2 border-border-default pl-[8px] text-[11px] italic leading-[16px] text-text-muted">
                      {competency.evidence.map((quote, i) => (
                        <span key={i} className="block">&ldquo;{quote}&rdquo;</span>
                      ))}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** Question, answer, and the evidence the scorer cited for it. */
function Transcript({ transcript }) {
  if (!transcript.length) return null;

  return (
    <ol className="space-y-[18px]">
      {transcript.map(entry => {
        const tone = getRatioTone(entry.score, entry.max_score);
        return (
          <li key={`${entry.order}-${entry.question}`}>
            <div className="flex flex-wrap items-baseline gap-x-[8px]">
              <p className="text-[13px] font-bold leading-[18px] text-text-primary">
                Interviewer: {entry.question}
              </p>
            </div>

            {entry.answered ? (
              /* The stored answer concatenates the candidate's initial reply with
                 any follow-up reply. Split it back apart and interleave the
                 interviewer's nudges, so the exchange reads in the order it
                 actually happened instead of looking like an unprompted topic
                 change mid-answer. */
              splitAnswerTurns(entry.answer).map((turn, index) => (
                <div key={index}>
                  {index > 0 && entry.nudges?.[index - 1] && (
                    <p className="mt-[7px] text-[12px] font-semibold leading-[18px] text-text-primary">
                      Interviewer (follow-up): {entry.nudges[index - 1]}
                    </p>
                  )}
                  <p className="mt-[7px] border-l-2 border-border-default bg-surface-hover px-[10px] py-[7px] text-[12px] italic leading-[18px] text-text-secondary">
                    {turn}
                  </p>
                </div>
              ))
            ) : (
              <p className="mt-[7px] text-[12px] italic leading-[18px] text-text-muted">
                Not answered.
              </p>
            )}

            <div className="mt-[7px] flex flex-wrap items-center gap-[6px]">
              {entry.competency && (
                <span className="inline-flex h-[22px] items-center rounded-[6px] border border-border-default px-[8px] text-[11px] font-medium text-text-secondary">
                  {formatCompetencyLabel(entry.competency)}
                </span>
              )}
              {Number.isFinite(Number(entry.score)) && (
                <span className={cn('text-[11px] font-bold', tone.text)}>
                  {formatScoreValue(entry.score)}/{formatScoreValue(entry.max_score)}
                </span>
              )}
              {entry.nudges?.length > 0 && (
                <span className="inline-flex h-[22px] items-center rounded-[6px] bg-warning-bg px-[8px] text-[11px] font-medium text-warning">
                  {entry.nudges.length === 1 ? 'Needed a prompt' : `${entry.nudges.length} prompts`}
                </span>
              )}
              {formatDuration(entry.response_seconds) && (
                <span className="text-[11px] text-text-faint">
                  {formatDuration(entry.response_seconds)}
                </span>
              )}
              {entry.caps_applied?.length > 0 && (
                <span className="text-[11px] font-medium text-warning">
                  {describeCaps(entry.caps_applied)}
                </span>
              )}
            </div>

            {entry.rationale && (
              <p className="mt-[5px] text-[12px] leading-[17px] text-text-secondary">
                {entry.rationale}
              </p>
            )}

            {entry.evidence?.length > 0 && (
              <div className="mt-[5px] border-l-2 border-border-default pl-[8px]">
                {entry.evidence.map((quote, i) => (
                  <p key={i} className="text-[11px] italic leading-[16px] text-text-muted">
                    &ldquo;{quote}&rdquo;
                  </p>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function AdaptiveSectionPanel({ section, report }) {
  const { data, loading, error } = useAdaptiveSectionReport(
    report?.assessment_instance_id,
    section?.section_id,
  );

  if (loading) {
    return (
      <PanelBlock>
        <Skeleton className="h-[14px] w-full" />
        <Skeleton className="mt-[8px] h-[14px] w-3/4" />
        <Skeleton className="mt-[20px] h-[64px] w-full" />
      </PanelBlock>
    );
  }

  if (error) {
    return (
      <PanelBlock>
        <div className="rounded-[10px] border border-error-border bg-error-bg px-[12px] py-[9px]">
          <p className="text-[12px] leading-[17px] text-error">{error}</p>
        </div>
      </PanelBlock>
    );
  }

  const competencies = data?.competencies || [];
  const transcript = data?.transcript || [];

  // Returning null here rendered an empty drawer with nothing but a title, which
  // reads as a broken panel rather than an absent interview.
  if (!data) {
    return (
      <PanelBlock>
        <p className="text-[13px] leading-[20px] text-text-muted">
          No interview data is available for this section.
        </p>
      </PanelBlock>
    );
  }

  // Runs scored before snapshots existed carry only a score and a summary.
  if (data.status === 'unavailable') {
    return (
      <PanelBlock>
        {data.summary && (
          <p className="text-[13px] leading-[20px] text-text-secondary">{data.summary}</p>
        )}
        <p className="mt-[12px] text-[12px] leading-[17px] text-text-muted">
          The detailed interview breakdown was not captured for this run.
        </p>
      </PanelBlock>
    );
  }

  const answeredCount = data.answered_count ?? transcript.filter(entry => entry.answered).length;
  const totalQuestions = data.total_questions ?? transcript.length;
  // Every block below is conditional, so a scored-but-empty run would otherwise
  // render an entirely blank panel.
  const hasAnyContent = Boolean(data.summary) || competencies.length > 0 || transcript.length > 0;

  if (!hasAnyContent) {
    return (
      <PanelBlock>
        <p className="text-[13px] leading-[20px] text-text-muted">
          This interview has no scored questions yet.
        </p>
      </PanelBlock>
    );
  }

  return (
    <>
      {data.summary && (
        <PanelBlock title="AI summary">
          <p className="text-[13px] leading-[20px] text-text-secondary">{data.summary}</p>
        </PanelBlock>
      )}

      {/* Question counts belong to the interview, not to the competency block —
          nesting them there hid them whenever competencies were missing. */}
      {totalQuestions > 0 && (
        <PanelBlock>
          <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] text-[12px] text-text-muted">
            <span>{answeredCount} of {totalQuestions} questions answered</span>
            {/* Independence. "3/3 unprompted" and "3/3, nudged every time" are
                very different candidates and read identically without this. */}
            {Number.isFinite(Number(data.questions_nudged)) && (
              <span className={cn(data.questions_nudged > 0 && 'text-warning')}>
                {data.questions_nudged === 0
                  ? 'Answered without prompting'
                  : `Needed prompting on ${data.questions_nudged} of ${totalQuestions}`}
              </span>
            )}
            {formatDuration(data.total_seconds) && (
              <span>{formatDuration(data.total_seconds)} total</span>
            )}
            {/* Scored on the answered subset only — without this a cut-short
                interview reads exactly like a completed one. */}
            {data.partial && (
              <span className="font-medium text-warning">
                Ended early — scored on answered questions only
              </span>
            )}
            {/* The candidate answered these; the scorer failed to return a usable
                score. Excluded from the denominator so they are not penalised —
                but a competency that was probed and lost must not look like one
                that was never probed. */}
            {data.unscored_count > 0 && (
              <span className="font-medium text-warning">
                {data.unscored_count} answer{data.unscored_count === 1 ? '' : 's'} could not be scored
              </span>
            )}
          </div>
        </PanelBlock>
      )}

      {competencies.length > 0 && (
        <PanelBlock title="Competency scores">
          <CompetencyTiles competencies={competencies} />
        </PanelBlock>
      )}

      {competencies.length > 0 && (
        <PanelBlock title="Competency breakdown">
          <CompetencyTable competencies={competencies} />
        </PanelBlock>
      )}

      {transcript.length > 0 && (
        <PanelBlock title="Transcript">
          <Transcript transcript={transcript} />
        </PanelBlock>
      )}
    </>
  );
}
