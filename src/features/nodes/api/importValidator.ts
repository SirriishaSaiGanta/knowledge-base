import { generateId } from '@shared/utils/id';
import { SECTION_REGISTRY } from '../config/sectionRegistry';
import type {
  BestPracticesContent,
  BulletListContent,
  CodeExamplesContent,
  CommonMistakesContent,
  Difficulty,
  InterviewQuestionsContent,
  MarkdownSectionContent,
  RealWorldExampleContent,
  RealWorldProblemContent,
  ReferenceImagesContent,
  ReferencesContent,
  ScenarioQuestionsContent,
  SectionType,
  WhyIntroducedContent,
} from '../types/Section';
import type { ImportNode, ImportParseResult, ImportValidationError } from '../types/Import';

const VALID_SECTION_TYPES = new Set<string>(SECTION_REGISTRY.map((definition) => definition.type));
const VALID_DIFFICULTIES = new Set(['basic', 'intermediate', 'advanced']);

export function parseImportPayload(raw: string): ImportParseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return { node: null, errors: [{ path: '$', message: `Invalid JSON: ${(err as Error).message}` }] };
  }

  const errors: ImportValidationError[] = [];
  const node = validateNode(json, '$', errors);

  return errors.length > 0 ? { node: null, errors } : { node, errors: [] };
}

/* ---------- generic field helpers ---------- */

function asRecord(value: unknown, path: string, errors: ImportValidationError[]): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    errors.push({ path, message: 'Expected an object' });
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown, path: string, errors: ImportValidationError[]): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push({ path, message: 'must be an array' });
    return [];
  }
  return value;
}

function optionalString(value: unknown, path: string, errors: ImportValidationError[]): string {
  if (value === undefined) return '';
  if (typeof value !== 'string') {
    errors.push({ path, message: 'must be a string' });
    return '';
  }
  return value;
}

function requiredString(value: unknown, path: string, errors: ImportValidationError[]): string {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push({ path, message: 'is required and must be a non-empty string' });
    return '';
  }
  return value;
}

/**
 * Accepts either a bare array (`"codeExamples": [...]`) or the array
 * wrapped under `key` (`"codeExamples": { "examples": [...] }`). AI-
 * generated JSON reliably produces the bare-array shape when asked
 * naturally, so both are first-class, not just the wrapped one.
 */
function unwrapListValue(value: unknown, key: string, path: string, errors: ImportValidationError[]): unknown[] {
  if (Array.isArray(value)) return value;
  const obj = asRecord(value, path, errors);
  return obj ? asArray(obj[key], `${path}.${key}`, errors) : [];
}

/* ---------- per-section-type content validators ---------- */

/**
 * JSON import isn't part of the dynamic-sections redesign (Markdown import is the only path that
 * produces `markdown` sections in practice), but SECTION_VALIDATORS must still cover every
 * SectionType. Accepts either a bare string (used as the body, untitled) or `{title, body}`.
 */
function validateMarkdownSection(value: unknown, path: string, errors: ImportValidationError[]): MarkdownSectionContent {
  if (typeof value === 'string') {
    return { title: '', body: value };
  }
  const obj = asRecord(value, path, errors);
  return {
    title: optionalString(obj?.title, `${path}.title`, errors),
    body: optionalString(obj?.body, `${path}.body`, errors),
  };
}

function validateWhyIntroduced(value: unknown, path: string, errors: ImportValidationError[]): WhyIntroducedContent {
  if (typeof value === 'string') {
    return { problem: value, limitations: '', solution: '', benefits: '' };
  }
  const obj = asRecord(value, path, errors);
  return {
    problem: optionalString(obj?.problem, `${path}.problem`, errors),
    limitations: optionalString(obj?.limitations, `${path}.limitations`, errors),
    solution: optionalString(obj?.solution, `${path}.solution`, errors),
    benefits: optionalString(obj?.benefits, `${path}.benefits`, errors),
  };
}

function validateRealWorldProblem(value: unknown, path: string, errors: ImportValidationError[]): RealWorldProblemContent {
  if (typeof value === 'string') {
    return { problem: value, impact: '', challenge: '', solution: '' };
  }
  const obj = asRecord(value, path, errors);
  return {
    problem: optionalString(obj?.problem, `${path}.problem`, errors),
    impact: optionalString(obj?.impact, `${path}.impact`, errors),
    challenge: optionalString(obj?.challenge, `${path}.challenge`, errors),
    solution: optionalString(obj?.solution, `${path}.solution`, errors),
  };
}

