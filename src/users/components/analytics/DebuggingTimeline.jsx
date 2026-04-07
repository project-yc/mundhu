const MILESTONES = [
  { time: '00:15', label: 'Started' },
  { time: '00:45', label: 'Bug found' },
  { time: '01:16', label: 'Fixed' },
  { time: '01:45', label: 'Deployed' },
];

const DOT_COLORS = ['bg-gray-500', 'bg-pink-500', 'bg-teal-400', 'bg-gray-500'];

export default function DebuggingTimeline() {
  return (
    <section className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5">
      <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-gray-500">Debugging Timeline</p>

      <div className="relative">
        <div className="absolute left-0 right-0 top-[21px] h-px bg-[#2a2d3a]" />

        <div className="relative flex items-start justify-between">
          {MILESTONES.map((milestone, index) => (
            <div key={`${milestone.time}-${milestone.label}`} className="flex min-w-0 flex-1 flex-col items-center text-center">
              <p className="mb-2 text-xs text-gray-400">{milestone.label}</p>
              <span className={`z-10 h-3 w-3 rounded-full border border-[#13151f] ${DOT_COLORS[index] || 'bg-gray-500'}`} />
              <p className="mt-2 text-[11px] text-gray-500">{milestone.time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}