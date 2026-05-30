// Shared module-level state for inline text formatting across components.
// applyingFormat: set to true by the sidebar button's onMouseDown,
// checked by handleEditBlur to prevent exiting edit mode mid-format.
export const richTextState = {
  applyingFormat: false,
  savedRange: null as Range | null,
};
