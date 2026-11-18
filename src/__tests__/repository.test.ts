import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BaseRepository
} from '../repository';

describe('7.0.0 - Relational Repository Layer', () => {
  it('creates and manages records with versioning for conflict resolution', () => {
    const repo = new BaseRepository<{ name: string }>();

    // Create
    const record = repo.create('user_1', { name: 'Ahmed' });
    assert.equal(record.id, 'user_1');
    assert.equal(record.data.name, 'Ahmed');
    assert.equal(record.version, 1);

    // Read
    const fetched = repo.findById('user_1');
    assert.ok(fetched);
    assert.equal(fetched?.data.name, 'Ahmed');

    // Update
    const updated = repo.update('user_1', { name: 'Ahmed Rafique' });
    assert.ok(updated);
    assert.equal(updated?.data.name, 'Ahmed Rafique');
    assert.equal(updated?.version, 2);

    // Conflict Resolution (Optimistic Concurrency)
    // Trying to update with an older version should fail or be handled
    const conflictResult = repo.updateWithVersion('user_1', { name: 'Stale Update' }, 1);
    assert.equal(conflictResult.success, false);
    assert.equal(conflictResult.reason, 'conflict');

    // Valid update with correct version
    const validUpdate = repo.updateWithVersion('user_1', { name: 'Valid Update' }, 2);
    assert.equal(validUpdate.success, true);
    assert.equal(validUpdate.record?.version, 3);
  });
});
