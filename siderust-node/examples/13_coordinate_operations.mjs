/**
 * 13_coordinate_operations.mjs — Coordinate Operations Example
 *
 * Mirrors: siderust/examples/13_coordinate_operations.rs
 *
 * Demonstrates angular separation (Vincenty), cross-validation against
 * cartesian dot product, Euclidean 3D distance, and direction operations.
 *
 * Run: node examples/13_coordinate_operations.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  angularSeparation,
  directionToCartesian,
  dotProduct,
  cartesianDistance,
  cartesianMagnitude,
  transformDirection,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;

console.log('=== Siderust Coordinate Operations Example ===\n');

// =========================================================================
// 1. Angular Separation — Spherical Directions
// =========================================================================
line('1. ANGULAR SEPARATION (SPHERICAL DIRECTIONS)');

// Two well-known stars in EquatorialMeanJ2000
const polarisDec = 89.2641, polarisRA = 37.9546;
const siriusDec = -16.7161, siriusRA = 101.2872;

const sep = angularSeparation(polarisDec, polarisRA, siriusDec, siriusRA, 'EquatorialMeanJ2000');
console.log(`Polaris  (RA=${polarisRA.toFixed(4)}°, Dec=${polarisDec.toFixed(4)}°)`);
console.log(`Sirius   (RA=${siriusRA.toFixed(4)}°, Dec=${siriusDec.toFixed(4)}°)`);
console.log(`  Angular separation = ${sep.toFixed(4)}°`);

// Nearby pair — separation should be about 0.71°
const sepClose = angularSeparation(30.0, 10.0, 30.5, 10.5, 'EquatorialMeanJ2000');
console.log(`\nNearby pair (0.5° apart in both RA and Dec):`);
console.log(`  Angular separation = ${sepClose.toFixed(4)}°`);

// Self-separation must be exactly 0
const selfSep = angularSeparation(polarisDec, polarisRA, polarisDec, polarisRA, 'EquatorialMeanJ2000');
console.log(`\nSelf-separation of Polaris = ${selfSep.toFixed(6)}°  (must be 0)`);

// =========================================================================
// 2. Cross-Validation: Spherical Vincenty vs. Cartesian Dot Product
// =========================================================================
line('2. CROSS-VALIDATION: SPHERICAL vs. CARTESIAN');

// Convert to Cartesian unit vectors
const polarisCart = directionToCartesian(polarisDec, polarisRA);
const siriusCart = directionToCartesian(siriusDec, siriusRA);

// Dot product → angle via acos
const dot = dotProduct(
  polarisCart.x, polarisCart.y, polarisCart.z,
  siriusCart.x, siriusCart.y, siriusCart.z
);
const angleRad = Math.acos(Math.max(-1, Math.min(1, dot)));
const angleDeg = angleRad * 180.0 / Math.PI;

console.log(`Polaris cartesian: (${polarisCart.x.toFixed(4)}, ${polarisCart.y.toFixed(4)}, ${polarisCart.z.toFixed(4)})`);
console.log(`Sirius  cartesian: (${siriusCart.x.toFixed(4)}, ${siriusCart.y.toFixed(4)}, ${siriusCart.z.toFixed(4)})`);
console.log(`  angle via acos(dot) = ${angleRad.toFixed(6)} rad = ${angleDeg.toFixed(4)}°`);
console.log(`  angularSeparation   = ${sep.toFixed(4)}°`);
console.log(`  Difference          = ${Math.abs(angleDeg - sep).toExponential(2)}°  (near machine epsilon)`);

// =========================================================================
// 3. Dot Product and Perpendicularity
// =========================================================================
line('3. DOT PRODUCT');

// North celestial pole and equatorial point are perpendicular
const northPole = directionToCartesian(90.0, 0.0);
const equatorial = directionToCartesian(0.0, 0.0);
const dotPerp = dotProduct(
  northPole.x, northPole.y, northPole.z,
  equatorial.x, equatorial.y, equatorial.z
);
console.log(`dot(North Pole, Equatorial point)   = ${dotPerp.toFixed(6)}  (must be  0)`);

// Anti-Polaris (opposite direction)
const antiPolaris = directionToCartesian(-polarisDec, polarisRA + 180.0);
const dotAnti = dotProduct(
  polarisCart.x, polarisCart.y, polarisCart.z,
  antiPolaris.x, antiPolaris.y, antiPolaris.z
);
console.log(`dot(Polaris, anti-Polaris)          = ${dotAnti.toFixed(6)}  (must be -1)`);

// =========================================================================
// 4. Euclidean Distance Between Positions
// =========================================================================
line('4. EUCLIDEAN DISTANCE BETWEEN POSITIONS');

// Approximate heliocentric ecliptic positions
// Earth at ~100° longitude, 1 AU
// Mars at ~200° longitude, 1.524 AU
const earthLon = 100.0, earthLat = 0.0, earthR = 1.0;
const marsLon = 200.0, marsLat = 2.0, marsR = 1.524;

// Convert spherical to Cartesian
function sphericalToCartesian(lonDeg, latDeg, r) {
  const lonRad = lonDeg * Math.PI / 180;
  const latRad = latDeg * Math.PI / 180;
  return {
    x: r * Math.cos(latRad) * Math.cos(lonRad),
    y: r * Math.cos(latRad) * Math.sin(lonRad),
    z: r * Math.sin(latRad),
  };
}

const earthCart = sphericalToCartesian(earthLon, earthLat, earthR);
const marsCart = sphericalToCartesian(marsLon, marsLat, marsR);
const euDist = cartesianDistance(
  earthCart.x, earthCart.y, earthCart.z,
  marsCart.x, marsCart.y, marsCart.z
);

// Angular separation in ecliptic frame
const angSep = angularSeparation(earthLat, earthLon, marsLat, marsLon, 'EclipticMeanJ2000');

console.log(`Earth (lon=100°, lat=0°, r=1.000 AU)`);
console.log(`Mars  (lon=200°, lat=2°, r=1.524 AU)`);
console.log(`  Euclidean 3D distance  = ${euDist.toFixed(4)} AU`);
console.log(`  Angular separation     = ${angSep.toFixed(4)}°`);

// =========================================================================
// 5. Cartesian Position Operations
// =========================================================================
line('5. CARTESIAN POSITION OPERATIONS');

console.log(`Earth cartesian: (${earthCart.x.toFixed(4)}, ${earthCart.y.toFixed(4)}, ${earthCart.z.toFixed(4)})`);
console.log(`Mars  cartesian: (${marsCart.x.toFixed(4)}, ${marsCart.y.toFixed(4)}, ${marsCart.z.toFixed(4)})`);
console.log(`  Euclidean distance = ${euDist.toFixed(4)} AU`);

// Vector difference (displacement)
const diff = {
  x: marsCart.x - earthCart.x,
  y: marsCart.y - earthCart.y,
  z: marsCart.z - earthCart.z,
};
const diffMag = cartesianMagnitude(diff.x, diff.y, diff.z);
console.log(`  Mars − Earth vector: (${diff.x.toFixed(4)}, ${diff.y.toFixed(4)}, ${diff.z.toFixed(4)})`);
console.log(`  |Mars − Earth|      = ${diffMag.toFixed(4)} AU`);

// =========================================================================
// 6. Ecliptic and Equatorial Directions
// =========================================================================
line('6. ECLIPTIC AND EQUATORIAL DIRECTIONS');

// Vernal equinox (lon=0°) to summer solstice (lon=90°) — angular sep = 90°
const eqSol = angularSeparation(0.0, 0.0, 0.0, 90.0, 'EclipticMeanJ2000');
console.log(`Vernal Equinox → Summer Solstice angular sep = ${eqSol.toFixed(4)}°  (must be 90°)`);

// Ecliptic north pole (lat=90°) to vernal equinox (lat=0°) — angular sep = 90°
const poleEq = angularSeparation(90.0, 0.0, 0.0, 0.0, 'EclipticMeanJ2000');
console.log(`Ecliptic North Pole → Vernal Equinox ang. sep = ${poleEq.toFixed(4)}°  (must be 90°)`);

console.log('\n  Note: In the Rust library, EclipticMeanJ2000 and EquatorialMeanJ2000');
console.log('  directions are distinct types — the compiler prevents mixing them.');
console.log('  In JavaScript, the frame is passed as a string parameter to');
console.log('  angularSeparation() for the same level of correctness.');

console.log('\n=== Example Complete ===');
