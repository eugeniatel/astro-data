// src/main.ts
// Gachi Pachi -- Natal Chart Tool
// Entry point: init WASM, load saved people, mount screen router.

import { initEphemeris } from './engine/ephemeris';
import { calculateChart } from './engine/chart';
import { calculateTransits } from './engine/transits';
import { Router } from './router';
import { getState, setState } from './store/state';
import { loadPeople, bumpUsage, sortByFrequency } from './store/persistence';
import { renderWheelCanvas } from './render/wheel-canvas';
import { renderPlanetTable, renderAspectTable } from './render/tables';
import { renderTransitListHtml, renderTransitPlanets } from './render/transit';
import { createGalaxy } from './ui/galaxy';
import { OnboardingFlow } from './ui/onboarding';
import type { Person, ChartData } from './engine/types';
import { DISPLAY_PLANETS } from './engine/types';
import { getPlanetInSignText, getPlanetInHouseText } from './data/interpretations';
import { longitudeToSign } from './engine/houses';

// Accent color used across landing and chart
const ACCENT = '#6ea8fe';
// const ACCENT_DIM = 'rgba(110, 168, 254, 0.6)';

// ---------------------------------------------------------------------------
// Global styles
// ---------------------------------------------------------------------------
function injectStyles() {
  // Load pixel font for landing title
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #0a0a0a; color: #d0d0d0; overflow-x: hidden; }
    body { font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace; }
    #app { min-height: 100vh; position: relative; }

    /* Landing */
    .landing { position: relative; width: 100%; height: 100vh; display: flex; flex-direction: column;
      justify-content: center; align-items: center; overflow: hidden; cursor: pointer; }
    .landing-text { position: relative; z-index: 1; text-align: center; }
    .landing-title {
      font-family: 'Press Start 2P', 'Silkscreen', monospace;
      font-size: clamp(36px, 6vw, 72px); font-weight: 400; letter-spacing: 0.12em;
      color: #c0d4ff; text-transform: uppercase; line-height: 1;
      text-shadow: 0 0 60px rgba(80, 130, 255, 0.5), 0 0 120px rgba(60, 100, 220, 0.2);
      image-rendering: pixelated;
    }
    .landing-sub { display: none; }
    .landing-prompt {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 16px; color: rgba(200, 200, 200, 0.5); margin-top: 60px;
      letter-spacing: 0.2em; animation: pulse 3s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.85; } }

    /* Chart screen */
    .chart-screen { display: flex; gap: 60px; padding: 24px 40px; min-height: 100vh; align-items: flex-start; justify-content: center; }
    .chart-wheel { flex-shrink: 0; }
    .chart-wheel canvas { max-width: 480px; max-height: 480px; width: 100%; height: auto; }
    .chart-panels { flex: 1; max-width: 420px; display: flex; flex-direction: column; gap: 24px; padding-top: 8px; }

    .big-three-header {
      text-transform: uppercase; line-height: 1.1;
    }
    .big-three-name {
      font-family: 'Press Start 2P', 'Silkscreen', monospace;
      font-size: clamp(16px, 2.5vw, 26px); font-weight: 400; letter-spacing: 0.08em;
      color: ${ACCENT};
      display: block; margin-top: 6px;
    }
    .big-three-prefix { color: #555; font-weight: 400; font-size: 11px; letter-spacing: 0.2em; display: block; }
    .big-three-row { display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: #aaa; }
    .big-three-item { display: flex; flex-direction: column; gap: 2px; }
    .big-three-label { font-size: 10px; color: #555; letter-spacing: 0.15em; text-transform: uppercase; }
    .big-three-value { color: #ccc; font-weight: 600; }

    .data-table { font-size: 12px; line-height: 1.6; }
    .data-table-title { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #555; margin-bottom: 8px; }
    .data-table pre { white-space: pre; font-family: inherit; color: #999; }

    .nav-bar {
      display: flex; gap: 24px; padding: 16px 20px; border-top: 1px solid #1a1a1a;
      font-size: 13px; color: #555; background: #0a0a0a;
      position: sticky; bottom: 0;
    }
    .nav-bar kbd {
      display: inline-block; padding: 1px 6px; border: 1px solid #333; border-radius: 3px;
      color: #888; font-family: inherit; font-size: 12px; margin-right: 4px;
    }
    .nav-bar span:hover { color: ${ACCENT}; cursor: pointer; }

    /* Person select */
    .person-select { padding: 40px; max-width: 500px; }
    .person-select h2 { font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: #555; margin-bottom: 20px; }
    .person-item { padding: 8px 12px; cursor: pointer; border-left: 2px solid transparent; color: #888; font-size: 14px; }
    .person-item.active { border-left-color: ${ACCENT}; color: #ddd; background: rgba(125, 211, 168, 0.05); }
    .person-item .views { color: #444; font-size: 12px; margin-left: 8px; }
    .person-new { padding: 8px 12px; color: #555; font-size: 14px; margin-top: 12px; cursor: pointer; border-left: 2px solid transparent; }
    .person-new.active { border-left-color: ${ACCENT}; color: #aaa; }
    .person-hint { margin-top: 24px; font-size: 12px; color: #333; }

    /* Interpretations */
    .interp-screen { padding: 20px; max-width: 700px; }
    .interp-screen h2 { font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: ${ACCENT}; margin-bottom: 20px; }
    .interp-section { margin-bottom: 24px; }
    .interp-section h3 { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #555; margin-bottom: 12px; }
    .interp-entry { margin-bottom: 12px; }
    .interp-entry .placement { color: #aaa; font-weight: 600; font-size: 13px; }
    .interp-entry .text { color: #666; font-size: 12px; margin-top: 2px; line-height: 1.5; }

    /* Transit screen */
    .transit-screen { padding: 24px 40px; max-width: 800px; }
    .transit-screen pre { white-space: pre; font-family: inherit; font-size: 12px; color: #999; line-height: 1.5; }
    .transit-entry { margin-bottom: 20px; }
    .transit-entry-header { color: #aaa; font-size: 13px; font-weight: 600; }
    .transit-entry-text { color: #777; font-size: 12px; line-height: 1.6; margin-top: 4px; word-wrap: break-word; white-space: normal; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// App initialization
// ---------------------------------------------------------------------------
async function main() {
  injectStyles();
  const app = document.getElementById('app')!;

  // Loading screen
  app.innerHTML = '<div style="padding:40px;color:#333;font-size:13px">Initializing ephemeris...</div>';
  await initEphemeris();

  const router = new Router();
  let galaxyRef: { destroy: () => void } | null = null;
  let onboardingFlow: OnboardingFlow | null = null;

  // Render loop
  function render() {
    const screen = router.screen;
    const state = getState();

    // Clean up galaxy animation when leaving landing
    if (screen !== 'LANDING' && galaxyRef) {
      galaxyRef.destroy();
      galaxyRef = null;
    }
    // Reset onboarding when leaving that screen
    if (screen !== 'ONBOARDING') {
      onboardingFlow = null;
    }

    switch (screen) {
      case 'LANDING':
        showLanding(app);
        galaxyRef = createGalaxy(app.querySelector('.landing')!);
        break;
      case 'PERSON_SELECT':
        showPersonSelect(app, sortByFrequency(loadPeople()));
        break;
      case 'CHART':
        if (state.chartData) showChart(app, state.chartData);
        break;
      case 'TRANSIT':
        if (state.chartData && state.transitData) showTransit(app, state.chartData, state.transitData);
        break;
      case 'INTERPRETATIONS':
        if (state.chartData) showInterpretations(app, state.chartData);
        break;
      case 'ONBOARDING':
        if (!onboardingFlow) {
          onboardingFlow = new OnboardingFlow(
            (person) => {
              // Person created, calculate chart and navigate
              const chart = calculateChart(person);
              setState({ activePerson: person, chartData: chart, navCursor: 0 });
              onboardingFlow = null;
              router.transition('PERSON_SELECTED');
            },
            () => {
              // Cancelled
              onboardingFlow = null;
              router.transition('EXIT');
            },
          );
        }
        showOnboarding(app, onboardingFlow);
        break;
    }
  }

  router.onTransition(render);

  // Global keyboard handler
  document.addEventListener('keydown', (e) => {
    const screen = router.screen;
    const state = getState();

    switch (screen) {
      case 'LANDING':
        if (e.key === 'Enter') {
          const people = sortByFrequency(loadPeople());
          if (people.length > 0) {
            router.setScreen('PERSON_SELECT');
            render();
          } else {
            router.transition('ENTER');
          }
        }
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
      case 'INTERPRETATIONS':
        if (e.key === 'b' || e.key === 'B') router.transition('BACK_TO_CHART');
        else if (e.key === 'q' || e.key === 'Q') router.transition('EXIT');
        break;

      case 'ONBOARDING':
        if (onboardingFlow) {
          const handled = onboardingFlow.handleKey(e);
          if (handled) render();
        }
        break;
    }
  });

  render();
}

// ---------------------------------------------------------------------------
// Landing screen
// ---------------------------------------------------------------------------
function showLanding(app: HTMLElement) {
  app.innerHTML = `
    <div class="landing" id="landing-tap">
      <div class="landing-text">
        <div class="landing-title">ASTRODATA</div>
        <div class="landing-sub">natal charts and transits</div>
        <div class="landing-prompt">press enter</div>
      </div>
    </div>
  `;
  // Tap/click anywhere on landing to proceed (mobile support)
  document.getElementById('landing-tap')?.addEventListener('click', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  });
}

// ---------------------------------------------------------------------------
// Person select screen
// ---------------------------------------------------------------------------
function showPersonSelect(app: HTMLElement, people: Person[]) {
  const state = getState();
  let items = '';
  people.forEach((p, i) => {
    const active = i === state.navCursor ? ' active' : '';
    const views = p.usageCount > 0 ? `<span class="views">${p.usageCount} views</span>` : '';
    items += `<div class="person-item${active}">${i + 1}. ${p.name} &mdash; ${p.birthCity}${views}</div>`;
  });
  const newActive = people.length === state.navCursor ? ' active' : '';

  app.innerHTML = `
    <div class="person-select">
      <h2>Select a person</h2>
      ${items}
      <div class="person-new${newActive}">+ New person</div>
      <div class="person-hint">Arrow keys to navigate, Enter to select</div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Chart screen
// ---------------------------------------------------------------------------
function showChart(app: HTMLElement, chartData: ChartData) {
  const planetTable = renderPlanetTable(chartData);
  const aspectTable = renderAspectTable(chartData);

  const sun = chartData.planets.find(p => p.planet === 'Sun');
  const moon = chartData.planets.find(p => p.planet === 'Moon');
  const { sign: ascSign } = longitudeToSign(chartData.ascendant);

  app.innerHTML = `
    <div class="chart-screen">
      <div class="chart-wheel" id="wheel-container"></div>
      <div class="chart-panels">
        <div>
          <div class="big-three-header">
            <span class="big-three-prefix">this is</span>
            <span class="big-three-name">${chartData.person.name}</span>
          </div>
          <div class="big-three-row">
            <div class="big-three-item">
              <span class="big-three-label">Sun</span>
              <span class="big-three-value">${sun?.sign ?? ''}</span>
            </div>
            <div class="big-three-item">
              <span class="big-three-label">Moon</span>
              <span class="big-three-value">${moon?.sign ?? ''}</span>
            </div>
            <div class="big-three-item">
              <span class="big-three-label">Ascendant</span>
              <span class="big-three-value">${ascSign}</span>
            </div>
          </div>
        </div>
        <div class="data-table">
          <div class="data-table-title">Planets</div>
          <pre>${planetTable}</pre>
        </div>
        <div class="data-table">
          <div class="data-table-title">Aspects</div>
          <pre>${aspectTable}</pre>
        </div>
      </div>
    </div>
    <div class="nav-bar">
      <span><kbd>T</kbd> Transits</span>
      <span><kbd>I</kbd> Interpretations</span>
      <span><kbd>N</kbd> New person</span>
      <span><kbd>Q</kbd> Exit</span>
    </div>
  `;

  // Mount canvas wheel
  const container = document.getElementById('wheel-container')!;
  const wheelCanvas = renderWheelCanvas(chartData, 480);
  container.appendChild(wheelCanvas);
}

// ---------------------------------------------------------------------------
// Transit screen
// ---------------------------------------------------------------------------
function showTransit(app: HTMLElement, chartData: ChartData, transitData: import('./engine/transits').TransitData) {
  const positions = renderTransitPlanets(transitData);
  const transitHtml = renderTransitListHtml(transitData);

  app.innerHTML = `
    <div class="transit-screen">
      <div class="big-three-header" style="margin-bottom:20px">
        <span class="big-three-prefix">transits for</span>
        <span class="big-three-name">${chartData.person.name}</span>
      </div>
      <div style="color:#555;font-size:13px;margin-bottom:24px">Date: ${transitData.date}</div>
      <pre>${positions}</pre>
      <div style="margin-top:32px">
        <div class="data-table-title">Active Transits</div>
        ${transitHtml}
      </div>
    </div>
    <div class="nav-bar">
      <span><kbd>B</kbd> Back to chart</span>
      <span><kbd>Q</kbd> Exit</span>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Interpretations screen
// ---------------------------------------------------------------------------
function showInterpretations(app: HTMLElement, chartData: ChartData) {
  const displayPlanets = chartData.planets.filter(p => DISPLAY_PLANETS.includes(p.planet));

  let signEntries = '';
  for (const p of displayPlanets) {
    const text = getPlanetInSignText(p.planet, p.sign);
    if (text) {
      signEntries += `<div class="interp-entry"><div class="placement">${p.planet} in ${p.sign}</div><div class="text">${text}</div></div>`;
    }
  }

  let houseEntries = '';
  for (const p of displayPlanets) {
    const text = getPlanetInHouseText(p.planet, p.house);
    if (text) {
      houseEntries += `<div class="interp-entry"><div class="placement">${p.planet} in House ${p.house}</div><div class="text">${text}</div></div>`;
    }
  }

  app.innerHTML = `
    <div class="interp-screen">
      <h2>Interpretations for <span style="color:${ACCENT}">${chartData.person.name}</span></h2>
      <div class="interp-section">
        <h3>Planet in Sign</h3>
        ${signEntries}
      </div>
      <div class="interp-section">
        <h3>Planet in House</h3>
        ${houseEntries}
      </div>
    </div>
    <div class="nav-bar">
      <span><kbd>B</kbd> Back to chart</span>
      <span><kbd>Q</kbd> Exit</span>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Onboarding screen
// ---------------------------------------------------------------------------
function showOnboarding(app: HTMLElement, flow: OnboardingFlow) {
  const content = flow.render();
  app.innerHTML = `
    <div class="person-select" style="max-width:600px">
      <h2>New person</h2>
      <pre style="font-family:inherit;font-size:14px;color:#aaa;line-height:2">${content}</pre>
      <div class="person-hint" style="margin-top:32px">Esc to cancel</div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function selectPerson(person: Person, router: Router) {
  bumpUsage(person.id);
  const chart = calculateChart(person);
  setState({ activePerson: person, chartData: chart, navCursor: 0 });
  router.transition('PERSON_SELECTED');
}

main().catch(console.error);
