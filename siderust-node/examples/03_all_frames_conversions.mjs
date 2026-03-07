/**
 * 03_all_frames_conversions.mjs — All Frame Conversions
 *
 * Mirrors: siderust/examples/03_all_frames_conversions.rs
 *
 * Demonstrates every direct frame-rotation pair, including round-trip
 * verification for each conversion.
 *
 * Run: node examples/03_all_frames_conversions.mjs
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  transformPositionFrame,
  cartesianMagnitude,
} = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'));

const JD = 2460000.5;
const src = { x: 0.30, y: -0.70, z: 0.64 };

function showFrameConversion(srcFrame, dstFrame, p) {
  const out = transformPositionFrame(p.x, p.y, p.z, srcFrame, dstFrame, JD);
  const back = transformPositionFrame(out.x, out.y, out.z, dstFrame, srcFrame, JD);
  const err = cartesianMagnitude(p.x - back.x, p.y - back.y, p.z - back.z);
  console.log(
    `${srcFrame.padEnd(24)} -> ${dstFrame.padEnd(24)} out=(${out.x.toFixed(9)}, ${out.y.toFixed(9)}, ${out.z.toFixed(9)})  roundtrip=${err.toExponential(3)}`
  );
}

console.log(`Frame conversion demo at JD(TT) = ${JD.toFixed(1)}\n`);

// First, convert the ICRS source to each frame so we have starting points
const frames = ['ICRS', 'EclipticMeanJ2000', 'EquatorialMeanJ2000', 'EquatorialMeanOfDate', 'EquatorialTrueOfDate'];
const positions = {};
positions['ICRS'] = src;
for (const f of frames) {
  if (f !== 'ICRS') {
    const p = transformPositionFrame(src.x, src.y, src.z, 'ICRS', f, JD);
    positions[f] = { x: p.x, y: p.y, z: p.z };
  }
}

// Identity conversions
console.log('── Identity conversions ──');
for (const f of frames) {
  showFrameConversion(f, f, positions[f]);
}

// All direct non-identity provider pairs
console.log('\n── Non-identity conversions ──');
// These are the supported direct frame pairs:
const pairs = [
  ['ICRS', 'EclipticMeanJ2000'],
  ['EclipticMeanJ2000', 'ICRS'],
  ['ICRS', 'EquatorialMeanJ2000'],
  ['EquatorialMeanJ2000', 'ICRS'],
  ['EquatorialMeanJ2000', 'EclipticMeanJ2000'],
  ['EclipticMeanJ2000', 'EquatorialMeanJ2000'],
  ['EquatorialMeanJ2000', 'EquatorialMeanOfDate'],
  ['EquatorialMeanOfDate', 'EquatorialMeanJ2000'],
  ['EquatorialMeanOfDate', 'EquatorialTrueOfDate'],
  ['EquatorialTrueOfDate', 'EquatorialMeanOfDate'],
  ['EquatorialMeanJ2000', 'EquatorialTrueOfDate'],
  ['EquatorialTrueOfDate', 'EquatorialMeanJ2000'],
  ['ICRS', 'EquatorialMeanOfDate'],
  ['EquatorialMeanOfDate', 'ICRS'],
  ['ICRS', 'EquatorialTrueOfDate'],
  ['EquatorialTrueOfDate', 'ICRS'],
  // Routed through ICRS (two-hop):
  ['EclipticMeanJ2000', 'EquatorialMeanOfDate'],
  ['EquatorialMeanOfDate', 'EclipticMeanJ2000'],
  ['EclipticMeanJ2000', 'EquatorialTrueOfDate'],
  ['EquatorialTrueOfDate', 'EclipticMeanJ2000'],
];

for (const [from, to] of pairs) {
  showFrameConversion(from, to, positions[from]);
}
