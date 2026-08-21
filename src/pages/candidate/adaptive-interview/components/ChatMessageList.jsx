import { useEffect, useRef } from 'react'
import ChatBubbleAI from './ChatBubbleAI'
import ChatBubbleCandidate from './ChatBubbleCandidate'
import ThinkingBubble from './ThinkingBubble'

export default function ChatMessageList({ messages, thinking, thinkingLabel, avatarUrl }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
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
      className="flex flex-col gap-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-label="Interview conversation"
    >
      {messages.map((message) => (
        message.role === 'ai'
          ? <ChatBubbleAI key={message.id} text={message.text} avatarUrl={avatarUrl} />
          : <ChatBubbleCandidate key={message.id} text={message.text} />
      ))}
      {thinking && <ThinkingBubble label={thinkingLabel} />}
      <div ref={endRef} />
    </div>
  )
}
