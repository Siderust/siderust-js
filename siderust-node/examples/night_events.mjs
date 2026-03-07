/**
 * night_events.mjs — Astronomical twilight, body visibility windows.
 *
 * Demonstrates finding twilight boundaries, body culminations,
 * and above/below-threshold periods over a multi-day window.
 *
 * Run: node examples/night_events.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  Observer,
  bodyCrossings,
  bodyCulminations,
  bodyAboveThreshold,
  bodyBelowThreshold,
  bodyAzimuthCrossings,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const obs = Observer.roqueDeLasMuchachos(); // La Palma
const mjd0 = 60000.0; // 2023-02-25
const mjd1 = mjd0 + 3; // 3-day window

// ─── Sunrise / Sunset (horizon crossings, 0°) ────────────────────────────
line('Sun horizon crossings (3 days)');
const sunCross = bodyCrossings('Sun', obs, mjd0, mjd1, 0);
for (const e of sunCross) {
  console.log(`  ${e.direction.padEnd(7)} MJD ${e.mjd.toFixed(5)}`);
}

// ─── Civil twilight (−6°) ─────────────────────────────────────────────────
line('Civil twilight crossings');
const civil = bodyCrossings('Sun', obs, mjd0, mjd1, -6);
for (const e of civil) {
  console.log(`  ${e.direction.padEnd(7)} MJD ${e.mjd.toFixed(5)}`);
}

// ─── Astronomical twilight (−18°) ─────────────────────────────────────────
line('Astronomical twilight crossings');
const astro = bodyCrossings('Sun', obs, mjd0, mjd1, -18);
for (const e of astro) {
  console.log(`  ${e.direction.padEnd(7)} MJD ${e.mjd.toFixed(5)}`);
}

// ─── Sun culminations ─────────────────────────────────────────────────────
line('Sun culminations (upper / lower transit)');
const culm = bodyCulminations('Sun', obs, mjd0, mjd1);
for (const e of culm) {
  console.log(
    `  ${e.kind.padEnd(3)} alt ${e.altitudeDeg.toFixed(2).padStart(7)}° at MJD ${e.mjd.toFixed(5)}`,
  );
}

// ─── Moon above 15° ───────────────────────────────────────────────────────
line('Moon above 15° (observable periods)');
const moonAbove = bodyAboveThreshold('Moon', obs, mjd0, mjd1, 15);
for (const p of moonAbove) {
  const hours = ((p.endMjd - p.startMjd) * 24).toFixed(1);
  console.log(`  MJD ${p.startMjd.toFixed(5)} → ${p.endMjd.toFixed(5)}  (${hours} h)`);
}

// ─── Mars below horizon ──────────────────────────────────────────────────
line('Mars below horizon');
const marsBelow = bodyBelowThreshold('Mars', obs, mjd0, mjd1, 0);
for (const p of marsBelow) {
  const hours = ((p.endMjd - p.startMjd) * 24).toFixed(1);
  console.log(`  MJD ${p.startMjd.toFixed(5)} → ${p.endMjd.toFixed(5)}  (${hours} h)`);
}

// ─── Jupiter due-south passages ───────────────────────────────────────────
line('Jupiter azimuth 180° crossings (due south)');
const jupSouth = bodyAzimuthCrossings('Jupiter', obs, mjd0, mjd1, 180);
for (const e of jupSouth) {
  console.log(`  ${e.direction.padEnd(7)} MJD ${e.mjd.toFixed(5)}`);
}
