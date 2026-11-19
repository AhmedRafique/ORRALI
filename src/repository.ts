import { RepositoryRecord } from './types';

/**
 * BaseRepository implements a relational repository layer pattern 
 * with optimistic concurrency control for cloud sync conflict resolution.
 */
export class BaseRepository<T> {
  private store: Map<string, RepositoryRecord<T>> = new Map();

  create(id: string, data: T): RepositoryRecord<T> {
    // Never silently replace an existing record: that would reset its version to 1
    // and defeat optimistic concurrency control.
    if (this.store.has(id)) {
      throw new Error(`Record "${id}" already exists; use update() or updateWithVersion().`);
    }
    const now = Date.now();
    const record: RepositoryRecord<T> = {
      id,
      data,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    this.store.set(id, record);
    return record;
  }

  findById(id: string): RepositoryRecord<T> | undefined {
    return this.store.get(id);
  }

  update(id: string, data: T): RepositoryRecord<T> | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;

    const record: RepositoryRecord<T> = {
      ...existing,
      data,
      updatedAt: Date.now(),
      version: existing.version + 1
    };
    
    this.store.set(id, record);
    return record;
  }

  updateWithVersion(
    id: string, 
    data: T, 
    expectedVersion: number
  ): { success: boolean; reason?: string; record?: RepositoryRecord<T> } {
    const existing = this.store.get(id);
    if (!existing) {
      return { success: false, reason: 'not_found' };
    }

    if (existing.version !== expectedVersion) {
      return { success: false, reason: 'conflict' };
    }

    const record = this.update(id, data);
    return { success: true, record };
  }
}
