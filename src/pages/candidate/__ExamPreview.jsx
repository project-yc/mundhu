// TEMPORARY design preview — mock data, no API. Delete before merge.
import { useEffect, useState } from 'react'
import { IconArrowLeft, IconArrowRight, IconEraser, IconLayoutGrid } from '@tabler/icons-react'
import ExamShell, {
  ExamActionBar,
  ExamProgress,
  ExamSidebar,
  ExamTopBar,
} from '../../components/candidate/exam/ExamShell'
import ExamButton from '../../components/candidate/exam/ExamButton'
import ExamTimer from '../../components/candidate/exam/ExamTimer'
import {
  AutoSaveChip,
  ConnectionStatus,
  ExamBrand,
  FullscreenToggle,
} from '../../components/candidate/exam/ExamStatus'
import QuestionMap, { QuestionMapLegend } from '../../components/candidate/exam/QuestionMap'
import QuestionMapSheet from '../../components/candidate/exam/QuestionMapSheet'
import QuestionStage from '../../components/candidate/exam/QuestionStage'

const LONG_PROMPT = `Consider a distributed system architecture where multiple nodes need to reach a consensus on a specific state change despite network partitions and potential node failures. You are implementing a simplified version of the Raft consensus algorithm.

Which of the following scenarios best describes a situation where a new Leader will definitively be elected in a cluster of 5 nodes?`

const QUESTIONS = [
  {
    item_attempt_id: 'a1', points: 2,
    question: {
      prompt: LONG_PROMPT,
      selection_mode: 'single',
      options: [
        { id: 1, text: 'The current Leader crashes, and two remaining nodes receive votes from 2 nodes each simultaneously.' },
        { id: 2, text: 'A network partition separates the Leader from the rest of the cluster; 3 nodes form a new majority and one times out, initiating an election.' },
        { id: 3, text: 'The Leader is operational but experiences high latency; followers continue to receive heartbeats just before their election timeouts expire.' },
        { id: 4, text: 'Every node simultaneously increments its term and votes for itself.' },
      ],
    },
  },
  {
    item_attempt_id: 'a2', points: 3,
    question: {
      prompt: 'Select every statement that is true about HTTP caching headers.',
      selection_mode: 'multi',
      options: [
        { id: 1, text: 'ETag enables conditional requests via If-None-Match' },
        { id: 2, text: 'Cache-Control: no-store prevents any storage of the response' },
        { id: 3, text: 'Expires takes precedence over Cache-Control: max-age' },
        { id: 4, text: 'Vary tells caches which request headers affect the response' },
      ],
    },
  },
  ...Array.from({ length: 23 }, (_, i) => ({
    item_attempt_id: `a${i + 3}`, points: 1,
    question: {
      prompt: `Placeholder question ${i + 3} — what does the event loop do between macrotasks?`,
      selection_mode: 'single',
      options: [
        { id: 1, text: 'Drains the microtask queue' },
        { id: 2, text: 'Blocks until the next timer' },
        { id: 3, text: 'Runs garbage collection' },
      ],
    },
  })),
]

const FREE_TEXT = [
  { item_attempt_id: 'f1', points: 5, question: { prompt: 'A teammate opens a pull request that adds a 400ms blocking call to your checkout path. Walk through how you would raise this, and what you would propose instead.', word_limit: 300 } },
  { item_attempt_id: 'f2', points: 4, question: { prompt: 'Describe a time you shipped something that broke in production. What did you change about how you work afterwards?', word_limit: null } },
  ...Array.from({ length: 6 }, (_, i) => ({ item_attempt_id: `f${i + 3}`, points: 3,
    question: { prompt: `Written prompt ${i + 3} — explain your reasoning in a short paragraph.`, word_limit: 150 } })),
]

const RANKING = [
  { item_attempt_id: 'r1', points: 4, question: { prompt: 'A production incident has just been declared. Rank these actions from first to last.',
    options: [
      { id: 1, text: 'Acknowledge the page and declare an incident channel' },
      { id: 2, text: 'Roll back the most recent deploy' },
      { id: 3, text: 'Write the customer-facing status update' },
      { id: 4, text: 'Open a post-incident review document' },
      { id: 5, text: 'Confirm the blast radius from dashboards' },
    ] } },
  ...Array.from({ length: 7 }, (_, i) => ({ item_attempt_id: `r${i + 2}`, points: 2,
    question: { prompt: `Ranking prompt ${i + 2} — order these by priority.`,
      options: [
        { id: 1, text: 'First candidate item' },
        { id: 2, text: 'Second candidate item' },
        { id: 3, text: 'Third candidate item' },
      ] } })),
]

