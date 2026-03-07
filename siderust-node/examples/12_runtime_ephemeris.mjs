/**
 * 12_runtime_ephemeris.mjs — Runtime Ephemeris & VSOP87 Backend Tour
 *
 * Mirrors: siderust/examples/12_runtime_ephemeris.rs
 *
 * The Rust example shows loading JPL DE4xx/441 BSP files at runtime via
 * `RuntimeEphemeris` and an optional `DataManager`.  BSP parsing is not
 * exposed through the NAPI bindings, so this JS example takes a different
 * angle:
 *
 *   - Uses the built-in VSOP87 backend (always available, no extra files)
 *     as the "runtime ephemeris" and tours its capabilities.
 *   - Compares heliocentric vs barycentric positions for all planets.
 *   - Evaluates position drift across centuries to show VSOP87's validity
 *     range and inherent precision.
 *   - Shows how loaded data could feed back into siderust via
 *     `transformPositionCenter` / `transformPositionFrame`.
 *
 * Run: node examples/12_runtime_ephemeris.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const siderust = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const {
  vsop87Heliocentric,
  vsop87Barycentric,
  vsop87SunBarycentric,
  vsop87EarthHeliocentric,
  vsop87EarthBarycentric,
  vsop87MoonGeocentric,
  transformPositionCenter,
  transformPositionFrame,
  cartesianMagnitude,
  cartesianDistance,
  version,
} = siderust;

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;
const JULIAN_YEAR = 365.25;
const AU_TO_KM = 149_597_870.7;

console.log('╔══════════════════════════════════════════════════╗');
console.log('║     Siderust Runtime Ephemeris Example (JS)      ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log(`\nsiderust-node version: ${version()}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 1) Built-in VSOP87 backend — positions at J2000
// ═══════════════════════════════════════════════════════════════════════════
line('1) Built-in VSOP87 — positions at J2000');

const sun = vsop87SunBarycentric(J2000);
const earthBary = vsop87EarthBarycentric(J2000);
const earthHelio = vsop87EarthHeliocentric(J2000);
const moon = vsop87MoonGeocentric(J2000);

const fmt = (pos, unit = 'AU') =>
  `(${pos.x.toFixed(6)}, ${pos.y.toFixed(6)}, ${pos.z.toFixed(6)}) ${unit}`;

console.log(`  Sun  (bary):  ${fmt(sun)}`);
console.log(`  Earth (bary): ${fmt(earthBary)}`);
console.log(`  Earth (helio):${fmt(earthHelio)}`);
console.log(`  Moon  (geo):  ${fmt(moon, 'km')}`);

// ═══════════════════════════════════════════════════════════════════════════
// 2) All planets — heliocentric vs barycentric at J2000
// ═══════════════════════════════════════════════════════════════════════════
line('2) Heliocentric vs Barycentric positions');

const PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

console.log(
  `  ${'Planet'.padEnd(10)} ${'r_helio [AU]'.padStart(14)} ${'r_bary [AU]'.padStart(14)} ${'Δ [km]'.padStart(14)}`,
);
console.log('  ' + '─'.repeat(54));

for (const name of PLANETS) {
  const helio = name === 'Earth' ? vsop87EarthHeliocentric(J2000) : vsop87Heliocentric(name, J2000);
  const bary = name === 'Earth' ? vsop87EarthBarycentric(J2000) : vsop87Barycentric(name, J2000);
  const rh = cartesianMagnitude(helio.x, helio.y, helio.z);
  const rb = cartesianMagnitude(bary.x, bary.y, bary.z);
  const diff = cartesianDistance(helio.x, helio.y, helio.z, bary.x, bary.y, bary.z);
  console.log(
    `  ${name.padEnd(10)} ${rh.toFixed(6).padStart(14)} ${rb.toFixed(6).padStart(14)} ${(diff * AU_TO_KM).toFixed(0).padStart(14)}`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3) Frame and center transforms (the user pipeline)
// ═══════════════════════════════════════════════════════════════════════════
line('3) Runtime pipeline: fetch → transform center → transform frame');

const marsHelio = vsop87Heliocentric('Mars', J2000);
console.log(`  Mars heliocentric ecliptic:  ${fmt(marsHelio)}`);

const marsGeo = transformPositionCenter(
  marsHelio.x,
  marsHelio.y,
  marsHelio.z,
  'Heliocentric',
  'Geocentric',
  J2000,
);
console.log(`  Mars geocentric ecliptic:    ${fmt(marsGeo)}`);

const marsGeoEq = transformPositionFrame(
  marsGeo.x,
  marsGeo.y,
  marsGeo.z,
  'EclipticMeanJ2000',
  'EquatorialMeanJ2000',
  J2000,
);
console.log(`  Mars geocentric equatorial:  ${fmt(marsGeoEq)}`);

const marsGeoIcrs = transformPositionFrame(
  marsGeo.x,
  marsGeo.y,
  marsGeo.z,
  'EclipticMeanJ2000',
  'ICRS',
  J2000,
);
console.log(`  Mars geocentric ICRS:        ${fmt(marsGeoIcrs)}`);

// ═══════════════════════════════════════════════════════════════════════════
// 4) VSOP87 validity & precision across epochs
// ═══════════════════════════════════════════════════════════════════════════
line('4) VSOP87 position drift across centuries');

console.log('  Evaluating Mars heliocentric distance over ±40 centuries from J2000...\n');
console.log(`  ${'Epoch'.padEnd(24)} ${'JD'.padStart(14)} ${'r [AU]'.padStart(14)}`);
console.log('  ' + '─'.repeat(52));

const offsets = [-4000, -2000, -1000, -100, 0, 100, 1000, 2000, 4000];
for (const years of offsets) {
  const jd = J2000 + years * JULIAN_YEAR;
  const pos = vsop87Heliocentric('Mars', jd);
  const r = cartesianMagnitude(pos.x, pos.y, pos.z);
  const label = years === 0 ? 'J2000.0' : `J2000 ${years > 0 ? '+' : ''}${years} yr`;
  console.log(`  ${label.padEnd(24)} ${jd.toFixed(1).padStart(14)} ${r.toFixed(6).padStart(14)}`);
}

console.log('\n  Note: VSOP87 truncated series are optimised for the interval');
console.log('  ±4000 years from J2000.  Results far from that range may drift.');

// ═══════════════════════════════════════════════════════════════════════════
// 5) Moon position across epochs
// ═══════════════════════════════════════════════════════════════════════════
line('5) Moon geocentric distance over one synodic month');

console.log(`  ${'Day'.padEnd(8)} ${'Distance [km]'.padStart(14)} ${'Distance [AU]'.padStart(14)}`);
console.log('  ' + '─'.repeat(36));

const SYNODIC_MONTH = 29.53059;
const moonSteps = 15;
for (let i = 0; i <= moonSteps; i++) {
  const day = (i / moonSteps) * SYNODIC_MONTH;
  const jd = J2000 + day;
  const pos = vsop87MoonGeocentric(jd);
  const r = cartesianMagnitude(pos.x, pos.y, pos.z);
  console.log(
    `  ${day.toFixed(2).padEnd(8)} ${r.toFixed(1).padStart(14)} ${(r / AU_TO_KM).toFixed(6).padStart(14)}`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6) What runtime ephemeris (BSP) would add
// ═══════════════════════════════════════════════════════════════════════════
line('6) Beyond VSOP87 — runtime BSP loading (Rust only, for now)');

console.log(`
  The Rust API provides RuntimeEphemeris for loading JPL DE4xx/441 BSP files:

    RuntimeEphemeris.from_bsp("/path/to/de440.bsp")
    RuntimeEphemeris.from_bytes(buffer)
    RuntimeEphemeris.from_data_manager(dm, DatasetId.De441)

  This gives higher-precision Chebyshev-interpolated positions and:
    • Sun, Earth, Moon barycentric/heliocentric/geocentric positions
    • Earth barycentric velocity
    • DataManager for automatic download + caching of ~120 MB (DE440)
      or ~1.65 GB (DE441) datasets

  These features are not yet exposed to JavaScript, but the VSOP87
  backend (used throughout this example) is already available and
  provides sub-arcsecond precision for the inner planets across
  several millennia.

  For applications requiring higher precision (e.g. spacecraft navigation),
  the Rust runtime ephemeris can be extended to NAPI in the future.
`);

console.log('Done.');
