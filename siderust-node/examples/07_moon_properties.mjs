import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { Observer, moonPhase, moonPhaseTopocentric } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const observer = new Observer(
  new Quantity(-17.8925, 'Degree'),
  new Quantity(28.7543, 'Degree'),
  new Quantity(2396, 'Meter'),
);
const jd = new JulianDate(2_451_545.0);

console.log('Geocentric moon phase:', moonPhase(jd));
console.log('Topocentric moon phase:', moonPhaseTopocentric(jd, observer));
