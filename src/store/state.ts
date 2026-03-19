// src/store/state.ts
// Application state: active person, chart data, transit data, nav cursor.
// Single source of truth. Screens read from here, never own persistent data.

import type { Person, ChartData } from '../engine/types';
import type { TransitData } from '../engine/transits';

export interface AppState {
  activePerson: Person | null;
  chartData: ChartData | null;
  transitData: TransitData | null;
  transitDate: string;       // "YYYY-MM-DD", defaults to today
  navCursor: number;         // index of selected option in bottom bar or people list
}

function todayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

let state: AppState = {
  activePerson: null,
  chartData: null,
  transitData: null,
  transitDate: todayString(),
  navCursor: 0,
};

const subscribers: Array<() => void> = [];

export function getState(): AppState {
  return state;
}

export function setState(updates: Partial<AppState>): void {
  state = { ...state, ...updates };
  notify();
}

export function resetState(): void {
  state = {
    activePerson: null,
    chartData: null,
    transitData: null,
    transitDate: todayString(),
    navCursor: 0,
  };
  notify();
}

export function subscribe(fn: () => void): () => void {
  subscribers.push(fn);
  return () => {
    const idx = subscribers.indexOf(fn);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

function notify(): void {
  for (const fn of subscribers) {
    fn();
  }
}
