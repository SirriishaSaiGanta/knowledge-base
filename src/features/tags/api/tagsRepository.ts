import { createSupabaseRepository } from '@data/supabaseRepository';
import type { Tag } from '../types/Tag';

function toRow(tag: Tag): Record<string, unknown> {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    created_at: tag.createdAt,
    updated_at: tag.updatedAt,
  };
}

function fromRow(row: Record<string, unknown>): Tag {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const tagsRepository = createSupabaseRepository<Tag>('tags', toRow, fromRow);
