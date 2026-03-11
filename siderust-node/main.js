/**
 * @siderust/siderust — Astronomy primitives for Node.js.
 *
 * Public entrypoint. Exposes the typed JS façade classes and wrapper
 * functions while keeping the generated N-API loader internal.
 *
 * @module @siderust/siderust
 */

'use strict';

const { Observer } = require('./lib/Observer.js');
const { Star } = require('./lib/Star.js');
const wrappers = require('./lib/wrappers.js');

module.exports = {
  Observer,
  Star,
  ...wrappers,
};