const SETS = { mcq: QUESTIONS, free_text: FREE_TEXT, ranking: RANKING }
const TYPE_LABELS = { mcq: 'MCQ', free_text: 'Free text', ranking: 'Ranking' }

export default function ExamPreview() {
  const [contentType, setContentType] = useState('mcq')
  const [answersByType, setAnswersByType] = useState({ mcq: { a1: ['2'], a3: ['1'], a4: ['1'], a5: ['2'] }, free_text: {}, ranking: {} })
  const [visited, setVisited] = useState({ a1: true, a2: true, a3: true, a4: true, a5: true, a6: true })
  const answers = answersByType[contentType]
  const setAnswers = (fn) => setAnswersByType((p) => ({ ...p, [contentType]: typeof fn === 'function' ? fn(p[contentType]) : fn }))
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [mapOpen, setMapOpen] = useState(false)
  const [seconds, setSeconds] = useState(6299)
  const [elapsed, setElapsed] = useState(0)

  const questions = SETS[contentType]
  const total = questions.length
  const isAnswered = (v) => (contentType === 'free_text' ? !!(v || '').trim() : (v || []).length > 0)
  const answered = questions.filter((q) => isAnswered(answers[q.item_attempt_id])).length
  const current = questions[Math.min(index, total - 1)]
  const currentAnswer = answers[current.item_attempt_id] ?? (contentType === 'free_text' ? '' : [])

  useEffect(() => {
    const id = setInterval(() => { setSeconds((s) => Math.max(s - 1, 0)); setElapsed((e) => e + 1) }, 1000)
    return () => clearInterval(id)
  }, [])

  const statuses = questions.map((q) => ({
    answered: isAnswered(answers[q.item_attempt_id]),
    visited: !!visited[q.item_attempt_id],
  }))

  const goTo = (i) => {
    const next = Math.min(Math.max(i, 0), total - 1)
    setDirection(next >= index ? 1 : -1)
    setIndex(next)
    const id = questions[next].item_attempt_id
    setVisited((p) => (p[id] ? p : { ...p, [id]: true }))
  }


  return (
    <ExamShell
      topBar={(
        <ExamTopBar brand={<ExamBrand fallback="QualifyPro" />}>
          <div className="flex items-center gap-1 rounded-lg border border-border-strong bg-surface-muted p-0.5">
            {Object.keys(SETS).map((t) => (
              <button key={t} type="button"
                onClick={() => { setContentType(t); setIndex(0) }}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${contentType === t ? 'bg-brand text-on-brand' : 'text-text-muted hover:text-text-primary'}`}>
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <AutoSaveChip savedAt={JSON.stringify(answers)} />
          <ExamTimer remainingSeconds={seconds} elapsedSeconds={elapsed} />
          <ConnectionStatus />
          <FullscreenToggle />
        </ExamTopBar>
      )}
      sidebar={(
        <ExamSidebar
          title="Question Navigator"
          subtitle={`${total - answered} questions remaining`}
          legend={<QuestionMapLegend />}
          action={<ExamButton variant="outline" size="lg" className="w-full">Finish section</ExamButton>}
        >
          <QuestionMap statuses={statuses} currentIndex={index} onJump={goTo} />
        </ExamSidebar>
      )}
      progress={<ExamProgress value={answered} total={total} />}
      actionBar={(
        <ExamActionBar>
          <ExamButton variant="quiet" size="icon" className="lg:hidden" onClick={() => setMapOpen(true)}>
            <IconLayoutGrid size={18} />
          </ExamButton>
          <ExamButton variant="quiet" onClick={() => goTo(index - 1)} disabled={index === 0}>
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </ExamButton>
          <ExamButton
            variant="quiet"
            onClick={() => setAnswers((p) => ({ ...p, [current.item_attempt_id]: contentType === 'free_text' ? '' : [] }))}
            disabled={!isAnswered(currentAnswer)}
          >
            <IconEraser size={16} />
            <span className="hidden sm:inline">Clear</span>
          </ExamButton>
          <span className="flex-1" />
          <ExamButton onClick={() => goTo(index + 1)} sweep={index === total - 1}>
            {index === total - 1 ? 'Finish section' : 'Next'}
            <IconArrowRight size={16} />
          </ExamButton>
        </ExamActionBar>
      )}
    >
      <QuestionStage
        question={current}
        index={Math.min(index, total - 1)}
        contentType={contentType}
        answer={currentAnswer}
        onAnswerChange={(value) => setAnswers((p) => ({ ...p, [current.item_attempt_id]: value }))}
        direction={direction}
      />
      <QuestionMapSheet
        open={mapOpen}
        onOpenChange={setMapOpen}
        statuses={statuses}
        currentIndex={index}
        onJump={(i) => { goTo(i); setMapOpen(false) }}
      />
    </ExamShell>
  )
}
