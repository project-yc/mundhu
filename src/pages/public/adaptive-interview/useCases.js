/**
 * The five ways the adaptive panel gets used.
 *
 * `status` drives the chip on each tab: 'live' for what ships today,
 * 'soon' for what is on the near roadmap. Flip a single string when a mode
 * lands — nothing else on the page needs to change.
 *
 * `image` is the chat capture for that mode. Leave it null and ChatShot
 * renders its designed placeholder; set it to an imported asset to swap in
 * the real screenshot.
 */

export const USE_CASES = [
  {
    id: 'resume',
    tab: 'Résumé deep dive',
    accent: '#FF8528',
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
    quote: {
      q: 'You list a 40% latency drop on the checkout service. What was the change that moved the number?',
      a: 'We added Redis in front of the pricing call.',
      f: 'Got it — what was the hit rate once it was live, and what happened on the misses?',
    },
    caption: 'Résumé deep dive — chat capture',
    file: 'resume-deep-dive.png',
    image: null,
  },
  {
    id: 'technical',
    tab: 'Code-aware follow-ups',
    accent: '#38BDF8',
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
    quote: {
      q: 'You skipped the retry on the webhook handler. Deliberate, or ran out of time?',
      a: 'Deliberate — the consumer is idempotent so a dropped event self-heals on the next sync.',
      f: 'That holds. What breaks if the next sync is 6 hours out?',
    },
    caption: 'Technical follow-ups — chat capture',
    file: 'technical-followups.png',
    image: null,
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
    quote: {
      q: 'The runbook says failover is manual below 3 healthy nodes. Why would a team choose that over automating it?',
      a: 'Probably because an automatic failover under partial failure can split-brain the cluster.',
      f: 'Right. What would you need in place before you\'d trust automating it?',
    },
    caption: 'Any-material round — chat capture',
    file: 'any-material.png',
    image: null,
  },
  {
    id: 'behavioral',
    tab: 'Behavioral round',
    accent: '#4ADE80',
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
    quote: {
      q: 'You pushed back on the deadline. How did the person on the other side of that describe it afterwards?',
      a: 'Honestly, they were frustrated. They thought I was being precious about the tests.',
      f: 'Fair answer. What did you do with that frustration the next sprint?',
    },
    caption: 'Behavioral round — chat capture',
    file: 'behavioral-round.png',
    image: null,
  },
  {
    id: 'scenario',
    tab: 'Scenario rounds',
    accent: '#FBBF24',
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
    quote: {
      q: 'p99 on the orders endpoint tripled at 14:02. The deploy went out at 13:58. Where do you look first?',
      a: 'The deploy diff — but I\'d check whether p50 moved too before I assume it\'s the cause.',
      f: 'Good instinct. p50 is flat. What does that narrow it down to?',
    },
    caption: 'Scenario round — chat capture',
    file: 'scenario-round.png',
    image: null,
  },
];
