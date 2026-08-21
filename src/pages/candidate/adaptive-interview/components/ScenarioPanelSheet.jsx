// ─────────────────────────────────────────────────────────────────────────────
// ScenarioPanelSheet — the scenario panel on small screens.
//
// Below `lg` there's no room for a persistent side panel, so it lives in a
// right-side sheet instead. Mirrors QuestionMapSheet.jsx: it reads the theme
// container itself because it's rendered inside the scope but portals outside
// of it.
// ─────────────────────────────────────────────────────────────────────────────

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../../components/ui/sheet'
import { useCandidateThemeContainer } from '../../../../theme/CandidateThemeProvider'
import ScenarioSection from './ScenarioSection'
import ScenarioErrorBoundary from './ScenarioErrorBoundary'

export default function ScenarioPanelSheet({ open, onOpenChange, scenario }) {
  const container = useCandidateThemeContainer()

  if (!scenario) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        container={container}
        className="candidate-theme w-full border-l border-border-default sm:max-w-[420px]"
      >
        <SheetHeader>
          <SheetTitle>{scenario.title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          <ScenarioErrorBoundary>
          {scenario.images?.length > 0 && (
            <div className="flex flex-col gap-2">
              {scenario.images.map((image, i) => (
                <figure key={i} className="overflow-hidden rounded-lg border border-border-subtle">
                  <img src={image.url} alt={image.alt} className="w-full object-cover" />
                  {image.caption && (
                    <figcaption className="px-2 py-1.5 text-[11px] text-text-muted">{image.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
          {/* See ScenarioPanel: `sections` arrives unvalidated and must not throw. */}
          {(scenario.sections || []).map((section, i) => (
            <ScenarioSection key={section?.id || i} section={section} />
          ))}
          </ScenarioErrorBoundary>
        </div>
      </SheetContent>
    </Sheet>
  )
}
