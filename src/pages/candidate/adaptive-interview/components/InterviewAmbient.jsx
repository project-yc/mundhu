// The ember ground behind the conversation.
//
// Purely decorative, and deliberately confined to the chat column: the scenario
// rail is reference material that has to stay legible under scrutiny, and a
// warm wash under a stat grid costs contrast for nothing.
//
// All of the colour work lives in `.interview-ambient` (src/index.css) — it is
// a stack of gradients with a lot of hand-placed stops, and it is far easier to
// tune as CSS that hot-reloads than as a utility string.
export default function InterviewAmbient() {
  return <div aria-hidden="true" className="interview-ambient" />
}
