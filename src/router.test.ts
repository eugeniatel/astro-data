// src/router.test.ts
import { describe, it, expect } from 'vitest';
import { Router } from './router';

describe('Router', () => {
  it('starts at LANDING by default', () => {
    const router = new Router();
    expect(router.screen).toBe('LANDING');
  });

  it('transitions LANDING -> PERSON_SELECT on ENTER', () => {
    const router = new Router();
    router.transition('ENTER');
    expect(router.screen).toBe('PERSON_SELECT');
  });

  it('transitions PERSON_SELECT -> CHART on PERSON_SELECTED', () => {
    const router = new Router('PERSON_SELECT');
    router.transition('PERSON_SELECTED');
    expect(router.screen).toBe('CHART');
  });

  it('transitions CHART -> TRANSIT on SEE_TRANSITS', () => {
    const router = new Router('CHART');
    router.transition('SEE_TRANSITS');
    expect(router.screen).toBe('TRANSIT');
  });

  it('transitions TRANSIT -> CHART on BACK_TO_CHART', () => {
    const router = new Router('TRANSIT');
    router.transition('BACK_TO_CHART');
    expect(router.screen).toBe('CHART');
  });

  it('transitions CHART -> INTERPRETATIONS on SEE_INTERPRETATIONS', () => {
    const router = new Router('CHART');
    router.transition('SEE_INTERPRETATIONS');
    expect(router.screen).toBe('INTERPRETATIONS');
  });

  it('transitions PERSON_SELECT -> ONBOARDING on NEW_PERSON', () => {
    const router = new Router('PERSON_SELECT');
    router.transition('NEW_PERSON');
    expect(router.screen).toBe('ONBOARDING');
  });

  it('ignores invalid transitions', () => {
    const router = new Router('LANDING');
    router.transition('BACK_TO_CHART'); // invalid from LANDING
    expect(router.screen).toBe('LANDING');
  });

  it('notifies listeners on transition', () => {
    const router = new Router();
    let notified: string | null = null;
    router.onTransition(screen => { notified = screen; });
    router.transition('ENTER');
    expect(notified).toBe('PERSON_SELECT');
  });

  it('unsubscribe stops notifications', () => {
    const router = new Router();
    let count = 0;
    const unsub = router.onTransition(() => { count++; });
    router.transition('ENTER');
    expect(count).toBe(1);
    unsub();
    router.transition('NEW_PERSON');
    expect(count).toBe(1); // no additional call
  });

  it('setScreen forces navigation', () => {
    const router = new Router();
    router.setScreen('CHART');
    expect(router.screen).toBe('CHART');
  });
});
