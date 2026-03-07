/**
 * 11_serde_serialization.mjs — Serialization & Deserialization
 *
 * Mirrors: siderust/examples/11_serde_serialization.rs
 *
 * In Rust, serde provides typed serialization with compile-time guarantees.
 * In JavaScript, all siderust API objects are plain JS objects / class
 * instances whose data is directly JSON-serializable via `JSON.stringify`.
 *
 * This example demonstrates:
 *   1) Serializing time, coordinate, and body snapshot data to JSON
 *   2) Round-trip deserialization and validation
 *   3) Target / observer / star catalog serialization
 *   4) File I/O with `node:fs`
 *
 * Run: node examples/11_serde_serialization.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, readFileSync, unlinkSync } from 'node:fs';

const require = createRequire(import.meta.url);
const siderust = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const {
  Observer,
  Star,
  getPlanet,
  listCatalogStars,
  vsop87Heliocentric,
  vsop87EarthHeliocentric,
  vsop87Barycentric,
  vsop87MoonGeocentric,
  cartesianMagnitude,
  geodeticToEcef,
  moonPhase,
} = siderust;

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;

console.log('=== Siderust Serialization Examples ===\n');

// ═══════════════════════════════════════════════════════════════════════════
// 1) TIME OBJECTS
// ═══════════════════════════════════════════════════════════════════════════
line('1) TIME OBJECTS');

const timeBundle = {
  j2000: J2000,
  mjd: J2000 - 2400000.5,
  timeline: [J2000, J2000 + 1.0, J2000 + 7.0],
  utcRef: '2000-01-01T12:00:00.000Z',
};

const timeJson = JSON.stringify(timeBundle, null, 2);
console.log(timeJson);

const recoveredTimes = JSON.parse(timeJson);
console.log(
  `Roundtrip check: j2000=${recoveredTimes.j2000.toFixed(1)}, timeline_len=${recoveredTimes.timeline.length}\n`,
);

// ═══════════════════════════════════════════════════════════════════════════
// 2) COORDINATE OBJECTS
// ═══════════════════════════════════════════════════════════════════════════
line('2) COORDINATE OBJECTS');

// Observer / geodetic site
const observer = Observer.roqueDeLasMuchachos();
const ecef = geodeticToEcef(observer);

const coordBundle = {
  observer: {
    lonDeg: observer.lonDeg,
    latDeg: observer.latDeg,
    heightM: observer.heightM,
    label: 'Roque de los Muchachos',
  },
  ecef: ecef,
  earthHeliocentric: vsop87EarthHeliocentric(J2000),
  marsHeliocentric: vsop87Heliocentric('Mars', J2000),
  moonGeocentric: vsop87MoonGeocentric(J2000),
};

const coordJson = JSON.stringify(coordBundle, null, 2);
console.log(coordJson);

const recoveredCoords = JSON.parse(coordJson);
console.log(
  `Roundtrip check: lon=${recoveredCoords.observer.lonDeg.toFixed(4)}°, ` +
    `ecef.x=${recoveredCoords.ecef.x.toFixed(1)} m\n`,
);

// ═══════════════════════════════════════════════════════════════════════════
// 3) BODY-RELATED OBJECTS (planet info + ephemeris snapshots)
// ═══════════════════════════════════════════════════════════════════════════
line('3) BODY-RELATED OBJECTS');

const earthSnapshot = {
  name: 'Earth',
  epoch: J2000,
  planet: getPlanet('Earth'),
  heliocentric: vsop87EarthHeliocentric(J2000),
};

const marsSnapshot = {
  name: 'Mars',
  epoch: J2000,
  planet: getPlanet('Mars'),
  heliocentric: vsop87Heliocentric('Mars', J2000),
};

console.log('Earth snapshot JSON:');
console.log(JSON.stringify(earthSnapshot, null, 2));
console.log('\nMars snapshot JSON:');
console.log(JSON.stringify(marsSnapshot, null, 2));

const recoveredMars = JSON.parse(JSON.stringify(marsSnapshot));
const recoveredR = cartesianMagnitude(
  recoveredMars.heliocentric.x,
  recoveredMars.heliocentric.y,
  recoveredMars.heliocentric.z,
);
console.log(
  `Roundtrip check: ${recoveredMars.name} @ JD ${recoveredMars.epoch.toFixed(1)}, r=${recoveredR.toFixed(6)} AU\n`,
);

// ═══════════════════════════════════════════════════════════════════════════
// 4) TARGET OBJECTS (position snapshot + metadata)
// ═══════════════════════════════════════════════════════════════════════════
line('4) TARGET OBJECTS');

const marsBarycentric = vsop87Barycentric('Mars', J2000);
const moonGeocentric = vsop87MoonGeocentric(J2000);

const targetsBundle = {
  marsTarget: {
    position: marsBarycentric,
    time: J2000,
    properMotion: null,
  },
  moonTarget: {
    position: moonGeocentric,
    time: J2000,
    properMotion: null,
  },
};

const targetsJson = JSON.stringify(targetsBundle, null, 2);
console.log(targetsJson);

const recoveredTargets = JSON.parse(targetsJson);
console.log(
  `Roundtrip check: Mars target JD ${recoveredTargets.marsTarget.time.toFixed(1)}, ` +
    `Moon target JD ${recoveredTargets.moonTarget.time.toFixed(1)}\n`,
);

// ═══════════════════════════════════════════════════════════════════════════
// 5) STAR CATALOG SERIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
line('5) STAR CATALOG');

const catalogNames = listCatalogStars();
const catalog = catalogNames.map((name) => {
  const star = Star.catalog(name);
  return {
    name: star.name,
    raDeg: star.raDeg,
    decDeg: star.decDeg,
    distanceLy: star.distanceLy,
    massSolar: star.massSolar,
    radiusSolar: star.radiusSolar,
    luminositySolar: star.luminositySolar,
  };
});

console.log(`Catalog has ${catalog.length} stars.`);
console.log(
  `First 3: ${catalog
    .slice(0, 3)
    .map((s) => s.name)
    .join(', ')}`,
);

const catalogJson = JSON.stringify(catalog, null, 2);
const recoveredCatalog = JSON.parse(catalogJson);
console.log(`Roundtrip check: ${recoveredCatalog.length} stars recovered`);
console.log(`  Vega RA: ${recoveredCatalog.find((s) => s.name === 'Vega').raDeg.toFixed(6)}°\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 6) MOON PHASE SERIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
line('6) MOON PHASE');

const phase = moonPhase(J2000);
console.log(JSON.stringify(phase, null, 2));

const recoveredPhase = JSON.parse(JSON.stringify(phase));
console.log(
  `Roundtrip check: ${recoveredPhase.label}, k=${recoveredPhase.illuminatedFraction.toFixed(4)}\n`,
);

// ═══════════════════════════════════════════════════════════════════════════
// 7) FILE I/O
// ═══════════════════════════════════════════════════════════════════════════
line('7) FILE I/O');

const outPath = '/tmp/siderust_js_serialization_example.json';

// Compose a comprehensive bundle
const fileBundle = {
  metadata: {
    library: 'siderust-node',
    version: siderust.version(),
    createdAt: new Date().toISOString(),
  },
  times: timeBundle,
  coordinates: coordBundle,
  targets: targetsBundle,
  moonPhase: phase,
  catalog,
};

writeFileSync(outPath, JSON.stringify(fileBundle, null, 2), 'utf-8');
console.log(`Saved: ${outPath}`);

// Load it back
const loaded = JSON.parse(readFileSync(outPath, 'utf-8'));
console.log(`Loaded: ${Object.keys(loaded).length} top-level keys`);
console.log(`  Library: ${loaded.metadata.library}`);
console.log(`  Stars: ${loaded.catalog.length}`);

// Verify we can re-use loaded data with siderust APIs
const loadedEarth = loaded.coordinates.earthHeliocentric;
const earthR = cartesianMagnitude(loadedEarth.x, loadedEarth.y, loadedEarth.z);
console.log(`  Earth r from loaded data: ${earthR.toFixed(6)} AU`);

// Clean up
unlinkSync(outPath);
console.log(`  Cleaned up: ${outPath}`);

console.log('\nDone.');
