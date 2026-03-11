import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { transformPositionCenter, transformPositionFrame, vsop87Heliocentric } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const jd = new JulianDate(2_451_545.0);
const mars = vsop87Heliocentric('Mars', jd);

console.log('Mars heliocentric position:', mars);
console.log(
  'Mars geocentric position:',
  transformPositionCenter(mars.x, mars.y, mars.z, 'Heliocentric', 'Geocentric', jd),
);
console.log(
  'Mars equatorial position:',
  transformPositionFrame(mars.x, mars.y, mars.z, 'EclipticMeanJ2000', 'EquatorialMeanJ2000', jd),
);
console.log('Reference length unit:', new Quantity(1, mars.x.unit).toString());
