import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { ID } from '@shared/types/common';
import { generateId } from '@shared/utils/id';
import { deleteSectionImage } from '@data/sectionImageStorage';
import { nodesRepository } from '../api/nodesRepository';
import type { KnowledgeNode, NodeInput, TreeNode } from '../types/Node';
import type { Section, SectionInput } from '../types/Section';
import { buildTree } from './buildTree';

/** Every Storage object path a section references — its cross-cutting gallery, plus its own
 *  content.images if it's a 'referenceImages' section — so removing the section can clean up
 *  the underlying Storage objects instead of leaving them orphaned. */
function collectSectionImagePaths(section: Section): string[] {
  const paths = (section.images ?? []).map((image) => image.path);
  if (section.type === 'referenceImages') {
    paths.push(...section.content.images.map((image) => image.path));
  }
  return paths.filter(Boolean);
}

export interface NodesResource {
  nodes: KnowledgeNode[];
  tree: TreeNode[];
  createNode: (input: NodeInput) => KnowledgeNode;
  renameNode: (id: ID, title: string) => void;
  /** Moves `id` to be the `newIndex`-th child of `newParentId`, renumbering that parent's other children to stay collision-free. */
  moveNode: (id: ID, newParentId: ID | null, newIndex: number) => void;
  removeNode: (id: ID) => void;
  addSection: (nodeId: ID, input: SectionInput) => void;
  updateSection: (nodeId: ID, sectionId: ID, patch: Partial<SectionInput>) => void;
  removeSection: (nodeId: ID, sectionId: ID) => void;
  /** Looks up a child by title (case-/whitespace-insensitive) against the live repository, not a
   *  React-state snapshot — safe to call repeatedly within a single synchronous import pass, where
   *  siblings created earlier in the same pass must be visible to the next lookup. */
  findChildByTitle: (parentId: ID | null, title: string) => KnowledgeNode | undefined;
}

export function useNodesResource(): NodesResource {
  /* nodesRepository notifies subscribers on every mutation — whether made locally or pushed in
   * via Realtime from another device — so reading through useSyncExternalStore keeps `nodes`
   * live without any manual setState bookkeeping. */
  const nodes = useSyncExternalStore(nodesRepository.subscribe, nodesRepository.getAll);

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  const patchNode = useCallback((id: ID, patch: Partial<Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>>) => {
    nodesRepository.update(id, patch);
  }, []);

  const createNode = useCallback((input: NodeInput) => {
    // A sibling with the same title (case-/whitespace-insensitive) under the same parent is
    // treated as "already there" rather than duplicated — matches the Import dialog's skip
    // behavior, extended to the plain "+" add-topic flow.
    const normalizedTitle = input.title.trim().toLowerCase();
    const existing = nodesRepository
      .getChildren(input.parentId)
      .find((node) => node.title.trim().toLowerCase() === normalizedTitle);
    if (existing) return existing;

    return nodesRepository.create({ ...input, sections: [] });
  }, []);

  const renameNode = useCallback(
    (id: ID, title: string) => patchNode(id, { title }),
    [patchNode],
  );

  const moveNode = useCallback((id: ID, newParentId: ID | null, newIndex: number) => {
    if (newParentId === id) return;
    if (newParentId !== null && nodesRepository.getDescendantIds(id).includes(newParentId)) return; // would create a cycle

    const current = nodesRepository.getAll();
    const moving = current.find((node) => node.id === id);
    if (!moving) return;

    const siblings = current
      .filter((node) => node.parentId === newParentId && node.id !== id)
      .sort((a, b) => a.order - b.order);

    const clampedIndex = Math.max(0, Math.min(newIndex, siblings.length));
    siblings.splice(clampedIndex, 0, moving);

    siblings.forEach((sibling, index) => nodesRepository.update(sibling.id, { parentId: newParentId, order: index }));
  }, []);

  const removeNode = useCallback((id: ID) => {
    nodesRepository.removeSubtree(id);
  }, []);

  const findChildByTitle = useCallback((parentId: ID | null, title: string) => {
    const normalized = title.trim().toLowerCase();
    return nodesRepository.getChildren(parentId).find((node) => node.title.trim().toLowerCase() === normalized);
  }, []);

  const addSection = useCallback(
    (nodeId: ID, input: SectionInput) => {
      const node = nodesRepository.getById(nodeId);
      if (!node) return;
      const section: Section = { id: generateId(), ...input };
      patchNode(nodeId, { sections: [...node.sections, section] });
    },
    [patchNode],
  );

  const updateSection = useCallback(
    (nodeId: ID, sectionId: ID, patch: Partial<SectionInput>) => {
      const node = nodesRepository.getById(nodeId);
      if (!node) return;
      const sections = node.sections.map((section) =>
        section.id === sectionId ? ({ ...section, ...patch } as Section) : section,
      );
      patchNode(nodeId, { sections });
    },
    [patchNode],
  );

  const removeSection = useCallback(
    (nodeId: ID, sectionId: ID) => {
      const node = nodesRepository.getById(nodeId);
      if (!node) return;
      const removed = node.sections.find((section) => section.id === sectionId);
      patchNode(nodeId, { sections: node.sections.filter((section) => section.id !== sectionId) });
      if (removed) collectSectionImagePaths(removed).forEach((path) => void deleteSectionImage(path));
    },
    [patchNode],
  );

  return {
    nodes,
    tree,
    createNode,
    renameNode,
    moveNode,
    removeNode,
    addSection,
    updateSection,
    removeSection,
    findChildByTitle,
  };
}
