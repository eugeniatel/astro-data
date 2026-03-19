// src/router.ts
// Screen state machine + transition logic.
// Manages which screen is active and handles navigation events.

export type Screen =
  | 'LANDING'
  | 'ONBOARDING'
  | 'PERSON_SELECT'
  | 'CHART'
  | 'TRANSIT'
  | 'INTERPRETATIONS';

export type NavEvent =
  | 'ENTER'
  | 'PERSON_SELECTED'
  | 'NEW_PERSON'
  | 'SEE_TRANSITS'
  | 'SEE_INTERPRETATIONS'
  | 'BACK_TO_CHART'
  | 'EXIT';

const TRANSITIONS: Record<Screen, Partial<Record<NavEvent, Screen>>> = {
  LANDING: {
    ENTER: 'PERSON_SELECT',
  },
  PERSON_SELECT: {
    PERSON_SELECTED: 'CHART',
    NEW_PERSON: 'ONBOARDING',
    EXIT: 'LANDING',
  },
  ONBOARDING: {
    PERSON_SELECTED: 'CHART',
    EXIT: 'PERSON_SELECT',
  },
  CHART: {
    SEE_TRANSITS: 'TRANSIT',
    SEE_INTERPRETATIONS: 'INTERPRETATIONS',
    NEW_PERSON: 'PERSON_SELECT',
    EXIT: 'LANDING',
  },
  TRANSIT: {
    BACK_TO_CHART: 'CHART',
    EXIT: 'CHART',
  },
  INTERPRETATIONS: {
    BACK_TO_CHART: 'CHART',
    EXIT: 'CHART',
  },
};

export class Router {
  private _screen: Screen;
  private _listeners: Array<(screen: Screen) => void> = [];

  constructor(initialScreen: Screen = 'LANDING') {
    this._screen = initialScreen;
  }

  get screen(): Screen {
    return this._screen;
  }

  transition(event: NavEvent): Screen {
    const nextScreen = TRANSITIONS[this._screen]?.[event];
    if (nextScreen) {
      this._screen = nextScreen;
      this._notify();
    }
    return this._screen;
  }

  // Force-set screen (for programmatic navigation, e.g. auto-skip landing)
  setScreen(screen: Screen): void {
    this._screen = screen;
    this._notify();
  }

  onTransition(listener: (screen: Screen) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  private _notify(): void {
    for (const listener of this._listeners) {
      listener(this._screen);
    }
  }
}
