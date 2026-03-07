/**
 * 02_coordinate_transformations.mjs — Coordinate Transformations Example
 *
 * Mirrors: siderust/examples/02_coordinate_transformations.rs
 *
 * Demonstrates frame transforms, center transforms, combined transforms,
 * barycentric coordinates, and round-trip verification.
 *
 * Run: node examples/02_coordinate_transformations.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  vsop87Heliocentric,
  vsop87Barycentric,
  vsop87EarthHeliocentric,
  vsop87EarthBarycentric,
  transformPositionFrame,
  transformPositionCenter,
  cartesianMagnitude,
  cartesianDistance,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;
const fmt = (v) => v.toFixed(6);

console.log('=== Coordinate Transformations Example ===\n');
console.log(`Reference time: J2000.0 (JD ${J2000.toFixed(1)})`);

// =========================================================================
// 1. Frame Transformations (same center)
// =========================================================================
line('1. FRAME TRANSFORMATIONS');

// Start with ecliptic coordinates (heliocentric) — 1 AU along X
const posEcl = { x: 1.0, y: 0.0, z: 0.0 };
console.log('Original (Heliocentric EclipticMeanJ2000):');
console.log(`  X = ${fmt(posEcl.x)}`);
console.log(`  Y = ${fmt(posEcl.y)}`);
console.log(`  Z = ${fmt(posEcl.z)}`);

// Ecliptic → Equatorial
const posEqu = transformPositionFrame(posEcl.x, posEcl.y, posEcl.z,
  'EclipticMeanJ2000', 'EquatorialMeanJ2000', J2000);
console.log('\nTransformed to EquatorialMeanJ2000 frame:');
console.log(`  X = ${fmt(posEqu.x)}`);
console.log(`  Y = ${fmt(posEqu.y)}`);
console.log(`  Z = ${fmt(posEqu.z)}`);

// Equatorial → ICRS
const posICRS = transformPositionFrame(posEqu.x, posEqu.y, posEqu.z,
  'EquatorialMeanJ2000', 'ICRS', J2000);
console.log('\nTransformed to ICRS frame:');
console.log(`  X = ${fmt(posICRS.x)}`);
console.log(`  Y = ${fmt(posICRS.y)}`);
console.log(`  Z = ${fmt(posICRS.z)}`);

// =========================================================================
// 2. Center Transformations (same frame)
// =========================================================================
line('2. CENTER TRANSFORMATIONS');

// Earth heliocentric
const earthH = vsop87Heliocentric('Earth', J2000);
const earthDist = cartesianMagnitude(earthH.x, earthH.y, earthH.z);
console.log('Earth (Heliocentric EclipticMeanJ2000):');
console.log(`  X = ${fmt(earthH.x)}`);
console.log(`  Y = ${fmt(earthH.y)}`);
console.log(`  Z = ${fmt(earthH.z)}`);
console.log(`  Distance = ${fmt(earthDist)} AU`);

// Earth → Geocentric (should be ~0)
const earthG = transformPositionCenter(earthH.x, earthH.y, earthH.z,
  'Heliocentric', 'Geocentric', J2000);
const earthGDist = cartesianMagnitude(earthG.x, earthG.y, earthG.z);
console.log('\nEarth (Geocentric EclipticMeanJ2000) — at origin:');
console.log(`  X = ${earthG.x.toFixed(10)}`);
console.log(`  Y = ${earthG.y.toFixed(10)}`);
console.log(`  Z = ${earthG.z.toFixed(10)}`);
console.log(`  Distance = ${earthGDist.toFixed(10)} (should be ~0)`);

// Mars heliocentric
const marsH = vsop87Heliocentric('Mars', J2000);
const marsDist = cartesianMagnitude(marsH.x, marsH.y, marsH.z);
console.log('\nMars (Heliocentric EclipticMeanJ2000):');
console.log(`  X = ${fmt(marsH.x)}`);
console.log(`  Y = ${fmt(marsH.y)}`);
console.log(`  Z = ${fmt(marsH.z)}`);
console.log(`  Distance = ${fmt(marsDist)} AU`);

// Mars → Geocentric
const marsG = transformPositionCenter(marsH.x, marsH.y, marsH.z,
  'Heliocentric', 'Geocentric', J2000);
const marsGDist = cartesianMagnitude(marsG.x, marsG.y, marsG.z);
console.log('\nMars (Geocentric EclipticMeanJ2000) — as seen from Earth:');
console.log(`  X = ${fmt(marsG.x)}`);
console.log(`  Y = ${fmt(marsG.y)}`);
console.log(`  Z = ${fmt(marsG.z)}`);
console.log(`  Distance = ${fmt(marsGDist)} AU`);

// =========================================================================
// 3. Combined Transformations (center + frame)
// =========================================================================
line('3. COMBINED TRANSFORMATIONS');

console.log('Mars transformation chain:');
console.log('  Start: Heliocentric EclipticMeanJ2000');

// Step 1: frame transform
const marsHEqu = transformPositionFrame(marsH.x, marsH.y, marsH.z,
  'EclipticMeanJ2000', 'EquatorialMeanJ2000', J2000);
console.log('  Step 1: Transform frame → Heliocentric EquatorialMeanJ2000');

// Step 2: center transform (still in EquatorialMeanJ2000 not available directly,
// so we do center transform in EclipticMeanJ2000, then frame transform)
const marsGEcl = transformPositionCenter(marsH.x, marsH.y, marsH.z,
  'Heliocentric', 'Geocentric', J2000);
const marsGEqu = transformPositionFrame(marsGEcl.x, marsGEcl.y, marsGEcl.z,
  'EclipticMeanJ2000', 'EquatorialMeanJ2000', J2000);
console.log('  Step 2: Transform center → Geocentric EquatorialMeanJ2000');
console.log('  Result:');
console.log(`    X = ${fmt(marsGEqu.x)}`);
console.log(`    Y = ${fmt(marsGEqu.y)}`);
console.log(`    Z = ${fmt(marsGEqu.z)}`);

// =========================================================================
// 4. Barycentric Coordinates
// =========================================================================
line('4. BARYCENTRIC COORDINATES');

const earthB = vsop87EarthBarycentric(J2000);
const earthBDist = cartesianMagnitude(earthB.x, earthB.y, earthB.z);
console.log('Earth (Barycentric EclipticMeanJ2000):');
console.log(`  X = ${fmt(earthB.x)}`);
console.log(`  Y = ${fmt(earthB.y)}`);
console.log(`  Z = ${fmt(earthB.z)}`);
console.log(`  Distance from SSB = ${fmt(earthBDist)} AU`);

// Earth Barycentric → Geocentric (should be ~0)
const earthBG = transformPositionCenter(earthB.x, earthB.y, earthB.z,
  'Barycentric', 'Geocentric', J2000);
const earthBGDist = cartesianMagnitude(earthBG.x, earthBG.y, earthBG.z);
console.log(`\nEarth (Geocentric, from Barycentric):`);
console.log(`  Distance = ${earthBGDist.toFixed(10)} (should be ~0)`);

// Mars Barycentric → Geocentric
const marsB = vsop87Barycentric('Mars', J2000);
const marsBG = transformPositionCenter(marsB.x, marsB.y, marsB.z,
  'Barycentric', 'Geocentric', J2000);
const marsBGDist = cartesianMagnitude(marsBG.x, marsBG.y, marsBG.z);
console.log('\nMars (Geocentric, from Barycentric):');
console.log(`  X = ${fmt(marsBG.x)}`);
console.log(`  Y = ${fmt(marsBG.y)}`);
console.log(`  Z = ${fmt(marsBG.z)}`);
console.log(`  Distance = ${fmt(marsBGDist)} AU`);

// =========================================================================
// 5. ICRS Frame Transformations
// =========================================================================
line('5. ICRS FRAME TRANSFORMATIONS');

const starICRS = { x: 100.0, y: 50.0, z: 1000.0 };
console.log('Star (Barycentric ICRS):');
console.log(`  X = ${starICRS.x.toFixed(3)}`);
console.log(`  Y = ${starICRS.y.toFixed(3)}`);
console.log(`  Z = ${starICRS.z.toFixed(3)}`);

// ICRS → EquatorialMeanJ2000 (very small difference)
const starEqu = transformPositionFrame(starICRS.x, starICRS.y, starICRS.z,
  'ICRS', 'EquatorialMeanJ2000', J2000);
console.log('\nStar (EquatorialMeanJ2000):');
console.log(`  X = ${starEqu.x.toFixed(3)}`);
console.log(`  Y = ${starEqu.y.toFixed(3)}`);
console.log(`  Z = ${starEqu.z.toFixed(3)}`);
console.log('  (Difference is tiny — ICRS ≈ EquatorialMeanJ2000)');

// =========================================================================
// 6. Round-trip Transformation
// =========================================================================
line('6. ROUND-TRIP TRANSFORMATION');

console.log('Original Mars (Heliocentric EclipticMeanJ2000):');
console.log(`  X = ${marsH.x.toFixed(10)}`);
console.log(`  Y = ${marsH.y.toFixed(10)}`);
console.log(`  Z = ${marsH.z.toFixed(10)}`);

// Helio Ecl → Geo EquatorialMeanJ2000 → Helio Ecl
const temp1 = transformPositionCenter(marsH.x, marsH.y, marsH.z, 'Heliocentric', 'Geocentric', J2000);
const temp2 = transformPositionFrame(temp1.x, temp1.y, temp1.z, 'EclipticMeanJ2000', 'EquatorialMeanJ2000', J2000);
const temp3 = transformPositionFrame(temp2.x, temp2.y, temp2.z, 'EquatorialMeanJ2000', 'EclipticMeanJ2000', J2000);
const recovered = transformPositionCenter(temp3.x, temp3.y, temp3.z, 'Geocentric', 'Heliocentric', J2000);

console.log('\nAfter round-trip transformation:');
console.log(`  X = ${recovered.x.toFixed(10)}`);
console.log(`  Y = ${recovered.y.toFixed(10)}`);
console.log(`  Z = ${recovered.z.toFixed(10)}`);

const diffX = Math.abs(marsH.x - recovered.x);
const diffY = Math.abs(marsH.y - recovered.y);
const diffZ = Math.abs(marsH.z - recovered.z);
console.log('\nDifferences (should be tiny):');
console.log(`  ΔX = ${diffX.toExponential(6)}`);
console.log(`  ΔY = ${diffY.toExponential(6)}`);
console.log(`  ΔZ = ${diffZ.toExponential(6)}`);

console.log('\n=== Example Complete ===');
