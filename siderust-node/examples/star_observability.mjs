/**
 * star_observability.mjs — Star visibility, culminations, above-threshold periods.
 *
 * Run: node examples/star_observability.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  Observer,
  Star,
  listCatalogStars,
  starAltitudeAt,
  starAzimuthAt,
  starCrossings,
  starCulminations,
  starAboveThreshold,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const obs = Observer.elParanal();
const mjd0 = 60000.0;
const mjd1 = mjd0 + 1; // 1-day window

// ─── Catalog overview ──────────────────────────────────────────────────────
line('Catalog stars');
const names = listCatalogStars();
for (const name of names) {
  const s = Star.catalog(name);
  console.log(
    `  ${s.name.padEnd(11)}  RA ${s.raDeg.toFixed(2).padStart(7)}°  Dec ${s.decDeg.toFixed(2).padStart(7)}°  d=${s.distanceLy.toFixed(1)} ly`,
  );
}

// ─── Sirius observability ──────────────────────────────────────────────────
line('Sirius — instantaneous position');
const sirius = Star.catalog('Sirius');
const alt = starAltitudeAt(sirius, obs, mjd0);
const az = starAzimuthAt(sirius, obs, mjd0);
console.log(`  Altitude: ${alt.toFixed(4)}°   Azimuth: ${az.toFixed(4)}°`);

// ─── Sirius rise / set ─────────────────────────────────────────────────────
line('Sirius rise / set');
const cross = starCrossings(sirius, obs, mjd0, mjd1, 0);
for (const e of cross) {
  console.log(`  ${e.direction.padEnd(7)} MJD ${e.mjd.toFixed(5)}`);
}

// ─── Sirius culminations ──────────────────────────────────────────────────
line('Sirius culminations');
const culm = starCulminations(sirius, obs, mjd0, mjd1);
for (const e of culm) {
  console.log(
    `  ${e.kind.padEnd(3)} alt ${e.altitudeDeg.toFixed(2).padStart(7)}° at MJD ${e.mjd.toFixed(5)}`,
  );
}

// ─── Sirius above 30° ─────────────────────────────────────────────────────
line('Sirius above 30° (good observing)');
const above = starAboveThreshold(sirius, obs, mjd0, mjd1, 30);
for (const p of above) {
  const hours = ((p.endMjd - p.startMjd) * 24).toFixed(1);
  console.log(`  MJD ${p.startMjd.toFixed(5)} → ${p.endMjd.toFixed(5)}  (${hours} h)`);
}

// ─── Custom star ───────────────────────────────────────────────────────────
line('Custom star');
const myStar = new Star('HD 12345', 120, 1.1, 0.95, 0.9, 45.0, 22.0);
console.log(myStar.format());
const myAlt = starAltitudeAt(myStar, obs, mjd0);
console.log(`  Altitude at MJD ${mjd0}: ${myAlt.toFixed(4)}°`);
