import { ExamSidebar } from '../../../../components/candidate/exam/ExamShell'
import ScenarioBody from './ScenarioBody'

// The desktop, persistent version of the scenario panel.
//
// It sits on the RIGHT. The candidate's job on this screen is to answer, and
// the answer is composed on the left — putting the reference material first in
// reading order made the conversation the secondary column on its own screen.
// Wider than the question-navigator case, too: this rail carries stat grids,
// log blocks and chat transcripts, not a grid of numbers.
export default function ScenarioPanel({ scenario }) {
  if (!scenario) return null

  return (
    <ExamSidebar
      side="right"
      // Fluid: the Figma frame gives the rail ~44% of a 1440px viewport, which
      // a fixed 440px does not reproduce on a large display and which squeezes
      // the conversation on a small one. Clamped so the stat grids keep enough
      // width to lay out without ellipsing their labels.
      width="clamp(380px, 32vw, 560px)"
      bodyClassName="px-6 py-5"
      header={(
        <div className="shrink-0 px-6 pb-1 pt-6">
          <h2 className="text-[17px] font-semibold leading-[1.3] tracking-[-0.015em] text-text-primary">
            {scenario.title}
          </h2>
        </div>
      )}
    >
      <ScenarioBody scenario={scenario} />
    </ExamSidebar>
  )
}
