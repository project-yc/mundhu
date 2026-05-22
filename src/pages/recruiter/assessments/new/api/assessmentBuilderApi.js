/**
 * Assessment Builder API layer.
 *
 * Wraps authFetch for all builder-related API calls.
 * Calls marked MISSING_ENDPOINT throw immediately — add the backend route
 * before enabling that feature end-to-end.
 *
 * Existing endpoints (venaka/core/assessments/urls.py):
 *   POST   /api/v1/create/assessment
 *   POST   /api/v1/recruiter/mcq/questions
 *   PATCH  /api/v1/recruiter/mcq/questions/<id>
 *   POST   /api/v1/recruiter/mcq/questions/<id>/publish
 *   POST   /api/v1/recruiter/mcq/questions/<id>/options
 *   PATCH  /api/v1/recruiter/mcq/questions/<id>/options/<option_id>
 *   DELETE /api/v1/recruiter/mcq/questions/<id>/options/<option_id>
 *   POST   /api/v1/recruiter/mcq/questions/<id>/options/reorder
 *   POST   /api/v1/recruiter/sections/<section_id>/items
 *   GET    /api/v1/recruiter/library/tasks
 *
 * MISSING endpoints (need backend implementation):
 *   POST   /api/v1/assessments/<assessment_id>/sections
 *   PATCH  /api/v1/assessments/sections/<section_id>
 *   DELETE /api/v1/assessments/sections/<section_id>
 *   POST   /api/v1/recruiter/mcq/questions/<id>/unlock
 *   POST   /api/v1/recruiter/freetext/questions  (+ full CRUD)
 *   POST   /api/v1/recruiter/ranking/questions  (+ full CRUD)
 *   PATCH  /api/v1/recruiter/sections/<section_id>/items/<item_id>
 *   DELETE /api/v1/recruiter/sections/<section_id>/items/<item_id>
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

// ─── Sections ─────────────────────────────────────────────────────────────────
// MISSING_ENDPOINT: POST /api/v1/assessments/<assessment_id>/sections
// The Section model needs `name` and `section_type` fields added before this works.

export async function createSection(assessmentId, { name, section_type, order, timer_config_json }) {
  throw new Error(
    `MISSING_ENDPOINT: POST /api/v1/assessments/${assessmentId}/sections — ` +
    'Add this view to the backend. Section model also needs `name` and `section_type` fields.'
  );
}

// MISSING_ENDPOINT: PATCH /api/v1/assessments/sections/<section_id>
export async function updateSection(sectionId, updates) {
  throw new Error(
    `MISSING_ENDPOINT: PATCH /api/v1/assessments/sections/${sectionId}`
  );
}

// MISSING_ENDPOINT: DELETE /api/v1/assessments/sections/<section_id>
export async function deleteSection(sectionId) {
  throw new Error(
    `MISSING_ENDPOINT: DELETE /api/v1/assessments/sections/${sectionId}`
  );
}

// ─── Section Items ────────────────────────────────────────────────────────────

/**
 * Attach an AssessmentItem to a section.
 * POST /api/v1/recruiter/sections/<section_id>/items
 */
export async function attachItemToSection(sectionId, { assessment_item_id, order, points }) {
  const res = await authFetch(`/api/v1/recruiter/sections/${sectionId}/items`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ assessment_item_id, order, points }),
  });
  return handleResponse(res);
}

// MISSING_ENDPOINT: PATCH /api/v1/recruiter/sections/<section_id>/items/<item_id>
export async function updateSectionItem(sectionId, itemId, updates) {
  throw new Error(
    `MISSING_ENDPOINT: PATCH /api/v1/recruiter/sections/${sectionId}/items/${itemId}`
  );
}

