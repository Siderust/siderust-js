import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { transformDirection } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const DEG = (value) => new Quantity(value, 'Degree');
const jd = new JulianDate(2_451_545.0);
const frames = [
  'ICRS',
  'EclipticMeanJ2000',
  'EquatorialMeanJ2000',
  'EquatorialMeanOfDate',
  'EquatorialTrueOfDate',
];

for (const frame of frames) {
  const result = transformDirection(DEG(38.7837), DEG(279.2347), 'ICRS', frame, jd);
  console.log(frame, result);
}
