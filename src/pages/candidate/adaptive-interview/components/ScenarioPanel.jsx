import { ExamSidebar } from '../../../../components/candidate/exam/ExamShell'
import ScenarioSection from './ScenarioSection'

// The desktop, persistent version of the scenario panel — reuses ExamShell's
// sidebar slot at a wider fixed width than the question-navigator case.
export default function ScenarioPanel({ scenario }) {
  if (!scenario) return null

  return (
    <ExamSidebar title={scenario.title} width="420px">
      <div className="flex flex-col gap-5">
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
        {scenario.sections.map((section, i) => (
          <ScenarioSection key={section.id || i} section={section} />
        ))}
      </div>
    </ExamSidebar>
  )
}
