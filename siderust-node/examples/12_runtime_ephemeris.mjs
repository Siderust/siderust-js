import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { transformPositionCenter, vsop87EarthHeliocentric, vsop87Heliocentric } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const jd = new JulianDate(2_451_545.0);
const earth = vsop87EarthHeliocentric(jd);
const mars = vsop87Heliocentric('Mars', jd);
const shifted = transformPositionCenter(
  new Quantity(mars.x.value, mars.x.unit),
  new Quantity(mars.y.value, mars.y.unit),
  new Quantity(mars.z.value, mars.z.unit),
  'Heliocentric',
  'Geocentric',
  jd,
);

console.log('Earth:', earth);
console.log('Mars:', mars);
console.log('Mars from Earth:', shifted);
