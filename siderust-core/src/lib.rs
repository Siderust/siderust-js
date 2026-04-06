// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Shared binding logic for siderust JavaScript adapters.
//!
//! This crate contains the core types and logic shared between the
//! Node.js (napi-rs) and WebAssembly (wasm-bindgen) adapters.
//!
//! ## Deduplication Strategy
//!
//! See [`DEDUPLICATION.md`](../DEDUPLICATION.md) for the plan to reduce
//! code duplication between siderust-node and siderust-web.
//!
//! The goal is to move all domain logic here, keeping only thin binding
//! wrappers in the platform-specific crates.

pub mod body;
pub mod events;
pub mod observer;
pub mod position;
pub mod star;
