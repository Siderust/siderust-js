/**
 * 08_solar_system.mjs — Solar System Module Tour
 *
 * Mirrors: siderust/examples/08_solar_system.rs
 *
 * Demonstrates the planet catalog, VSOP87 ephemerides, center transforms,
 * Moon position, and orbital periods.
 *
 * Run: node examples/08_solar_system.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  getPlanet,
  listBodies,
  vsop87Heliocentric,
  vsop87Barycentric,
  vsop87SunBarycentric,
  vsop87MoonGeocentric,
  transformPositionCenter,
  orbitalPeriodDays,
  cartesianMagnitude,
  cartesianDistance,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;
// Approximate "now" in JD (fixed for reproducible output)
const NOW_JD = 2460400.5;

console.log('=== Siderust Solar System Module Tour ===\n');
console.log(`Epoch used for deterministic outputs: J2000 (JD ${J2000.toFixed(1)})`);
console.log(`Snapshot epoch: JD ${NOW_JD.toFixed(6)}\n`);

// ─── 1) Catalog overview ──────────────────────────────────────────────────
line('1) CATALOG OVERVIEW');
const bodies = listBodies();
console.log(`Available bodies: ${bodies.join(', ')}`);

// ─── 2) Planet constants and periods ──────────────────────────────────────
line('2) PLANET CONSTANTS + ORBITAL PERIODS');
const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
console.log(
  `${'Planet'.padEnd(10)} ${'a [AU]'.padStart(10)} ${'e'.padStart(10)} ${'Period [d]'.padStart(12)}`,
);
console.log('─'.repeat(46));
for (const name of planets) {
  const p = getPlanet(name);
  const period = orbitalPeriodDays(name);
  console.log(
    `${name.padEnd(10)} ${p.semiMajorAxisAu.toFixed(6).padStart(10)} ${p.eccentricity.toFixed(6).padStart(10)} ${period.toFixed(2).padStart(12)}`,
  );
}

// ─── 3) VSOP87 ephemerides ────────────────────────────────────────────────
line('3) VSOP87 EPHEMERIDES (HELIOCENTRIC + BARYCENTRIC)');
const earthH = vsop87Heliocentric('Earth', J2000);
const marsH = vsop87Heliocentric('Mars', J2000);
const earthDist = cartesianMagnitude(earthH.x, earthH.y, earthH.z);
const marsDist = cartesianMagnitude(marsH.x, marsH.y, marsH.z);
const earthMarsDist = cartesianDistance(earthH.x, earthH.y, earthH.z, marsH.x, marsH.y, marsH.z);
const AU_TO_KM = 149597870.7;

console.log(`Earth heliocentric distance: ${earthDist.toFixed(6)} AU`);
console.log(`Mars heliocentric distance:  ${marsDist.toFixed(6)} AU`);
console.log(
  `Earth-Mars separation:       ${earthMarsDist.toFixed(6)} AU (${(earthMarsDist * AU_TO_KM).toFixed(0)} km)`,
);

const sunBary = vsop87SunBarycentric(J2000);
const sunBaryDist = cartesianMagnitude(sunBary.x, sunBary.y, sunBary.z);
console.log(`Sun barycentric offset from SSB: ${sunBaryDist.toFixed(8)} AU`);

// ─── 4) Center transforms ────────────────────────────────────────────────
line('4) CENTER TRANSFORMS (HELIOCENTRIC -> GEOCENTRIC)');
const marsGeo = transformPositionCenter(
  marsH.x,
  marsH.y,
  marsH.z,
  'Heliocentric',
  'Geocentric',
  J2000,
);
const marsGeoDist = cartesianMagnitude(marsGeo.x, marsGeo.y, marsGeo.z);
console.log(`Mars geocentric distance at J2000: ${marsGeoDist.toFixed(6)} AU`);
console.log(`Mars geocentric distance at J2000: ${(marsGeoDist * AU_TO_KM).toFixed(0)} km`);

// ─── 5) Moon + Lagrange points ───────────────────────────────────────────
line('5) MOON');
const moonGeo = vsop87MoonGeocentric(J2000);
const moonDist = cartesianMagnitude(moonGeo.x, moonGeo.y, moonGeo.z);
const moonDistAU = moonDist / AU_TO_KM;
console.log(
  `Moon geocentric distance (ELP2000): ${moonDist.toFixed(1)} km (${moonDistAU.toFixed(6)} AU)`,
);

// ─── 6) Trait-based dispatch ─────────────────────────────────────────────
line('6) HELIOCENTRIC vs BARYCENTRIC DISTANCES');
for (const name of ['Mercury', 'Venus', 'Earth', 'Mars']) {
  const helio = vsop87Heliocentric(name, J2000);
  const bary = vsop87Barycentric(name, J2000);
  const hd = cartesianMagnitude(helio.x, helio.y, helio.z);
  const bd = cartesianMagnitude(bary.x, bary.y, bary.z);
  console.log(
    `${name.padEnd(10)} helio=${hd.toFixed(5).padStart(9)}  bary=${bd.toFixed(5).padStart(9)}`,
  );
}

// ─── 7) Planet builder (JS equivalent) ───────────────────────────────────
line('7) CUSTOM PLANET DATA');
// In JS we can use getPlanet + orbitalPeriodDays; no builder needed
const demo = {
  mass_kg: 5.972e24 * 2.0,
  radius_km: 6371.0 * 1.3,
  semi_major_axis_au: 1.4,
  eccentricity: 0.07,
};
console.log('Custom planet (runtime data):');
console.log(`  mass   = ${demo.mass_kg.toExponential(3)} kg`);
console.log(`  radius = ${demo.radius_km.toFixed(0)} km`);
console.log(`  a      = ${demo.semi_major_axis_au} AU`);
// Kepler's third law for sidereal period: P² = a³ → P = a^(3/2) years → * 365.25 days
const periodDays = Math.pow(demo.semi_major_axis_au, 1.5) * 365.25;
console.log(`  sidereal period ≈ ${periodDays.toFixed(2)} days (Kepler estimate)`);

// ─── 8) Current snapshot ─────────────────────────────────────────────────
line('8) SNAPSHOT');
const earthNow = vsop87Heliocentric('Earth', NOW_JD);
const marsNow = vsop87Heliocentric('Mars', NOW_JD);
const earthNowDist = cartesianMagnitude(earthNow.x, earthNow.y, earthNow.z);
const marsNowDist = cartesianMagnitude(marsNow.x, marsNow.y, marsNow.z);
const marsGeoNow = transformPositionCenter(
  marsNow.x,
  marsNow.y,
  marsNow.z,
  'Heliocentric',
  'Geocentric',
  NOW_JD,
);
const marsGeoNowDist = cartesianMagnitude(marsGeoNow.x, marsGeoNow.y, marsGeoNow.z);

console.log(`Earth-Sun distance: ${earthNowDist.toFixed(6)} AU`);
console.log(`Mars-Sun distance:  ${marsNowDist.toFixed(6)} AU`);
console.log(
  `Mars-Earth distance: ${marsGeoNowDist.toFixed(6)} AU (${(marsGeoNowDist * AU_TO_KM).toFixed(0)} km)`,
);

console.log('\n=== End of example ===');
