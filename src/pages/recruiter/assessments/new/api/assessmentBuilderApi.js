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

// ─── Library Items ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/library/my
 *
 * Used for adaptive interviews, which have no dedicated create endpoint the way
 * MCQ / free text / ranking do — the item is a bare AssessmentItem and all of
 * its configuration lives on the SectionItem.
 */
export async function createLibraryItem({ content_type, title, domain, seniority, language }) {
  return authAxios.post('/api/v1/library/my', {
    content_type,
    title,
    ...(domain ? { domain } : {}),
    ...(seniority ? { seniority } : {}),
    ...(language ? { language } : {}),
  });
}

/**
 * GET /api/v1/recruiter/adaptive/focus-areas
 *
 * The focus areas the engine's rubric catalog can actually ask AND score for
 * this role/level. Anything outside this list is discarded by the engine without
 * an error, so offering it would mean accepting a choice the interview ignores.
 * `catalog_available: false` means the engine was unreachable and the full list
 * was returned as a fallback.
 */
export async function getAdaptiveFocusAreas({ role_family, seniority }) {
  return authAxios.get('/api/v1/recruiter/adaptive/focus-areas', {
    params: { role_family, seniority },
  });
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
export async function publishAssessmentFlow(state, onSectionCreated) {
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
      // Persist the id back into builder state immediately. Without this, a
      // failure later in the loop left `backendId` null, so retrying Publish
      // created a SECOND section; the orphan then had zero items and the
      // publish check ("every section must have at least one question")
      // rejected the assessment permanently, with no way to delete it here.
      onSectionCreated?.(section.id, sectionId);
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
        if (String(item.task_id).startsWith('fallback-')) {
          // FALLBACK_CODING_TASKS are placeholders shown when the library API is
          // down. Their ids are not real UUIDs and blow up mid-publish, after
          // earlier sections have already been created server-side.
          throw new Error(
            `Coding section "${section.name}" is using a placeholder task. `
            + 'Reopen the section and pick a task from the library.',
          );
        }
        const attachedCoding = await attachItemToSection(sectionId, {
          library_task_id: item.task_id,
          order: qIdx,
          points: item.points,
        });
        // Section-scoped runtime config lands on the SectionItem, mirroring the
        // adaptive path below. Both are omitted when unset so the task/assessment
        // defaults still apply.
        const codingConfig = {};
        if (item.ai_level) codingConfig.ai_level = item.ai_level;
        if (item.rubric_weights) codingConfig.rubric_weights = item.rubric_weights;
        if (Object.keys(codingConfig).length > 0) {
          await updateSectionItem(sectionId, attachedCoding.data.id, codingConfig);
        }
      } else if (item.type === 'adaptive') {
        // Three calls, because the interview config is section-scoped: the
        // library item carries only role/seniority metadata, and the config
        // lands on the SectionItem created by the attach.
        const config = item.adaptive_config || {};
        const created = await createLibraryItem({
          content_type: 'adaptive_interview',
          title: section.name || 'AI Adaptive Interview',
          domain: state.config_json?.domain || state.domain || '',
          seniority: state.config_json?.seniority || state.seniority || '',
        });
        const assessmentItemId = created.data.id;

        const attached = await attachItemToSection(sectionId, {
          assessment_item_id: assessmentItemId,
          order: qIdx,
          points: item.points,
        });

        await updateSectionItem(sectionId, attached.data.id, {
          adaptive_interview_config: config,
        });
      } else {
        // Previously an unknown type fell through silently, publishing an empty
        // section with no error anywhere.
        throw new Error(
          `Section "${section.name}" contains an unsupported item type: ${item.type}`,
        );
      }
    }
  }

  const result = await authAxios.post(`/api/v1/assessments/${assessmentId}/publish`, {});
  return { id: assessmentId, ...result };
}
