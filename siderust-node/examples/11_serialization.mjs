import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { JulianDate } from '@siderust/tempoch';

const require = createRequire(import.meta.url);
const { getPlanet, moonPhase, vsop87Heliocentric } = require(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js'),
);

const payload = {
  mars: {
    mass: getPlanet('Mars').mass.toJson(),
    position: (() => {
      const position = vsop87Heliocentric('Mars', new JulianDate(2_451_545.0));
      return {
        x: position.x.toJson(),
        y: position.y.toJson(),
        z: position.z.toJson(),
        frame: position.frame,
        center: position.center,
      };
    })(),
  },
  moon: {
    phaseAngle: moonPhase(new JulianDate(2_451_545.0)).phaseAngle.toJson(),
  },
};

console.log(JSON.stringify(payload, null, 2));
