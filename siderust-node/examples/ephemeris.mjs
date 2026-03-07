/**
 * ephemeris.mjs — VSOP87 planet positions and coordinate transforms.
 *
 * Demonstrates heliocentric and barycentric ephemeris queries, the Moon's
 * geocentric position, and celestial frame transformations.
 *
 * Run: node examples/ephemeris.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  Observer,
  getPlanet,
  vsop87Heliocentric,
  vsop87SunBarycentric,
  vsop87EarthBarycentric,
  vsop87EarthHeliocentric,
  vsop87MoonGeocentric,
  transformDirection,
  directionToHorizontal,
  geodeticToEcef,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;
const fmt = (v) => v.toExponential(6);

// ─── Planet data ──────────────────────────────────────────────────────────
line('Planet data');
for (const name of ['Mars', 'Jupiter', 'Saturn']) {
  const p = getPlanet(name);
  console.log(
    `  ${p.name}: a=${p.semiMajorAxisAu.toFixed(4)} AU  e=${p.eccentricity.toFixed(4)}  R=${p.radiusKm.toFixed(0)} km`,
  );
}

// ─── Heliocentric positions at J2000 ──────────────────────────────────────
line('Heliocentric ecliptic (VSOP87a) at J2000');
for (const body of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
  const p = vsop87Heliocentric(body, J2000);
  console.log(
    `  ${body.padEnd(8)} x=${fmt(p.x)}  y=${fmt(p.y)}  z=${fmt(p.z)}  [${p.frame}, ${p.center}]`,
  );
}

// ─── Barycentric positions ────────────────────────────────────────────────
line('Barycentric ecliptic (VSOP87e) at J2000');
const sun = vsop87SunBarycentric(J2000);
console.log(`  Sun      x=${fmt(sun.x)}  y=${fmt(sun.y)}  z=${fmt(sun.z)}`);
const earth = vsop87EarthBarycentric(J2000);
console.log(`  Earth    x=${fmt(earth.x)}  y=${fmt(earth.y)}  z=${fmt(earth.z)}`);

// ─── Earth heliocentric ───────────────────────────────────────────────────
line('Earth heliocentric at J2000');
const earthH = vsop87EarthHeliocentric(J2000);
console.log(`  x=${fmt(earthH.x)}  y=${fmt(earthH.y)}  z=${fmt(earthH.z)}`);

// ─── Moon geocentric ─────────────────────────────────────────────────────
line('Moon geocentric (ELP2000) at J2000');
const moon = vsop87MoonGeocentric(J2000);
console.log(`  x=${moon.x.toFixed(1)} km  y=${moon.y.toFixed(1)} km  z=${moon.z.toFixed(1)} km`);
console.log(`  frame: ${moon.frame}  center: ${moon.center}`);

// ─── Coordinate transforms ───────────────────────────────────────────────
line('Coordinate frame transforms');
// Vega approximate ICRS coordinates: RA 279.23° Dec 38.78°
const ecliptic = transformDirection(38.78, 279.23, 'ICRS', 'EclipticMeanJ2000', J2000);
console.log(
  `  ICRS → Ecliptic: polar=${ecliptic.polarDeg.toFixed(4)}°  azimuth=${ecliptic.azimuthDeg.toFixed(4)}°`,
);

const back = transformDirection(
  ecliptic.polarDeg,
  ecliptic.azimuthDeg,
  'EclipticMeanJ2000',
  'ICRS',
  J2000,
);
console.log(
  `  Ecliptic → ICRS: polar=${back.polarDeg.toFixed(4)}°  azimuth=${back.azimuthDeg.toFixed(4)}°  (round-trip)`,
);

// ─── Horizontal conversion ───────────────────────────────────────────────
line('Direction to Horizontal');
const obs = Observer.roqueDeLasMuchachos();
const jdNow = 2460400.5; // approximate 2024-04
const horiz = directionToHorizontal(38.78, 279.23, 'ICRS', jdNow, obs);
console.log(`  Altitude: ${horiz.polarDeg.toFixed(4)}°  Azimuth: ${horiz.azimuthDeg.toFixed(4)}°`);

// ─── Geodetic → ECEF ──────────────────────────────────────────────────────
line('Geodetic → ECEF');
const ecef = geodeticToEcef(obs);
console.log(`  X=${ecef.x.toFixed(2)} m  Y=${ecef.y.toFixed(2)} m  Z=${ecef.z.toFixed(2)} m`);
