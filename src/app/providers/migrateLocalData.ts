import { localStorageAdapter } from '@data/storage/localStorageAdapter';
import { nodesRepository } from '@features/nodes/api/nodesRepository';
import { tagsRepository } from '@features/tags/api/tagsRepository';
import type { KnowledgeNode } from '@features/nodes';
import type { Tag } from '@features/tags';

const MIGRATION_FLAG_KEY = 'kb:migratedToCloud';

/**
 * One-time migration for whoever's browser has pre-Supabase data sitting in localStorage from
 * before cross-device sync existed.
 *
 * Uses importRaw (not create) to preserve original ids — node.parentId and section.tagIds
 * reference other rows by id, and regenerating ids on the way in would break every one of those
 * references. importRaw upserts rather than inserts, so this is deliberately *not* gated on the
 * cloud being empty — safe to force a re-run (clear MIGRATION_FLAG_KEY from localStorage) to
 * backfill anything an earlier, partially-failed run left out, without duplicating what already
 * made it across.
 */
export async function migrateLocalDataIfNeeded(): Promise<void> {
  if (localStorageAdapter.get<boolean>(MIGRATION_FLAG_KEY)) return;

  try {
    const localNodes = localStorageAdapter.get<KnowledgeNode[]>('kb:nodes') ?? [];
    const localTags = localStorageAdapter.get<Tag[]>('kb:tags') ?? [];

    if (localNodes.length > 0) {
      await tagsRepository.importRaw(localTags);
      await nodesRepository.importRaw(localNodes);
    }
  } finally {
    localStorageAdapter.set(MIGRATION_FLAG_KEY, true);
  }
}
