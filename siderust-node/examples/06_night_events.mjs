import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { ModifiedJulianDate, Period } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { Observer, bodyBelowThreshold, bodyCrossings } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const DEG = (value) => new Quantity(value, 'Degree');
const observer = new Observer(DEG(0), DEG(51.4769), new Quantity(0, 'Meter'));
const week = new Period(new ModifiedJulianDate(60_000.0), new ModifiedJulianDate(60_007.0));

console.log('Sunset/sunrise events:', bodyCrossings('Sun', observer, week, DEG(0)));
console.log('Astronomical night periods:', bodyBelowThreshold('Sun', observer, week, DEG(-18)));
