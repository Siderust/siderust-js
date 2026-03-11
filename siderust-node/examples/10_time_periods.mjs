import { ModifiedJulianDate, Period } from '@siderust/tempoch';

const window = new Period(new ModifiedJulianDate(51_544.5), new ModifiedJulianDate(51_545.5));
const later = new ModifiedJulianDate(51_545.0);

console.log('Window:', window.format());
console.log('Duration:', window.duration().toString());
console.log('Contains 51545.0:', window.contains(later));
console.log('UTC bounds:', window.toUtc());
