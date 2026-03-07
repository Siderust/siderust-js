// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Browser/WASM bindings for **siderust** — high-precision astronomy.
//!
//! This crate uses `wasm-bindgen` to expose siderust's core workflows as a
//! browser-friendly WebAssembly module.  All numerical computation stays in
//! Rust/WASM; the JS layer only sees high-level domain objects.
//!
//! ## Design principles
//!
//! * **Batch over chatty** — altitude/azimuth queries return arrays of events
//!   in a single crossing, avoiding per-value JS↔WASM overhead.
//! * **Domain objects** — `Observer`, `Star`, `CartesianPosition`, etc.
//!   rather than raw numeric tuples.
//! * **API parity** — mirrors the `@siderust/siderust` (Node) package so
//!   code can be ported between Node and browser with minimal changes.

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

use wasm_bindgen::prelude::*;

/// Initialise panic hook for readable error messages in the browser console.
#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

/// Return the siderust-web version string.
#[wasm_bindgen(js_name = "version")]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
