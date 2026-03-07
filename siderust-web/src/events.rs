// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Altitude and azimuth event queries — the core observation-planning API.

use serde::Serialize;
use wasm_bindgen::prelude::*;

use crate::body::{dispatch_body, to_js, BodyKind};
use crate::observer::Observer;
use crate::star::Star;

use qtty::*;
use siderust::calculus::altitude::{self, SearchOpts};
use siderust::calculus::azimuth;
use siderust::AltitudePeriodsProvider;
use siderust::AzimuthProvider;
use tempoch::{ModifiedJulianDate, Period, MJD};

// ═══════════════════════════════════════════════════════════════════════════
// Result types (serde-serialised — becomes plain JS objects)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CrossingEvent {
    pub mjd: f64,
    pub direction: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CulminationEvent {
    pub mjd: f64,
    pub altitude_deg: f64,
    pub kind: String,
}

#[derive(Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MjdPeriod {
    pub start_mjd: f64,
    pub end_mjd: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AzimuthCrossingEvent {
    pub mjd: f64,
    pub direction: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AzimuthExtremum {
    pub mjd: f64,
    pub azimuth_deg: f64,
    pub kind: String,
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

pub(crate) fn make_window(start_mjd: f64, end_mjd: f64) -> Result<Period<MJD>, JsError> {
    if !start_mjd.is_finite() || !end_mjd.is_finite() {
        return Err(JsError::new(
            "Window bounds (startMjd, endMjd) must be finite",
        ));
    }
    if start_mjd >= end_mjd {
        return Err(JsError::new(
            "Window start must be before end (startMjd < endMjd)",
        ));
    }
    Ok(Period::new(
        ModifiedJulianDate::new(start_mjd),
        ModifiedJulianDate::new(end_mjd),
    ))
}

fn convert_crossings(events: Vec<altitude::CrossingEvent>) -> Vec<CrossingEvent> {
    events
        .into_iter()
        .map(|e| CrossingEvent {
            mjd: e.mjd.value(),
            direction: match e.direction {
                altitude::CrossingDirection::Rising => "rising".to_string(),
                altitude::CrossingDirection::Setting => "setting".to_string(),
            },
        })
        .collect()
}

fn convert_culminations(events: Vec<altitude::CulminationEvent>) -> Vec<CulminationEvent> {
    events
        .into_iter()
        .map(|e| CulminationEvent {
            mjd: e.mjd.value(),
            altitude_deg: e.altitude.value(),
            kind: match e.kind {
                altitude::CulminationKind::Max => "max".to_string(),
                altitude::CulminationKind::Min => "min".to_string(),
            },
        })
        .collect()
}

fn convert_periods(periods: Vec<Period<MJD>>) -> Vec<MjdPeriod> {
    periods
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect()
}

fn convert_az_crossings(
    events: Vec<siderust::AzimuthCrossingEvent>,
) -> Vec<AzimuthCrossingEvent> {
    events
        .into_iter()
        .map(|e| AzimuthCrossingEvent {
            mjd: e.mjd.value(),
            direction: match e.direction {
                siderust::AzimuthCrossingDirection::Rising => "rising".to_string(),
                siderust::AzimuthCrossingDirection::Setting => "setting".to_string(),
            },
        })
        .collect()
}

fn convert_az_extrema(events: Vec<siderust::AzimuthExtremum>) -> Vec<AzimuthExtremum> {
    events
        .into_iter()
        .map(|e| AzimuthExtremum {
            mjd: e.mjd.value(),
            azimuth_deg: e.azimuth.value(),
            kind: match e.kind {
                siderust::AzimuthExtremumKind::Max => "max".to_string(),
                siderust::AzimuthExtremumKind::Min => "min".to_string(),
            },
        })
        .collect()
}

// ═══════════════════════════════════════════════════════════════════════════
// Body altitude — instantaneous
// ═══════════════════════════════════════════════════════════════════════════

/// Compute the altitude of a solar-system body at a single instant.
#[wasm_bindgen(js_name = "bodyAltitudeAt")]
pub fn body_altitude_at(body: &str, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    if !mjd.is_finite() {
        return Err(JsError::new("mjd must be finite"));
    }
    let kind = BodyKind::from_str(body)?;
    let m = ModifiedJulianDate::new(mjd);
    let result: f64 = dispatch_body!(kind, |b| {
        b.altitude_at(&observer.inner, m).to::<Degree>().value()
    });
    Ok(result)
}

/// Compute the azimuth of a solar-system body at a single instant.
#[wasm_bindgen(js_name = "bodyAzimuthAt")]
pub fn body_azimuth_at(body: &str, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    if !mjd.is_finite() {
        return Err(JsError::new("mjd must be finite"));
    }
    let kind = BodyKind::from_str(body)?;
    let m = ModifiedJulianDate::new(mjd);
    let result: f64 = dispatch_body!(kind, |b| {
        b.azimuth_at(&observer.inner, m).to::<Degree>().value()
    });
    Ok(result)
}

// ═══════════════════════════════════════════════════════════════════════════
// Body altitude — batch events
// ═══════════════════════════════════════════════════════════════════════════

/// Find threshold-crossing events (rise/set) for a solar-system body.
#[wasm_bindgen(js_name = "bodyCrossings")]
pub fn body_crossings(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let kind = BodyKind::from_str(body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_crossings(altitude::crossings(&b, &observer.inner, window, thr, opts))
    });
    to_js(&result)
}

/// Find culmination events (altitude local extrema) for a solar-system body.
#[wasm_bindgen(js_name = "bodyCulminations")]
pub fn body_culminations(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let kind = BodyKind::from_str(body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_culminations(altitude::culminations(&b, &observer.inner, window, opts))
    });
    to_js(&result)
}

