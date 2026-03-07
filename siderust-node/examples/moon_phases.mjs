/**
 * moon_phases.mjs — Moon phase events, illumination periods.
 *
 * Run: node examples/moon_phases.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  Observer,
  moonPhase,
  moonPhaseTopocentric,
  findPhaseEvents,
  moonIlluminationAbove,
  moonIlluminationBelow,
  moonIlluminationRange,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;

// ─── Geocentric phase at J2000 ────────────────────────────────────────────
line('Geocentric Moon phase at J2000');
const ph = moonPhase(J2000);
console.log(`  Phase angle:       ${ph.phaseAngleDeg.toFixed(2)}°`);
console.log(`  Illumination:      ${(ph.illuminatedFraction * 100).toFixed(1)}%`);
console.log(`  Elongation:        ${ph.elongationDeg.toFixed(2)}°`);
console.log(`  Waxing:            ${ph.waxing}`);
console.log(`  Label:             ${ph.label}`);

// ─── Topocentric phase ───────────────────────────────────────────────────
line('Topocentric Moon phase (La Palma)');
const obs = Observer.roqueDeLasMuchachos();
const topo = moonPhaseTopocentric(J2000, obs);
console.log(`  Phase angle:       ${topo.phaseAngleDeg.toFixed(2)}°`);
console.log(`  Illumination:      ${(topo.illuminatedFraction * 100).toFixed(1)}%`);
console.log(`  Label:             ${topo.label}`);

// ─── Phase events over 3 months ──────────────────────────────────────────
line('Lunar phase events (3 months, MJD 60000–60090)');
const events = findPhaseEvents(60000.0, 60090.0);
for (const e of events) {
  console.log(`  ${e.kind.padEnd(14)} MJD ${e.mjd.toFixed(5)}`);
}
console.log(`  (${events.length} events found)`);

// ─── Dark-sky periods (illumination < 30%) ───────────────────────────────
line('Dark-sky periods (illumination < 30%, 1 month)');
const dark = moonIlluminationBelow(60000.0, 60030.0, 0.3);
for (const p of dark) {
  const days = (p.endMjd - p.startMjd).toFixed(1);
  console.log(`  MJD ${p.startMjd.toFixed(3)} → ${p.endMjd.toFixed(3)}  (${days} d)`);
}

// ─── Bright Moon (illumination > 80%) ────────────────────────────────────
line('Bright Moon periods (illumination > 80%, 1 month)');
const bright = moonIlluminationAbove(60000.0, 60030.0, 0.8);
for (const p of bright) {
  const days = (p.endMjd - p.startMjd).toFixed(1);
  console.log(`  MJD ${p.startMjd.toFixed(3)} → ${p.endMjd.toFixed(3)}  (${days} d)`);
}

// ─── First/last quarter range (40%–60%) ──────────────────────────────────
line('Illumination 40%–60% (quarter-phase band)');
const quarter = moonIlluminationRange(60000.0, 60030.0, 0.4, 0.6);
for (const p of quarter) {
  const days = (p.endMjd - p.startMjd).toFixed(1);
  console.log(`  MJD ${p.startMjd.toFixed(3)} → ${p.endMjd.toFixed(3)}  (${days} d)`);
}
