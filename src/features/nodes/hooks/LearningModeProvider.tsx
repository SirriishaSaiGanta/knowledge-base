import { useState, type PropsWithChildren } from 'react';
import type { LearningMode } from '../types/LearningMode';
import { LearningModeContext } from './LearningModeContext';

export function LearningModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<LearningMode>('study');
  return <LearningModeContext.Provider value={{ mode, setMode }}>{children}</LearningModeContext.Provider>;
}
