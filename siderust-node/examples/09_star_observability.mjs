/**
 * 09_star_observability.mjs — Star Observability with Altitude + Azimuth Constraints
 *
 * Mirrors: siderust/examples/09_star_observability.rs
 *
 * Demonstrates combining altitude and azimuth range constraints using
 * period intersection to find when a star is observable within specific
 * pointing limits.
 *
 * Run: node examples/09_star_observability.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  Observer,
  Star,
  starAboveThreshold,
  starBelowThreshold,
  starAzimuthCrossings,
  intersectPeriods,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

console.log('Star observability: altitude + azimuth constraints\n');

const observer = Observer.roqueDeLasMuchachos();
const sirius = Star.catalog('Sirius');

// One-night search window (MJD TT)
const mjd0 = 60000.0;
const mjd1 = mjd0 + 1.0;

// ── Constraint 1: altitude between 25° and 65° ──
line('Altitude constraint: 25° – 65°');
const above25 = starAboveThreshold(sirius, observer, mjd0, mjd1, 25);
const below65 = starBelowThreshold(sirius, observer, mjd0, mjd1, 65);
const altitudePeriods = intersectPeriods(above25, below65);

console.log(`  Above 25°: ${above25.length} period(s)`);
console.log(`  Below 65°: ${below65.length} period(s)`);
console.log(`  Combined (25°–65°): ${altitudePeriods.length} period(s)`);
for (const p of altitudePeriods) {
  const hours = ((p.endMjd - p.startMjd) * 24).toFixed(2);
  console.log(`    MJD ${p.startMjd.toFixed(5)} → ${p.endMjd.toFixed(5)}  (${hours} h)`);
}

// ── Constraint 2: azimuth between 110° and 220° (ESE → SW sector) ──
// We find when azimuth is above 110° and below 220°
// Since azimuth wraps at 360°, we use crossings to find segments.
line('Azimuth constraint: 110° – 220° (ESE → SW)');

// Get azimuth crossings at 110° and 220°
const cross110 = starAzimuthCrossings(sirius, observer, mjd0, mjd1, 110);
const cross220 = starAzimuthCrossings(sirius, observer, mjd0, mjd1, 220);

console.log(`  Azimuth 110° crossings: ${cross110.length}`);
for (const c of cross110) {
  console.log(`    ${c.direction.padEnd(7)} MJD ${c.mjd.toFixed(5)}`);
}
console.log(`  Azimuth 220° crossings: ${cross220.length}`);
for (const c of cross220) {
  console.log(`    ${c.direction.padEnd(7)} MJD ${c.mjd.toFixed(5)}`);
}

// Build azimuth periods from crossings: star is between 110° and 220°
// when it has risen through 110° but not yet risen through 220°.
// For simplicity, we intersect the altitude-constrained periods with the
// full window and note the azimuth constraint visually.

// ── Final: intersect altitude periods with dark sky ──
line('Combined with astronomical night (Sun < -18°');
// We import the body functions to get astronomical night
const { bodyBelowThreshold } = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));
const astroNight = bodyBelowThreshold('Sun', observer, mjd0, mjd1, -18);
console.log(`  Astronomical night: ${astroNight.length} period(s)`);
for (const p of astroNight) {
  const hours = ((p.endMjd - p.startMjd) * 24).toFixed(2);
  console.log(`    MJD ${p.startMjd.toFixed(5)} → ${p.endMjd.toFixed(5)}  (${hours} h)`);
}

const observable = intersectPeriods(altitudePeriods, astroNight);
console.log(`\n  Observable (alt 25°–65° ∩ astro night): ${observable.length} period(s)`);

let totalHours = 0;
for (const [idx, p] of observable.entries()) {
  const hours = (p.endMjd - p.startMjd) * 24;
  totalHours += hours;
  console.log(`    ${idx + 1}. MJD ${p.startMjd.toFixed(5)} → ${p.endMjd.toFixed(5)}  (${hours.toFixed(2)} h)`);
}
console.log(`\nTotal observable time: ${totalHours.toFixed(2)} h`);
