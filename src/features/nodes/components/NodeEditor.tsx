import type { ChangeEvent } from 'react';
import { Button } from '@shared/components/ui';
import { useNodes } from '../hooks/useNodes';
import { SECTION_REGISTRY, getSectionDefinition } from '../config/sectionRegistry';
import { SectionEditor } from './SectionEditor';
import type { KnowledgeNode } from '../types/Node';
import type { SectionInput, SectionType } from '../types/Section';

export function NodeEditor({ node }: { node: KnowledgeNode }) {
  const { addSection, updateSection, removeSection } = useNodes();

  const usedTypes = new Set(node.sections.map((section) => section.type));
  // 'markdown' is repeatable — it gets its own always-available button below, not this
  // one-per-type dropdown (which still governs the 12 legacy structured types).
  const availableTypes = SECTION_REGISTRY.filter(
    (definition) => definition.type !== 'markdown' && !usedTypes.has(definition.type),
  );

  function handleAddSection(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as SectionType;
    if (type) {
      const definition = getSectionDefinition(type);
      addSection(node.id, { type, content: definition.emptyContent(), tagIds: [] } as SectionInput);
    }
    event.target.value = '';
  }

  function handleAddMarkdownSection() {
    addSection(node.id, { type: 'markdown', content: { title: '', body: '' }, tagIds: [] });
  }

  return (
    <div className="node-editor">
      {node.sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onSave={(patch) => updateSection(node.id, section.id, patch)}
          onDelete={() => removeSection(node.id, section.id)}
        />
      ))}

      <div className="add-section">
        <Button type="button" variant="secondary" onClick={handleAddMarkdownSection}>
          + Add section
        </Button>

        {availableTypes.length > 0 && (
          <select defaultValue="" onChange={handleAddSection} aria-label="Add structured section">
            <option value="" disabled>
              + Add structured section…
            </option>
            {availableTypes.map((definition) => (
              <option key={definition.type} value={definition.type}>
                {definition.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