/// Find periods where a body's altitude is above a threshold.
#[wasm_bindgen(js_name = "bodyAboveThreshold")]
pub fn body_above_threshold(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let kind = BodyKind::from_str(body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_periods(altitude::above_threshold(
            &b,
            &observer.inner,
            window,
            thr,
            opts,
        ))
    });
    to_js(&result)
}

/// Find periods where a body's altitude is below a threshold.
#[wasm_bindgen(js_name = "bodyBelowThreshold")]
pub fn body_below_threshold(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let kind = BodyKind::from_str(body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_periods(altitude::below_threshold(
            &b,
            &observer.inner,
            window,
            thr,
            opts,
        ))
    });
    to_js(&result)
}

/// Find azimuth-crossing events for a body.
#[wasm_bindgen(js_name = "bodyAzimuthCrossings")]
pub fn body_azimuth_crossings(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    bearing_deg: f64,
) -> Result<JsValue, JsError> {
    let kind = BodyKind::from_str(body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let bearing = Degrees::new(bearing_deg);
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_az_crossings(azimuth::azimuth_crossings(
            &b,
            &observer.inner,
            window,
            bearing,
            opts,
        ))
    });
    to_js(&result)
}

/// Find azimuth extrema (max/min bearing) for a body.
#[wasm_bindgen(js_name = "bodyAzimuthExtrema")]
pub fn body_azimuth_extrema(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let kind = BodyKind::from_str(body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_az_extrema(azimuth::azimuth_extrema(
            &b,
            &observer.inner,
            window,
            opts,
        ))
    });
    to_js(&result)
}

// ═══════════════════════════════════════════════════════════════════════════
// Star altitude — instantaneous
// ═══════════════════════════════════════════════════════════════════════════

/// Compute the altitude of a catalog or custom star at a single instant.
#[wasm_bindgen(js_name = "starAltitudeAt")]
pub fn star_altitude_at(star: &Star, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    if !mjd.is_finite() {
        return Err(JsError::new("mjd must be finite"));
    }
    let m = ModifiedJulianDate::new(mjd);
    Ok(star
        .inner
        .altitude_at(&observer.inner, m)
        .to::<Degree>()
        .value())
}

