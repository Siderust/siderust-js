/**
 * 04_all_center_conversions.mjs — All Center Conversions
 *
 * Mirrors: siderust/examples/04_all_center_conversions.rs
 *
 * Demonstrates all supported center-shift pairs: Barycentric ↔ Heliocentric,
 * Barycentric ↔ Geocentric, Heliocentric ↔ Geocentric, with round-trip
 * verification.
 *
 * Run: node examples/04_all_center_conversions.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  transformPositionCenter,
  cartesianMagnitude,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const JD = 2460000.5;

function showCenterConversion(srcCenter, dstCenter, p) {
  const out = transformPositionCenter(p.x, p.y, p.z, srcCenter, dstCenter, JD);
  const back = transformPositionCenter(out.x, out.y, out.z, dstCenter, srcCenter, JD);
  const err = cartesianMagnitude(p.x - back.x, p.y - back.y, p.z - back.z);
  console.log(
    `${srcCenter.padEnd(14)} -> ${dstCenter.padEnd(14)} out=(${out.x.toFixed(9)}, ${out.y.toFixed(9)}, ${out.z.toFixed(9)})  roundtrip=${err.toExponential(3)}`
  );
}

console.log(`Center conversion demo at JD(TT) = ${JD.toFixed(1)}\n`);

// Start with a barycentric position
const pBary = { x: 0.40, y: -0.10, z: 1.20 };

// Convert to other centers for use as sources
const pHelio = transformPositionCenter(pBary.x, pBary.y, pBary.z, 'Barycentric', 'Heliocentric', JD);
const pGeo   = transformPositionCenter(pBary.x, pBary.y, pBary.z, 'Barycentric', 'Geocentric', JD);

// ── Standard center shifts ──

console.log('── Standard center shifts ───────────────────────────────────────');

// Barycentric source
showCenterConversion('Barycentric', 'Barycentric', pBary);
showCenterConversion('Barycentric', 'Heliocentric', pBary);
showCenterConversion('Barycentric', 'Geocentric', pBary);

// Heliocentric source
showCenterConversion('Heliocentric', 'Heliocentric', pHelio);
showCenterConversion('Heliocentric', 'Barycentric', pHelio);
showCenterConversion('Heliocentric', 'Geocentric', pHelio);

// Geocentric source
showCenterConversion('Geocentric', 'Geocentric', pGeo);
showCenterConversion('Geocentric', 'Barycentric', pGeo);
showCenterConversion('Geocentric', 'Heliocentric', pGeo);

// ── Verification: Helio → Geo → Bary → Helio ──

console.log('\n── Chain verification: Helio → Geo → Bary → Helio ──────────────');
const step1 = transformPositionCenter(pHelio.x, pHelio.y, pHelio.z, 'Heliocentric', 'Geocentric', JD);
const step2 = transformPositionCenter(step1.x, step1.y, step1.z, 'Geocentric', 'Barycentric', JD);
const step3 = transformPositionCenter(step2.x, step2.y, step2.z, 'Barycentric', 'Heliocentric', JD);
const chainErr = cartesianMagnitude(pHelio.x - step3.x, pHelio.y - step3.y, pHelio.z - step3.z);
console.log(`Original:  (${pHelio.x.toFixed(9)}, ${pHelio.y.toFixed(9)}, ${pHelio.z.toFixed(9)})`);
console.log(`Recovered: (${step3.x.toFixed(9)}, ${step3.y.toFixed(9)}, ${step3.z.toFixed(9)})`);
console.log(`Round-trip error: ${chainErr.toExponential(3)}`);
