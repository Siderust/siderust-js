// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Star — catalog and custom stars for altitude/azimuth/coordinate queries.

use wasm_bindgen::prelude::*;

use qtty::length::nominal::SolarRadiuses;
use qtty::*;
use siderust::bodies::{self, Star as SiderustStar};
use siderust::coordinates::centers::Geocentric;
use siderust::coordinates::frames::EquatorialMeanJ2000;
use siderust::coordinates::spherical;
use siderust::targets::CoordinateWithPM;
use siderust::time::JulianDate;
use std::borrow::Cow;

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
        for (label, v) in [
            ("distanceLy", distance_ly),
            ("massSolar", mass_solar),
            ("radiusSolar", radius_solar),
            ("luminositySolar", luminosity_solar),
            ("raDeg", ra_deg),
            ("decDeg", dec_deg),
        ] {
            if !v.is_finite() {
                return Err(JsError::new(&format!(
                    "{label} must be finite (not NaN or ±infinity)"
                )));
            }
        }

        let pos = spherical::Position::<Geocentric, EquatorialMeanJ2000, LightYear>::new(
            Degrees::new(ra_deg),
            Degrees::new(dec_deg),
            LightYears::new(distance_ly),
        );
        let target =
            CoordinateWithPM::<spherical::Position<Geocentric, EquatorialMeanJ2000, LightYear>>::new_static(
                pos,
                JulianDate::J2000,
            );

        let star = SiderustStar::new(
            Cow::<'static, str>::Owned(name.to_string()),
            LightYears::new(distance_ly),
            SolarMasses::new(mass_solar),
            SolarRadiuses::new(radius_solar),
            SolarLuminosities::new(luminosity_solar),
            target,
        );

        Ok(Self { inner: star })
    }

    /// Look up a star from the built-in catalog by name.
    ///
    /// Supported names (case-insensitive): Vega, Sirius, Polaris, Canopus,
    /// Arcturus, Rigel, Betelgeuse, Procyon, Aldebaran, Altair.
    pub fn catalog(name: &str) -> Result<Star, JsError> {
        let star: &SiderustStar<'static> = match name.to_uppercase().as_str() {
            "VEGA" => &bodies::VEGA,
            "SIRIUS" => &bodies::SIRIUS,
            "POLARIS" => &bodies::POLARIS,
            "CANOPUS" => &bodies::CANOPUS,
            "ARCTURUS" => &bodies::ARCTURUS,
            "RIGEL" => &bodies::RIGEL,
            "BETELGEUSE" => &bodies::BETELGEUSE,
            "PROCYON" => &bodies::PROCYON,
            "ALDEBARAN" => &bodies::ALDEBARAN,
            "ALTAIR" => &bodies::ALTAIR,
            _ => {
                return Err(JsError::new(&format!(
                    "Unknown catalog star: \"{name}\". Available: Vega, Sirius, Polaris, Canopus, Arcturus, Rigel, Betelgeuse, Procyon, Aldebaran, Altair."
                )));
            }
        };
        Ok(Self {
            inner: star.clone(),
        })
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
    let names: Vec<&str> = vec![
        "Vega", "Sirius", "Polaris", "Canopus", "Arcturus", "Rigel", "Betelgeuse", "Procyon",
        "Aldebaran", "Altair",
    ];
    serde_wasm_bindgen::to_value(&names).unwrap()
}
