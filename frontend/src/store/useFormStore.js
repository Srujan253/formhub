import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useFormStore = create(
  immer((set) => ({
    currentForm: {
      title: '',
      description: '',
      headerImage: '',
      sections: []
    },
    isDirty: false,
    isSaving: false,

    // Initial Load or Overwrite
    setForm: (formParams) => set((state) => {
      state.currentForm = formParams;
      state.isDirty = false;
    }),

    // Set saving indicator
    setSaving: (savingStatus) => set((state) => {
      state.isSaving = savingStatus;
    }),

    // Mark as clean after server persistence
    markClean: () => set((state) => {
      state.isDirty = false;
    }),

    // Section Actions
    addSection: (section) => set((state) => {
      state.currentForm.sections.push(section);
      state.isDirty = true;
    }),
    
    updateSection: (sectionIndex, updates) => set((state) => {
      state.currentForm.sections[sectionIndex] = {
        ...state.currentForm.sections[sectionIndex],
        ...updates
      };
      state.isDirty = true;
    }),

    removeSection: (sectionIndex) => set((state) => {
      state.currentForm.sections.splice(sectionIndex, 1);
      state.isDirty = true;
    }),

    // Item/Question Actions
    addQuestion: (sectionIndex, question) => set((state) => {
      state.currentForm.sections[sectionIndex].items.push(question);
      state.isDirty = true;
    }),

    updateQuestion: (sectionIndex, questionIndex, data) => set((state) => {
      state.currentForm.sections[sectionIndex].items[questionIndex] = {
        ...state.currentForm.sections[sectionIndex].items[questionIndex],
        ...data
      };
      state.isDirty = true;
    }),

    removeQuestion: (sectionIndex, questionIndex) => set((state) => {
      state.currentForm.sections[sectionIndex].items.splice(questionIndex, 1);
      state.isDirty = true;
    }),

    moveQuestion: (sourceSIndex, destSIndex, sourceIIndex, destIIndex) => set((state) => {
      const [movedItem] = state.currentForm.sections[sourceSIndex].items.splice(sourceIIndex, 1);
      state.currentForm.sections[destSIndex].items.splice(destIIndex, 0, movedItem);
      state.isDirty = true;
    })
  }))
);