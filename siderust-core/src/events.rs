// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Event data types shared between Node and Web bindings.
//!
//! These types represent altitude/azimuth events without binding-specific
//! annotations. Platform crates convert these to their respective output
//! formats (napi objects or serde-serializable structs).

/// Direction of a threshold crossing.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CrossingDirection {
    /// Rising through the threshold (altitude increasing).
    Rising,
    /// Setting through the threshold (altitude decreasing).
    Setting,
}

impl CrossingDirection {
    /// String representation for JS bindings.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Rising => "rising",
            Self::Setting => "setting",
        }
    }
}

/// Kind of culmination event.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CulminationKind {
    /// Upper culmination (maximum altitude).
    Max,
    /// Lower culmination (minimum altitude).
    Min,
}

impl CulminationKind {
    /// String representation for JS bindings.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Max => "max",
            Self::Min => "min",
        }
    }
}

/// A threshold-crossing event (rise or set).
#[derive(Debug, Clone)]
pub struct CrossingEventData {
    /// Time of the crossing (Modified Julian Date).
    pub mjd: f64,
    /// Direction of the crossing.
    pub direction: CrossingDirection,
}

/// A culmination event (local altitude extremum).
#[derive(Debug, Clone)]
pub struct CulminationEventData {
    /// Time of the culmination (Modified Julian Date).
    pub mjd: f64,
    /// Altitude at the extremum in degrees.
    pub altitude_deg: f64,
    /// Kind of culmination.
    pub kind: CulminationKind,
}

/// A time period (MJD interval).
#[derive(Debug, Clone)]
pub struct MjdPeriodData {
    /// Start of the period (Modified Julian Date).
    pub start_mjd: f64,
    /// End of the period (Modified Julian Date).
    pub end_mjd: f64,
}

/// An azimuth-crossing event.
#[derive(Debug, Clone)]
pub struct AzimuthCrossingEventData {
    /// Time of the event (Modified Julian Date).
    pub mjd: f64,
    /// Crossing direction.
    pub direction: CrossingDirection,
}

/// An azimuth extremum (local max or min bearing).
#[derive(Debug, Clone)]
pub struct AzimuthExtremumData {
    /// Time of the extremum (Modified Julian Date).
    pub mjd: f64,
    /// Azimuth at the extremum in degrees (North = 0, East = 90).
    pub azimuth_deg: f64,
    /// Kind of extremum.
    pub kind: CulminationKind,
}

// ═══════════════════════════════════════════════════════════════════════════
// Conversion from siderust types
// ═══════════════════════════════════════════════════════════════════════════

use siderust::calculus::altitude::{
    CrossingDirection as SiderustCrossingDirection, CrossingEvent, CulminationEvent,
    CulminationKind as SiderustCulminationKind,
};
use siderust::calculus::azimuth::{
    AzimuthCrossingEvent, AzimuthExtremum, AzimuthExtremumKind,
};
use tempoch::{Period, MJD};

impl From<SiderustCrossingDirection> for CrossingDirection {
    fn from(d: SiderustCrossingDirection) -> Self {
        match d {
            SiderustCrossingDirection::Rising => CrossingDirection::Rising,
            SiderustCrossingDirection::Setting => CrossingDirection::Setting,
        }
    }
}

impl From<SiderustCulminationKind> for CulminationKind {
    fn from(k: SiderustCulminationKind) -> Self {
        match k {
            SiderustCulminationKind::Max => CulminationKind::Max,
            SiderustCulminationKind::Min => CulminationKind::Min,
        }
    }
}

impl From<AzimuthExtremumKind> for CulminationKind {
    fn from(k: AzimuthExtremumKind) -> Self {
        match k {
            AzimuthExtremumKind::Max => CulminationKind::Max,
            AzimuthExtremumKind::Min => CulminationKind::Min,
        }
    }
}

impl From<CrossingEvent> for CrossingEventData {
    fn from(e: CrossingEvent) -> Self {
        Self {
            mjd: e.mjd.value(),
            direction: e.direction.into(),
        }
    }
}

impl From<CulminationEvent> for CulminationEventData {
    fn from(e: CulminationEvent) -> Self {
        use qtty::Degree;
        Self {
            mjd: e.mjd.value(),
            altitude_deg: e.altitude.to::<Degree>().value(),
            kind: e.kind.into(),
        }
    }
}

impl From<Period<MJD>> for MjdPeriodData {
    fn from(p: Period<MJD>) -> Self {
        Self {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        }
    }
}

impl From<AzimuthCrossingEvent> for AzimuthCrossingEventData {
    fn from(e: AzimuthCrossingEvent) -> Self {
        Self {
            mjd: e.mjd.value(),
            direction: e.direction.into(),
        }
    }
}

impl From<AzimuthExtremum> for AzimuthExtremumData {
    fn from(e: AzimuthExtremum) -> Self {
        use qtty::Degree;
        Self {
            mjd: e.mjd.value(),
            azimuth_deg: e.azimuth.to::<Degree>().value(),
            kind: e.kind.into(),
        }
    }
}
