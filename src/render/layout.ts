// src/render/layout.ts
// Split-panel layout compositor.
// Combines wheel (left) with text panels (right) into a single terminal output.

import type { ChartData } from '../engine/types';
import { renderWheel } from './wheel';
import { renderBigThree, renderPlanetTable, renderAspectTable } from './tables';

// ---------------------------------------------------------------------------
// Split layout: wheel on left, panels on right
// ---------------------------------------------------------------------------
export function renderNatalChart(chartData: ChartData): string {
  // Render the wheel as lines
  const wheelGrid = renderWheel(chartData);
  const wheelLines = wheelGrid.map(row => row.join(''));

  // Render text panels
  const bigThree = renderBigThree(chartData);
  const planetTable = renderPlanetTable(chartData);
  const aspectTable = renderAspectTable(chartData);

  // Combine panels with spacing
  const rightPanel = [bigThree, '', planetTable, '', aspectTable].join('\n');
  const rightLines = rightPanel.split('\n');

  // Determine max height
  const maxLines = Math.max(wheelLines.length, rightLines.length);

  // Pad both sides to same height
  const wheelWidth = wheelLines[0]?.length ?? 0;
  const separator = '  ';

  const combined: string[] = [];
  for (let i = 0; i < maxLines; i++) {
    const left = (wheelLines[i] ?? '').padEnd(wheelWidth);
    const right = rightLines[i] ?? '';
    combined.push(left + separator + right);
  }

  return combined.join('\n');
}
