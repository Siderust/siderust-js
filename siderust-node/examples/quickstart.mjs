/**
 * quickstart.mjs — Observer setup, Sun rise/set, star altitude.
 *
 * Run: node examples/quickstart.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  version,
  Observer,
  Star,
  listBodies,
  listCatalogStars,
  bodyAltitudeAt,
  bodyCrossings,
  starAltitudeAt,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(label ? `─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56));

// ─── Version ──────────────────────────────────────────────────────────────
line('Version');
console.log(`siderust-node v${version()}`);

// ─── Observer ─────────────────────────────────────────────────────────────
line('Observer');
const obs = Observer.roqueDeLasMuchachos();
console.log(obs.format());
console.log(`  lon: ${obs.lonDeg.toFixed(4)}°  lat: ${obs.latDeg.toFixed(4)}°  height: ${obs.heightM} m`);

const custom = new Observer(-3.7038, 40.4168, 650);   // Madrid
console.log(`\nCustom observer: ${custom.format()}`);

// ─── Available bodies & stars ──────────────────────────────────────────────
line('Available bodies');
console.log(`Bodies: ${listBodies().join(', ')}`);
console.log(`Catalog stars: ${listCatalogStars().join(', ')}`);

// ─── Sun altitude ─────────────────────────────────────────────────────────
line('Sun altitude (single instant)');
const mjd = 60000.0;  // 2023-02-25
const alt = bodyAltitudeAt('Sun', obs, mjd);
console.log(`Sun altitude at MJD ${mjd}: ${alt.toFixed(4)}°`);

// ─── Sun rise / set ───────────────────────────────────────────────────────
line('Sun rise & set');
const events = bodyCrossings('Sun', obs, mjd, mjd + 1, 0);
for (const e of events) {
  console.log(`  ${e.direction.padEnd(7)} at MJD ${e.mjd.toFixed(5)}`);
}

// ─── Star altitude ────────────────────────────────────────────────────────
line('Star altitude');
const vega = Star.catalog('Vega');
console.log(`${vega.name}: RA ${vega.raDeg.toFixed(4)}°  Dec ${vega.decDeg.toFixed(4)}°`);
const starAlt = starAltitudeAt(vega, obs, mjd);
console.log(`Altitude at MJD ${mjd}: ${starAlt.toFixed(4)}°`);
