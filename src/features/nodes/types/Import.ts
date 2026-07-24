import type { ID } from '@shared/types/common';
import type { KnowledgeNode, NodeInput } from './Node';
import type { SectionContentMap, SectionInput } from './Section';

/** Untrusted-input shape, validated by parseImportPayload before use. */
export interface ImportNode {
  title: string;
  description?: string;
  tags?: string[];
  /** Legacy typed sections — only ever populated by the JSON import path (`sections` is keyed by
   *  SectionType, so it can't hold more than one instance of a given type). */
  sections?: Partial<SectionContentMap>;
  /** Ordered, repeatable, freeform sections — one per `#` heading in a Markdown import, in source
   *  order. This is what the Markdown import path produces instead of `sections`. */
  dynamicSections?: { title: string; body: string }[];
  children?: ImportNode[];
}

export interface ImportValidationError {
  path: string;
  message: string;
}

export type ImportParseResult =
  | { node: ImportNode; errors: [] }
  | { node: null; errors: ImportValidationError[] };

/**
 * How to handle a node whose title already exists under the same parent.
 * Only 'skip' has real behavior today — 'replace' and 'merge' are wired
 * into the dispatch so a future implementation is a one-function change,
 * not a rewrite of the import flow.
 */
export type ConflictStrategy = 'skip' | 'replace' | 'merge';

export interface ImportSummary {
  created: number;
  replaced: number;
  skipped: number;
}

/**
 * The operations importTree needs, passed in rather than imported directly
 * so the service has no dependency on React or on any specific provider —
 * a caller wires it up to live state (as ImportDialog does via useNodes()/
 * useTags()) or to mocks in a test.
 */
export interface ImportOperations {
  createNode: (input: NodeInput) => KnowledgeNode;
  addSection: (nodeId: ID, input: SectionInput) => void;
  removeSection: (nodeId: ID, sectionId: ID) => void;
  resolveTagIds: (tagNames: string[]) => ID[];
  findChildByTitle: (parentId: ID | null, title: string) => KnowledgeNode | undefined;
}
