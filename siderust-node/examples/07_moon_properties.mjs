/**
 * 07_moon_properties.mjs — Moon Phase Properties Example
 *
 * Mirrors: siderust/examples/07_moon_properties.rs
 *
 * Shows geocentric and topocentric Moon phase properties, principal phase
 * events, and illumination-range searches.
 *
 * Run: node examples/07_moon_properties.mjs
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
  moonIlluminationRange,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

// ── Setup ──
const obs = Observer.roqueDeLasMuchachos();
const J2000 = 2451545.0;
const mjd0 = 60000.0;
const mjd35 = mjd0 + 35; // ~5 weeks

console.log(`Moon phase at J2000 (JD ${J2000.toFixed(1)})`);
console.log('==================================');
console.log(`Site: ${obs.format()}`);

// ── 1) Point-in-time phase properties ──
line('Geocentric');
const geo = moonPhase(J2000);
console.log(`  label                 : ${geo.label}`);
console.log(`  illuminated fraction  : ${geo.illuminatedFraction.toFixed(4)}`);
console.log(`  illuminated percent   : ${(geo.illuminatedFraction * 100).toFixed(2)} %`);
console.log(`  phase angle           : ${geo.phaseAngleDeg.toFixed(4)}°`);
console.log(`  elongation            : ${geo.elongationDeg.toFixed(4)}°`);
console.log(`  waxing                : ${geo.waxing}`);

line('Topocentric');
const topo = moonPhaseTopocentric(J2000, obs);
console.log(`  label                 : ${topo.label}`);
console.log(`  illuminated fraction  : ${topo.illuminatedFraction.toFixed(4)}`);
console.log(`  illumination delta    : ${((topo.illuminatedFraction - geo.illuminatedFraction) * 100).toFixed(4)} %`);
console.log(`  elongation            : ${topo.elongationDeg.toFixed(4)}°`);

// ── 2) Principal phase events ──
line('Principal phase events (35 days)');
const events = findPhaseEvents(mjd0, mjd35);
console.log(`Found ${events.length} events:`);
for (const ev of events) {
  console.log(`  - ${ev.kind.padEnd(14)} at MJD ${ev.mjd.toFixed(5)}`);
}

// ── 3) Illumination range searches ──
function printPeriods(label, periods) {
  console.log(`\n${label}: ${periods.length} period(s)`);
  for (const p of periods) {
    const hours = ((p.endMjd - p.startMjd) * 24).toFixed(1);
    console.log(`  - MJD ${p.startMjd.toFixed(3)} → ${p.endMjd.toFixed(3)} (${hours} h)`);
  }
}

line('Illumination range searches (35 days)');
const crescent = moonIlluminationRange(mjd0, mjd35, 0.05, 0.35);
printPeriods('Crescent-like range (5%–35%)', crescent);

const quarterish = moonIlluminationRange(mjd0, mjd35, 0.45, 0.55);
printPeriods('Quarter-like range (45%–55%)', quarterish);

const gibbous = moonIlluminationRange(mjd0, mjd35, 0.65, 0.95);
printPeriods('Gibbous-like range (65%–95%)', gibbous);
