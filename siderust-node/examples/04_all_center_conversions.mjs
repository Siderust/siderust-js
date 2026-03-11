import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { transformPositionCenter, vsop87Barycentric, vsop87EarthBarycentric } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const jd = new JulianDate(2_451_545.0);
const mars = vsop87Barycentric('Mars', jd);
const earth = vsop87EarthBarycentric(jd);

console.log('Mars barycentric:', mars);
console.log(
  'Mars geocentric:',
  transformPositionCenter(mars.x, mars.y, mars.z, 'Barycentric', 'Geocentric', jd),
);
console.log(
  'Earth heliocentric:',
  transformPositionCenter(earth.x, earth.y, earth.z, 'Barycentric', 'Heliocentric', jd),
);
