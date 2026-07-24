import type { ComponentType } from 'react';
import type { Section, SectionType } from '../../types/Section';
import { ShortDescriptionView } from './ShortDescriptionView';
import { ShortDescriptionEdit } from './ShortDescriptionEdit';
import { DetailedExplanationView } from './DetailedExplanationView';
import { DetailedExplanationEdit } from './DetailedExplanationEdit';
import { WhyIntroducedView } from './WhyIntroducedView';
import { WhyIntroducedEdit } from './WhyIntroducedEdit';
import { RealWorldProblemView } from './RealWorldProblemView';
import { RealWorldProblemEdit } from './RealWorldProblemEdit';
import { RealWorldExampleView } from './RealWorldExampleView';
import { RealWorldExampleEdit } from './RealWorldExampleEdit';
import { CodeExamplesView } from './CodeExamplesView';
import { CodeExamplesEdit } from './CodeExamplesEdit';
import { ImportantPointsView } from './ImportantPointsView';
import { ImportantPointsEdit } from './ImportantPointsEdit';
import { BestPracticesView } from './BestPracticesView';
import { BestPracticesEdit } from './BestPracticesEdit';
import { CommonMistakesView } from './CommonMistakesView';
import { CommonMistakesEdit } from './CommonMistakesEdit';
import { InterviewPointsView } from './InterviewPointsView';
import { InterviewPointsEdit } from './InterviewPointsEdit';
import { InterviewQuestionsView } from './InterviewQuestionsView';
import { InterviewQuestionsEdit } from './InterviewQuestionsEdit';
import { ScenarioQuestionsView } from './ScenarioQuestionsView';
import { ScenarioQuestionsEdit } from './ScenarioQuestionsEdit';
import { ReferencesView } from './ReferencesView';
import { ReferencesEdit } from './ReferencesEdit';
import { MarkdownSectionView } from './MarkdownSectionView';
import { MarkdownSectionEdit } from './MarkdownSectionEdit';

type ErasedViewProps = { content: unknown; theme: 'light' | 'dark' };
type ErasedEditProps = { content: unknown; onChange: (content: unknown) => void };

const VIEWERS: Record<SectionType, ComponentType<ErasedViewProps>> = {
  shortDescription: ShortDescriptionView,
  detailedExplanation: DetailedExplanationView,
  whyIntroduced: WhyIntroducedView,
  realWorldProblem: RealWorldProblemView,
  realWorldExample: RealWorldExampleView,
  codeExamples: CodeExamplesView,
  importantPoints: ImportantPointsView,
  bestPractices: BestPracticesView,
  commonMistakes: CommonMistakesView,
  interviewPoints: InterviewPointsView,
  interviewQuestions: InterviewQuestionsView,
  scenarioQuestions: ScenarioQuestionsView,
  references: ReferencesView,
  markdown: MarkdownSectionView,
} as unknown as Record<SectionType, ComponentType<ErasedViewProps>>;

const EDITORS: Record<SectionType, ComponentType<ErasedEditProps>> = {
  shortDescription: ShortDescriptionEdit,
  detailedExplanation: DetailedExplanationEdit,
  whyIntroduced: WhyIntroducedEdit,
  realWorldProblem: RealWorldProblemEdit,
  realWorldExample: RealWorldExampleEdit,
  codeExamples: CodeExamplesEdit,
  importantPoints: ImportantPointsEdit,
  bestPractices: BestPracticesEdit,
  commonMistakes: CommonMistakesEdit,
  interviewPoints: InterviewPointsEdit,
  interviewQuestions: InterviewQuestionsEdit,
  scenarioQuestions: ScenarioQuestionsEdit,
  references: ReferencesEdit,
  markdown: MarkdownSectionEdit,
} as unknown as Record<SectionType, ComponentType<ErasedEditProps>>;

/**
 * The only place in the app that erases each section type's specific
 * content shape down to `unknown`. Every view/edit component above stays
 * fully typed against its own SectionContentMap entry — this function is
 * the single, contained boundary where that safety is asserted rather than
 * proven, because SECTION_REGISTRY/VIEWERS/EDITORS are kept in sync by
 * construction (TS errors if a SectionType is missing from either map).
 */
export function renderSectionView(section: Section, theme: 'light' | 'dark') {
  const Viewer = VIEWERS[section.type];
  return <Viewer content={section.content} theme={theme} />;
}

export function renderSectionEdit(section: Section, onChange: (content: Section['content']) => void) {
  const Editor = EDITORS[section.type];
  return <Editor content={section.content} onChange={onChange as (content: unknown) => void} />;
}