/// Compute the azimuth of a star at a single instant.
#[wasm_bindgen(js_name = "starAzimuthAt")]
pub fn star_azimuth_at(star: &Star, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    if !mjd.is_finite() {
        return Err(JsError::new("mjd must be finite"));
    }
    let m = ModifiedJulianDate::new(mjd);
    Ok(star
        .inner
        .azimuth_at(&observer.inner, m)
        .to::<Degree>()
        .value())
}

// ═══════════════════════════════════════════════════════════════════════════
// Star altitude — batch events
// ═══════════════════════════════════════════════════════════════════════════

/// Find threshold-crossing events for a star.
#[wasm_bindgen(js_name = "starCrossings")]
pub fn star_crossings(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    to_js(&convert_crossings(altitude::crossings(
        &star.inner,
        &observer.inner,
        window,
        thr,
        opts,
    )))
}

/// Find culmination events for a star.
#[wasm_bindgen(js_name = "starCulminations")]
pub fn star_culminations(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let opts = SearchOpts::default();
    to_js(&convert_culminations(altitude::culminations(
        &star.inner,
        &observer.inner,
        window,
        opts,
    )))
}

/// Find periods where a star's altitude is above a threshold.
#[wasm_bindgen(js_name = "starAboveThreshold")]
pub fn star_above_threshold(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    to_js(&convert_periods(altitude::above_threshold(
        &star.inner,
        &observer.inner,
        window,
        thr,
        opts,
    )))
}

/// Find periods where a star's altitude is below a threshold.
#[wasm_bindgen(js_name = "starBelowThreshold")]
pub fn star_below_threshold(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    to_js(&convert_periods(altitude::below_threshold(
        &star.inner,
        &observer.inner,
        window,
        thr,
        opts,
    )))
}

// ═══════════════════════════════════════════════════════════════════════════
// Star azimuth — batch events
// ═══════════════════════════════════════════════════════════════════════════

/// Find azimuth-crossing events for a star.
#[wasm_bindgen(js_name = "starAzimuthCrossings")]
pub fn star_azimuth_crossings(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    bearing_deg: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let bearing = Degrees::new(bearing_deg);
    let opts = SearchOpts::default();
    to_js(&convert_az_crossings(azimuth::azimuth_crossings(
        &star.inner,
        &observer.inner,
        window,
        bearing,
        opts,
    )))
}

/// Find azimuth extrema (max/min bearing) for a star.
#[wasm_bindgen(js_name = "starAzimuthExtrema")]
pub fn star_azimuth_extrema(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let opts = SearchOpts::default();
    to_js(&convert_az_extrema(azimuth::azimuth_extrema(
        &star.inner,
        &observer.inner,
        window,
        opts,
    )))
}

// ═══════════════════════════════════════════════════════════════════════════
// Period utilities
// ═══════════════════════════════════════════════════════════════════════════

/// Intersect two lists of MJD periods, returning only overlapping intervals.
#[wasm_bindgen(js_name = "intersectPeriods")]
pub fn intersect_periods_js(
    periods1: JsValue,
    periods2: JsValue,
) -> Result<JsValue, JsError> {
    let p1: Vec<MjdPeriod> = serde_wasm_bindgen::from_value(periods1)
        .map_err(|e| JsError::new(&format!("periods1: {e}")))?;
    let p2: Vec<MjdPeriod> = serde_wasm_bindgen::from_value(periods2)
        .map_err(|e| JsError::new(&format!("periods2: {e}")))?;

    let tp1: Vec<Period<MJD>> = p1
        .iter()
        .map(|p| {
            Period::new(
                ModifiedJulianDate::new(p.start_mjd),
                ModifiedJulianDate::new(p.end_mjd),
            )
        })
        .collect();
    let tp2: Vec<Period<MJD>> = p2
        .iter()
        .map(|p| {
            Period::new(
                ModifiedJulianDate::new(p.start_mjd),
                ModifiedJulianDate::new(p.end_mjd),
            )
        })
        .collect();

    let result = tempoch::intersect_periods(&tp1, &tp2);
    let out: Vec<MjdPeriod> = result
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect();
    to_js(&out)
}
