/**
 * Assessment Builder API layer.
 *
 * Wraps authFetch for all builder-related API calls.
 *
 * Endpoints:
 *   POST   /api/v1/create/assessment
 *   GET    /api/v1/assessments/<id>/builder-state
 *   POST   /api/v1/assessments/<id>/sections
 *   PATCH  /api/v1/assessments/sections/<section_id>
 *   DELETE /api/v1/assessments/sections/<section_id>
 *   POST   /api/v1/assessments/<id>/publish
 *   POST   /api/v1/recruiter/mcq/questions
 *   PATCH  /api/v1/recruiter/mcq/questions/<id>
 *   POST   /api/v1/recruiter/mcq/questions/<id>/publish
 *   POST   /api/v1/recruiter/mcq/questions/<id>/options
 *   PATCH  /api/v1/recruiter/mcq/questions/<id>/options/<option_id>
 *   DELETE /api/v1/recruiter/mcq/questions/<id>/options/<option_id>
 *   POST   /api/v1/recruiter/mcq/questions/<id>/options/reorder
 *   POST   /api/v1/recruiter/sections/<section_id>/items
 *   PATCH  /api/v1/recruiter/sections/<section_id>/items/<item_id>
 *   DELETE /api/v1/recruiter/sections/<section_id>/items/<item_id>
 *   GET    /api/v1/recruiter/library/tasks
 */

import { authFetch } from '../../../../../utils/authFetch';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Assessment ───────────────────────────────────────────────────────────────

/**
 * Creates the top-level AssessmentTemplate.
 * @returns {{ id: string, message: string }}
 */
export async function createAssessment({ name, description, duration_minutes, config_json }) {
  const res = await authFetch('/api/v1/create/assessment', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ name, description, duration_minutes, config_json }),
  });
  return handleResponse(res);
}

/**
 * GET /api/v1/assessments/<id>/builder-state
 * Fetches full nested builder state to resume an existing draft.
 */
export async function getBuilderState(assessmentId) {
  const res = await authFetch(`/api/v1/assessments/${assessmentId}/builder-state`);
  return handleResponse(res);
}

// ─── Sections ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/assessments/<assessment_id>/sections
 */
export async function createSection(assessmentId, { name, timer_minutes }) {
  const res = await authFetch(`/api/v1/assessments/${assessmentId}/sections`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ name, timer_minutes: timer_minutes ?? null }),
  });
  return handleResponse(res);
}

/**
 * PATCH /api/v1/assessments/sections/<section_id>
 */
export async function updateSection(sectionId, updates) {
  const res = await authFetch(`/api/v1/assessments/sections/${sectionId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

/**
 * DELETE /api/v1/assessments/sections/<section_id>
 */
export async function deleteSection(sectionId) {
  const res = await authFetch(`/api/v1/assessments/sections/${sectionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || `HTTP ${res.status}`);
  }
}

// ─── Section Items ────────────────────────────────────────────────────────────

/**
 * Attach an AssessmentItem to a section.
 * POST /api/v1/recruiter/sections/<section_id>/items
 */
export async function attachItemToSection(sectionId, { assessment_item_id, library_task_id, order, points }) {
  const res = await authFetch(`/api/v1/recruiter/sections/${sectionId}/items`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ assessment_item_id, library_task_id, order, points }),
  });
  return handleResponse(res);
}

/**
 * PATCH /api/v1/recruiter/sections/<section_id>/items/<item_id>
 */
export async function updateSectionItem(sectionId, itemId, updates) {
  const res = await authFetch(`/api/v1/recruiter/sections/${sectionId}/items/${itemId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

/**
 * DELETE /api/v1/recruiter/sections/<section_id>/items/<item_id>
 */
export async function deleteSectionItem(sectionId, itemId) {
  const res = await authFetch(`/api/v1/recruiter/sections/${sectionId}/items/${itemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || `HTTP ${res.status}`);
  }
}

// ─── MCQ Questions ────────────────────────────────────────────────────────────

/**
 * Create MCQ question + AssessmentItem.
 * POST /api/v1/recruiter/mcq/questions
 */
