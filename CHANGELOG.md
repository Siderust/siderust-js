# Changelog

All notable changes to the JavaScript workspace are documented here.

## [Unreleased]

### Changed
- Documented the shared `rework-ffi` development flow for `qtty-js`,
  `tempoch-js`, and `siderust-js`, including the canonical-workspace path
  patches used for local integration and the branch-pinned git-patch workflow
  to use once those Rust branches are committed.

## [0.1.0] - 2026-03-11

### Added
- Initial `siderust-js` workspace release documentation covering the published
  Node and Web packages.
- `@siderust/siderust` for Node.js, exposing observer and star models,
  coordinate transforms, ephemerides, event search helpers, time-period
  operations, and lunar phase helpers.
- `@siderust/siderust-web` for browsers and bundlers, exposing the same
  astronomy surface over WebAssembly with explicit async initialization via
  `init()`.
- TypeScript declaration files, examples, package READMEs, and automated tests
  for the Node and Web packages.

### Changed
- The public JS API is now strictly typed around the published `qtty-js` and
  `tempoch-js` packages.
- Raw numeric time and quantity inputs are no longer part of the public
  surface; callers must use `Quantity`, `JulianDate`, `ModifiedJulianDate`, and
  `Period` objects.
- Public unit-suffixed numeric fields and `*Like` aliases were removed in favor
  of typed domain objects and unit-neutral field names.
