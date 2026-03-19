// src/store/persistence.ts
// localStorage CRUD for Person profiles.
// All birth data persists across page reloads and browser sessions.
// Sorted by frequency (most viewed first, then most recent).

import type { Person } from '../engine/types';

const STORAGE_KEY = 'gachi-pachi-people';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export function loadPeople(): Person[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Person[];
  } catch {
    return [];
  }
}

// Get a single person by ID
export function getPerson(id: string): Person | null {
  const people = loadPeople();
  return people.find(p => p.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

function savePeople(people: Person[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

// Add a new person (does not check for duplicates)
export function addPerson(person: Person): void {
  const people = loadPeople();
  people.push(person);
  savePeople(people);
}

// Update an existing person by ID
export function updatePerson(id: string, updates: Partial<Person>): void {
  const people = loadPeople();
  const index = people.findIndex(p => p.id === id);
  if (index === -1) return;
  people[index] = { ...people[index], ...updates };
  savePeople(people);
}

// Delete a person by ID
export function deletePerson(id: string): void {
  const people = loadPeople().filter(p => p.id !== id);
  savePeople(people);
}

// ---------------------------------------------------------------------------
// Usage tracking
// ---------------------------------------------------------------------------

// Increment usage count and update lastUsed timestamp.
// Called each time a person's chart is viewed.
export function bumpUsage(id: string): void {
  const people = loadPeople();
  const person = people.find(p => p.id === id);
  if (!person) return;
  person.usageCount += 1;
  person.lastUsed = Date.now();
  savePeople(people);
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

// Sort by usage frequency (most used first), then by recency (most recent first).
export function sortByFrequency(people: Person[]): Person[] {
  return [...people].sort((a, b) => {
    if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
    return b.lastUsed - a.lastUsed;
  });
}
