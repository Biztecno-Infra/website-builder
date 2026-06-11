let _idCounter = 0;
export const newId = () => `el_${Date.now()}_${_idCounter++}`;
export const newSectionId = () => `sec_${Date.now()}_${_idCounter++}`;
export const newPageId = () => `page_${Date.now()}_${_idCounter++}`;
export const newGridCellId = () => `gc_${Date.now()}_${_idCounter++}`;
export const newColumnsId  = () => `cb_${Date.now()}_${_idCounter++}`;
