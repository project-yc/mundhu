import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconRocket } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { SECTION_TYPE_CONFIG, AI_LEVEL_LABELS } from '../constants/sectionTypeConfig';
import { publishAssessmentFlow } from '../api/assessmentBuilderApi';

function SectionRow({ section }) {
  const cfg = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.mcq;
  const totalCount = section.items.length;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border-default last:border-0">
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className="text-[13px] font-semibold text-text-primary">{section.name}</span>
        <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
        {section.timer_minutes && (
          <span className="text-[11px] text-text-muted">{section.timer_minutes}m</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-semibold text-text-secondary">
          {totalCount} question{totalCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export function AssessmentReviewStep() {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const { sections, name, duration_minutes, ai_level } = state;

  const totalQuestions = sections.reduce((acc, s) => acc + s.items.length, 0);
  const totalPts = sections.reduce((acc, s) => s.items.reduce((a, i) => a + (i.points || 0), acc), 0);

  const handleBack = () => dispatch({ type: ACTIONS.SET_STEP, payload: 2 });

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      const result = await publishAssessmentFlow(state);
      navigate(`/recruiter/assessments/${result.id || state.backendId}`);
    } catch (err) {
      if (err.message?.startsWith('MISSING_ENDPOINT')) {
        setError(`Cannot publish yet — some backend endpoints are not implemented:\n${err.message.replace('MISSING_ENDPOINT: ', '')}`);
      } else {
        setError(err.message || 'Failed to publish assessment.');
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto py-10 px-6">
      <div className="max-w-[640px] mx-auto space-y-6">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary mb-1">Review &amp; publish</h2>
          <p className="text-[13px] text-text-secondary">Check everything looks right before sharing with candidates.</p>
        </div>

        {/* Summary card */}
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border-default">
            <h3 className="text-[15px] font-bold text-text-primary truncate">{name || 'Untitled assessment'}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-[12px] text-text-secondary">
              {duration_minutes && <span>{duration_minutes}m cap</span>}
              {ai_level && <span>AI: {AI_LEVEL_LABELS[ai_level] || ai_level}</span>}
              <span>{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
              <span>{totalQuestions} question{totalQuestions !== 1 ? 's' : ''}</span>
              {totalPts > 0 && <span>{totalPts} pts</span>}
            </div>
          </div>

          {/* Section rows */}
          <div className="px-5">
            {sections.length === 0 ? (
              <p className="text-[13px] text-text-muted py-5 text-center">No sections added yet.</p>
            ) : (
              sections.map(section => <SectionRow key={section.id} section={section} />)
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-bg border border-error/30 rounded-xl">
            <p className="text-[13px] text-error whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
          >
            <IconArrowLeft size={15} />
            Back
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || sections.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconRocket size={15} />
            {publishing ? 'Publishing…' : 'Publish assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}
