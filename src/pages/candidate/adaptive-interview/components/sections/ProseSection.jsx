export default function ProseSection({ section }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[13px] font-medium text-text-primary">{section.label}</p>
      {section.body.split('\n\n').map((paragraph, i) => (
        <p key={i} className="text-[12px] leading-[1.5] text-text-secondary">
          {paragraph}
        </p>
      ))}
    </div>
  )
}
