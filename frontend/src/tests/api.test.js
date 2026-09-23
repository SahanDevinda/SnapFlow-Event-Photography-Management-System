import { describe, it, expect, vi } from 'vitest';

vi.unmock('../services/api');
const { listOf } = await vi.importActual('../services/api');

describe('listOf payload normaliser', () => {
  it('unwraps a Spring Page response', () => {
    expect(listOf({ data: { content: [1, 2], totalElements: 2 } })).toEqual([1, 2]);
  });

  it('passes a plain list straight through', () => {
    expect(listOf({ data: [1, 2, 3] })).toEqual([1, 2, 3]);
  });

  it('returns an empty array for null / unexpected payloads', () => {
    expect(listOf(null)).toEqual([]);
    expect(listOf({ data: { foo: 'bar' } })).toEqual([]);
  });
});
