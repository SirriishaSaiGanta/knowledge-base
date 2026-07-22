import { TagBadge, useTags } from '@features/tags';
import { useTheme } from '@features/theme';
import { ErrorBoundary } from '@shared/components/ui';
import { SECTION_LABELS } from '../config/sectionRegistry';
import { useSectionCollapseContext } from '../hooks/useSectionCollapseContext';
import { renderSectionView } from './sections/registry';
import type { Section } from '../types/Section';

export function SectionView({ section }: { section: Section }) {
  const { items: allTags } = useTags();
  const { theme } = useTheme();
  const { isCollapsed: isSectionCollapsed, toggle } = useSectionCollapseContext();
  const isCollapsed = isSectionCollapsed(section.id);
  const tags = allTags.filter((tag) => section.tagIds.includes(tag.id));

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
          <h3>{SECTION_LABELS[section.type]}</h3>
        </button>
        {tags.length > 0 && (
          <div className="entity-card-tags">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
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
        </div>
      )}
    </section>
  );
}
