import type { LearningMode } from '../types/LearningMode';
import type { Section, SectionContentMap, SectionType } from '../types/Section';

interface SectionDefinition<T extends SectionType = SectionType> {
  type: T;
  label: string;
  /** Modes that show this section type by default. */
  modes: LearningMode[];
  emptyContent: () => SectionContentMap[T];
  isEmpty: (content: SectionContentMap[T]) => boolean;
}

type AnySectionDefinition = { [T in SectionType]: SectionDefinition<T> }[SectionType];

const isBlank = (value: string) => !value.trim();

/**
 * Single source of truth for which sections exist, where they appear, what
 * an empty instance looks like, and how to detect "nothing filled in yet".
 * Adding a new section type is one entry here — no component needs to know
 * about it structurally.
 */
export const SECTION_REGISTRY: AnySectionDefinition[] = [
  {
    type: 'shortDescription',
    label: 'Short Description',
    modes: ['study', 'revision', 'interview'],
    emptyContent: () => '',
    isEmpty: isBlank,
  },
  {
    type: 'detailedExplanation',
    label: 'Detailed Explanation',
    modes: ['study'],
    emptyContent: () => '',
    isEmpty: isBlank,
  },
  {
    type: 'whyIntroduced',
    label: 'Why Introduced',
    modes: ['study'],
    emptyContent: () => ({ problem: '', limitations: '', solution: '', benefits: '' }),
    isEmpty: (c) => isBlank(c.problem) && isBlank(c.limitations) && isBlank(c.solution) && isBlank(c.benefits),
  },
  {
    type: 'realWorldProblem',
    label: 'Real-world Problem',
    modes: ['study'],
    emptyContent: () => ({ problem: '', impact: '', challenge: '', solution: '' }),
    isEmpty: (c) => isBlank(c.problem) && isBlank(c.impact) && isBlank(c.challenge) && isBlank(c.solution),
  },
  {
    type: 'realWorldExample',
    label: 'Real-world Example',
    modes: ['study', 'interview'],
    emptyContent: () => ({ examples: [] }),
    isEmpty: (c) => c.examples.length === 0,
  },
  {
    type: 'codeExamples',
    label: 'Code Examples',
    modes: ['study'],
    emptyContent: () => ({ examples: [] }),
    isEmpty: (c) => c.examples.length === 0,
  },
  {
    type: 'importantPoints',
    label: 'Important Points',
    modes: ['study', 'revision'],
    emptyContent: () => ({ points: [] }),
    isEmpty: (c) => c.points.every(isBlank),
  },
  {
    type: 'bestPractices',
    label: 'Best Practices',
    modes: ['study', 'revision'],
    emptyContent: () => ({ practices: [] }),
    isEmpty: (c) => c.practices.length === 0,
  },
  {
    type: 'commonMistakes',
    label: 'Common Mistakes',
    modes: ['study', 'revision'],
    emptyContent: () => ({ mistakes: [] }),
    isEmpty: (c) => c.mistakes.length === 0,
  },
  {
    type: 'interviewPoints',
    label: 'Interview Points',
    modes: ['study', 'revision', 'interview'],
    emptyContent: () => ({ points: [] }),
    isEmpty: (c) => c.points.every(isBlank),
  },
  {
    type: 'interviewQuestions',
    label: 'Interview Questions',
    modes: ['study', 'revision', 'interview'],
    emptyContent: () => ({ questions: [] }),
    isEmpty: (c) => c.questions.length === 0,
  },
  {
    type: 'scenarioQuestions',
    label: 'Scenario-based Questions',
    modes: ['study', 'interview'],
    emptyContent: () => ({ scenarios: [] }),
    isEmpty: (c) => c.scenarios.length === 0,
  },
  {
    type: 'references',
    label: 'References / Links',
    modes: ['study'],
    emptyContent: () => ({ items: [] }),
    isEmpty: (c) => c.items.length === 0,
  },
];

export const SECTION_LABELS: Record<SectionType, string> = Object.fromEntries(
  SECTION_REGISTRY.map((definition) => [definition.type, definition.label]),
) as Record<SectionType, string>;

/** Typed lookup — safe because SECTION_REGISTRY is exhaustive over SectionType by construction. */
export function getSectionDefinition<T extends SectionType>(type: T): SectionDefinition<T> {
  return SECTION_REGISTRY.find((definition) => definition.type === type) as unknown as SectionDefinition<T>;
}

export function isSectionEmpty(section: Section): boolean {
  const definition = getSectionDefinition(section.type);
  return definition.isEmpty(section.content as never);
}

export function isSectionVisible(section: Section, mode: LearningMode, revealedIds: Set<string>): boolean {
  const definition = getSectionDefinition(section.type);
  return (
    definition.modes.includes(mode) ||
    (mode === 'revision' && Boolean(section.markedImportant)) ||
    revealedIds.has(section.id)
  );
}
