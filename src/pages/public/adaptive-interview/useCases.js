/**
 * The five ways the adaptive panel gets used.
 *
 * `status` drives the chip on each tab: 'live' for what ships today,
 * 'soon' for what is on the near roadmap. Flip a single string when a mode
 * lands — nothing else on the page needs to change.
 *
 * `chat` is the transcript rendered in that mode's panel, built from the row
 * kinds in `components/chatKit.jsx`. Each mode leans on a different artefact —
 * a cited résumé line, the candidate's own diff, a passage from your doc, a
 * live metrics grid — which is what stops the five panels looking alike.
 *
 * Accents are spread across the wheel so each mode owns a hue: warm paper
 * orange for the résumé, terminal cyan for code, document violet for uploaded
 * material, human rose for behavioural, alert yellow for incidents.
 */

export const USE_CASES = [
  {
    id: 'resume',
    tab: 'Résumé deep dive',
    accent: '#FF8F5A',
    status: 'soon',
    kicker: 'Mode 01',
    title: 'Find out which line of the résumé they can actually defend.',
    body:
      'The panel reads the résumé before it says hello, then works down the claims that matter — the migration they "led", the system they "scaled", the number they put in bold. It follows the thread until there is either real ownership underneath it or there plainly is not.',
    proof: [
      'Pulls specific projects, tools and metrics straight off the CV',
      'Separates "I was on the team" from "I made the call"',
      'Flags claims that collapse under one follow-up',
    ],
    chat: {
      title: 'Résumé deep dive',
      meta: 'platform · staff · ownership',
      badge: 'Q2 / 6',
      turns: [
        { kind: 'note', text: 'context loaded · resume.pdf · 4 claims queued' },
        {
          kind: 'cite',
          label: 'From the résumé',
          body: 'Led the migration of billing from the monolith into three services. Cut p95 by 40%.',
        },
        {
          kind: 'ai',
          text: 'I want to dig into the billing migration. Whose call was it to split it into three services rather than two, or four?',
        },
        { kind: 'candidate', text: 'It was a team decision — we mapped the services onto the domains.' },
        { kind: 'signal', value: 'low_evidence', strategy: 'evidence_seeking', color: '#FBBF24' },
        { kind: 'ai', text: 'Sure. When you mapped those domains, which boundary was the one people argued about?' },
        {
          kind: 'candidate',
          text: 'Refunds. It touches invoices and payouts, so we nearly folded it into invoicing. We kept it separate because the payout ledger has a stricter consistency requirement.',
        },
        { kind: 'score', competency: 'ownership', value: 3, note: 'named the real boundary' },
        { kind: 'ai', text: 'That is the detail I was after. And the 40% — measured against which baseline?' },
      ],
    },
  },

  {
    id: 'technical',
    tab: 'Code-aware follow-ups',
    accent: '#56C7F5',
    status: 'live',
    kicker: 'Mode 02',
    title: 'The follow-up round your take-home was always missing.',
    body:
      'The panel opens with the candidate\'s own submission already in context — the diff they wrote, the tests they skipped, the shortcut they took at line 84. It asks about their code, not code in general. Copy-pasted solutions come apart in about two questions.',
    proof: [
      'Reads the coding attempt and report signals before generating anything',
      'Probes the decisions behind the code, not textbook recall',
      'Separates candidates who wrote it from candidates who pasted it',
    ],
    chat: {
      title: 'Code-aware follow-ups',
      meta: 'backend · senior · reliability',
      badge: 'Q4 / 8',
      turns: [
        { kind: 'note', text: 'context loaded · submission #4821 · 214 lines changed' },
        {
          kind: 'code',
          file: 'order_service.py',
          meta: 'their diff',
          lines: [
            { n: 82, t: 'async def handle_webhook(evt):' },
            { n: 83, t: '    order = await repo.get(evt.order_id)' },
            { n: 84, t: '    # TODO: retry', hl: true },
            { n: 85, t: '    await repo.mark_paid(order)' },
          ],
        },
        { kind: 'ai', text: 'Line 84 — you left the retry as a TODO. Ran out of time, or deliberate?' },
        {
          kind: 'candidate',
          text: 'Deliberate. The consumer is idempotent, so a dropped event self-heals on the next reconciliation sync.',
        },
        { kind: 'signal', value: 'sufficient_evidence', strategy: 'deeper_tradeoff', color: '#4ADE80' },
        { kind: 'ai', text: 'That holds. What breaks if the reconciliation sync is six hours out?' },
        {
          kind: 'candidate',
          text: 'The customer stares at an unpaid order for six hours. So a dead-letter queue with a much shorter drain, and reconciliation stays as the safety net rather than the mechanism.',
        },
        { kind: 'score', competency: 'reliability', value: 4, note: 'corrected his own design' },
      ],
    },
  },

  {
    id: 'material',
    tab: 'Ask from any material',
    accent: '#A78BFA',
    status: 'soon',
    kicker: 'Mode 03',
    title: 'Drop in your material. Get an interview about your material.',
    body:
      'A job description, an architecture doc, an internal runbook, the actual on-call postmortem from last quarter. Upload it and the panel builds a grounded round on top of it — so you are screening for your stack and your problems, not a generic industry average.',
    proof: [
      'JDs, specs, docs, decks, postmortems — anything you already have',
      'Questions stay anchored to the source, with the passage on file',
      'Ideal for domain-heavy roles a generic bank will never cover',
    ],
    chat: {
      title: 'Grounded in your material',
      meta: 'infrastructure · mid · judgment',
      badge: 'Q3 / 6',
      turns: [
        { kind: 'note', text: 'context loaded · oncall-runbook.md · 1 of 3 sources' },
        {
          kind: 'cite',
          label: 'oncall-runbook.md · §4.2',
          body: 'Failover stays manual below 3 healthy nodes. Do not automate this step.',
        },
        { kind: 'ai', text: 'Your runbook says failover stays manual below three healthy nodes. Why would a team write that rule down?' },
        {
          kind: 'candidate',
          text: 'Probably because an automatic failover during a partial network failure can split-brain the cluster.',
        },
        { kind: 'signal', value: 'partial_evidence', strategy: 'evidence_seeking', color: '#FBBF24' },
        { kind: 'ai', text: 'Right idea. What would have to be true before you would trust automating it?' },
        {
          kind: 'candidate',
          text: 'A quorum witness outside both zones, and a fencing step that actually kills the old primary rather than politely asking it to stop.',
        },
        { kind: 'score', competency: 'judgment', value: 4, note: 'grounded in the source' },
      ],
    },
  },

  {
    id: 'behavioral',
    tab: 'Behavioral round',
    accent: '#FB7185',
    status: 'soon',
    kicker: 'Mode 04',
    title: 'A behavioral round that asks the second question.',
    body:
      'Everyone has a rehearsed answer to "tell me about a conflict". Almost nobody has a rehearsed answer to what came after it. The panel keeps going — what you actually did, what it cost, what you would change — and scores against a behavioral rubric instead of a gut read.',
    proof: [
      'Pushes past the rehearsed STAR script into specifics',
      'Consistent rubric across every candidate and every interviewer',
      'Ownership, conflict, judgment under pressure, collaboration',
    ],
    chat: {
      title: 'Behavioral round',
      meta: 'senior · conflict & ownership',
      badge: 'Q2 / 5',
      turns: [
        { kind: 'note', text: 'competency · ownership under disagreement' },
        { kind: 'ai', text: 'Tell me about a time you pushed back on a deadline you thought was wrong.' },
        {
          kind: 'candidate',
          text: 'We were asked to ship the reporting rewrite in three weeks. I said no, and we shipped in five with proper tests.',
        },
        { kind: 'signal', value: 'partial_evidence', strategy: 'evidence_seeking', color: '#FBBF24' },
        { kind: 'ai', text: 'How did the person on the other side of that describe it at the time?' },
        {
          kind: 'candidate',
          text: 'Honestly? They thought I was being precious about coverage. My PM said as much in standup.',
        },
        { kind: 'ai', text: 'That is a fair thing to admit. What did you do with it the next sprint?' },
        {
          kind: 'candidate',
          text: 'Started publishing what the extra week bought — two escaped bugs the quarter before, zero after. Took the argument out of opinion.',
        },
        { kind: 'score', competency: 'ownership', value: 4, note: 'cost acknowledged, behaviour changed' },
      ],
    },
  },

  {
    id: 'scenario',
    tab: 'Scenario rounds',
    accent: '#FACC15',
    status: 'live',
    kicker: 'Mode 05',
    title: 'Realistic scenario rounds, calibrated from intern to principal.',
    body:
      'Pre-vetted, role-specific situations with real artefacts attached — dashboards, logs, chat transcripts, stat grids. A junior gets a scoped, concrete incident. A principal gets the irreversible architectural call. Same engine, different altitude, deliberately calibrated.',
    proof: [
      '11 role families × 5 seniority bands, all separately calibrated',
      'Scenarios ship with the artefacts: logs, metrics, transcripts',
      'No level is graded against a higher band\'s expectations',
    ],
    chat: {
      title: 'Scenario round',
      meta: 'backend · senior · incident response',
      badge: 'Q1 / 6',
      turns: [
        { kind: 'note', text: 'scenario · sc-rel-orders-014' },
        {
          kind: 'stats',
          label: '/orders · last 30 min',
          stats: [
            { k: 'p50', v: '41 ms', tone: 'flat' },
            { k: 'p99', v: '2.4 s ▲3×', tone: 'up' },
            { k: 'error rate', v: '0.02%', tone: 'ok' },
            { k: 'last deploy', v: '13:58', tone: 'flat' },
          ],
        },
        { kind: 'ai', text: 'p99 on /orders tripled at 14:02. The deploy went out at 13:58. Where do you look first?' },
        {
          kind: 'candidate',
          text: 'The deploy diff — but I would check whether p50 moved before I assume the deploy caused it.',
        },
        { kind: 'signal', value: 'sufficient_evidence', strategy: 'deeper_tradeoff', color: '#4ADE80' },
        { kind: 'ai', text: 'p50 is flat, as you can see. What does that narrow it down to?' },
        {
          kind: 'candidate',
          text: 'Something on the tail — a slow path only some requests take. Lock contention, a cold cache on a new code path, or one unhappy shard.',
        },
        { kind: 'score', competency: 'incident reasoning', value: 4, note: 'read the artefact correctly' },
      ],
    },
  },
];
