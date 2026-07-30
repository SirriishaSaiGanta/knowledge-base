import type { ID } from '@shared/types/common';

export type SectionType =
  | 'shortDescription'
  | 'detailedExplanation'
  | 'whyIntroduced'
  | 'realWorldProblem'
  | 'realWorldExample'
  | 'codeExamples'
  | 'importantPoints'
  | 'bestPractices'
  | 'commonMistakes'
  | 'interviewPoints'
  | 'interviewQuestions'
  | 'scenarioQuestions'
  | 'references'
  | 'referenceImages'
  | 'markdown';

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

/** Every markdown-bearing field below is rendered through the shared Markdown component. */

export interface WhyIntroducedContent {
  problem: string;
  limitations: string;
  solution: string;
  benefits: string;
}

export interface RealWorldProblemContent {
  problem: string;
  impact: string;
  challenge: string;
  solution: string;
}

export interface ExampleCard {
  id: ID;
  icon: string;
  title: string;
  description: string;
}

export interface RealWorldExampleContent {
  examples: ExampleCard[];
}

export interface CodeExample {
  id: ID;
  title: string;
  language: string;
  code: string;
  explanation: string;
}

export interface CodeExamplesContent {
  examples: CodeExample[];
}

/** Shared by Important Points and Interview Points — same "one line per point" rule. */
export interface BulletListContent {
  points: string[];
}

export interface Practice {
  id: ID;
  recommendation: string;
  explanation: string;
  example: string;
}

export interface BestPracticesContent {
  practices: Practice[];
}

export interface Mistake {
  id: ID;
  mistake: string;
  whyWrong: string;
  correctApproach: string;
}

export interface CommonMistakesContent {
  mistakes: Mistake[];
}

export interface InterviewQuestion {
  id: ID;
  question: string;
  answer: string;
  difficulty: Difficulty;
}

export interface InterviewQuestionsContent {
  questions: InterviewQuestion[];
}

export interface ScenarioQuestion {
  id: ID;
  question: string;
  answer: string;
  why: string;
}

export interface ScenarioQuestionsContent {
  scenarios: ScenarioQuestion[];
}

export interface ReferenceItem {
  id: ID;
  title: string;
  source: string;
  description: string;
  url: string;
}

export interface ReferencesContent {
  items: ReferenceItem[];
}

/** An uploaded reference image — `path` is the Storage object path (needed to delete it later),
 *  `url` is its permanent public URL (what's actually rendered). */
export interface SectionImage {
  id: ID;
  url: string;
  path: string;
  caption: string;
}

export interface ReferenceImagesContent {
  images: SectionImage[];
}

/**
 * A freeform, per-instance-titled section — the dynamic counterpart to the typed sections above.
 * Unlike every other section type, a node can have any number of these (one per `#` heading in a
 * Markdown import); `title` comes from that heading's exact text, `body` is its raw Markdown body,
 * stored and rendered verbatim.
 */
export interface MarkdownSectionContent {
  title: string;
  body: string;
}

/** Maps each section type to the shape its `content` field holds. */
export interface SectionContentMap {
  shortDescription: string;
  detailedExplanation: string;
  whyIntroduced: WhyIntroducedContent;
  realWorldProblem: RealWorldProblemContent;
  realWorldExample: RealWorldExampleContent;
  codeExamples: CodeExamplesContent;
  importantPoints: BulletListContent;
  bestPractices: BestPracticesContent;
  commonMistakes: CommonMistakesContent;
  interviewPoints: BulletListContent;
  interviewQuestions: InterviewQuestionsContent;
  scenarioQuestions: ScenarioQuestionsContent;
  references: ReferencesContent;
  referenceImages: ReferenceImagesContent;
  markdown: MarkdownSectionContent;
}

interface SectionBase<T extends SectionType> {
  id: ID;
  type: T;
  content: SectionContentMap[T];
  tagIds: ID[];
  /** Pins the section into Revision mode even if its type isn't normally shown there. */
  markedImportant?: boolean;
  /** Pins the section into Interview mode even if its type isn't normally shown there — the
   *  interview-mode counterpart to markedImportant, toggled instantly from the section header
   *  rather than from inside the edit form. */
  markedForInterview?: boolean;
  /** Reference screenshots/diagrams attachable to *any* section, regardless of type — distinct
   *  from the dedicated 'referenceImages' section type, which is its own standalone gallery. */
  images?: SectionImage[];
}

export type Section = { [T in SectionType]: SectionBase<T> }[SectionType];

export type SectionInput = { [T in SectionType]: Omit<SectionBase<T>, 'id'> }[SectionType];
