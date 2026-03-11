import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { getPlanet, orbitalPeriod, vsop87Heliocentric } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const jd = new JulianDate(2_451_545.0);
for (const body of ['Mercury', 'Venus', 'Earth', 'Mars']) {
  console.log(body, {
    info: getPlanet(body),
    period: orbitalPeriod(body),
    position: vsop87Heliocentric(body, jd),
  });
}
