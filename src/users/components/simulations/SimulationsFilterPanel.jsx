import { ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react';

function SectionLabel({ children }) {
  return <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-[#6f7f9f]">{children}</p>;
}

export default function SimulationsFilterPanel({
  domains,
  selectedDomains,
  onToggleDomain,
  difficulties,
  selectedDifficulty,
  onSelectDifficulty,
  tags,
  selectedTags,
  onToggleTag,
  aiAssistance,
  onToggleAi,
}) {
  return (
    <aside className="w-[280px] border-r border-[#121f38] bg-[#040a16] px-4 py-4">
      <SectionLabel>DOMAIN</SectionLabel>
      <div className="space-y-2">
        {domains.map((domain) => {
          const checked = selectedDomains.includes(domain.value);

          return (
            <label key={domain.value} className="flex cursor-pointer items-center gap-2 text-sm text-[#8b9cbc]">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleDomain(domain.value)}
                className="h-4 w-4 rounded border border-[#263b63] bg-[#091426] text-[#16d2ff] focus:ring-0"
              />
              {domain.label}
            </label>
          );
        })}
      </div>

      <div className="mt-6">
        <SectionLabel>DIFFICULTY</SectionLabel>
        <div className="space-y-1.5">
          {difficulties.map((difficulty) => {
            const selected = difficulty === selectedDifficulty;

            return (
              <button
                key={difficulty}
                type="button"
                onClick={() => onSelectDifficulty(difficulty)}
                className={`flex w-full items-center gap-2 rounded border px-3 py-2 text-left text-sm transition ${
                  selected
                    ? 'border-[#16d2ff] bg-[#07192d] text-[#e7f4ff]'
                    : 'border-[#1a2945] bg-[#070f1d] text-[#7f90b2] hover:border-[#29416d]'
                }`}
              >
                <span
                  className={`h-3.5 w-3.5 rounded-full border ${
                    selected ? 'border-[#16d2ff] bg-[#16d2ff]' : 'border-[#2a3c60]'
                  }`}
                />
                {difficulty}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel>TAGS</SectionLabel>
        <div className="space-y-2 rounded border border-[#1a2945] bg-[#070f1d] p-3">
          {tags.map((tag) => {
            const checked = selectedTags.includes(tag.value);

            return (
              <label key={tag.value} className="flex cursor-pointer items-center gap-2 text-[13px] text-[#8b9cbc]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTag(tag.value)}
                  className="h-3.5 w-3.5 rounded border border-[#263b63] bg-[#091426] text-[#16d2ff] focus:ring-0"
                />
                {tag.label}
              </label>
            );
          })}

          {tags.length === 0 && <p className="text-[12px] text-[#6f7f9f]">No tags available</p>}

          <div className="flex items-center justify-between border-t border-[#1a2945] pt-2">
            <p className="text-[12px] text-[#7f90b2]">Select tags...</p>
            <ChevronDown className="h-4 w-4 text-[#6f7f9f]" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-[14px] text-[#95a6c7]">AI Assistance</p>
        <button type="button" onClick={onToggleAi} className="text-[#16d2ff]">
          {aiAssistance ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
        </button>
      </div>
    </aside>
  );
}
