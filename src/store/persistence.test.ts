// src/store/persistence.test.ts
// Tests for localStorage persistence layer.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPeople, addPerson, getPerson, updatePerson,
  deletePerson, bumpUsage, sortByFrequency,
} from './persistence';
import type { Person } from '../engine/types';

// Mock person factory
function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: crypto.randomUUID(),
    name: 'Test Person',
    birthDate: '1990-06-15',
    birthTime: '14:30',
    birthCity: 'London',
    birthCountry: 'GB',
    lat: 51.5,
    lon: -0.12,
    ianaTimezone: 'Europe/London',
    usageCount: 0,
    lastUsed: 0,
    ...overrides,
  };
}

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

describe('loadPeople', () => {
  it('returns empty array when no data stored', () => {
    expect(loadPeople()).toEqual([]);
  });

  it('returns empty array when stored data is invalid JSON', () => {
    localStorage.setItem('gachi-pachi-people', 'not json');
    expect(loadPeople()).toEqual([]);
  });

  it('returns empty array when stored data is not an array', () => {
    localStorage.setItem('gachi-pachi-people', '{"not": "array"}');
    expect(loadPeople()).toEqual([]);
  });
});

describe('addPerson + loadPeople', () => {
  it('adds a person and retrieves it', () => {
    const person = makePerson({ name: 'Alice' });
    addPerson(person);
    const people = loadPeople();
    expect(people).toHaveLength(1);
    expect(people[0].name).toBe('Alice');
  });

  it('adds multiple people', () => {
    addPerson(makePerson({ name: 'Alice' }));
    addPerson(makePerson({ name: 'Bob' }));
    const people = loadPeople();
    expect(people).toHaveLength(2);
  });
});

describe('getPerson', () => {
  it('returns person by ID', () => {
    const person = makePerson({ name: 'Charlie' });
    addPerson(person);
    const found = getPerson(person.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Charlie');
  });

  it('returns null for unknown ID', () => {
    expect(getPerson('nonexistent')).toBeNull();
  });
});

describe('updatePerson', () => {
  it('updates fields on existing person', () => {
    const person = makePerson({ name: 'Dave' });
    addPerson(person);
    updatePerson(person.id, { name: 'David' });
    const updated = getPerson(person.id);
    expect(updated!.name).toBe('David');
  });

  it('does not crash on unknown ID', () => {
    expect(() => updatePerson('nonexistent', { name: 'X' })).not.toThrow();
  });
});

describe('deletePerson', () => {
  it('removes a person by ID', () => {
    const person = makePerson();
    addPerson(person);
    expect(loadPeople()).toHaveLength(1);
    deletePerson(person.id);
    expect(loadPeople()).toHaveLength(0);
  });

  it('does not affect other people', () => {
    const a = makePerson({ name: 'A' });
    const b = makePerson({ name: 'B' });
    addPerson(a);
    addPerson(b);
    deletePerson(a.id);
    const people = loadPeople();
    expect(people).toHaveLength(1);
    expect(people[0].name).toBe('B');
  });
});

describe('bumpUsage', () => {
  it('increments usageCount', () => {
    const person = makePerson();
    addPerson(person);
    bumpUsage(person.id);
    const updated = getPerson(person.id);
    expect(updated!.usageCount).toBe(1);
  });

  it('updates lastUsed timestamp', () => {
    const person = makePerson();
    addPerson(person);
    const before = Date.now();
    bumpUsage(person.id);
    const updated = getPerson(person.id);
    expect(updated!.lastUsed).toBeGreaterThanOrEqual(before);
  });

  it('increments multiple times', () => {
    const person = makePerson();
    addPerson(person);
    bumpUsage(person.id);
    bumpUsage(person.id);
    bumpUsage(person.id);
    expect(getPerson(person.id)!.usageCount).toBe(3);
  });
});

describe('sortByFrequency', () => {
  it('sorts most used first', () => {
    const a = makePerson({ name: 'A', usageCount: 1, lastUsed: 100 });
    const b = makePerson({ name: 'B', usageCount: 5, lastUsed: 50 });
    const c = makePerson({ name: 'C', usageCount: 3, lastUsed: 200 });
    const sorted = sortByFrequency([a, b, c]);
    expect(sorted.map(p => p.name)).toEqual(['B', 'C', 'A']);
  });

  it('breaks ties by recency (most recent first)', () => {
    const a = makePerson({ name: 'A', usageCount: 3, lastUsed: 100 });
    const b = makePerson({ name: 'B', usageCount: 3, lastUsed: 200 });
    const sorted = sortByFrequency([a, b]);
    expect(sorted.map(p => p.name)).toEqual(['B', 'A']);
  });

  it('does not mutate the input array', () => {
    const people = [
      makePerson({ name: 'A', usageCount: 1 }),
      makePerson({ name: 'B', usageCount: 5 }),
    ];
    const original = [...people];
    sortByFrequency(people);
    expect(people[0].name).toBe(original[0].name);
  });
});
