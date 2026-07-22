import { useLearningMode } from '../hooks/useLearningMode';
import type { LearningMode } from '../types/LearningMode';

const MODES: { value: LearningMode; label: string; icon: string }[] = [
  { value: 'study', label: 'Study', icon: '📖' },
  { value: 'revision', label: 'Revision', icon: '🔄' },
  { value: 'interview', label: 'Interview', icon: '🎯' },
];

export function LearningModeSwitcher() {
  const { mode, setMode } = useLearningMode();

  return (
    <div className="mode-switcher" role="tablist" aria-label="Learning mode">
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          title={item.label}
          aria-selected={mode === item.value}
          className={mode === item.value ? 'mode-tab active' : 'mode-tab'}
          onClick={() => setMode(item.value)}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span className="mode-tab-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