// MISSING_ENDPOINT: DELETE /api/v1/recruiter/sections/<section_id>/items/<item_id>
export async function deleteSectionItem(sectionId, itemId) {
  throw new Error(
    `MISSING_ENDPOINT: DELETE /api/v1/recruiter/sections/${sectionId}/items/${itemId}`
  );
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
// MISSING_ENDPOINT — all free text endpoints need to be added to the backend.
// Backend also needs: AssessmentItemContentType.FREE_TEXT = "free_text",
// a FreeTextQuestion model, serializers, views, and URL routes.

export async function createFreeTextQuestion(payload) {
  throw new Error(
    'MISSING_ENDPOINT: POST /api/v1/recruiter/freetext/questions — ' +
    'Add FreeTextQuestion model + serializer + view + URL.'
  );
}

export async function updateFreeTextQuestion(id, payload) {
  throw new Error(
    `MISSING_ENDPOINT: PATCH /api/v1/recruiter/freetext/questions/${id}`
  );
}

export async function publishFreeTextQuestion(id) {
  throw new Error(
    `MISSING_ENDPOINT: POST /api/v1/recruiter/freetext/questions/${id}/publish`
  );
}

export async function unlockFreeTextQuestion(id) {
  throw new Error(
    `MISSING_ENDPOINT: POST /api/v1/recruiter/freetext/questions/${id}/unlock`
  );
}

// ─── Ranking Questions ────────────────────────────────────────────────────────
// MISSING_ENDPOINT — all ranking endpoints need to be added to the backend.
// Backend also needs: AssessmentItemContentType.RANKING = "ranking",
// RankingQuestion + RankingItem models, serializers, views, and URL routes.

export async function createRankingQuestion(payload) {
  throw new Error(
    'MISSING_ENDPOINT: POST /api/v1/recruiter/ranking/questions — ' +
    'Add RankingQuestion + RankingItem models + serializer + view + URL.'
  );
}

export async function updateRankingQuestion(id, payload) {
  throw new Error(
    `MISSING_ENDPOINT: PATCH /api/v1/recruiter/ranking/questions/${id}`
  );
}

export async function publishRankingQuestion(id) {
  throw new Error(
    `MISSING_ENDPOINT: POST /api/v1/recruiter/ranking/questions/${id}/publish`
  );
}

export async function unlockRankingQuestion(id) {
  throw new Error(
    `MISSING_ENDPOINT: POST /api/v1/recruiter/ranking/questions/${id}/unlock`
  );
}

// ─── Library Tasks ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/recruiter/library/tasks
 */
export async function getLibraryTasks() {
  const res = await authFetch('/api/v1/recruiter/library/tasks');
  return handleResponse(res);
}

// ─── Full publish flow ────────────────────────────────────────────────────────

/**
 * Orchestrates the full publish flow:
 * 1. Create assessment
 * 2. Create each section  (MISSING — will throw)
 * 3. For each MCQ question: create → publish → attach to section
 *
 * Returns assessmentId on success.
 */
export async function publishAssessmentFlow(state) {
  const { name, description, duration_minutes, ai_level, sections } = state;

  // 1. Create assessment
  const assessmentResult = await createAssessment({
    name,
    description,
    duration_minutes,
    config_json: { ai_level },
  });
  const assessmentId = assessmentResult.id;

  // 2 & 3. Sections and items (section creation is a missing endpoint)
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];

    // MISSING — will throw here until backend section creation endpoint is added
    const sectionResult = await createSection(assessmentId, {
      name: section.name,
      section_type: section.type,
      order: sIdx,
      timer_config_json: {
        duration_minutes: section.timer_minutes,
        ai_level: section.ai_level_override,
      },
    });
    const sectionId = sectionResult.id;

    for (let qIdx = 0; qIdx < section.items.length; qIdx++) {
      const item = section.items[qIdx];

      if (item.type === 'mcq') {
        const mcqResult = await createMcqQuestion({
          title: item.prompt?.slice(0, 60) || `MCQ ${qIdx + 1}`,
          prompt: item.prompt,
          selection_mode: item.selection_mode,
          shuffle_options: item.shuffle_options,
          show_explanation_after: item.show_explanation_after,
        });
        const mcqId = mcqResult.data.id;
        const itemId = mcqResult.data.assessment_item_id;

        // Add options
        for (let oIdx = 0; oIdx < item.options.length; oIdx++) {
          const opt = item.options[oIdx];
          await addMcqOption(mcqId, { text: opt.text, is_correct: opt.is_correct, order_index: oIdx });
        }

        if (item.published) {
          await publishMcqQuestion(mcqId);
        }

        await attachItemToSection(sectionId, {
          assessment_item_id: itemId,
          order: qIdx,
          points: item.points,
        });

      } else if (item.type === 'free_text') {
        // MISSING — will throw
        const result = await createFreeTextQuestion({ prompt: item.prompt, word_limit: item.word_limit, grading_hints: item.grading_hints });
        if (item.published) await publishFreeTextQuestion(result.data.id);
        await attachItemToSection(sectionId, { assessment_item_id: result.data.assessment_item_id, order: qIdx, points: item.points });

      } else if (item.type === 'ranking') {
        // MISSING — will throw
        const result = await createRankingQuestion({ prompt: item.prompt, items: item.items });
        if (item.published) await publishRankingQuestion(result.data.id);
        await attachItemToSection(sectionId, { assessment_item_id: result.data.assessment_item_id, order: qIdx, points: item.points });
      }
      // coding items are library tasks already attached via library task endpoints
    }
  }

  return assessmentId;
}
