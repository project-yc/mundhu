import { useEffect, useRef } from 'react'
import ChatBubbleAI from './ChatBubbleAI'
import ChatBubbleCandidate from './ChatBubbleCandidate'
import ThinkingBubble from './ThinkingBubble'

// The transcript scrolls inside ExamShell's <main>, not inside this component,
// so "am I at the bottom?" has to be asked of whichever ancestor actually
// overflows.
//
// Deliberately does NOT require the ancestor to be overflowing right now: at
// mount the conversation is one or two bubbles and nothing scrolls yet, so a
// size test here found no container at all and the listener below was never
// attached — the transcript then sat at scrollTop 0 for the entire interview
// while messages piled up below the fold.
const scrollParentOf = (node) => {
  let el = node?.parentElement
  while (el) {
    const overflowY = window.getComputedStyle(el).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return el
    el = el.parentElement
  }
  return null
}

const NEAR_BOTTOM_PX = 120

export default function ChatMessageList({
  messages,
  thinking,
  thinkingLabel,
  candidateName,
  pendingMessageId,
}) {
  const endRef = useRef(null)
  const atBottomRef = useRef(true)
  const scrollerRef = useRef(null)
  // Set while THIS component is driving the scroller. A smooth scroll emits the
  // same `scroll` events a finger does, and it emits them from the top of the
  // animation — where the position is, by definition, not yet at the bottom. So
  // the auto-scroll read its own first frame as "the candidate scrolled away",
  // set the flag false, and never followed the conversation again.
  const autoScrollingRef = useRef(false)
  const autoScrollTimerRef = useRef(0)

  // Track the candidate's position from SCROLL events rather than from render.
  //
  // Sampling during render — even in a layout effect — is too late: React has
  // already appended the new bubble by then, so `scrollHeight` includes it and
  // every position measures as "far from the bottom". Reading it on scroll
  // instead means the ref holds where the candidate actually was when they last
  // looked, which is the question being asked.
  useEffect(() => {
    const parent = scrollParentOf(endRef.current)
    if (!parent) return undefined
    scrollerRef.current = parent
    const sync = () => {
      const nearBottom =
        parent.scrollHeight - parent.scrollTop - parent.clientHeight < NEAR_BOTTOM_PX
      if (autoScrollingRef.current) {
        // While we are driving, a scroll event may only CONFIRM that we have
        // arrived — never deny it. Arriving also ends the animation as far as
        // this is concerned, so a real scroll straight afterwards is honoured.
        if (nearBottom) {
          autoScrollingRef.current = false
          atBottomRef.current = true
        }
        return
      }
      atBottomRef.current = nearBottom
    }
    sync()
    parent.addEventListener('scroll', sync, { passive: true })
    return () => parent.removeEventListener('scroll', sync)
  }, [])

  useEffect(() => () => clearTimeout(autoScrollTimerRef.current), [])

  useEffect(() => {
    // Only follow the conversation if the candidate was already at the bottom.
    // Scrolling unconditionally yanked them back down mid-sentence whenever a
    // poll landed while they were up in the transcript re-reading the question
    // they are answering — which is exactly when they scroll up.
    if (!atBottomRef.current) return
    const parent = scrollerRef.current
    // Scroll the CONTAINER, not a sentinel element. `scrollIntoView` with
    // `block: 'end'` aligns the sentinel to the container's bottom edge and so
    // leaves the stage's bottom padding unscrolled — which is exactly the
    // clearance the composer's blur veil occupies, so the newest message came
    // to rest underneath it, permanently out of focus.
    if (!parent) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      return
    }
    autoScrollingRef.current = true
    // Release the guard even if the animation never lands — an interrupted
    // scroll (the candidate grabs the bar mid-flight) would otherwise leave it
    // stuck on and make every later scroll of theirs invisible to `sync`.
    clearTimeout(autoScrollTimerRef.current)
    autoScrollTimerRef.current = setTimeout(() => { autoScrollingRef.current = false }, 1200)
    parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' })
  }, [messages.length, thinking])

  return (
    // Announced, because the interviewer's messages arrive from a POLL — there
    // is no user action for a screen reader to attribute the change to, so
    // without a live region a candidate using one got silence and had to keep
    // re-reading the page to find out whether a question had appeared. This is
    // the primary content channel and was the only place in the interview
    // missing one (`Composer` marks up interim dictation, `index.jsx` marks up
    // send errors).
    //
    // `polite`, not `assertive`: it must not interrupt the candidate mid-answer.
    // `additions text` so appended bubbles are read without re-reading the whole
    // transcript each time.
    <div
      className="flex flex-col"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-label="Interview conversation"
    >
      {messages.map((message, i) => {
        const previous = messages[i - 1]
        // Consecutive turns from one speaker are one utterance broken up, not a
        // new exchange. Tightening them and dropping the repeated gutter mark
        // is what makes a long transcript scan as a conversation.
        const grouped = previous?.role === message.role
        const spacing = i === 0 ? '' : grouped ? 'mt-1.5' : 'mt-5'

        return (
          <div key={message.id} className={spacing}>
            {message.role === 'ai' ? (
              <ChatBubbleAI
                text={message.text}
                isNudge={message.isNudge}
                hideAvatar={grouped}
              />
            ) : (
              <ChatBubbleCandidate
                text={message.text}
                candidateName={candidateName}
                pending={message.id === pendingMessageId}
                hideAvatar={grouped}
              />
            )}
          </div>
        )
      })}

      {thinking && (
        <div className={messages.length ? 'mt-5' : ''}>
          <ThinkingBubble label={thinkingLabel} />
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
