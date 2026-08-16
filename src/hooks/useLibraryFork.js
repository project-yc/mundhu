/**
 * Fork-on-edit semantics for library questions — the single implementation.
 *
 * A SectionItem holds a plain FK to an AssessmentItem: nothing is snapshotted or
 * versioned. So editing a question in place rewrites it for every assessment
 * already using it, published ones included. The rules below exist to make that
 * impossible by accident:
 *
 *   locked          -> refuse; the backend returns 409 `item_locked` too
 *   shared (Trudev) -> always clone into My Library, edit the copy
 *   own + in use    -> default to a copy, editing everywhere is an explicit opt-in
 *   own + unused    -> edit in place
 *
 * `TaskLibraryPage` had a working version of this inline; the builder's picker
 * needs the same behaviour, and a second copy is how the two item-authoring
 * stacks in the backend drifted apart. One copy, two consumers.
 */

import { cloneToMyLibrary, updateMyLibraryItem } from '../api/recruiter/taskLibrary';

export const EDIT_INTENT = {
  BLOCKED: 'blocked',
  FORK: 'fork',
  CONFIRM_FORK: 'confirm_fork',
  EDIT: 'edit',
};

/**
 * What should happen if the user edits this item right now.
 *
 * `ownsItem` is derived from `org_id`: Trudev/platform items have none. The
 * caller may pass `isMyLibrary` when it already knows which tab it is on.
 */
export function resolveEditIntent(item, { isMyLibrary } = {}) {
  if (!item) return { kind: EDIT_INTENT.BLOCKED, reason: 'Question not found.' };

  if (item.is_locked) {
    return {
      kind: EDIT_INTENT.BLOCKED,
      reason: 'This question is locked because a published assessment uses it. Make a copy to edit it.',
    };
  }

  const ownsItem = isMyLibrary ?? Boolean(item.org_id);
  if (!ownsItem) {
    return {
      kind: EDIT_INTENT.FORK,
      reason: 'This is a shared TruDev question, so editing saves a copy to My Library. The original is left untouched.',
    };
  }

  const usageCount = item.usage_count ?? 0;
  if (usageCount > 0) {
    return {
      kind: EDIT_INTENT.CONFIRM_FORK,
      usageCount,
      reason: `This question is used by ${usageCount} assessment${usageCount === 1 ? '' : 's'}. `
        + 'Editing it changes them all.',
    };
  }

  return { kind: EDIT_INTENT.EDIT };
}

/**
 * Persist an edit, cloning first when the intent calls for it.
 *
 * `mode` is 'copy' | 'in_place'; callers that resolved to CONFIRM_FORK pass the
 * user's choice, everyone else can omit it and take the resolved default.
 *
 * Returns { id, forked, item } so the caller can re-point its selection at the
 * fork — the edited question is a different row than the one that was clicked.
 */
export async function saveLibraryEdit(item, payload, { isMyLibrary, mode } = {}) {
  const intent = resolveEditIntent(item, { isMyLibrary });

  if (intent.kind === EDIT_INTENT.BLOCKED) {
    const error = new Error(intent.reason);
    error.code = 'item_locked';
    throw error;
  }

  const shouldFork = intent.kind === EDIT_INTENT.FORK
    || (intent.kind === EDIT_INTENT.CONFIRM_FORK && mode !== 'in_place');

  let targetId = item.id;
  if (shouldFork) {
    const cloned = await cloneToMyLibrary(item.id);
    targetId = cloned?.data?.id;
    if (!targetId) throw new Error('Clone succeeded but returned no item id.');
  }

  const res = await updateMyLibraryItem(targetId, payload);
  return {
    id: targetId,
    forked: String(targetId) !== String(item.id),
    item: res?.data,
  };
}

/**
 * True when a rejected save was the backend's lock guard rather than a real
 * failure — the caller should offer "make a copy instead" rather than an error.
 */
export function isLockedError(error) {
  return error?.code === 'item_locked'
    || error?.response?.status === 409
    || error?.response?.data?.data?.code === 'item_locked';
}
