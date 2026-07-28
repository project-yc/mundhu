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
  formatCompetencyLabel,
  formatScoreValue,
  getRatioTone,
  joinRationales,
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
              <span className="text-[12px] font-medium text-text-muted">
                /{formatScoreValue(competency.max_score)}
              </span>
            </p>
            <p className="mt-[5px] text-[12px] leading-[16px] text-text-secondary">
              {formatCompetencyLabel(competency.key)}
            </p>
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
              <p className="mt-[7px] border-l-2 border-border-default bg-surface-hover px-[10px] py-[7px] text-[12px] italic leading-[18px] text-text-secondary">
                {entry.answer}
              </p>
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
            </div>

            {entry.rationale && (
              <p className="mt-[5px] text-[12px] leading-[17px] text-text-secondary">
                {entry.rationale}
              </p>
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

  if (!data) return null;

  const competencies = data.competencies || [];
  const transcript = data.transcript || [];

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

  return (
    <>
      {data.summary && (
        <PanelBlock title="AI summary">
          <p className="text-[13px] leading-[20px] text-text-secondary">{data.summary}</p>
        </PanelBlock>
      )}

      {competencies.length > 0 && (
        <PanelBlock title="Competency scores">
          <CompetencyTiles competencies={competencies} />
          <p className="mt-[10px] text-[12px] text-text-muted">
            {data.answered_count ?? transcript.filter(entry => entry.answered).length} of{' '}
            {data.total_questions ?? transcript.length} questions answered
          </p>
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
