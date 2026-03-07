// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Altitude and azimuth event queries — the core observation-planning API.
//!
//! All functions accept an `Observer`, a body name (or `Star` handle), and
//! a time window, returning arrays of events or periods in a single call.

use napi_derive::napi;

use crate::body::{dispatch_body, BodyKind};
use crate::observer::JsObserver;
use crate::star::JsStar;

use qtty::*;
use siderust::calculus::altitude::{self, SearchOpts};
use siderust::calculus::azimuth;
use siderust::AltitudePeriodsProvider;
use siderust::AzimuthProvider;
use tempoch::{ModifiedJulianDate, Period, MJD};

// ═══════════════════════════════════════════════════════════════════════════
// Result types (plain objects)
// ═══════════════════════════════════════════════════════════════════════════

/// A threshold-crossing event (rise or set).
#[napi(object)]
pub struct CrossingEvent {
    /// Time of the crossing (Modified Julian Date).
    pub mjd: f64,
    /// Direction: `"rising"` or `"setting"`.
    pub direction: String,
}

/// A culmination event (local altitude extremum).
#[napi(object)]
pub struct CulminationEvent {
    /// Time of the culmination (Modified Julian Date).
    pub mjd: f64,
    /// Altitude at the extremum in degrees.
    pub altitude_deg: f64,
    /// Kind: `"max"` (upper culmination) or `"min"` (lower culmination).
    pub kind: String,
}

/// A time period (MJD interval).
#[napi(object)]
pub struct MjdPeriod {
    /// Start of the period (Modified Julian Date).
    pub start_mjd: f64,
    /// End of the period (Modified Julian Date).
    pub end_mjd: f64,
}

/// An azimuth-crossing event.
#[napi(object)]
pub struct AzimuthCrossingEvent {
    /// Time of the event (Modified Julian Date).
    pub mjd: f64,
    /// Crossing direction: `"rising"` or `"setting"`.
    pub direction: String,
}

