import type { SectionContentMap, SectionType } from '../../types/Section';

export interface SectionViewProps<T extends SectionType> {
  content: SectionContentMap[T];
  theme: 'light' | 'dark';
}

export interface SectionEditProps<T extends SectionType> {
  content: SectionContentMap[T];
  onChange: (content: SectionContentMap[T]) => void;
}
