import SectionLabel from './SectionLabel'

export default function ProseSection({ section }) {
  // Split on blank lines first — that is what the engine emits as a paragraph
  // break. Falling back to single newlines matters because a briefing written
  // as one line per fact ("You are the on-call engineer...") arrived as a
  // single run-on block, which is the hardest possible shape to scan.
  const body = String(section.body ?? '')
  const blocks = (body.includes('\n\n') ? body.split(/\n{2,}/) : body.split('\n'))
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <section className="flex flex-col gap-2">
      <SectionLabel>{section.label}</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {blocks.map((paragraph, i) => (
          <p key={i} className="text-[13px] leading-[1.6] text-text-secondary">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
