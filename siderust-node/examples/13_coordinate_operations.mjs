import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';

const require = createRequire(import.meta.url);
const { angularSeparation, cartesianDistance, cartesianMagnitude } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const DEG = (value) => new Quantity(value, 'Degree');
const M = (value) => new Quantity(value, 'Meter');

console.log(
  'Angular separation:',
  angularSeparation(DEG(38.7837), DEG(279.2347), DEG(7.4071), DEG(88.7929), 'ICRS'),
);
console.log('Distance:', cartesianDistance(M(0), M(0), M(0), M(3), M(4), M(12)));
console.log('Magnitude:', cartesianMagnitude(M(3), M(4), M(12)));
