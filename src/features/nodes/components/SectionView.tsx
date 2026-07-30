import { useState } from 'react';
import { TagBadge, useTags } from '@features/tags';
import { useTheme } from '@features/theme';
import { ErrorBoundary, Button, ImageGallery } from '@shared/components/ui';
import { ConfirmDialog } from '@shared/components/composite';
import type { ID } from '@shared/types/common';
import { SECTION_LABELS } from '../config/sectionRegistry';
import { useSectionCollapseContext } from '../hooks/useSectionCollapseContext';
import { useNodes } from '../hooks/useNodes';
import { renderSectionView } from './sections/registry';
import { SectionEditor } from './SectionEditor';
import type { Section } from '../types/Section';

export function SectionView({ section, nodeId }: { section: Section; nodeId: ID }) {
  const { items: allTags } = useTags();
  const { theme } = useTheme();
  const { isCollapsed: isSectionCollapsed, toggle } = useSectionCollapseContext();
  const { updateSection, removeSection } = useNodes();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isCollapsed = isSectionCollapsed(section.id);
  const tags = allTags.filter((tag) => section.tagIds.includes(tag.id));
  // 'markdown' sections are repeatable and per-instance-titled — every other type shares one
  // fixed label across all nodes, so only this one needs its title read from its own content.
  const label = section.type === 'markdown' ? section.content.title.trim() || 'Untitled section' : SECTION_LABELS[section.type];

  if (isEditing) {
    return (
      <SectionEditor
        section={section}
        onSave={(patch) => {
          updateSection(nodeId, section.id, patch);
          setIsEditing(false);
        }}
        onDelete={() => removeSection(nodeId, section.id)}
      />
    );
  }

  return (
    <section className="section-view">
      <div className="section-view-header">
        <button
          type="button"
          className="section-view-toggle"
          onClick={() => toggle(section.id)}
          aria-expanded={!isCollapsed}
        >
          <span aria-hidden="true">{isCollapsed ? '▸' : '▾'}</span>
          <h3>{label}</h3>
        </button>
        <div className="section-view-actions">
          {tags.length > 0 && (
            <div className="entity-card-tags">
              {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}
          <button
            type="button"
            className={section.markedForInterview ? 'interview-toggle active' : 'interview-toggle'}
            aria-pressed={Boolean(section.markedForInterview)}
            title={
              section.markedForInterview
                ? 'Shown in Interview mode — click to unmark'
                : 'Mark for Interview mode'
            }
            onClick={() => updateSection(nodeId, section.id, { markedForInterview: !section.markedForInterview })}
          >
            🎤 Interview
          </button>
          <Button type="button" variant="ghost" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button type="button" variant="danger" onClick={() => setIsConfirmingDelete(true)}>
            Delete
          </Button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="section-view-body">
          <ErrorBoundary
            fallback={(error) => (
              <div className="section-error">
                <p>This section couldn&apos;t be displayed{error.message ? ` (${error.message})` : ''}.</p>
                <p className="section-error-hint">
                  Its content may be in an old format — try editing or removing it.
                </p>
              </div>
            )}
          >
            {renderSectionView(section, theme)}
          </ErrorBoundary>

          {/* Skipped for 'referenceImages' sections — renderSectionView above already rendered
              this exact gallery from section.content.images, so this would just duplicate it. */}
          {section.type !== 'referenceImages' && section.images && section.images.length > 0 && (
            <ImageGallery images={section.images} />
          )}
        </div>
      )}

      <ConfirmDialog
        open={isConfirmingDelete}
        title="Delete section"
        message={`Delete "${label}"? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setIsConfirmingDelete(false)}
        onConfirm={() => {
          setIsConfirmingDelete(false);
          removeSection(nodeId, section.id);
        }}
      />
    </section>
  );
}
