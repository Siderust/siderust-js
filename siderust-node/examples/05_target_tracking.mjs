/**
 * 05_target_tracking.mjs — Target Tracking & Proper Motion
 *
 * Mirrors: siderust/examples/05_target_tracking.rs
 *
 * In Rust, `Trackable` is a trait and `Target<T>` is a generic struct with
 * compile-time frame/center typing.  In JavaScript we achieve the same
 * concepts idiomatically:
 *
 *   - A lightweight `Target` class wraps {position, time, properMotion?}
 *     and offers `update()`, `propagate()`, and frame/center conversion.
 *   - Factory helpers (`trackPlanet`, `trackSun`, `trackMoon`, `trackStar`)
 *     play the role of the Rust `Trackable` trait.
 *   - Proper motion is expressed as µα* and µδ (mas/yr) and applied as a
 *     simple linear drift in RA/Dec, matching `set_proper_motion_since_j2000`.
 *
 * Run: node examples/05_target_tracking.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const siderust = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const {
  Star,
  vsop87Heliocentric,
  vsop87Barycentric,
  vsop87SunBarycentric,
  vsop87EarthHeliocentric,
  vsop87EarthBarycentric,
  vsop87MoonGeocentric,
  transformPositionCenter,
  transformPositionFrame,
  cartesianMagnitude,
  transformDirection,
} = siderust;

// ─── Utilities ──────────────────────────────────────────────────────────

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

const J2000 = 2451545.0;
const JULIAN_YEAR = 365.25;
const MAS_TO_DEG = 1.0 / 3_600_000.0;

// ─── Target class ───────────────────────────────────────────────────────
// Mirrors siderust::targets::Target<T> — a timestamped position snapshot
// with optional proper motion.

class Target {
  /**
   * @param {object}  position      - { x, y, z, frame, center } or direction-like
   * @param {number}  jd            - Julian Date of the snapshot
   * @param {object?} properMotion  - { muAlphaStar, muDelta } in mas/yr (optional)
   */
  constructor(position, jd, properMotion = null) {
    this.position = { ...position };
    this.time = jd;
    this.properMotion = properMotion;
  }

  /** Replace the snapshot with a new position and epoch. */
  update(position, jd) {
    this.position = { ...position };
    this.time = jd;
  }

  /** Propagate proper motion from the reference epoch to `jd`. */
  propagate(jd) {
    if (!this.properMotion) {
      throw new Error('No proper motion attached — use Target with properMotion parameter');
    }
    const dt = (jd - J2000) / JULIAN_YEAR; // Julian years since J2000
    const { muAlphaStar, muDelta } = this.properMotion; // mas/yr
    const cosDec = Math.cos((this.position.decDeg ?? this.position.polarDeg) * Math.PI / 180);

    const newRa = (this.position.raDeg ?? this.position.azimuthDeg)
      + (muAlphaStar * MAS_TO_DEG / cosDec) * dt;
    const newDec = (this.position.decDeg ?? this.position.polarDeg)
      + (muDelta * MAS_TO_DEG) * dt;

    return { raDeg: newRa, decDeg: newDec };
  }

  /** Distance from origin (magnitude) for Cartesian positions. */
  distance() {
    const { x, y, z } = this.position;
    return cartesianMagnitude(x, y, z);
  }

  toString() {
    if (this.position.x !== undefined) {
      return `Target @ JD ${this.time.toFixed(1)}: r = ${this.distance().toFixed(6)} [${this.position.frame}, ${this.position.center}]`;
    }
    return `Target @ JD ${this.time.toFixed(1)}: RA ${(this.position.raDeg ?? this.position.azimuthDeg).toFixed(4)}°, Dec ${(this.position.decDeg ?? this.position.polarDeg).toFixed(4)}°`;
  }
}

// ─── Tracking helpers (equivalent to Rust's Trackable trait) ────────────

/** Track a planet at a given epoch → Cartesian position (heliocentric ecliptic). */
function trackPlanet(name, jd) {
  return new Target(vsop87Heliocentric(name, jd), jd);
}

/** Track the Sun at a given epoch → Cartesian position (barycentric ecliptic). */
function trackSun(jd) {
  return new Target(vsop87SunBarycentric(jd), jd);
}

/** Track the Moon at a given epoch → Cartesian position (geocentric ecliptic, km). */
function trackMoon(jd) {
  return new Target(vsop87MoonGeocentric(jd), jd);
}

/** Track a catalog star at a given epoch → direction snapshot. */
function trackStar(name, jd) {
  const star = Star.catalog(name);
  return new Target(
    { raDeg: star.raDeg, decDeg: star.decDeg, frame: 'ICRS', center: 'Barycentric' },
    jd,
  );
}

// ═══════════════════════════════════════════════════════════════════════════

console.log('Target + Trackable examples');
console.log('===========================\n');

// ─── 1) Trackable objects ───────────────────────────────────────────────
line('1) Trackable objects (ICRS, star, Sun, planet, Moon)');

// Fixed ICRS direction: time-invariant (like Rust Direction<ICRS>)
const fixedIcrs = { polarDeg: 22.5, azimuthDeg: 120.0, frame: 'ICRS' };
const fixedIcrsJd = transformDirection(fixedIcrs.polarDeg, fixedIcrs.azimuthDeg, 'ICRS', 'ICRS', J2000);
const fixedIcrsNext = transformDirection(fixedIcrs.polarDeg, fixedIcrs.azimuthDeg, 'ICRS', 'ICRS', J2000 + 1);

