const SIGNAL_SCORE_MAPPING = {
  green: { score: 5, label: 'Strong' },
  yellow: { score: 3.5, label: 'Developing' },
  red: { score: 2, label: 'Needs Work' },
};

const SIGNAL_TEXT_CLASS = {
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
};

const SIGNAL_DOT_CLASS = {
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
};

export default function SignalCard({ title, signal, summary }) {
  const normalizedSignal = SIGNAL_SCORE_MAPPING[signal] ? signal : 'red';
  const scoreData = SIGNAL_SCORE_MAPPING[normalizedSignal];

  return (
    <article className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">{title || 'Signal'}</h3>
        <span className={`h-2 w-2 rounded-full ${SIGNAL_DOT_CLASS[normalizedSignal]}`} />
      </div>

      <p className={`mb-2 text-sm font-semibold ${SIGNAL_TEXT_CLASS[normalizedSignal]}`}>{scoreData.label}</p>
      <p className="mb-4 min-h-10 text-sm text-gray-400">{summary || 'No summary available.'}</p>

      <div className="flex items-end gap-1 text-white">
        <span className="text-4xl font-bold">{scoreData.score}</span>
        <span className="pb-1 text-sm text-gray-400">/5</span>
      </div>
    </article>
  );
}