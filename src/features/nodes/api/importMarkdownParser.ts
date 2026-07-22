import type { SectionType } from '../types/Section';
import type { ImportNode, ImportValidationError } from '../types/Import';
import { SECTION_VALIDATORS } from './importValidator';

const HEADING_TO_SECTION: Record<string, SectionType> = {
  description: 'shortDescription',
  'detailed explanation': 'detailedExplanation',
  'why introduced': 'whyIntroduced',
  'real-world problem': 'realWorldProblem',
  'real world problem': 'realWorldProblem',
  'real-world example': 'realWorldExample',
  'real world example': 'realWorldExample',
  'code example': 'codeExamples',
  'code examples': 'codeExamples',
  'important points': 'importantPoints',
  'best practices': 'bestPractices',
  'common mistakes': 'commonMistakes',
  'interview points': 'interviewPoints',
  'interview questions': 'interviewQuestions',
  'scenario questions': 'scenarioQuestions',
  'scenario-based questions': 'scenarioQuestions',
  references: 'references',
  'references / links': 'references',
};

const CHILDREN_HEADING = 'children';
const DIFFICULTY_TAG = /\s*\[(basic|intermediate|advanced)\]\s*$/i;
const MARKDOWN_LINK = /^\[(.+)\]\((.+)\)$/;
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;

interface HeadingBlock {
  heading: string;
  body: string;
}

/** Heading-marker lines inside fenced code blocks (e.g. a Python "# comment") don't count as headings. */
function splitByHeadings(markdown: string, level: number): HeadingBlock[] {
  const marker = `${'#'.repeat(level)} `;
  const lines = markdown.split('\n');
  const blocks: HeadingBlock[] = [];
  let current: HeadingBlock | null = null;
  let insideFence = false;

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      insideFence = !insideFence;
    }

    if (!insideFence && line.startsWith(marker)) {
      if (current) blocks.push({ ...current, body: current.body.trim() });
      current = { heading: line.slice(marker.length).trim(), body: '' };
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) blocks.push({ ...current, body: current.body.trim() });
  return blocks;
}

interface OutlineNode {
  level: number;
  title: string;
  bodyLines: string[];
  children: OutlineNode[];
}

/**
 * Builds a tree from every heading level found in `body` in a single pass —
 * each heading becomes a child of the nearest preceding heading with a
 * shallower level (the standard outline-to-tree algorithm). This is what
 * makes inconsistent nesting work: some items sitting directly under a
 * "##" heading, with a "###" sub-category appearing later in that same
 * section, both end up as direct children of the "##" — no single,
 * consistent depth is required throughout the document.
 */
function buildHeadingTree(body: string): OutlineNode[] {
  const lines = body.split('\n');
  const roots: OutlineNode[] = [];
  const stack: OutlineNode[] = [];
  let insideFence = false;

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      insideFence = !insideFence;
    }

    const match = insideFence ? null : HEADING_PATTERN.exec(line);

    if (match) {
      const node: OutlineNode = { level: match[1].length, title: match[2].trim(), bodyLines: [], children: [] };

      while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        roots.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }
      stack.push(node);
    } else if (stack.length > 0) {
      stack[stack.length - 1].bodyLines.push(line);
    }
  }

  return roots;
}

/** A "Children" heading is a transparent label, not a real node — splice its children into its parent. */
function flattenChildrenHeadings(nodes: OutlineNode[]): OutlineNode[] {
  const result: OutlineNode[] = [];
  for (const node of nodes) {
    if (node.title.trim().toLowerCase() === CHILDREN_HEADING) {
      result.push(...flattenChildrenHeadings(node.children));
    } else {
      result.push({ ...node, children: flattenChildrenHeadings(node.children) });
    }
  }
  return result;
}

function outlineToImportNodes(nodes: OutlineNode[]): ImportNode[] {
  return nodes.map((node) => ({
    title: node.title,
    description: node.bodyLines.join('\n').trim() || undefined,
    children: node.children.length > 0 ? outlineToImportNodes(node.children) : undefined,
  }));
}

