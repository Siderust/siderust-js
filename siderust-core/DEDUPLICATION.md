# Node/Web Deduplication Plan

This document outlines the strategy for reducing code duplication between
`siderust-node` and `siderust-web`.

## Current State

Both adapters have near-identical module structures:
- `body.rs`, `coordinates.rs`, `ephemeris.rs`, `events.rs`
- `observer.rs`, `phase.rs`, `position.rs`, `star.rs`

The main differences are:
1. **Import mechanism**: `napi_derive::napi` vs `wasm_bindgen::prelude::*`
2. **Result types**: `#[napi(object)]` structs vs `#[derive(Serialize)]` structs
3. **Error handling**: `napi::Error` vs `JsValue` errors
4. **Type names**: `JsObserver` vs `Observer`, `JsStar` vs `Star`

## Target Architecture

```
siderust-core/
├── body.rs         # Body enum, validation, dispatch macros
├── observer.rs     # ObserverData (lat/lon/alt storage)
├── position.rs     # PositionData, DisplacementData, validation
├── events.rs       # EventData types (CrossingEvent, CulminationEvent, etc.)
├── star.rs         # StarData (catalog fields, proper motion)
├── ephemeris.rs    # EphemerisData (position snapshots)
├── phase.rs        # PhaseData (illumination, phase angle)
└── lib.rs

siderust-node/
├── lib.rs          # napi exports
├── bindings.rs     # napi wrapper: JsType -> CoreType -> compute -> JsType
└── (thin wrappers only)

siderust-web/
├── lib.rs          # wasm_bindgen exports
├── bindings.rs     # wasm wrapper: serde JSON <-> CoreType -> compute -> JSON
└── (thin wrappers only)
```

## Migration Steps

### Phase 1: Core Data Types (✓ Partially Complete)
- [x] `PositionData`, `DisplacementData` in core
- [x] `ObserverData` in core
- [x] Body enum and validation in core
- [ ] `EventData` types (CrossingEvent, CulminationEvent, MjdPeriod, etc.)
- [ ] `StarData` for catalog fields
- [ ] `EphemerisData` for position snapshots

### Phase 2: Computation Functions
- [ ] Move `above_threshold`, `below_threshold`, `crossings`, `culminations`
      logic into core with generic return types
- [ ] Core computes with Rust types, returns `Vec<EventData>`
- [ ] Platform crates convert to binding-specific output

### Phase 3: Thin Wrapper Layer
- [ ] Node: `#[napi]` functions that call core and convert results
- [ ] Web: `#[wasm_bindgen]` functions that call core and serialize

## Example: Event Deduplication

**Before (duplicated):**
```rust
// siderust-node/src/events.rs
#[napi(object)]
pub struct CrossingEvent {
    pub mjd: f64,
    pub direction: String,
}

// siderust-web/src/events.rs  
#[derive(Serialize)]
pub struct CrossingEvent {
    pub mjd: f64,
    pub direction: String,
}
```

**After (shared):**
```rust
// siderust-core/src/events.rs
pub struct CrossingEventData {
    pub mjd: f64,
    pub direction: CrossingDirection,
}

pub enum CrossingDirection {
    Rising,
    Setting,
}

// siderust-node/src/events.rs
#[napi(object)]
pub struct CrossingEvent {
    pub mjd: f64,
    pub direction: String,
}

impl From<CrossingEventData> for CrossingEvent {
    fn from(e: CrossingEventData) -> Self {
        Self {
            mjd: e.mjd,
            direction: e.direction.as_str().to_string(),
        }
    }
}
```

## Benefits

1. **Single source of truth** for validation and business logic
2. **Easier testing** - test core once, platform wrappers are thin
3. **Consistent behavior** between Node and Web
4. **Reduced maintenance** - fixes apply to both platforms
5. **Type safety** - core uses Rust enums, platform crates convert to strings

## Implementation Notes

- Keep `#[derive(Clone)]` on core types for easy conversion
- Use `From` traits for platform-specific conversions
- Consider `TryFrom` for types that can fail validation
- Core should not depend on napi or wasm-bindgen
