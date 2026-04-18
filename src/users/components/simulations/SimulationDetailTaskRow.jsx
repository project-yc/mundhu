const MONO_STYLE = { fontFamily: '"JetBrains Mono", monospace' };

const getLeftAccentColor = (status) => {
  if (status === 'completed') {
    return '#10B981';
  }

  if (status === 'in_progress') {
    return '#F59E0B';
  }

  return '#0F1A2E';
};

const clampTwoLinesClass =
  '[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden';

export default function SimulationDetailTaskRow({
  task,
  index,
  status,
  onOpen,
}) {
  const taskNumber = String(index + 1).padStart(2, '0');
  const leftAccentColor = getLeftAccentColor(status);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="task-row mb-2 flex w-full cursor-pointer items-start gap-4 rounded-[8px] border-l-[3px] bg-[#0A0F1E] px-5 py-4"
      style={{ '--left-accent-color': leftAccentColor }}
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[11px] font-semibold" style={MONO_STYLE}>
        {status === 'completed' ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A1A0A] text-[#10B981]">✓</span>
        ) : status === 'in_progress' ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1200] text-[#F59E0B]">{taskNumber}</span>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0F1A2E] bg-[#0A0F1E] text-[#4B5563]">
            {taskNumber}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-[#F1F5F9]">{task?.title || `Task ${taskNumber}`}</p>

        {task?.description ? (
          <p className={`mt-0.5 text-[13px] leading-[1.45] text-[#94A3B8] ${clampTwoLinesClass}`}>
            {task.description}
          </p>
        ) : null}

        {status === 'completed' ? (
          <p className="mt-2 text-[11px] font-semibold text-[#10B981]" style={MONO_STYLE}>DONE</p>
        ) : null}

        {status === 'in_progress' ? (
          <div className="mt-2 flex items-center gap-1.5" style={MONO_STYLE}>
            <span className="h-1.5 w-1.5 animate-[taskPulse_1.4s_ease-in-out_infinite] rounded-full bg-[#F59E0B]" />
            <span className="text-[11px] font-semibold text-[#F59E0B]">IN PROGRESS</span>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className={`rounded-[8px] px-[14px] py-[5px] text-[10px] font-bold uppercase tracking-[0.04em] ${
            status === 'completed'
              ? 'border border-[#10B981] bg-transparent text-[#10B981]'
              : status === 'in_progress'
                ? 'border border-[#06B6D4] bg-transparent text-[#06B6D4]'
                : 'bg-[#06B6D4] text-[#040914]'
          }`}
          style={MONO_STYLE}
        >
          {status === 'completed' ? 'GENERATE REPORT' : status === 'in_progress' ? 'CONTINUE' : 'START TASK'}
        </button>
      </div>
    </article>
  );
}