console.log(
  `  ICRS direction is time-invariant: RA ${fixedIcrsJd.azimuthDeg.toFixed(3)} -> ${fixedIcrsNext.azimuthDeg.toFixed(3)}, Dec ${fixedIcrsJd.polarDeg.toFixed(3)} -> ${fixedIcrsNext.polarDeg.toFixed(3)}`
);

// Star
const sirius = Star.catalog('Sirius');
console.log(`  Sirius via Trackable: RA ${sirius.raDeg.toFixed(3)}, Dec ${sirius.decDeg.toFixed(3)}`);

// Sun, Mars, Moon
const sunTarget = trackSun(J2000);
const marsTarget = trackPlanet('Mars', J2000);
const moonTarget = trackMoon(J2000);

console.log(`  Sun barycentric distance: ${sunTarget.distance().toFixed(6)}`);
console.log(`  Mars heliocentric distance: ${marsTarget.distance().toFixed(6)}`);
console.log(`  Moon geocentric distance: ${moonTarget.distance().toFixed(1)}`);

// ─── 2) Target snapshots ───────────────────────────────────────────────
line('2) Target snapshots for arbitrary sky objects');

// Planet target
let marsT = trackPlanet('Mars', J2000);
console.log(`  ${marsT}`);

// Update to next day
const jdNext = J2000 + 1;
marsT.update(vsop87Heliocentric('Mars', jdNext), jdNext);
console.log(`  Mars target updated to JD ${jdNext.toFixed(1)}: r = ${marsT.distance().toFixed(6)}`);

// Earth target (heliocentric)
const earthT = new Target(vsop87EarthHeliocentric(J2000), J2000);
console.log(`  Earth target at JD ${J2000.toFixed(1)}: r = ${earthT.distance().toFixed(6)}`);

// ─── 3) Target with proper motion ──────────────────────────────────────
line('3) Target with proper motion (stellar-style target)');

// Betelgeuse proper motion: µα⋆ = 27.54 mas/yr, µδ = 10.86 mas/yr
const betelgeuse = Star.catalog('Betelgeuse');
const betelgeuseTarget = new Target(
  { raDeg: betelgeuse.raDeg, decDeg: betelgeuse.decDeg, frame: 'ICRS' },
  J2000,
  { muAlphaStar: 27.54, muDelta: 10.86 },
);

console.log(
  `  Betelgeuse-like target at J2000: RA ${betelgeuse.raDeg.toFixed(6)}, Dec ${betelgeuse.decDeg.toFixed(6)}`
);

// Propagate 25 years forward
const jdFuture = J2000 + 25.0 * JULIAN_YEAR;
const moved = betelgeuseTarget.propagate(jdFuture);
console.log(
  `  After 25 years: RA ${moved.raDeg.toFixed(6)}, Dec ${moved.decDeg.toFixed(6)}`
);

// Show the drift
const dRa = (moved.raDeg - betelgeuse.raDeg) * 3_600_000; // to mas
const dDec = (moved.decDeg - betelgeuse.decDeg) * 3_600_000;
console.log(
  `  Drift: ΔRA = ${dRa.toFixed(1)} mas, ΔDec = ${dDec.toFixed(1)} mas`
);

// ─── 4) Target conversion across frame + center ────────────────────────
line('4) Target conversion across frame + center');

// Mars heliocentric ecliptic → geocentric equatorial J2000
const marsHelio = vsop87Heliocentric('Mars', J2000);
const marsGeo = transformPositionCenter(
  marsHelio.x, marsHelio.y, marsHelio.z,
  'Heliocentric', 'Geocentric', J2000,
);
const marsGeoEq = transformPositionFrame(
  marsGeo.x, marsGeo.y, marsGeo.z,
  'EclipticMeanJ2000', 'EquatorialMeanJ2000', J2000,
);

const marsHelioTarget = new Target(marsHelio, J2000);
const marsGeoEqTarget = new Target(marsGeoEq, J2000);

console.log(`  Mars heliocentric ecliptic target: r = ${marsHelioTarget.distance().toFixed(6)}`);
console.log(`  Mars geocentric equatorial target: r = ${marsGeoEqTarget.distance().toFixed(6)}`);

// ─── 5) Tracking over a time range ─────────────────────────────────────
line('5) Tracking Mars over 30 days');

const steps = 7;
const interval = 30 / steps;
console.log(`  ${'Day'.padEnd(6)} ${'r [AU]'.padStart(12)} ${'x [AU]'.padStart(12)} ${'y [AU]'.padStart(12)} ${'z [AU]'.padStart(12)}`);
console.log('  ' + '─'.repeat(54));

for (let i = 0; i <= steps; i++) {
  const jd = J2000 + i * interval;
  const pos = vsop87Heliocentric('Mars', jd);
  const r = cartesianMagnitude(pos.x, pos.y, pos.z);
  const day = (i * interval).toFixed(1);
  console.log(
    `  ${day.padEnd(6)} ${r.toFixed(6).padStart(12)} ${pos.x.toFixed(6).padStart(12)} ${pos.y.toFixed(6).padStart(12)} ${pos.z.toFixed(6).padStart(12)}`
  );
}

console.log('\nDone.');
