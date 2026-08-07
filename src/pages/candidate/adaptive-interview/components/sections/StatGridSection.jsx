import { cn } from '../../../../../lib/utils'

export default function StatGridSection({ section }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[13px] font-medium text-text-primary">{section.label}</p>
      <div className="grid grid-cols-3 gap-2">
        {section.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-0.5 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2"
          >
            <span className="text-[12px] text-text-muted">{stat.label}</span>
            <span
              className={cn(
                'text-[13px]',
                stat.tone === 'success' ? 'text-success' : 'text-text-primary',
              )}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
