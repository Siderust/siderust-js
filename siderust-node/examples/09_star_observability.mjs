import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { ModifiedJulianDate, Period } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { Observer, Star, intersectPeriods, starAboveThreshold, starAzimuthCrossings } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const observer = Observer.roqueDeLasMuchachos();
const sirius = Star.catalog('Sirius');
const window = new Period(new ModifiedJulianDate(60_000.0), new ModifiedJulianDate(60_001.0));

const highAltitude = starAboveThreshold(sirius, observer, window, new Quantity(25, 'Degree'));
const dueSouth = starAzimuthCrossings(sirius, observer, window, new Quantity(180, 'Degree'));

console.log('High-altitude periods:', highAltitude);
console.log('South crossings:', dueSouth);
console.log('Self-intersection check:', intersectPeriods(highAltitude, highAltitude));
