import { useCallback, useMemo, useState } from 'react';
import type { ID } from '@shared/types/common';
import { generateId } from '@shared/utils/id';
import { nodesRepository } from '../api/nodesRepository';
import type { KnowledgeNode, NodeInput, TreeNode } from '../types/Node';
import type { Section, SectionInput } from '../types/Section';
import { buildTree } from './buildTree';

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
}

export function useNodesResource(): NodesResource {
  const [nodes, setNodes] = useState<KnowledgeNode[]>(() => nodesRepository.getAll());

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  const patchNode = useCallback((id: ID, patch: Partial<Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const updated = nodesRepository.update(id, patch);
    if (!updated) return;
    setNodes((current) => current.map((node) => (node.id === id ? updated : node)));
  }, []);

  const createNode = useCallback((input: NodeInput) => {
    const node = nodesRepository.create({ ...input, sections: [] });
    setNodes((current) => [...current, node]);
    return node;
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

    const updates = siblings
      .map((sibling, index) => nodesRepository.update(sibling.id, { parentId: newParentId, order: index }))
      .filter((node): node is KnowledgeNode => node !== undefined);

    setNodes((currentState) => {
      const updateMap = new Map(updates.map((node) => [node.id, node]));
      return currentState.map((node) => updateMap.get(node.id) ?? node);
    });
  }, []);

  const removeNode = useCallback((id: ID) => {
    const idsToRemove = new Set([id, ...nodesRepository.getDescendantIds(id)]);
    nodesRepository.removeSubtree(id);
    setNodes((current) => current.filter((node) => !idsToRemove.has(node.id)));
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
      patchNode(nodeId, { sections: node.sections.filter((section) => section.id !== sectionId) });
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
  };
}
