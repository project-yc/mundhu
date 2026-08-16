/**
 * Maps a question from CreateTaskOverlay onto the nested `type_data` the library
 * create endpoint expects (see API_CONTRACTS_TASK_LIBRARY.md §2.2).
 *
 * Shared by the standalone Task Library page and the builder's picker so a
 * question created from either surface lands in exactly the same shape.
 */
export function buildLibraryTypeData(contentType, question) {
  if (contentType === 'mcq') {
    const options = (question.options || []).map(option => ({
      text: option.text,
      is_correct: !!option.is_correct,
      points: option.is_correct ? 1 : 0,
    }));

    // Honour an explicit mode, else derive it from the answer key. This was
    // hardcoded to 'single', which silently discarded what the importer had
    // already worked out — a two-answer question was stored as single-choice
    // and rendered an unanswerable control for the candidate.
    const correctCount = options.filter(option => option.is_correct).length;
    const selectionMode = question.selection_mode
      || (correctCount > 1 ? 'multi' : 'single');

    return {
      prompt: question.question || '',
      selection_mode: selectionMode,
      options,
    };
  }

  if (contentType === 'ranking') {
    return {
      prompt: question.question || '',
      scoring_mode: 'weighted_partial',
      // Overlay items are plain strings, already in correct order.
      items: (question.items || []).map(text => ({
        text: typeof text === 'string' ? text : text?.text || '',
      })),
    };
  }

  // free_text. `sample_answer` is the model answer and `grading_hints` is advice
  // to the grader — `free_text_ai_scoring` puts them in separate blocks. These
  // used to be collapsed into one "Model answer / guideline" field that was sent
  // as `grading_hints`, so the model answer never existed as such and the
  // builder's own Answer field was dropped entirely on the way to the API.
  return {
    prompt: question.question || '',
    ...(question.sample_answer ? { sample_answer: question.sample_answer } : {}),
    ...(question.grading_hints ? { grading_hints: question.grading_hints } : {}),
    ...(question.word_limit ? { word_limit: Number(question.word_limit) } : {}),
  };
}
