import { createContext, useContext, useReducer } from 'react';
import { assessmentBuilderReducer, initialState, ACTIONS } from './assessmentBuilderReducer';

const AssessmentBuilderContext = createContext(null);

export function AssessmentBuilderProvider({ children }) {
  const [state, dispatch] = useReducer(assessmentBuilderReducer, initialState);
  return (
    <AssessmentBuilderContext.Provider value={{ state, dispatch, ACTIONS }}>
      {children}
    </AssessmentBuilderContext.Provider>
  );
}

export function useAssessmentBuilder() {
  const ctx = useContext(AssessmentBuilderContext);
  if (!ctx) throw new Error('useAssessmentBuilder must be used within AssessmentBuilderProvider');
  return ctx;
}
