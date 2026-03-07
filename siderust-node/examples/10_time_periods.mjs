/**
 * 10_time_periods.mjs — Time Scales, Formats, and Period Conversions
 *
 * Mirrors: siderust/examples/10_time_periods.rs
 *
 * The Rust example uses `tempoch`'s strongly-typed time scale system
 * (JD, JDE, MJD, TDB, TT, TAI, TCG, TCB, GPS, UnixTime, UT) with
 * compile-time scale tagging and automatic conversions.
 *
 * In JavaScript we achieve the same concepts using:
 *   - `@siderust/tempoch` (tempoch-node): JulianDate, ModifiedJulianDate,
 *     Period classes with JD ↔ MJD ↔ Date conversions and arithmetic.
 *   - Pure JS math for the remaining time scale offsets (TT, TAI, TDB,
 *     TCG, TCB, GPS, Unix) that are not yet exposed as native classes.
 *
 * Run: node examples/10_time_periods.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

// ─── Load tempoch (from sibling package) ────────────────────────────────
const tempochPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..', '..', '..', 'tempoch-js', 'tempoch-node', 'index.js',
);
const tempoch = require(tempochPath);
const { JulianDate, ModifiedJulianDate, Period } = tempoch;

// ─── Time-scale conversion constants ───────────────────────────────────
// All conversions route through JD(TT), matching the Rust canonical path.

// Key constants
const J2000_JD = 2451545.0;         // J2000.0 epoch in JD
const MJD_OFFSET = 2400000.5;       // JD = MJD + 2400000.5
const UNIX_EPOCH_JD = 2440587.5;    // JD of Unix epoch (1970-01-01T00:00:00)
const GPS_EPOCH_JD = 2444244.5;     // JD of GPS epoch (1980-01-06T00:00:00)
const SECONDS_PER_DAY = 86400;

// Offsets (seconds) at J2000.0 — simplified, constant-offset model
// In reality TAI-UTC (leap seconds) is tabular; this uses the value at J2000.
const TAI_TT_OFFSET_S = -32.184;    // TT = TAI + 32.184 s
const TAI_UTC_OFFSET_S = 32;        // TAI - UTC = 32 s (at J2000)
const GPS_TAI_OFFSET_S = -19;       // GPS = TAI - 19 s

// TDB ≈ TT for most purposes (the periodic term is < 1.7 ms)
// TCG rate: dTCG/dTT = 1 + L_G where L_G = 6.969290134e-10
const L_G = 6.969290134e-10;
// TCB rate: dTCB/dTDB ≈ 1 + L_B where L_B = 1.550519768e-8
const L_B = 1.550519768e-8;

// ΔT = TT - UT1 (at J2000.0): approximately 63.83 seconds
const DELTA_T_J2000_S = 63.83;

// ─── Helpers ────────────────────────────────────────────────────────────

const line = (label = '') =>
  console.log(
    label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 52 - label.length))}` : '─'.repeat(56),
  );

/** Convert JD(TT) to a specific time scale value. */
function jdToScale(jdTT, scale) {
  const daysSinceJ2000 = jdTT - J2000_JD;
  const secSinceJ2000 = daysSinceJ2000 * SECONDS_PER_DAY;

  switch (scale) {
    case 'JD':   return jdTT;
    case 'JDE':  return jdTT; // JDE ≡ JD(TDB) ≈ JD(TT)
    case 'MJD':  return jdTT - MJD_OFFSET;
    case 'TDB':  return jdTT; // TDB ≈ TT (< 1.7 ms periodic term ignored)
    case 'TT':   return jdTT;
    case 'TAI':  return jdTT + TAI_TT_OFFSET_S / SECONDS_PER_DAY;
    case 'TCG':  return jdTT + L_G * secSinceJ2000 / SECONDS_PER_DAY;
    case 'TCB':  return jdTT + L_B * secSinceJ2000 / SECONDS_PER_DAY;
    case 'GPS':  return jdTT + (TAI_TT_OFFSET_S + GPS_TAI_OFFSET_S) / SECONDS_PER_DAY;
    case 'Unix': return (jdTT - UNIX_EPOCH_JD) * SECONDS_PER_DAY
                        + (TAI_TT_OFFSET_S - TAI_UTC_OFFSET_S);
    case 'UT':   return jdTT - DELTA_T_J2000_S / SECONDS_PER_DAY;
    default:     throw new Error(`Unknown scale: ${scale}`);
  }
}