export async function createMcqQuestion(payload) {
  // payload: { title, prompt, selection_mode, shuffle_options, show_explanation_after, options?, ... }
  const res = await authFetch('/api/v1/recruiter/mcq/questions', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * PATCH /api/v1/recruiter/mcq/questions/<id>
 */
export async function updateMcqQuestion(mcqId, payload) {
  const res = await authFetch(`/api/v1/recruiter/mcq/questions/${mcqId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * POST /api/v1/recruiter/mcq/questions/<id>/publish
 */
export async function publishMcqQuestion(mcqId) {
  const res = await authFetch(`/api/v1/recruiter/mcq/questions/${mcqId}/publish`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  });
  return handleResponse(res);
}

/**
 * MISSING_ENDPOINT: POST /api/v1/recruiter/mcq/questions/<id>/unlock
 * Sets is_published=False, is_locked=False on the AssessmentItem.
 */
export async function unlockMcqQuestion(mcqId) {
  throw new Error(
    `MISSING_ENDPOINT: POST /api/v1/recruiter/mcq/questions/${mcqId}/unlock — ` +
    'Add an unlock view that sets is_published=False, is_locked=False.'
  );
}

// ─── MCQ Options ──────────────────────────────────────────────────────────────

export async function addMcqOption(mcqId, { text, is_correct, order_index }) {
  const res = await authFetch(`/api/v1/recruiter/mcq/questions/${mcqId}/options`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ text, is_correct, order_index }),
  });
  return handleResponse(res);
}

export async function updateMcqOption(mcqId, optionId, updates) {
  const res = await authFetch(`/api/v1/recruiter/mcq/questions/${mcqId}/options/${optionId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

export async function deleteMcqOption(mcqId, optionId) {
  const res = await authFetch(`/api/v1/recruiter/mcq/questions/${mcqId}/options/${optionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || `HTTP ${res.status}`);
  }
}

export async function reorderMcqOptions(mcqId, orderedOptionIds) {
  const res = await authFetch(`/api/v1/recruiter/mcq/questions/${mcqId}/options/reorder`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ order: orderedOptionIds }),
  });
  return handleResponse(res);
}

// ─── Free Text Questions ──────────────────────────────────────────────────────

export async function createFreeTextQuestion(payload) {
  const res = await authFetch('/api/v1/recruiter/freetext/questions', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateFreeTextQuestion(id, payload) {
  const res = await authFetch(`/api/v1/recruiter/freetext/questions/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function publishFreeTextQuestion(id) {
  const res = await authFetch(`/api/v1/recruiter/freetext/questions/${id}/publish`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  });
  return handleResponse(res);
}

export async function unlockFreeTextQuestion(id) {
  const res = await authFetch(`/api/v1/recruiter/freetext/questions/${id}/unlock`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  });
  return handleResponse(res);
}

// ─── Ranking Questions ────────────────────────────────────────────────────────

export async function createRankingQuestion(payload) {
  const res = await authFetch('/api/v1/recruiter/ranking/questions', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateRankingQuestion(id, payload) {
  const res = await authFetch(`/api/v1/recruiter/ranking/questions/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function publishRankingQuestion(id) {
  const res = await authFetch(`/api/v1/recruiter/ranking/questions/${id}/publish`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  });
  return handleResponse(res);
}

export async function unlockRankingQuestion(id) {
  const res = await authFetch(`/api/v1/recruiter/ranking/questions/${id}/unlock`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  });
  return handleResponse(res);
}

// ─── Library Tasks ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/recruiter/library/tasks
 */
export async function getLibraryTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.seniority) params.set('seniority', filters.seniority);
  if (filters.domain) params.set('domain', filters.domain);
  if (filters.language) params.set('language', filters.language);
  if (filters.search) params.set('search', filters.search);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.assessment_id) params.set('assessment_id', filters.assessment_id);
  const qs = params.toString();
  const res = await authFetch(`/api/v1/recruiter/library/tasks${qs ? `?${qs}` : ''}`);
  return handleResponse(res);
}

// ─── Full publish flow ────────────────────────────────────────────────────────

/**
 * Orchestrates the full publish flow.
 *
 * Assessment is already created in Step 1 — state.backendId is reused.
 * For each section: create section → for each item: create+publish+attach.
 * Finally: POST publish to lock the assessment.
 *
 * Returns { id: assessmentId } on success.
 */
export async function publishAssessmentFlow(state) {
  const assessmentId = state.backendId;
  if (!assessmentId) {
    throw new Error('No assessment ID found. Complete Step 1 first.');
  }

  const { sections } = state;

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];

    // Use backendId if already persisted during builder, otherwise create now
    let sectionId = section.backendId;
    if (!sectionId) {
      const sectionResult = await createSection(assessmentId, {
        name: section.name,
        timer_minutes: section.timer_minutes ?? null,
      });
      sectionId = sectionResult.data.id;
    }

    for (let qIdx = 0; qIdx < section.items.length; qIdx++) {
      const item = section.items[qIdx];

      if (item.type === 'mcq') {
        // Use backendMcqId if already persisted
        let mcqId = item.backendMcqId;
        let itemId = item.backendItemId;

        if (!mcqId) {
          const mcqResult = await createMcqQuestion({
            title: item.prompt?.slice(0, 60) || `MCQ ${qIdx + 1}`,
            prompt: item.prompt,
            selection_mode: item.selection_mode,
            shuffle_options: item.shuffle_options,
            show_explanation_after: item.show_explanation_after,
          });
          mcqId = mcqResult.data.id;
          itemId = mcqResult.data.assessment_item_id;

          // Add options
          for (let oIdx = 0; oIdx < item.options.length; oIdx++) {
            const opt = item.options[oIdx];
            await addMcqOption(mcqId, { text: opt.text, is_correct: opt.is_correct, order_index: oIdx });
          }
        }

        // NOTE: Do NOT call publishMcqQuestion here.
        // AssessmentPublishView bulk-publishes all linked items at the end of the flow.
        // Calling publishMcqQuestion individually would fail if the question has <2 options
        // or no correct answer marked, blocking the entire publish flow unnecessarily.

        await attachItemToSection(sectionId, {
          assessment_item_id: itemId,
          order: qIdx,
          points: item.points,
        });

      } else if (item.type === 'free_text') {
        const result = await createFreeTextQuestion({ prompt: item.prompt, word_limit: item.word_limit, grading_hints: item.grading_hints });
        if (!item.published) await publishFreeTextQuestion(result.data.id);
        await attachItemToSection(sectionId, { assessment_item_id: result.data.assessment_item_id, order: qIdx, points: item.points });

      } else if (item.type === 'ranking') {
        const result = await createRankingQuestion({ prompt: item.prompt, items: item.items });
        if (!item.published) await publishRankingQuestion(result.data.id);
        await attachItemToSection(sectionId, { assessment_item_id: result.data.assessment_item_id, order: qIdx, points: item.points });
      } else if (item.type === 'coding') {
        if (!item.task_id) {
          throw new Error(`Coding section "${section.name}" is missing a selected library task.`);
        }
        await attachItemToSection(sectionId, {
          library_task_id: item.task_id,
          order: qIdx,
          points: item.points,
        });
      }
    }
  }

  // Lock the assessment
  const res = await authFetch(`/api/v1/assessments/${assessmentId}/publish`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  });
  const result = await handleResponse(res);
  return { id: assessmentId, ...result };
}