function validateRealWorldExample(value: unknown, path: string, errors: ImportValidationError[]): RealWorldExampleContent {
  if (typeof value === 'string') {
    return value.trim() ? { examples: [{ id: generateId(), icon: '💡', title: 'Example', description: value }] } : { examples: [] };
  }
  const arr = unwrapListValue(value, 'examples', path, errors);
  const examples = arr.map((item, index) => {
    const itemPath = `${path}.examples[${index}]`;
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    return {
      id: generateId(),
      icon: optionalString(itemObj.icon, `${itemPath}.icon`, errors) || '💡',
      title: requiredString(itemObj.title, `${itemPath}.title`, errors),
      description: optionalString(itemObj.description, `${itemPath}.description`, errors),
    };
  });
  return { examples };
}

function validateCodeExamples(value: unknown, path: string, errors: ImportValidationError[]): CodeExamplesContent {
  const arr = unwrapListValue(value, 'examples', path, errors);
  const examples = arr.map((item, index) => {
    const itemPath = `${path}.examples[${index}]`;
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    return {
      id: generateId(),
      title: optionalString(itemObj.title, `${itemPath}.title`, errors),
      language: optionalString(itemObj.language, `${itemPath}.language`, errors) || 'text',
      code: requiredString(itemObj.code, `${itemPath}.code`, errors),
      explanation: optionalString(itemObj.explanation, `${itemPath}.explanation`, errors),
    };
  });
  return { examples };
}

function validateBulletList(value: unknown, path: string, errors: ImportValidationError[]): BulletListContent {
  const arr = asArray(value, path, errors);
  const points = arr.map((item, index) => requiredString(item, `${path}[${index}]`, errors)).filter(Boolean);
  return { points };
}

function validateBestPractices(value: unknown, path: string, errors: ImportValidationError[]): BestPracticesContent {
  const arr = unwrapListValue(value, 'practices', path, errors);
  const practices = arr.map((item, index) => {
    const itemPath = `${path}.practices[${index}]`;
    if (typeof item === 'string') {
      return { id: generateId(), recommendation: item, explanation: '', example: '' };
    }
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    return {
      id: generateId(),
      recommendation: requiredString(itemObj.recommendation, `${itemPath}.recommendation`, errors),
      explanation: optionalString(itemObj.explanation, `${itemPath}.explanation`, errors),
      example: optionalString(itemObj.example, `${itemPath}.example`, errors),
    };
  });
  return { practices };
}

function validateCommonMistakes(value: unknown, path: string, errors: ImportValidationError[]): CommonMistakesContent {
  const arr = unwrapListValue(value, 'mistakes', path, errors);
  const mistakes = arr.map((item, index) => {
    const itemPath = `${path}.mistakes[${index}]`;
    if (typeof item === 'string') {
      return { id: generateId(), mistake: item, whyWrong: '', correctApproach: '' };
    }
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    return {
      id: generateId(),
      mistake: requiredString(itemObj.mistake, `${itemPath}.mistake`, errors),
      whyWrong: optionalString(itemObj.whyWrong, `${itemPath}.whyWrong`, errors),
      correctApproach: optionalString(itemObj.correctApproach, `${itemPath}.correctApproach`, errors),
    };
  });
  return { mistakes };
}

function validateInterviewQuestions(value: unknown, path: string, errors: ImportValidationError[]): InterviewQuestionsContent {
  const arr = unwrapListValue(value, 'questions', path, errors);
  const questions = arr.map((item, index) => {
    const itemPath = `${path}.questions[${index}]`;
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    const rawDifficulty = itemObj.difficulty;
    const difficulty: Difficulty =
      typeof rawDifficulty === 'string' && VALID_DIFFICULTIES.has(rawDifficulty) ? (rawDifficulty as Difficulty) : 'basic';
    return {
      id: generateId(),
      question: requiredString(itemObj.question, `${itemPath}.question`, errors),
      answer: optionalString(itemObj.answer, `${itemPath}.answer`, errors),
      difficulty,
    };
  });
  return { questions };
}

function validateScenarioQuestions(value: unknown, path: string, errors: ImportValidationError[]): ScenarioQuestionsContent {
  const arr = unwrapListValue(value, 'scenarios', path, errors);
  const scenarios = arr.map((item, index) => {
    const itemPath = `${path}.scenarios[${index}]`;
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    return {
      id: generateId(),
      question: requiredString(itemObj.question, `${itemPath}.question`, errors),
      answer: optionalString(itemObj.answer, `${itemPath}.answer`, errors),
      why: optionalString(itemObj.why, `${itemPath}.why`, errors),
    };
  });
  return { scenarios };
}