/** Convert a scale value back to JD(TT). */
function scaleToJd(value, scale) {
  switch (scale) {
    case 'JD':   return value;
    case 'JDE':  return value;
    case 'MJD':  return value + MJD_OFFSET;
    case 'TDB':  return value;
    case 'TT':   return value;
    case 'TAI':  return value - TAI_TT_OFFSET_S / SECONDS_PER_DAY;
    case 'TCG': {
      const approxDays = value - J2000_JD;
      return value - L_G * approxDays * SECONDS_PER_DAY / SECONDS_PER_DAY;
    }
    case 'TCB': {
      const approxDays = value - J2000_JD;
      return value - L_B * approxDays * SECONDS_PER_DAY / SECONDS_PER_DAY;
    }
    case 'GPS':  return value - (TAI_TT_OFFSET_S + GPS_TAI_OFFSET_S) / SECONDS_PER_DAY;
    case 'Unix': return (value - (TAI_TT_OFFSET_S - TAI_UTC_OFFSET_S)) / SECONDS_PER_DAY + UNIX_EPOCH_JD;
    case 'UT':   return value + DELTA_T_J2000_S / SECONDS_PER_DAY;
    default:     throw new Error(`Unknown scale: ${scale}`);
  }
}

function printScale(label, value, referenceJd) {
  const jdBack = scaleToJd(value, label);
  const driftS = (jdBack - referenceJd) * SECONDS_PER_DAY;
  const valueStr = typeof value === 'number' ? value.toFixed(9) : String(value);
  console.log(
    `   ${label.padEnd(8)} value = ${valueStr.padStart(16)}  | JD roundtrip drift = ${driftS.toExponential(3).padStart(11)} s`
  );
}

function printPeriod(label, startVal, endVal) {
  const duration = endVal - startVal;
  console.log(
    `   ${label.padEnd(8)} [${startVal.toFixed(9).padStart(16)} → ${endVal.toFixed(9).padStart(16)}]  Δ = ${duration.toFixed(9)} d`
  );
}

// ═══════════════════════════════════════════════════════════════════════════

console.log('Time Scales, Formats, and Period Conversions');
console.log('============================================\n');

// Reference instant: 2000-01-01T12:00:00Z (J2000.0)
const utcRef = new Date('2000-01-01T12:00:00Z');
const jd = JulianDate.fromDate(utcRef);
const jdVal = jd.value;

console.log(`Reference UTC instant: ${utcRef.toISOString()}\n`);

// ─── 1) Time scales ────────────────────────────────────────────────────
line('1) Each supported time scale for the same instant');

const SCALES = ['JD', 'JDE', 'MJD', 'TDB', 'TT', 'TAI', 'TCG', 'TCB', 'GPS', 'Unix', 'UT'];
for (const scale of SCALES) {
  const val = jdToScale(jdVal, scale);
  printScale(scale, val, jdVal);
}
console.log(`   ${'UT'.padEnd(8)} delta_t = ${DELTA_T_J2000_S.toFixed(3)} s (TT - UT)`);

// ─── 2) Time formats / aliases ─────────────────────────────────────────
line('2) Time formats / aliases (tempoch native classes)');

const mjd = ModifiedJulianDate.fromDate(utcRef);

console.log(`   JulianDate:         ${jd.format()}`);
console.log(`   ModifiedJulianDate: ${mjd.format()}`);
console.log(`   JD value:           ${jd.value}`);
console.log(`   MJD value:          ${mjd.value}`);
console.log(`   Julian centuries:   ${jd.julianCenturies().toFixed(12)}`);
console.log(`   Julian years:       ${jd.julianYears().toFixed(12)}`);

// Round-trip: JD → Date → JD
const utcRoundtrip = jd.toDate();
console.log(`   UTC roundtrip from JD: ${utcRoundtrip.toISOString()}`);

