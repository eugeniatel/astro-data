// src/main.ts
// Gachi Pachi -- Natal Chart Tool
// Entry point: init WASM, load saved people, mount screen router.

import { initEphemeris } from './engine/ephemeris';
import { calculateChart } from './engine/chart';
import { calculateTransits } from './engine/transits';
import { Router } from './router';
import { getState, setState } from './store/state';
import { loadPeople, bumpUsage, sortByFrequency } from './store/persistence';
import { renderNatalChart } from './render/layout';
import { renderTransitHeader, renderTransitList, renderTransitPlanets } from './render/transit';
// renderWheel and gridToString available for transit overlay (future enhancement)
import type { Person, ChartData } from './engine/types';
import { DISPLAY_PLANETS } from './engine/types';
import { getPlanetInSignText, getPlanetInHouseText } from './data/interpretations';

// ---------------------------------------------------------------------------
// App initialization
// ---------------------------------------------------------------------------
async function main() {
  const app = document.getElementById('app')!;
  app.style.fontFamily = 'monospace';
  app.style.whiteSpace = 'pre';
  app.style.fontSize = '14px';
  app.style.lineHeight = '1.2';
  app.style.background = '#0a0a0a';
  app.style.color = '#e0e0e0';
  app.style.padding = '20px';
  app.style.minHeight = '100vh';
  app.style.boxSizing = 'border-box';

  app.textContent = 'Initializing ephemeris...';

  await initEphemeris();

  const router = new Router();
  const people = sortByFrequency(loadPeople());

  // If people exist, skip landing and go to person select
  if (people.length > 0) {
    router.setScreen('PERSON_SELECT');
  }

  // Render loop
  function render() {
    const screen = router.screen;
    const state = getState();

    switch (screen) {
      case 'LANDING':
        renderLanding(app, router);
        break;
      case 'PERSON_SELECT':
        renderPersonSelect(app, router, sortByFrequency(loadPeople()));
        break;
      case 'CHART':
        if (state.chartData) {
          app.textContent = renderNatalChart(state.chartData);
          app.textContent += '\n\n  [T] Transits  [I] Interpretations  [N] New person  [Q] Exit';
        }
        break;
      case 'TRANSIT':
        if (state.chartData && state.transitData) {
          const header = renderTransitHeader(state.chartData, state.transitData);
          const list = renderTransitList(state.transitData);
          const positions = renderTransitPlanets(state.transitData);
          app.textContent = `${header}\n\n${positions}\n\n${list}\n\n  [B] Back to chart  [Q] Exit`;
        }
        break;
      case 'INTERPRETATIONS':
        if (state.chartData) {
          renderInterpretations(app, state.chartData);
        }
        break;
      default:
        app.textContent = `Screen: ${screen}`;
    }
  }

  router.onTransition(render);

  // Global keyboard handler
  document.addEventListener('keydown', (e) => {
    const screen = router.screen;
    const state = getState();

    switch (screen) {
      case 'LANDING':
        if (e.key === 'Enter') router.transition('ENTER');
        break;

      case 'PERSON_SELECT': {
        const people = sortByFrequency(loadPeople());
        if (e.key === 'ArrowUp') {
          setState({ navCursor: Math.max(0, state.navCursor - 1) });
          render();
        } else if (e.key === 'ArrowDown') {
          setState({ navCursor: Math.min(people.length, state.navCursor + 1) });
          render();
        } else if (e.key === 'Enter') {
          if (state.navCursor < people.length) {
            selectPerson(people[state.navCursor], router);
          } else {
            router.transition('NEW_PERSON');
          }
        } else if (e.key === 'q' || e.key === 'Q') {
          router.transition('EXIT');
        }
        break;
      }

      case 'CHART':
        if (e.key === 't' || e.key === 'T') {
          if (state.chartData) {
            const transits = calculateTransits(state.transitDate, state.chartData);
            setState({ transitData: transits });
          }
          router.transition('SEE_TRANSITS');
        } else if (e.key === 'i' || e.key === 'I') {
          router.transition('SEE_INTERPRETATIONS');
        } else if (e.key === 'n' || e.key === 'N') {
          setState({ navCursor: 0 });
          router.transition('NEW_PERSON');
        } else if (e.key === 'q' || e.key === 'Q') {
          router.transition('EXIT');
        }
        break;

      case 'TRANSIT':
        if (e.key === 'b' || e.key === 'B') {
          router.transition('BACK_TO_CHART');
        } else if (e.key === 'q' || e.key === 'Q') {
          router.transition('EXIT');
        }
        break;

      case 'INTERPRETATIONS':
        if (e.key === 'b' || e.key === 'B') {
          router.transition('BACK_TO_CHART');
        } else if (e.key === 'q' || e.key === 'Q') {
          router.transition('EXIT');
        }
        break;
    }
  });

  render();
}

// ---------------------------------------------------------------------------
// Screen renderers
// ---------------------------------------------------------------------------

function renderLanding(app: HTMLElement, _router: Router) {
  const lines: string[] = [];
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('                          . . .     . . .     . . .     . . .');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('                                GACHI PACHI');
  lines.push('');
  lines.push('                          natal charts and transits');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('                          . . .     . . .     . . .     . . .');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('                            Press Enter to begin');
  app.textContent = lines.join('\n');
}

function renderPersonSelect(app: HTMLElement, _router: Router, people: Person[]) {
  const state = getState();
  const lines: string[] = [];
  lines.push('  Select a person:\n');

  people.forEach((p, i) => {
    const cursor = i === state.navCursor ? '>' : ' ';
    const views = p.usageCount > 0 ? ` (${p.usageCount} views)` : '';
    lines.push(`  ${cursor} ${i + 1}. ${p.name} - ${p.birthCity}${views}`);
  });

  const newCursor = people.length === state.navCursor ? '>' : ' ';
  lines.push(`\n  ${newCursor} + New person`);
  lines.push('\n  Use arrow keys to select, Enter to confirm');

  app.textContent = lines.join('\n');
}

function selectPerson(person: Person, router: Router) {
  bumpUsage(person.id);
  const chart = calculateChart(person);
  setState({
    activePerson: person,
    chartData: chart,
    navCursor: 0,
  });
  router.transition('PERSON_SELECTED');
}

function renderInterpretations(app: HTMLElement, chartData: ChartData) {
  const lines: string[] = [];
  lines.push(`  Interpretations for ${chartData.person.name}\n`);

  const displayPlanets = chartData.planets.filter(p => DISPLAY_PLANETS.includes(p.planet));

  lines.push('  Planet in Sign');
  lines.push('  --------------');
  for (const p of displayPlanets) {
    const text = getPlanetInSignText(p.planet, p.sign);
    if (text) {
      lines.push(`\n  ${p.planet} in ${p.sign}:`);
      lines.push(`    ${text}`);
    }
  }

  lines.push('\n\n  Planet in House');
  lines.push('  ---------------');
  for (const p of displayPlanets) {
    const text = getPlanetInHouseText(p.planet, p.house);
    if (text) {
      lines.push(`\n  ${p.planet} in House ${p.house}:`);
      lines.push(`    ${text}`);
    }
  }

  lines.push('\n\n  [B] Back to chart');
  app.textContent = lines.join('\n');
}

main().catch(console.error);
