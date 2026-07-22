import { useContext } from 'react';
import { LearningModeContext, type LearningModeResource } from './LearningModeContext';

export function useLearningMode(): LearningModeResource {
  const context = useContext(LearningModeContext);
  if (!context) throw new Error('useLearningMode must be used within a LearningModeProvider');
  return context;
}
