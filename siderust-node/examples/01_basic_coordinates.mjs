import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { Observer, directionToCartesian, geodeticToEcef, transformDirection } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const DEG = (value) => new Quantity(value, 'Degree');
const jd = new JulianDate(2_451_545.0);
const observer = new Observer(DEG(-17.8925), DEG(28.7543), new Quantity(2396, 'Meter'));

console.log('Observer:', observer.format());
console.log('ECEF:', geodeticToEcef(observer));

const vega = transformDirection(DEG(38.7837), DEG(279.2347), 'ICRS', 'EclipticMeanJ2000', jd);
console.log('Vega in ecliptic coordinates:', vega);

const unitVector = directionToCartesian(DEG(38.7837), DEG(279.2347));
console.log('Unit vector:', unitVector);
