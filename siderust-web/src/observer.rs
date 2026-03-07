// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Observer (geodetic site) for topocentric computations.

use wasm_bindgen::prelude::*;

use qtty::*;
use siderust::coordinates::centers::Geodetic;
use siderust::coordinates::frames::ECEF;
use siderust::observatories;

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
        if !lon_deg.is_finite() || !lat_deg.is_finite() || !height_m.is_finite() {
            return Err(JsError::new(
                "Observer coordinates must be finite (not NaN or ±infinity)",
            ));
        }
        Ok(Self {
            inner: Geodetic::<ECEF>::new(
                Degrees::new(lon_deg),
                Degrees::new(lat_deg),
                Meters::new(height_m),
            ),
        })
    }

    // ── preset observatories ─────────────────────────────────────────

    /// Roque de los Muchachos Observatory (La Palma, Spain).
    ///
    /// Longitude −17.8925°, Latitude +28.7543°, Altitude 2396 m.
    #[wasm_bindgen(js_name = "roqueDeLasMuchachos")]
    pub fn roque_de_las_muchachos() -> Observer {
        Self {
            inner: observatories::ROQUE_DE_LOS_MUCHACHOS,
        }
    }

    /// Paranal Observatory (ESO, Chile).
    ///
    /// Longitude −70.4043°, Latitude −24.6272°, Altitude 2635 m.
    #[wasm_bindgen(js_name = "elParanal")]
    pub fn el_paranal() -> Observer {
        Self {
            inner: observatories::EL_PARANAL,
        }
    }

    /// Mauna Kea Observatory (Hawaiʻi, USA).
    ///
    /// Longitude −155.4681°, Latitude +19.8207°, Altitude 4207 m.
    #[wasm_bindgen(js_name = "maunaKea")]
    pub fn mauna_kea() -> Observer {
        Self {
            inner: observatories::MAUNA_KEA,
        }
    }

    /// La Silla Observatory (ESO, Chile).
    ///
    /// Longitude −70.7346°, Latitude −29.2584°, Altitude 2400 m.
    #[wasm_bindgen(js_name = "laSilla")]
    pub fn la_silla() -> Observer {
        Self {
            inner: observatories::LA_SILLA_OBSERVATORY,
        }
    }

    // ── accessors ────────────────────────────────────────────────────

    /// Longitude in degrees (east positive).
    #[wasm_bindgen(getter, js_name = "lonDeg")]
    pub fn lon_deg(&self) -> f64 {
        self.inner.lon.value()
    }

    /// Latitude in degrees (north positive).
    #[wasm_bindgen(getter, js_name = "latDeg")]
    pub fn lat_deg(&self) -> f64 {
        self.inner.lat.value()
    }

    /// Height above the WGS84 ellipsoid in metres.
    #[wasm_bindgen(getter, js_name = "heightM")]
    pub fn height_m(&self) -> f64 {
        self.inner.height.value()
    }

    /// Human-readable string representation.
    pub fn format(&self) -> String {
        format!(
            "Observer(lon={:.4}°, lat={:.4}°, h={:.1} m)",
            self.inner.lon.value(),
            self.inner.lat.value(),
            self.inner.height.value(),
        )
    }
}