// JD ↔ MJD conversions
const mjdFromJd = jd.toMjd();
const jdFromMjd = mjd.toJd();
console.log(`   JD → MJD: ${mjdFromJd.value}`);
console.log(`   MJD → JD: ${jdFromMjd.value}`);

// ─── 3) Period representations and conversions ─────────────────────────
line('3) Period representations and conversions');

// Create a half-day period starting at J2000
const period = new Period(mjd.value, mjd.value + 0.5);
console.log(`   Period: ${period.format()}`);
console.log(`   Duration: ${period.durationDays().toFixed(6)} days`);
console.log(`   Contains MJD ${(mjd.value + 0.25).toFixed(3)}: ${period.contains(mjd.value + 0.25)}`);
console.log(`   Contains MJD ${(mjd.value + 0.75).toFixed(3)}: ${period.contains(mjd.value + 0.75)}`);

// Show the same period expressed in different scales
const startJd = jdVal;
const endJd = jdVal + 0.5;

for (const scale of SCALES) {
  const s = jdToScale(startJd, scale);
  const e = jdToScale(endJd, scale);
  printPeriod(scale, s, e);
}

// UTC period
const utcStart = jd.toDate();
const utcEnd = new JulianDate(jdVal + 0.5).toDate();
console.log(
  `   ${'UTC'.padEnd(8)} [${utcStart.toISOString()} → ${utcEnd.toISOString()}]  Δ = 0.500000 days (43200 s)`
);

// ─── 4) Period from Dates and back ─────────────────────────────────────
line('4) Period from JS Dates and back');

const dateStart = new Date('2000-01-01T12:00:00Z');
const dateEnd = new Date('2000-01-01T18:00:00Z'); // 6 hours later
const periodFromDates = Period.fromDates(dateStart, dateEnd);

console.log(`   From Dates: ${periodFromDates.format()}`);
console.log(`   Duration: ${periodFromDates.durationDays().toFixed(6)} days`);

// Convert back to UTC
const { startMs, endMs } = periodFromDates.toUtc();
console.log(`   Back to UTC: ${new Date(startMs).toISOString()} → ${new Date(endMs).toISOString()}`);

// Start/end as MJD objects
const startMjd = periodFromDates.start;
const endMjd = periodFromDates.end;
console.log(`   Start MJD: ${startMjd.format()}`);
console.log(`   End MJD:   ${endMjd.format()}`);

// ─── 5) Period intersection ────────────────────────────────────────────
line('5) Period intersection');

const p1 = new Period(51544.0, 51545.0); // J2000 − 0.5d → J2000 + 0.5d
const p2 = new Period(51544.5, 51546.0); // J2000 → J2000 + 1.5d
const overlap = p1.intersection(p2);

console.log(`   P1: MJD ${p1.startMjd} → ${p1.endMjd}  (${p1.durationDays()} d)`);
console.log(`   P2: MJD ${p2.startMjd} → ${p2.endMjd}  (${p2.durationDays()} d)`);
if (overlap) {
  console.log(`   P1 ∩ P2: MJD ${overlap.startMjd} → ${overlap.endMjd}  (${overlap.durationDays()} d)`);
} else {
  console.log('   P1 ∩ P2: no overlap');
}

// Non-overlapping periods
const p3 = new Period(51540.0, 51542.0);
const noOverlap = p1.intersection(p3);
console.log(`   P1 ∩ P3 (disjoint): ${noOverlap === null ? 'no overlap' : 'overlap found'}`);

// ─── 6) Arithmetic ─────────────────────────────────────────────────────
line('6) JulianDate / MJD arithmetic');

const jd0 = new JulianDate(J2000_JD);
const jd1 = jd0.addDays(365.25);
console.log(`   J2000:          ${jd0.format()}`);
console.log(`   J2000 + 1 year: ${jd1.format()}`);
console.log(`   Difference:     ${jd0.difference(jd1).toFixed(2)} days`);

const mjd0 = new ModifiedJulianDate(51544.5);
const mjd1 = mjd0.addDays(30);
console.log(`   MJD J2000:          ${mjd0.format()}`);
console.log(`   MJD J2000 + 30 d:   ${mjd1.format()}`);
console.log(`   Difference:         ${mjd0.difference(mjd1).toFixed(2)} days`);

console.log('\nDone.');
