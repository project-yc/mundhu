/**
 * Assessment Builder API layer.
 *
 * Wraps authAxios for all builder-related API calls.
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
 *   GET    /api/v1/library/trudev
 */

import { authAxios } from '../../../../../lib/axios';

// ─── Assessment ───────────────────────────────────────────────────────────────

/**
 * Creates the top-level AssessmentTemplate.
 * @returns {{ id: string, message: string }}
 */
export async function createAssessment({ name, description, duration_minutes, config_json }) {
  return authAxios.post('/api/v1/create/assessment', { name, description, duration_minutes, config_json });
}

/**
 * GET /api/v1/assessments/<id>/builder-state
 * Fetches full nested builder state to resume an existing draft.
 */
export async function getBuilderState(assessmentId) {
  return authAxios.get(`/api/v1/assessments/${assessmentId}/builder-state`);
}

// ─── Sections ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/assessments/<assessment_id>/sections
 */
export async function createSection(assessmentId, { name, timer_minutes }) {
  return authAxios.post(`/api/v1/assessments/${assessmentId}/sections`, {
    name,
    timer_minutes: timer_minutes ?? null,
  });
}

/**
 * PATCH /api/v1/assessments/sections/<section_id>
 */
export async function updateSection(sectionId, updates) {
  return authAxios.patch(`/api/v1/assessments/sections/${sectionId}`, updates);
}

/**
 * DELETE /api/v1/assessments/sections/<section_id>
 */
export async function deleteSection(sectionId) {
  return authAxios.delete(`/api/v1/assessments/sections/${sectionId}`);
}

// ─── Section Items ────────────────────────────────────────────────────────────

/**
 * Attach an AssessmentItem to a section.
 * POST /api/v1/recruiter/sections/<section_id>/items
 */
export async function attachItemToSection(sectionId, { assessment_item_id, library_task_id, order, points }) {
  return authAxios.post(`/api/v1/recruiter/sections/${sectionId}/items`, {
    assessment_item_id,
    library_task_id,
    order,
    points,
  });
}

/**
 * PATCH /api/v1/recruiter/sections/<section_id>/items/<item_id>
 */
export async function updateSectionItem(sectionId, itemId, updates) {
  return authAxios.patch(`/api/v1/recruiter/sections/${sectionId}/items/${itemId}`, updates);
}

/**
 * DELETE /api/v1/recruiter/sections/<section_id>/items/<item_id>
 */
export async function deleteSectionItem(sectionId, itemId) {
  return authAxios.delete(`/api/v1/recruiter/sections/${sectionId}/items/${itemId}`);
}

// ─── MCQ Questions ────────────────────────────────────────────────────────────

export async function createMcqQuestion(payload) {
  return authAxios.post('/api/v1/recruiter/mcq/questions', payload);
}

export async function updateMcqQuestion(mcqId, payload) {
  return authAxios.patch(`/api/v1/recruiter/mcq/questions/${mcqId}`, payload);
}

export async function publishMcqQuestion(mcqId) {
  return authAxios.post(`/api/v1/recruiter/mcq/questions/${mcqId}/publish`, {});
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
  return authAxios.post(`/api/v1/recruiter/mcq/questions/${mcqId}/options`, { text, is_correct, order_index });
}

export async function updateMcqOption(mcqId, optionId, updates) {
  return authAxios.patch(`/api/v1/recruiter/mcq/questions/${mcqId}/options/${optionId}`, updates);
}

export async function deleteMcqOption(mcqId, optionId) {
  return authAxios.delete(`/api/v1/recruiter/mcq/questions/${mcqId}/options/${optionId}`);
}

export async function reorderMcqOptions(mcqId, orderedOptionIds) {
  return authAxios.post(`/api/v1/recruiter/mcq/questions/${mcqId}/options/reorder`, { order: orderedOptionIds });
}

// ─── Free Text Questions ──────────────────────────────────────────────────────

export async function createFreeTextQuestion(payload) {
  return authAxios.post('/api/v1/recruiter/freetext/questions', payload);
}

export async function updateFreeTextQuestion(id, payload) {
  return authAxios.patch(`/api/v1/recruiter/freetext/questions/${id}`, payload);
}

export async function publishFreeTextQuestion(id) {
  return authAxios.post(`/api/v1/recruiter/freetext/questions/${id}/publish`, {});
}

export async function unlockFreeTextQuestion(id) {
  return authAxios.post(`/api/v1/recruiter/freetext/questions/${id}/unlock`, {});
}

// ─── Ranking Questions ────────────────────────────────────────────────────────

export async function createRankingQuestion(payload) {
  return authAxios.post('/api/v1/recruiter/ranking/questions', payload);
}

export async function updateRankingQuestion(id, payload) {
  return authAxios.patch(`/api/v1/recruiter/ranking/questions/${id}`, payload);
}

export async function publishRankingQuestion(id) {
  return authAxios.post(`/api/v1/recruiter/ranking/questions/${id}/publish`, {});
}

export async function unlockRankingQuestion(id) {
  return authAxios.post(`/api/v1/recruiter/ranking/questions/${id}/unlock`, {});
}

// ─── Library Tasks ────────────────────────────────────────────────────────────

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
  return authAxios.get(`/api/v1/library/trudev${qs ? `?${qs}` : ''}`);
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

          for (let oIdx = 0; oIdx < item.options.length; oIdx++) {
            const opt = item.options[oIdx];
            await addMcqOption(mcqId, { text: opt.text, is_correct: opt.is_correct, order_index: oIdx });
          }
        }

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

  const result = await authAxios.post(`/api/v1/assessments/${assessmentId}/publish`, {});
  return { id: assessmentId, ...result };
}