/// An azimuth extremum (local max or min bearing).
#[napi(object)]
pub struct AzimuthExtremum {
    /// Time of the extremum (Modified Julian Date).
    pub mjd: f64,
    /// Azimuth at the extremum in degrees.
    pub azimuth_deg: f64,
    /// Kind: `"max"` or `"min"`.
    pub kind: String,
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

pub(crate) fn make_window(start_mjd: f64, end_mjd: f64) -> napi::Result<Period<MJD>> {
    if !start_mjd.is_finite() || !end_mjd.is_finite() {
        return Err(napi::Error::from_reason(
            "Window bounds (startMjd, endMjd) must be finite",
        ));
    }
    if start_mjd >= end_mjd {
        return Err(napi::Error::from_reason(
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
///
/// @param body     — Body name (e.g. `"Sun"`, `"Moon"`, `"Mars"`).
/// @param observer — Observer location.
/// @param mjd      — Modified Julian Date of the instant.
/// @returns Altitude in degrees.
///
/// ```js
/// const { Observer, bodyAltitudeAt } = require('@siderust/siderust');
/// const obs = Observer.roqueDeLasMuchachos();
/// const alt = bodyAltitudeAt('Sun', obs, 60000.0);
/// ```
#[napi(js_name = "bodyAltitudeAt")]
pub fn body_altitude_at(body: String, observer: &JsObserver, mjd: f64) -> napi::Result<f64> {
    if !mjd.is_finite() {
        return Err(napi::Error::from_reason("mjd must be finite"));
    }
    let kind = BodyKind::from_str(&body)?;
    let m = ModifiedJulianDate::new(mjd);
    let result: f64 = dispatch_body!(kind, |b| {
        b.altitude_at(&observer.inner, m).to::<Degree>().value()
    });
    Ok(result)
}

/// Compute the azimuth of a solar-system body at a single instant.
///
/// @returns Azimuth in degrees (north = 0°, east = 90°).
#[napi(js_name = "bodyAzimuthAt")]
pub fn body_azimuth_at(body: String, observer: &JsObserver, mjd: f64) -> napi::Result<f64> {
    if !mjd.is_finite() {
        return Err(napi::Error::from_reason("mjd must be finite"));
    }
    let kind = BodyKind::from_str(&body)?;
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
///
/// @param body         — Body name.
/// @param observer     — Observer location.
/// @param startMjd     — Window start (MJD).
/// @param endMjd       — Window end (MJD).
/// @param thresholdDeg — Altitude threshold in degrees (e.g. 0 for horizon).
/// @returns Array of crossing events `{ mjd, direction }`.
#[napi(js_name = "bodyCrossings")]
pub fn body_crossings(
    body: String,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> napi::Result<Vec<CrossingEvent>> {
    let kind = BodyKind::from_str(&body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_crossings(altitude::crossings(&b, &observer.inner, window, thr, opts))
    });
    Ok(result)
}

/// Find culmination events (altitude local extrema) for a solar-system body.
///
/// @returns Array of culmination events `{ mjd, altitudeDeg, kind }`.
#[napi(js_name = "bodyCulminations")]
pub fn body_culminations(
    body: String,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
) -> napi::Result<Vec<CulminationEvent>> {
    let kind = BodyKind::from_str(&body)?;
    let window = make_window(start_mjd, end_mjd)?;
    let opts = SearchOpts::default();
    let result = dispatch_body!(kind, |b| {
        convert_culminations(altitude::culminations(&b, &observer.inner, window, opts))
    });
    Ok(result)
}

/// Find periods where a body's altitude is above a threshold.
///
/// @returns Array of MJD periods `{ startMjd, endMjd }`.
#[napi(js_name = "bodyAboveThreshold")]
pub fn body_above_threshold(
    body: String,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> napi::Result<Vec<MjdPeriod>> {
    let kind = BodyKind::from_str(&body)?;
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
    Ok(result)
}

/// Find periods where a body's altitude is below a threshold.
///
/// @returns Array of MJD periods `{ startMjd, endMjd }`.
#[napi(js_name = "bodyBelowThreshold")]
pub fn body_below_threshold(
    body: String,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> napi::Result<Vec<MjdPeriod>> {
    let kind = BodyKind::from_str(&body)?;
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
    Ok(result)
}

/// Find azimuth-crossing events for a body.
///
/// @param bearingDeg — Target azimuth bearing in degrees.
/// @returns Array of azimuth crossing events `{ mjd, direction }`.
#[napi(js_name = "bodyAzimuthCrossings")]
pub fn body_azimuth_crossings(
    body: String,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    bearing_deg: f64,
) -> napi::Result<Vec<AzimuthCrossingEvent>> {
    let kind = BodyKind::from_str(&body)?;
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
    Ok(result)
}

/// Find azimuth extrema (max/min bearing) for a body.
///
/// @returns Array of azimuth extrema `{ mjd, azimuthDeg, kind }`.
#[napi(js_name = "bodyAzimuthExtrema")]
pub fn body_azimuth_extrema(
    body: String,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
) -> napi::Result<Vec<AzimuthExtremum>> {
    let kind = BodyKind::from_str(&body)?;
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
    Ok(result)
}

// ═══════════════════════════════════════════════════════════════════════════
// Star altitude — instantaneous
// ═══════════════════════════════════════════════════════════════════════════

/// Compute the altitude of a catalog or custom star at a single instant.
///
/// @returns Altitude in degrees.
#[napi(js_name = "starAltitudeAt")]
pub fn star_altitude_at(star: &JsStar, observer: &JsObserver, mjd: f64) -> napi::Result<f64> {
    if !mjd.is_finite() {
        return Err(napi::Error::from_reason("mjd must be finite"));
    }
    let m = ModifiedJulianDate::new(mjd);
    Ok(star
        .inner
        .altitude_at(&observer.inner, m)
        .to::<Degree>()
        .value())
}

/// Compute the azimuth of a star at a single instant.
///
/// @returns Azimuth in degrees.
#[napi(js_name = "starAzimuthAt")]
pub fn star_azimuth_at(star: &JsStar, observer: &JsObserver, mjd: f64) -> napi::Result<f64> {
    if !mjd.is_finite() {
        return Err(napi::Error::from_reason("mjd must be finite"));
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
#[napi(js_name = "starCrossings")]
pub fn star_crossings(
    star: &JsStar,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> napi::Result<Vec<CrossingEvent>> {
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    Ok(convert_crossings(altitude::crossings(
        &star.inner,
        &observer.inner,
        window,
        thr,
        opts,
    )))
}

/// Find culmination events for a star.
#[napi(js_name = "starCulminations")]
pub fn star_culminations(
    star: &JsStar,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
) -> napi::Result<Vec<CulminationEvent>> {
    let window = make_window(start_mjd, end_mjd)?;
    let opts = SearchOpts::default();
    Ok(convert_culminations(altitude::culminations(
        &star.inner,
        &observer.inner,
        window,
        opts,
    )))
}

/// Find periods where a star's altitude is above a threshold.
#[napi(js_name = "starAboveThreshold")]
pub fn star_above_threshold(
    star: &JsStar,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> napi::Result<Vec<MjdPeriod>> {
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    Ok(convert_periods(altitude::above_threshold(
        &star.inner,
        &observer.inner,
        window,
        thr,
        opts,
    )))
}

/// Find periods where a star's altitude is below a threshold.
#[napi(js_name = "starBelowThreshold")]
pub fn star_below_threshold(
    star: &JsStar,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> napi::Result<Vec<MjdPeriod>> {
    let window = make_window(start_mjd, end_mjd)?;
    let thr = Degrees::new(threshold_deg);
    let opts = SearchOpts::default();
    Ok(convert_periods(altitude::below_threshold(
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
///
/// @param bearingDeg — Target azimuth bearing in degrees.
/// @returns Array of azimuth crossing events `{ mjd, direction }`.
#[napi(js_name = "starAzimuthCrossings")]
pub fn star_azimuth_crossings(
    star: &JsStar,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
    bearing_deg: f64,
) -> napi::Result<Vec<AzimuthCrossingEvent>> {
    let window = make_window(start_mjd, end_mjd)?;
    let bearing = Degrees::new(bearing_deg);
    let opts = SearchOpts::default();
    Ok(convert_az_crossings(azimuth::azimuth_crossings(
        &star.inner,
        &observer.inner,
        window,
        bearing,
        opts,
    )))
}

/// Find azimuth extrema (max/min bearing) for a star.
///
/// @returns Array of azimuth extrema `{ mjd, azimuthDeg, kind }`.
#[napi(js_name = "starAzimuthExtrema")]
pub fn star_azimuth_extrema(
    star: &JsStar,
    observer: &JsObserver,
    start_mjd: f64,
    end_mjd: f64,
) -> napi::Result<Vec<AzimuthExtremum>> {
    let window = make_window(start_mjd, end_mjd)?;
    let opts = SearchOpts::default();
    Ok(convert_az_extrema(azimuth::azimuth_extrema(
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
///
/// This is useful for combining altitude and azimuth constraints, or
/// combining target visibility with astronomical night periods.
///
/// @param periods1 — First list of MJD periods.
/// @param periods2 — Second list of MJD periods.
/// @returns Array of MJD periods representing the intersection.
///
/// ```js
/// const altPeriods = starAboveThreshold(star, obs, mjd0, mjd1, 25);
/// const azPeriods = bodyAboveThreshold('Sun', obs, mjd0, mjd1, -18); // dark sky
/// const observable = intersectPeriods(altPeriods, azPeriods);
/// ```
#[napi(js_name = "intersectPeriods")]
pub fn intersect_periods_js(
    periods1: Vec<MjdPeriod>,
    periods2: Vec<MjdPeriod>,
) -> Vec<MjdPeriod> {
    let p1: Vec<Period<MJD>> = periods1
        .iter()
        .map(|p| Period::new(
            ModifiedJulianDate::new(p.start_mjd),
            ModifiedJulianDate::new(p.end_mjd),
        ))
        .collect();
    let p2: Vec<Period<MJD>> = periods2
        .iter()
        .map(|p| Period::new(
            ModifiedJulianDate::new(p.start_mjd),
            ModifiedJulianDate::new(p.end_mjd),
        ))
        .collect();

    let result = tempoch::intersect_periods(&p1, &p2);
    result
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect()
}
