import ProseSection from './sections/ProseSection'
import StatGridSection from './sections/StatGridSection'
import LogSection from './sections/LogSection'
import ChatTranscriptSection from './sections/ChatTranscriptSection'

const RENDERERS = {
  prose: ProseSection,
  stat_grid: StatGridSection,
  log: LogSection,
  chat_transcript: ChatTranscriptSection,
}

// Dispatches a scenario section by its `type` to the matching renderer. This
// is the extension point for the future backend contract — a new section
// type only needs a new entry here, not a change to ScenarioPanel.
export default function ScenarioSection({ section }) {
  // The section list is forwarded unvalidated from the engine, so an entry can
  // be null or a bare string. Reading `.type` off that throws, and a throw here
  // used to unmount the whole interview.
  if (!section || typeof section !== 'object') {
    console.warn('[adaptive-interview] scenario section is not an object', section)
    return null
  }
  const Renderer = RENDERERS[section.type]
  if (!Renderer) {
    // Silently dropping it hid a library/renderer mismatch from everyone.
    console.warn(`[adaptive-interview] no renderer for scenario section type "${section.type}"`)
    return null
  }
  return <Renderer section={section} />
}
