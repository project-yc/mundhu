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
    <div className="flex flex-col gap-4">
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
