/**
 * Section settings card shown at the top of MCQ, FreeText, and Ranking editors.
 * Maps to Section.timer_config_json.duration_minutes.
 */
export function SectionConfigCard({ timerMinutes, onTimerChange }) {
  return (
    <div className="bg-surface border border-border-default rounded-xl p-4 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Section Settings</p>
      <label className="flex items-center gap-2 text-[13px] text-text-secondary">
        <span className="font-medium">Section timer (min)</span>
        <input
          type="number"
          min={1}
          max={480}
          value={timerMinutes ?? ''}
          onChange={e => onTimerChange(e.target.value ? Number(e.target.value) : null)}
          placeholder="—"
          className="w-16 px-2.5 py-1.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
        />
      </label>
    </div>
  );
}
