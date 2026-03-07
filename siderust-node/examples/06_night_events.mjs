/**
 * 06_night_events.mjs — Night Events Example
 *
 * Mirrors: siderust/examples/06_night_events.rs
 *
 * Shows night-type crossing events and night periods using civil,
 * nautical, astronomical, and horizon thresholds over a one-week window.
 *
 * Run: node examples/06_night_events.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  Observer,
  bodyCrossings,
  bodyBelowThreshold,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

// ── Setup ──
// Default: Greenwich, 2023-02-25, 1 week
const obs = new Observer(0.0, 51.4769, 0.0); // lon, lat, height
const mjd0 = 60000.0; // 2023-02-25
const mjd1 = mjd0 + 7; // 1 week

// Night-type thresholds (matching twilight definitions)
const nightTypes = [
  { name: 'Horizon',            threshold:   0.0 },
  { name: 'Apparent Horizon',   threshold:  -0.833 },  // refraction-corrected
  { name: 'Civil',              threshold:  -6.0 },
  { name: 'Nautical',           threshold: -12.0 },
  { name: 'Astronomical',       threshold: -18.0 },
];

console.log('Night events over one week');
console.log('==========================');
console.log(`Site: lat=${obs.latDeg.toFixed(4)}° lon=${obs.lonDeg.toFixed(4)}° height=${obs.heightM} m`);
console.log(`Week start: MJD ${mjd0}\n`);

// ── 1) Night-type crossing events ──
line('1) Night-type crossing events');
for (const { name, threshold } of nightTypes) {
  const events = bodyCrossings('Sun', obs, mjd0, mjd1, threshold);
  let downs = 0;
  let raises = 0;

  console.log(`${name.padEnd(18)} threshold ${threshold.toFixed(3).padStart(8)}° -> ${String(events.length).padStart(2)} crossing(s)`);

  for (const ev of events) {
    if (ev.direction === 'setting') {
      downs++;
      console.log(`  - night-type down (Sun setting below threshold) at MJD ${ev.mjd.toFixed(5)}`);
    } else {
      raises++;
      console.log(`  - night-type raise (Sun rising above threshold) at MJD ${ev.mjd.toFixed(5)}`);
    }
  }
  console.log(`  summary: down=${downs} raise=${raises}`);
}

// ── 2) Night periods per night type ──
line('2) Night periods per night type');
for (const { name, threshold } of nightTypes) {
  const periods = bodyBelowThreshold('Sun', obs, mjd0, mjd1, threshold);
  console.log(`${name.padEnd(18)} night periods (Sun < ${threshold}°): ${periods.length}`);
  for (const p of periods) {
    const hours = ((p.endMjd - p.startMjd) * 24).toFixed(1);
    console.log(`  - MJD ${p.startMjd.toFixed(5)} -> ${p.endMjd.toFixed(5)} (${hours} h)`);
  }
}
