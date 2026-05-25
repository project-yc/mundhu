/**
 * API layer for the new full-screen candidate MCQ assessment flow.
 *
 * Endpoints:
 *   POST /api/v1/sessions/assessment-overview   — public overview for landing page
 *   POST /api/v1/sessions/start-mcq             — start / resume MCQ session
 *   POST /api/v1/sessions/:instanceId/timer-sync — timer heartbeat
 *   POST /api/v1/candidate/sections/:id/submit-all — batch section submit
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' }

const parseJson = async (res) => {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

const request = async (url, options = {}) => {
  const res = await fetch(url, { ...options })
  const body = await parseJson(res)
  if (!res.ok) {
    throw new Error(body.detail || body.message || `Request failed (${res.status})`)
  }
  return body?.data ?? body
}

const requestWithToken = async (url, token, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })
  const body = await parseJson(res)
  if (!res.ok) {
    throw new Error(body.detail || body.message || `Request failed (${res.status})`)
  }
  return body?.data ?? body
}

// ─── API functions ────────────────────────────────────────────────

export const getAssessmentOverview = (token) =>
  request('/api/v1/sessions/assessment-overview', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ token }),
  })

export const startMcqAssessment = (token) =>
  request('/api/v1/sessions/start-mcq', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ token }),
  })

export const syncTimer = (instanceId, instanceToken, payload) =>
  requestWithToken(`/api/v1/sessions/${instanceId}/timer-sync`, instanceToken, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  })

export const submitSectionAll = (sectionId, instanceToken, answers) =>
  requestWithToken(`/api/v1/candidate/sections/${sectionId}/submit-all`, instanceToken, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ answers }),
  })

// ─── Session storage helpers ──────────────────────────────────────

const SESSION_KEY = 'trudev_mcq_session'

export const saveMcqSession = (data) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
  return data
}

export const loadMcqSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearMcqSession = () => sessionStorage.removeItem(SESSION_KEY)

export const saveSectionAnswers = (sectionId, answers) => {
  try {
    sessionStorage.setItem(`trudev_ans_${sectionId}`, JSON.stringify(answers))
  } catch {
    /* storage full — ignore */
  }
}

export const loadSectionAnswers = (sectionId) => {
  try {
    const raw = sessionStorage.getItem(`trudev_ans_${sectionId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const clearSectionAnswers = (sectionId) => {
  sessionStorage.removeItem(`trudev_ans_${sectionId}`)
}