function validateReferences(value: unknown, path: string, errors: ImportValidationError[]): ReferencesContent {
  const arr = unwrapListValue(value, 'items', path, errors);
  const items = arr.map((item, index) => {
    const itemPath = `${path}.items[${index}]`;
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    return {
      id: generateId(),
      title: requiredString(itemObj.title, `${itemPath}.title`, errors),
      source: optionalString(itemObj.source, `${itemPath}.source`, errors),
      description: optionalString(itemObj.description, `${itemPath}.description`, errors),
      url: optionalString(itemObj.url, `${itemPath}.url`, errors),
    };
  });
  return { items };
}

/** JSON import only ever provides a plain external `url` (never a Storage `path`, since the image
 *  wasn't uploaded through this app) — deleting such an entry later is a harmless no-op remove. */
function validateReferenceImages(value: unknown, path: string, errors: ImportValidationError[]): ReferenceImagesContent {
  const arr = unwrapListValue(value, 'images', path, errors);
  const images = arr.map((item, index) => {
    const itemPath = `${path}.images[${index}]`;
    const itemObj = asRecord(item, itemPath, errors) ?? {};
    return {
      id: generateId(),
      url: requiredString(itemObj.url, `${itemPath}.url`, errors),
      path: '',
      caption: optionalString(itemObj.caption, `${itemPath}.caption`, errors),
    };
  });
  return { images };
}

export type ContentValidator = (value: unknown, path: string, errors: ImportValidationError[]) => unknown;

/**
 * Mirrors SECTION_REGISTRY — one validator per section type, keeping each fully typed internally.
 * Used by the JSON import path (parseImportPayload/validateNode below). The Markdown import path
 * has its own, much simpler pass-through logic for the repeatable `markdown` section type — see
 * importMarkdownParser.ts — and doesn't go through this map at all.
 */
export const SECTION_VALIDATORS: Record<SectionType, ContentValidator> = {
  shortDescription: optionalString,
  detailedExplanation: optionalString,
  whyIntroduced: validateWhyIntroduced,
  realWorldProblem: validateRealWorldProblem,
  realWorldExample: validateRealWorldExample,
  codeExamples: validateCodeExamples,
  importantPoints: validateBulletList,
  bestPractices: validateBestPractices,
  commonMistakes: validateCommonMistakes,
  interviewPoints: validateBulletList,
  interviewQuestions: validateInterviewQuestions,
  scenarioQuestions: validateScenarioQuestions,
  references: validateReferences,
  referenceImages: validateReferenceImages,
  markdown: validateMarkdownSection,
};

/* ---------- node structure ---------- */

function validateNode(value: unknown, path: string, errors: ImportValidationError[]): ImportNode {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    errors.push({ path, message: 'Expected an object' });
    return { title: '' };
  }

  const obj = value as Record<string, unknown>;

  const title = typeof obj.title === 'string' ? obj.title.trim() : '';
  if (!title) {
    errors.push({ path: `${path}.title`, message: 'title is required and must be a non-empty string' });
  }

  let description: string | undefined;
  if (obj.description !== undefined) {
    description = optionalString(obj.description, `${path}.description`, errors);
  }

  let tags: string[] | undefined;
  if (obj.tags !== undefined) {
    if (Array.isArray(obj.tags) && obj.tags.every((tag) => typeof tag === 'string')) {
      tags = obj.tags;
    } else {
      errors.push({ path: `${path}.tags`, message: 'tags must be an array of strings' });
    }
  }

  let sections: ImportNode['sections'];
  const sectionsObj = asRecord(obj.sections, `${path}.sections`, errors);
  if (sectionsObj) {
    sections = {};
    for (const [key, sectionValue] of Object.entries(sectionsObj)) {
      const sectionPath = `${path}.sections.${key}`;
      if (!VALID_SECTION_TYPES.has(key)) {
        errors.push({ path: sectionPath, message: `Unknown section type "${key}"` });
        continue;
      }
      const type = key as SectionType;
      const validator = SECTION_VALIDATORS[type];
      (sections as Record<string, unknown>)[type] = validator(sectionValue, sectionPath, errors);
    }
  }

  let children: ImportNode[] | undefined;
  if (obj.children !== undefined) {
    if (!Array.isArray(obj.children)) {
      errors.push({ path: `${path}.children`, message: 'children must be an array' });
    } else {
      children = obj.children.map((child, index) => validateNode(child, `${path}.children[${index}]`, errors));
    }
  }

  return { title, description, tags, sections, children };
}
