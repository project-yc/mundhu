import ScenarioSection from './ScenarioSection'
import ScenarioErrorBoundary from './ScenarioErrorBoundary'

// The scenario's rendered contents, shared by the desktop rail
// (`ScenarioPanel`) and the small-screen sheet (`ScenarioPanelSheet`). The two
// had identical bodies copied into both files, so every fix to one — the
// unvalidated-`sections` guard, the image figure markup — had to be made twice
// and twice was not always what happened.
export default function ScenarioBody({ scenario }) {
  if (!scenario) return null

  return (
    <ScenarioErrorBoundary>
      <div className="flex flex-col gap-6">
        {scenario.images?.length > 0 && (
          <div className="flex flex-col gap-2">
            {scenario.images.map((image, i) => (
              <figure key={i} className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
                <img src={image.url} alt={image.alt || ''} className="w-full object-cover" />
                {image.caption && (
                  <figcaption className="border-t border-border-subtle px-3 py-2 text-[11.5px] leading-[1.4] text-text-muted">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* Optional-chained: `sections` is required by contract but arrives
            unvalidated, and an absent key must not throw. */}
        {(scenario.sections || []).map((section, i) => (
          <ScenarioSection key={section?.id || i} section={section} />
        ))}
      </div>
    </ScenarioErrorBoundary>
  )
}
