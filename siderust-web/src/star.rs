// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Star — catalog and custom stars for altitude/azimuth/coordinate queries.

use wasm_bindgen::prelude::*;
use siderust::bodies::Star as SiderustStar;
use siderust_binding_core::star as core_star;

// ─────────────────────────────────────────────────────────────────────────────
// Star class
// ─────────────────────────────────────────────────────────────────────────────

/// A star with physical parameters and sky coordinates.
#[wasm_bindgen]
pub struct Star {
    pub(crate) inner: SiderustStar<'static>,
}

#[wasm_bindgen]
impl Star {
    /// Create a custom star.
    ///
    /// @param name        — Display name.
    /// @param distanceLy  — Distance in light-years.
    /// @param massSolar   — Mass in solar masses (M☉).
    /// @param radiusSolar — Radius in solar radii (R☉).
    /// @param luminositySolar — Luminosity in solar luminosities (L☉).
    /// @param raDeg       — Right ascension at J2000.0 in degrees.
    /// @param decDeg      — Declination at J2000.0 in degrees.
    #[wasm_bindgen(constructor)]
    pub fn new(
        name: &str,
        distance_ly: f64,
        mass_solar: f64,
        radius_solar: f64,
        luminosity_solar: f64,
        ra_deg: f64,
        dec_deg: f64,
    ) -> Result<Star, JsError> {
        core_star::create_star(
            name,
            distance_ly,
            mass_solar,
            radius_solar,
            luminosity_solar,
            ra_deg,
            dec_deg,
        )
        .map(|inner| Self { inner })
        .map_err(|error| JsError::new(&error))
    }

    /// Look up a star from the built-in catalog by name.
    ///
    /// Supported names (case-insensitive): Vega, Sirius, Polaris, Canopus,
    /// Arcturus, Rigel, Betelgeuse, Procyon, Aldebaran, Altair.
    pub fn catalog(name: &str) -> Result<Star, JsError> {
        core_star::catalog_star(name)
            .map(|inner| Self { inner })
            .map_err(|error| JsError::new(&error))
    }

    // ── accessors ────────────────────────────────────────────────────

    /// Star name.
    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.inner.name.to_string()
    }

    /// Distance in light-years.
    #[wasm_bindgen(getter, js_name = "distanceLy")]
    pub fn distance_ly(&self) -> f64 {
        self.inner.distance.value()
    }

    /// Mass in solar masses (M☉).
    #[wasm_bindgen(getter, js_name = "massSolar")]
    pub fn mass_solar(&self) -> f64 {
        self.inner.mass.value()
    }

    /// Radius in solar radii (R☉).
    #[wasm_bindgen(getter, js_name = "radiusSolar")]
    pub fn radius_solar(&self) -> f64 {
        self.inner.radius.value()
    }

    /// Luminosity in solar luminosities (L☉).
    #[wasm_bindgen(getter, js_name = "luminositySolar")]
    pub fn luminosity_solar(&self) -> f64 {
        self.inner.luminosity.value()
    }

    /// Right ascension at J2000.0 in degrees.
    #[wasm_bindgen(getter, js_name = "raDeg")]
    pub fn ra_deg(&self) -> f64 {
        self.inner.coordinate.get_position().azimuth.value()
    }

    /// Declination at J2000.0 in degrees.
    #[wasm_bindgen(getter, js_name = "decDeg")]
    pub fn dec_deg(&self) -> f64 {
        self.inner.coordinate.get_position().polar.value()
    }

    /// Human-readable representation.
    pub fn format(&self) -> String {
        format!(
            "Star({}, d={:.1} ly, RA={:.4}°, Dec={:.4}°)",
            self.inner.name,
            self.inner.distance.value(),
            self.inner.coordinate.get_position().azimuth.value(),
            self.inner.coordinate.get_position().polar.value(),
        )
    }
}

/// List all catalog star names.
#[wasm_bindgen(js_name = "listCatalogStars")]
pub fn list_catalog_stars() -> JsValue {
    serde_wasm_bindgen::to_value(&core_star::list_catalog_star_names()).unwrap()
}
