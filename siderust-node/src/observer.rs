// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Observer (geodetic site) for topocentric computations.

use napi_derive::napi;
use siderust::coordinates::centers::Geodetic;
use siderust::coordinates::frames::ECEF;
use siderust_binding_core::observer as core_observer;

// ─────────────────────────────────────────────────────────────────────────────
// Observer class
// ─────────────────────────────────────────────────────────────────────────────

/// A geodetic observer location on the Earth's surface (WGS84 ellipsoid).
///
/// Used as the reference site for all topocentric computations: altitude,
/// azimuth, crossings, culminations, and coordinate transforms to the
/// Horizontal frame.
///
/// ```js
/// const { Observer } = require('@siderust/siderust');
///
/// // Custom site
/// const obs = new Observer(-17.8925, 28.7543, 2396);
///
/// // Preset observatory
/// const orm = Observer.roqueDeLasMuchachos();
/// ```
#[napi(js_name = "Observer")]
pub struct JsObserver {
    pub(crate) inner: Geodetic<ECEF>,
}

#[napi]
impl JsObserver {
    /// Create an observer at a geodetic position.
    ///
    /// @param lonDeg   — Longitude in degrees (east positive).
    /// @param latDeg   — Latitude in degrees (north positive).
    /// @param heightM  — Height above WGS84 ellipsoid in metres.
    #[napi(constructor)]
    pub fn new(lon_deg: f64, lat_deg: f64, height_m: f64) -> napi::Result<Self> {
        core_observer::validate_observer_coords(lon_deg, lat_deg, height_m)
            .map_err(napi::Error::from_reason)?;
        Ok(Self {
            inner: core_observer::create_observer(lon_deg, lat_deg, height_m),
        })
    }

    // ── preset observatories ─────────────────────────────────────────

    /// Roque de los Muchachos Observatory (La Palma, Spain).
    ///
    /// Longitude −17.8925°, Latitude +28.7543°, Altitude 2396 m.
    #[napi(factory, js_name = "roqueDeLasMuchachos")]
    pub fn roque_de_las_muchachos() -> Self {
        Self {
            inner: core_observer::roque_de_los_muchachos(),
        }
    }

    /// Paranal Observatory (ESO, Chile).
    ///
    /// Longitude −70.4043°, Latitude −24.6272°, Altitude 2635 m.
    #[napi(factory, js_name = "elParanal")]
    pub fn el_paranal() -> Self {
        Self {
            inner: core_observer::el_paranal(),
        }
    }

    /// Mauna Kea Observatory (Hawaiʻi, USA).
    ///
    /// Longitude −155.4681°, Latitude +19.8207°, Altitude 4207 m.
    #[napi(factory, js_name = "maunaKea")]
    pub fn mauna_kea() -> Self {
        Self {
            inner: core_observer::mauna_kea(),
        }
    }

    /// La Silla Observatory (ESO, Chile).
    ///
    /// Longitude −70.7346°, Latitude −29.2584°, Altitude 2400 m.
    #[napi(factory, js_name = "laSilla")]
    pub fn la_silla() -> Self {
        Self {
            inner: core_observer::la_silla(),
        }
    }

    // ── accessors ────────────────────────────────────────────────────

    /// Longitude in degrees (east positive).
    #[napi(getter, js_name = "lonDeg")]
    pub fn lon_deg(&self) -> f64 {
        core_observer::get_observer_lon_deg(&self.inner)
    }

    /// Latitude in degrees (north positive).
    #[napi(getter, js_name = "latDeg")]
    pub fn lat_deg(&self) -> f64 {
        core_observer::get_observer_lat_deg(&self.inner)
    }

    /// Height above the WGS84 ellipsoid in metres.
    #[napi(getter, js_name = "heightM")]
    pub fn height_m(&self) -> f64 {
        core_observer::get_observer_height_m(&self.inner)
    }

    /// Human-readable string representation.
    #[napi]
    pub fn format(&self) -> String {
        format!(
            "Observer(lon={:.4}°, lat={:.4}°, h={:.1} m)",
            self.lon_deg(),
            self.lat_deg(),
            self.height_m(),
        )
    }
}
