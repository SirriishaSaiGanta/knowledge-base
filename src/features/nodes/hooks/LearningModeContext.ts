import { createContext } from 'react';
import type { LearningMode } from '../types/LearningMode';

export interface LearningModeResource {
  mode: LearningMode;
  setMode: (mode: LearningMode) => void;
}

export const LearningModeContext = createContext<LearningModeResource | undefined>(undefined);
