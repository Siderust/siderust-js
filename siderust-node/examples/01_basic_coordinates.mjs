/**
 * 01_basic_coordinates.mjs — Basic Coordinates Example
 *
 * Mirrors: siderust/examples/01_basic_coordinates.rs
 *
 * Demonstrates the Cartesian/Spherical coordinate concepts exposed through
 * the siderust-node bindings: directions, positions, frame transforms,
 * and the geodetic-to-ECEF conversion.
 *
 * Run: node examples/01_basic_coordinates.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  vsop87Heliocentric,
  vsop87MoonGeocentric,
  transformDirection,
  directionToCartesian,
  geodeticToEcef,
  cartesianMagnitude,
  cartesianDistance,
  Observer,
  listBodies,
  listCatalogStars,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;

console.log('=== Siderust Basic Coordinates Example ===\n');

// =========================================================================
// 1. Cartesian Coordinates
// =========================================================================
line('1. CARTESIAN COORDINATES');

// Heliocentric ecliptic position of Earth at J2000
const earth = vsop87Heliocentric('Earth', J2000);
const earthDist = cartesianMagnitude(earth.x, earth.y, earth.z);
console.log('Earth position (Heliocentric EclipticMeanJ2000):');
console.log(`  X = ${earth.x.toFixed(6)} AU`);
console.log(`  Y = ${earth.y.toFixed(6)} AU`);
console.log(`  Z = ${earth.z.toFixed(6)} AU`);
console.log(`  Distance from Sun = ${earthDist.toFixed(6)} AU`);

// Moon geocentric position (~384 400 km)
const moon = vsop87MoonGeocentric(J2000);
const moonDist = cartesianMagnitude(moon.x, moon.y, moon.z);
console.log('\nMoon position (Geocentric EclipticMeanJ2000):');
console.log(`  X = ${moon.x.toFixed(1)} km`);
console.log(`  Y = ${moon.y.toFixed(1)} km`);
console.log(`  Z = ${moon.z.toFixed(1)} km`);
console.log(`  Distance from Earth = ${moonDist.toFixed(1)} km`);

// =========================================================================
// 2. Spherical Coordinates (Directions)
// =========================================================================
line('2. SPHERICAL COORDINATES');

// Polaris approximate ICRS coordinates
const polarisDec = 89.26;
const polarisRA = 37.95;
console.log('Polaris (EquatorialMeanJ2000 Direction):');
console.log(`  Right Ascension = ${polarisRA.toFixed(2)}°`);
console.log(`  Declination = ${polarisDec.toFixed(2)}°`);

// Betelgeuse
const betelgeuseRA = 88.79;
const betelgeuseDec = 7.41;
const betelgeuseDistLy = 500.0;
const betelgeuseDistAU = (betelgeuseDistLy * 9.461e15) / 1.496e11;
console.log('\nBetelgeuse (ICRS Position):');
console.log(`  Right Ascension = ${betelgeuseRA.toFixed(2)}°`);
console.log(`  Declination = ${betelgeuseDec.toFixed(2)}°`);
console.log(`  Distance = ${betelgeuseDistAU.toFixed(1)} AU (~500 ly)`);

// =========================================================================
// 3. Directions (Unit Vectors)
// =========================================================================
line('3. DIRECTIONS (UNIT VECTORS)');

// Convert a direction to a Cartesian unit vector
const polarisCart = directionToCartesian(polarisDec, polarisRA);
console.log('Polaris unit vector:');
console.log(`  x = ${polarisCart.x.toFixed(6)}`);
console.log(`  y = ${polarisCart.y.toFixed(6)}`);
console.log(`  z = ${polarisCart.z.toFixed(6)}`);
const mag = cartesianMagnitude(polarisCart.x, polarisCart.y, polarisCart.z);
console.log(`  |v| = ${mag.toFixed(6)} (unit vector, should be 1)`);

// =========================================================================
// 4. Cartesian ↔ Spherical Conversion
// =========================================================================
line('4. CARTESIAN ↔ SPHERICAL (frame transforms)');

// Transform Vega from ICRS to EclipticMeanJ2000 and back (round-trip)
const vegaDec = 38.78;
const vegaRA = 279.23;
const ecliptic = transformDirection(vegaDec, vegaRA, 'ICRS', 'EclipticMeanJ2000', J2000);
console.log(`Vega ICRS -> Ecliptic: lon=${ecliptic.azimuthDeg.toFixed(4)}° lat=${ecliptic.polarDeg.toFixed(4)}°`);
const back = transformDirection(ecliptic.polarDeg, ecliptic.azimuthDeg, 'EclipticMeanJ2000', 'ICRS', J2000);
console.log(`Round-trip Ecliptic -> ICRS: RA=${back.azimuthDeg.toFixed(4)}° Dec=${back.polarDeg.toFixed(4)}°`);
console.log(`  ΔRA  = ${Math.abs(back.azimuthDeg - vegaRA).toExponential(2)}`);
console.log(`  ΔDec = ${Math.abs(back.polarDeg - vegaDec).toExponential(2)}`);

// =========================================================================
// 5. Type Safety Note
// =========================================================================
line('5. TYPE SAFETY');

const marsH = vsop87Heliocentric('Mars', J2000);
console.log(`Mars (Heliocentric EclipticMeanJ2000): x=${marsH.x.toFixed(6)}, y=${marsH.y.toFixed(6)}, z=${marsH.z.toFixed(6)}`);
console.log(`Moon (Geocentric  EclipticMeanJ2000):  x=${moon.x.toFixed(1)} km, y=${moon.y.toFixed(1)} km, z=${moon.z.toFixed(1)} km`);
console.log('\n  Positions carry frame + center metadata — check .frame and .center');
console.log(`  Mars: frame="${marsH.frame}" center="${marsH.center}"`);
console.log(`  Moon: frame="${moon.frame}" center="${moon.center}"`);

// Distance between two same-type positions
const venusH = vsop87Heliocentric('Venus', J2000);
const earthMarsD = cartesianDistance(earth.x, earth.y, earth.z, marsH.x, marsH.y, marsH.z);
const earthVenusD = cartesianDistance(earth.x, earth.y, earth.z, venusH.x, venusH.y, venusH.z);
console.log(`\nEarth-Mars distance:  ${earthMarsD.toFixed(6)} AU`);
console.log(`Earth-Venus distance: ${earthVenusD.toFixed(6)} AU`);

// =========================================================================
// 6. Centers and Frames
// =========================================================================
line('6. CENTERS AND FRAMES');

console.log('Available reference centers: Heliocentric, Barycentric, Geocentric');
console.log('Available reference frames:  ICRS, EclipticMeanJ2000, EquatorialMeanJ2000,');
console.log('  EquatorialMeanOfDate, EquatorialTrueOfDate, Horizontal');

console.log('\nAvailable bodies:', listBodies().join(', '));
console.log('Catalog stars:', listCatalogStars().join(', '));

// Geodetic to ECEF
const obs = Observer.roqueDeLasMuchachos();
const ecef = geodeticToEcef(obs);
console.log(`\nObserver ECEF (${obs.format()}):`);
console.log(`  X = ${ecef.x.toFixed(2)} m`);
console.log(`  Y = ${ecef.y.toFixed(2)} m`);
console.log(`  Z = ${ecef.z.toFixed(2)} m`);

console.log('\n=== Example Complete ===');
