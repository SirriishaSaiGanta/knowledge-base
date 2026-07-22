import type { ChangeEvent } from 'react';
import { useNodes } from '../hooks/useNodes';
import { SECTION_REGISTRY, getSectionDefinition } from '../config/sectionRegistry';
import { SectionEditor } from './SectionEditor';
import type { KnowledgeNode } from '../types/Node';
import type { SectionInput, SectionType } from '../types/Section';

export function NodeEditor({ node }: { node: KnowledgeNode }) {
  const { addSection, updateSection, removeSection } = useNodes();

  const usedTypes = new Set(node.sections.map((section) => section.type));
  const availableTypes = SECTION_REGISTRY.filter((definition) => !usedTypes.has(definition.type));

  function handleAddSection(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as SectionType;
    if (type) {
      const definition = getSectionDefinition(type);
      addSection(node.id, { type, content: definition.emptyContent(), tagIds: [] } as SectionInput);
    }
    event.target.value = '';
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

      {availableTypes.length > 0 && (
        <div className="add-section">
          <select defaultValue="" onChange={handleAddSection} aria-label="Add section">
            <option value="" disabled>
              + Add section…
            </option>
            {availableTypes.map((definition) => (
              <option key={definition.type} value={definition.type}>
                {definition.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
