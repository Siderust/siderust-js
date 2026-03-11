import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { transformDirection, vsop87Heliocentric } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const DEG = (value) => new Quantity(value, 'Degree');
const jd0 = new JulianDate(2_451_545.0);
const jd1 = new JulianDate(2_451_545.5);

console.log('Mars at J2000:', vsop87Heliocentric('Mars', jd0));
console.log('Mars 12h later:', vsop87Heliocentric('Mars', jd1));
console.log(
  'Vega of-date direction at J2000+12h:',
  transformDirection(DEG(38.7837), DEG(279.2347), 'ICRS', 'EquatorialTrueOfDate', jd1),
);
