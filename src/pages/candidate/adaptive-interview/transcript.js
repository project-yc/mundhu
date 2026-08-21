// Turning one stored question into the chat bubbles the candidate saw.
//
// Lives outside index.jsx so the recruiter transcript's `splitAnswerTurns` can be
// shared without turning the screen component into a mixed-export module.

// The engine joins a nudge reply onto the original answer with this marker. The
// recruiter transcript already splits it back apart; reusing that helper keeps
// one parser for one wire format.
import { splitAnswerTurns } from '../../recruiter/report-detail/utils/adaptiveReport'

// Replay one question's exchange as the bubbles the candidate saw live.
//
// The stored answer is NOT just the last thing they typed. When they reply to a
// nudge the engine appends the reply onto the existing answer_text with
// ANSWER_TURN_SEPARATOR rather than replacing it, and Django forwards that
// string verbatim. Rendering it as one bubble put the internal `[follow-up]`
// marker inside the candidate's own words, fused their two turns together, and
// — because every nudge was emitted before the answer — showed the interviewer's
// follow-up BEFORE the answer that provoked it. Every refresh and every 409
// resync rewrote their transcript that way.
//
// So walk the turns and the nudges together. A nudge that awaited a reply is
// exactly what produced the NEXT turn, so it belongs between them. An
// acknowledgement (`awaits_reply === false`) is a remark, not a question — it
// produced no further turn, so it is emitted where it was said and does not
// consume a turn boundary. Splitting is delegated to `splitAnswerTurns`, the
// same helper the recruiter transcript uses, so the two views cannot drift.
export const questionToMessages = (question) => {
  const messages = [{ id: `q-${question.id}`, role: 'ai', text: question.question_text }]

  const turns = splitAnswerTurns(question.answer?.answer_text)
  const nudges = (question.nudge_history || []).filter((nudge) => nudge?.text)

  let turnIndex = 0
  const pushNextTurn = () => {
    if (turnIndex >= turns.length) return
    messages.push({ id: `a-${question.id}-${turnIndex}`, role: 'candidate', text: turns[turnIndex] })
    turnIndex += 1
  }

  pushNextTurn()
  nudges.forEach((nudge, index) => {
    messages.push({ id: `n-${question.id}-${index}`, role: 'ai', text: nudge.text, isNudge: true })
    // Entries written before `awaits_reply` existed were all real probes.
    if (nudge.awaits_reply !== false) pushNextTurn()
  })
  // Anything still unemitted is the candidate's own text (a marker they typed
  // themselves, or a turn the nudge history does not account for). Never drop
  // their words to satisfy the interleave.
  while (turnIndex < turns.length) pushNextTurn()

  return messages
}
