// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Star — catalog and custom stars for altitude/azimuth/coordinate queries.

use napi_derive::napi;
use siderust::bodies::Star;
use siderust_binding_core::star as core_star;

// ─────────────────────────────────────────────────────────────────────────────
// Star class
// ─────────────────────────────────────────────────────────────────────────────

/// A star with physical parameters and sky coordinates.
///
/// Use the factory methods to look up well-known stars from the built-in
/// catalog, or the constructor to define custom stars.
///
/// ```js
/// const { Star } = require('@siderust/siderust');
///
/// // Catalog look-up
/// const vega = Star.catalog('Vega');
///
/// // Custom star
/// const custom = new Star('MyStar', 100, 1.5, 1.2, 3.0, 200.0, 45.0);
/// ```
#[napi(js_name = "Star")]
pub struct JsStar {
    pub(crate) inner: Star<'static>,
}

#[napi]
impl JsStar {
    /// Create a custom star.
    ///
    /// @param name        — Display name.
    /// @param distanceLy  — Distance in light-years.
    /// @param massSolar   — Mass in solar masses (M☉).
    /// @param radiusSolar — Radius in solar radii (R☉).
    /// @param luminositySolar — Luminosity in solar luminosities (L☉).
    /// @param raDeg       — Right ascension at J2000.0 in degrees.
    /// @param decDeg      — Declination at J2000.0 in degrees.
    #[napi(constructor)]
    pub fn new(
        name: String,
        distance_ly: f64,
        mass_solar: f64,
        radius_solar: f64,
        luminosity_solar: f64,
        ra_deg: f64,
        dec_deg: f64,
    ) -> napi::Result<Self> {
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
        .map_err(napi::Error::from_reason)
    }

    /// Look up a star from the built-in catalog by name.
    ///
    /// Supported names (case-insensitive): Vega, Sirius, Polaris, Canopus,
    /// Arcturus, Rigel, Betelgeuse, Procyon, Aldebaran, Altair.
    #[napi(factory)]
    pub fn catalog(name: String) -> napi::Result<Self> {
        core_star::catalog_star(&name)
            .map(|inner| Self { inner })
            .map_err(napi::Error::from_reason)
    }

    // ── accessors ────────────────────────────────────────────────────

    /// Star name.
    #[napi(getter)]
    pub fn name(&self) -> String {
        self.inner.name.to_string()
    }

    /// Distance in light-years.
    #[napi(getter, js_name = "distanceLy")]
    pub fn distance_ly(&self) -> f64 {
        self.inner.distance.value()
    }

    /// Mass in solar masses (M☉).
    #[napi(getter, js_name = "massSolar")]
    pub fn mass_solar(&self) -> f64 {
        self.inner.mass.value()
    }

    /// Radius in solar radii (R☉).
    #[napi(getter, js_name = "radiusSolar")]
    pub fn radius_solar(&self) -> f64 {
        self.inner.radius.value()
    }

    /// Luminosity in solar luminosities (L☉).
    #[napi(getter, js_name = "luminositySolar")]
    pub fn luminosity_solar(&self) -> f64 {
        self.inner.luminosity.value()
    }

    /// Right ascension at J2000.0 in degrees.
    #[napi(getter, js_name = "raDeg")]
    pub fn ra_deg(&self) -> f64 {
        self.inner.coordinate.get_position().azimuth.value()
    }

    /// Declination at J2000.0 in degrees.
    #[napi(getter, js_name = "decDeg")]
    pub fn dec_deg(&self) -> f64 {
        self.inner.coordinate.get_position().polar.value()
    }

    /// Human-readable representation.
    #[napi]
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
#[napi(js_name = "listCatalogStars")]
pub fn list_catalog_stars() -> Vec<String> {
    core_star::list_catalog_star_names()
}