function extractBulletPoints(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- ') || line.startsWith('* '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

/** Every fenced block becomes one example; the text up to the next fence becomes its explanation. */
function extractCodeExamples(body: string): { language: string; code: string; explanation: string }[] {
  const fencePattern = /```(\w*)\n([\s\S]*?)```/g;
  const matches = [...body.matchAll(fencePattern)];

  return matches.map((match, index) => {
    const fenceEnd = (match.index ?? 0) + match[0].length;
    const nextStart = matches[index + 1]?.index ?? body.length;
    const explanation = body
      .slice(fenceEnd, nextStart)
      .replace(/^#{1,6}.*$/gm, '')
      .trim();
    return { language: match[1] || 'text', code: match[2].replace(/\n$/, ''), explanation };
  });
}

/** Converts one top-level section's markdown body into the "raw" shape SECTION_VALIDATORS already accepts. */
function toRawSectionValue(type: SectionType, body: string): unknown {
  switch (type) {
    case 'realWorldExample': {
      const items = splitByHeadings(body, 2);
      return items.length > 0 ? items.map((item) => ({ title: item.heading, description: item.body })) : body;
    }
    case 'codeExamples':
      return extractCodeExamples(body);
    case 'importantPoints':
    case 'interviewPoints':
      return extractBulletPoints(body);
    case 'bestPractices': {
      const items = splitByHeadings(body, 2);
      return items.length > 0
        ? items.map((item) => ({ recommendation: item.heading, explanation: item.body }))
        : extractBulletPoints(body);
    }
    case 'commonMistakes': {
      const items = splitByHeadings(body, 2);
      return items.length > 0
        ? items.map((item) => ({ mistake: item.heading, whyWrong: item.body }))
        : extractBulletPoints(body);
    }
    case 'interviewQuestions':
      return splitByHeadings(body, 2).map((item) => {
        const difficultyMatch = DIFFICULTY_TAG.exec(item.heading);
        return {
          question: item.heading.replace(DIFFICULTY_TAG, '').trim(),
          answer: item.body,
          difficulty: difficultyMatch?.[1]?.toLowerCase() ?? 'basic',
        };
      });
    case 'scenarioQuestions':
      return splitByHeadings(body, 2).map((item) => ({ question: item.heading, answer: item.body }));
    case 'references':
      return splitByHeadings(body, 2).map((item) => {
        const linkMatch = MARKDOWN_LINK.exec(item.heading);
        return linkMatch
          ? { title: linkMatch[1], url: linkMatch[2], description: item.body }
          : { title: item.heading, description: item.body };
      });
    default:
      // shortDescription, detailedExplanation, whyIntroduced, realWorldProblem — all accept plain prose.
      return body;
  }
}

/**
 * Turns a pasted markdown document (using the documented heading
 * convention) into an ImportNode, ready for the same importTree() used by
 * JSON imports. Unlike JSON parsing, this never hard-fails — unrecognized
 * or missing headings are simply skipped, since markdown is prose, not a
 * strict schema.
 */
export function parseMarkdownImport(title: string, markdown: string): ImportNode {
  const topLevel = splitByHeadings(markdown, 1);
  const sections: NonNullable<ImportNode['sections']> = {};
  let children: ImportNode[] | undefined;
  const scratchErrors: ImportValidationError[] = [];

  for (const block of topLevel) {
    const normalized = block.heading.trim().toLowerCase();

    if (normalized === CHILDREN_HEADING) {
      const outline = flattenChildrenHeadings(buildHeadingTree(block.body));
      children = outlineToImportNodes(outline);
      continue;
    }

    const sectionType = HEADING_TO_SECTION[normalized];
    if (!sectionType || !block.body.trim()) continue;

    const raw = toRawSectionValue(sectionType, block.body);
    sections[sectionType] = SECTION_VALIDATORS[sectionType](raw, sectionType, scratchErrors) as never;
  }

  return {
    title: title.trim(),
    sections: Object.keys(sections).length > 0 ? sections : undefined,
    children,
  };
}
