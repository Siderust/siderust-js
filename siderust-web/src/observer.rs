// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Observer (geodetic site) for topocentric computations.

use wasm_bindgen::prelude::*;
use siderust::coordinates::centers::Geodetic;
use siderust::coordinates::frames::ECEF;
use siderust_binding_core::observer as core_observer;

// ─────────────────────────────────────────────────────────────────────────────
// Observer class
// ─────────────────────────────────────────────────────────────────────────────

/// A geodetic observer location on the Earth's surface (WGS84 ellipsoid).
#[wasm_bindgen]
pub struct Observer {
    pub(crate) inner: Geodetic<ECEF>,
}

#[wasm_bindgen]
impl Observer {
    /// Create an observer at a geodetic position.
    ///
    /// @param lonDeg   — Longitude in degrees (east positive).
    /// @param latDeg   — Latitude in degrees (north positive).
    /// @param heightM  — Height above WGS84 ellipsoid in metres.
    #[wasm_bindgen(constructor)]
    pub fn new(lon_deg: f64, lat_deg: f64, height_m: f64) -> Result<Observer, JsError> {
        core_observer::validate_observer_coords(lon_deg, lat_deg, height_m)
            .map_err(|error| JsError::new(&error))?;
        Ok(Self {
            inner: core_observer::create_observer(lon_deg, lat_deg, height_m),
        })
    }

    // ── preset observatories ─────────────────────────────────────────

    /// Roque de los Muchachos Observatory (La Palma, Spain).
    ///
    /// Longitude −17.8925°, Latitude +28.7543°, Altitude 2396 m.
    #[wasm_bindgen(js_name = "roqueDeLasMuchachos")]
    pub fn roque_de_las_muchachos() -> Observer {
        Self {
            inner: core_observer::roque_de_los_muchachos(),
        }
    }

    /// Paranal Observatory (ESO, Chile).
    ///
    /// Longitude −70.4043°, Latitude −24.6272°, Altitude 2635 m.
    #[wasm_bindgen(js_name = "elParanal")]
    pub fn el_paranal() -> Observer {
        Self {
            inner: core_observer::el_paranal(),
        }
    }

    /// Mauna Kea Observatory (Hawaiʻi, USA).
    ///
    /// Longitude −155.4681°, Latitude +19.8207°, Altitude 4207 m.
    #[wasm_bindgen(js_name = "maunaKea")]
    pub fn mauna_kea() -> Observer {
        Self {
            inner: core_observer::mauna_kea(),
        }
    }

    /// La Silla Observatory (ESO, Chile).
    ///
    /// Longitude −70.7346°, Latitude −29.2584°, Altitude 2400 m.
    #[wasm_bindgen(js_name = "laSilla")]
    pub fn la_silla() -> Observer {
        Self {
            inner: core_observer::la_silla(),
        }
    }

    // ── accessors ────────────────────────────────────────────────────

    /// Longitude in degrees (east positive).
    #[wasm_bindgen(getter, js_name = "lonDeg")]
    pub fn lon_deg(&self) -> f64 {
        core_observer::get_observer_lon_deg(&self.inner)
    }

    /// Latitude in degrees (north positive).
    #[wasm_bindgen(getter, js_name = "latDeg")]
    pub fn lat_deg(&self) -> f64 {
        core_observer::get_observer_lat_deg(&self.inner)
    }

    /// Height above the WGS84 ellipsoid in metres.
    #[wasm_bindgen(getter, js_name = "heightM")]
    pub fn height_m(&self) -> f64 {
        core_observer::get_observer_height_m(&self.inner)
    }

    /// Human-readable string representation.
    pub fn format(&self) -> String {
        format!(
            "Observer(lon={:.4}°, lat={:.4}°, h={:.1} m)",
            self.lon_deg(),
            self.lat_deg(),
            self.height_m(),
        )
    }
}
