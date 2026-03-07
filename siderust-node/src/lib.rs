// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Node.js native bindings for **siderust** — high-precision astronomy.
//!
//! This crate uses `napi-rs` to expose siderust's core workflows as a
//! JavaScript/TypeScript-friendly API.  All numerical computation stays in
//! Rust; the JS layer only sees high-level domain objects.
//!
//! ## Design principles
//!
//! * **Batch over chatty** — altitude/azimuth queries return arrays of events
//!   in a single crossing, avoiding per-value FFI overhead.
//! * **Domain objects** — `Observer`, `Star`, `Body`, `CartesianPosition`, etc.
//!   rather than raw numeric tuples.
//! * **Reuse conventions** — camelCase naming, `napi::Error` for exceptions,
//!   MJD/JD as `f64` — consistent with `@siderust/tempoch` and `@siderust/qtty`.

#![deny(clippy::all)]

mod body;
mod coordinates;
mod ephemeris;
mod events;
mod observer;
mod phase;
mod star;

pub use body::*;
pub use coordinates::*;
pub use ephemeris::*;
pub use events::*;
pub use observer::*;
pub use phase::*;
pub use star::*;

/// Return the siderust-node version string.
#[napi_derive::napi(js_name = "version")]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
