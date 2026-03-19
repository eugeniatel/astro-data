// src/ui/onboarding.ts
// Terminal-style onboarding flow for entering birth data.
// Manages a step-by-step prompt sequence with text input.

import { createPerson } from '../engine/chart';
import { resolveLocation } from '../geocoding/geocode';
import { addPerson } from '../store/persistence';
import type { BirthData, GeocodingResult, Person } from '../engine/types';

type Step = 'name' | 'date' | 'time' | 'city' | 'country' | 'geocoding' | 'done' | 'error';

interface OnboardingState {
  step: Step;
  name: string;
  date: string;
  time: string;
  city: string;
  country: string;
  inputBuffer: string;
  error: string;
  person: Person | null;
}

export class OnboardingFlow {
  private state: OnboardingState;
  private onComplete: (person: Person) => void;
  private onCancel: () => void;

  constructor(onComplete: (person: Person) => void, onCancel: () => void) {
    this.onComplete = onComplete;
    this.onCancel = onCancel;
    this.state = {
      step: 'name',
      name: '',
      date: '',
      time: '',
      city: '',
      country: '',
      inputBuffer: '',
      error: '',
      person: null,
    };
  }

  handleKey(e: KeyboardEvent): boolean {
    const { step } = this.state;

    if (step === 'geocoding' || step === 'done') return false;

    if (e.key === 'Escape') {
      this.onCancel();
      return true;
    }

    if (step === 'error') {
      if (e.key === 'Enter') {
        // Retry from city step
        this.state.step = 'city';
        this.state.inputBuffer = '';
        this.state.error = '';
      }
      return true;
    }

    if (e.key === 'Enter') {
      this.submit();
      return true;
    }

    if (e.key === 'Backspace') {
      this.state.inputBuffer = this.state.inputBuffer.slice(0, -1);
      return true;
    }

    // Only accept printable characters
    if (e.key.length === 1) {
      this.state.inputBuffer += e.key;
      return true;
    }

    return false;
  }

  private submit() {
    const value = this.state.inputBuffer.trim();

    switch (this.state.step) {
      case 'name':
        if (!value) return;
        this.state.name = value;
        this.state.inputBuffer = '';
        this.state.step = 'date';
        break;

      case 'date': {
        if (!value) return;
        // Parse DD/MM/YYYY or YYYY-MM-DD
        const parsed = this.parseDate(value);
        if (!parsed) {
          this.state.error = 'Use DD/MM/YYYY format';
          return;
        }
        this.state.date = parsed;
        this.state.inputBuffer = '';
        this.state.step = 'time';
        break;
      }

      case 'time':
        if (!value) {
          // Unknown birth time
          this.state.time = '';
          this.state.inputBuffer = '';
          this.state.step = 'city';
        } else {
          const parsed = this.parseTime(value);
          if (!parsed) {
            this.state.error = 'Use HH:MM format (24h)';
            return;
          }
          this.state.time = parsed;
          this.state.inputBuffer = '';
          this.state.step = 'city';
        }
        break;

      case 'city':
        if (!value) return;
        this.state.city = value;
        this.state.inputBuffer = '';
        this.state.step = 'country';
        break;

      case 'country':
        if (!value) return;
        this.state.country = value;
        this.state.inputBuffer = '';
        this.state.step = 'geocoding';
        this.geocodeAndCreate();
        break;
    }

    this.state.error = '';
  }

  private parseDate(input: string): string | null {
    // Accept DD/MM/YYYY
    const slashMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const [, d, m, y] = slashMatch;
      const day = d.padStart(2, '0');
      const month = m.padStart(2, '0');
      return `${y}-${month}-${day}`;
    }
    // Accept YYYY-MM-DD
    const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return null;
  }

  private parseTime(input: string): string | null {
    const match = input.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private async geocodeAndCreate() {
    try {
      const response = await resolveLocation(this.state.city, this.state.country);

      let geo: GeocodingResult;

      if (response.result) {
        geo = response.result;
      } else if (response.candidates && response.candidates.length > 0) {
        // Use first candidate for now
        geo = response.candidates[0];
      } else {
        this.state.step = 'error';
        this.state.error = `Could not find "${this.state.city}, ${this.state.country}". Press Enter to try again.`;
        return;
      }

      const birthData: BirthData = {
        date: this.state.date,
        time: this.state.time || null,
        city: this.state.city,
        country: this.state.country,
      };

      const person = createPerson(birthData, geo, this.state.name);
      addPerson(person);

      this.state.person = person;
      this.state.step = 'done';
      this.onComplete(person);
    } catch {
      this.state.step = 'error';
      this.state.error = 'Geocoding failed. Press Enter to try again.';
    }
  }

  render(): string {
    const lines: string[] = [];
    const cursor = '\u2588'; // █ block cursor

    // Show completed fields
    if (this.state.name) {
      lines.push(`  name          ${this.state.name}`);
    }
    if (this.state.date) {
      lines.push(`  birth date    ${this.state.date}`);
    }
    if (this.state.step !== 'name' && this.state.step !== 'date' && this.state.date) {
      lines.push(`  birth time    ${this.state.time || 'unknown'}`);
    }
    if (this.state.city) {
      lines.push(`  city          ${this.state.city}`);
    }
    if (this.state.country) {
      lines.push(`  country       ${this.state.country}`);
    }

    if (lines.length > 0) lines.push('');

    // Show current prompt
    switch (this.state.step) {
      case 'name':
        lines.push(`  What's your name?`);
        lines.push(`  > ${this.state.inputBuffer}${cursor}`);
        break;
      case 'date':
        lines.push(`  Birth date (DD/MM/YYYY)`);
        lines.push(`  > ${this.state.inputBuffer}${cursor}`);
        break;
      case 'time':
        lines.push(`  Birth time (HH:MM, 24h)`);
        lines.push(`  Press Enter if unknown`);
        lines.push(`  > ${this.state.inputBuffer}${cursor}`);
        break;
      case 'city':
        lines.push(`  Birth city`);
        lines.push(`  > ${this.state.inputBuffer}${cursor}`);
        break;
      case 'country':
        lines.push(`  Country`);
        lines.push(`  > ${this.state.inputBuffer}${cursor}`);
        break;
      case 'geocoding':
        lines.push(`  Looking up ${this.state.city}, ${this.state.country}...`);
        break;
      case 'error':
        lines.push(`  ${this.state.error}`);
        break;
      case 'done':
        lines.push(`  Chart ready.`);
        break;
    }

    if (this.state.error && this.state.step !== 'error') {
      lines.push(`  ${this.state.error}`);
    }

    return lines.join('\n');
  }
}
