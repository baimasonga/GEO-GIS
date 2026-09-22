import { LatLng, ChangeEvent, WatchArea } from '../types/geowatch';

/**
 * Calculates rough polygon area in square kilometers using planar approximation
 */
export function calculatePolygonAreaSqKm(coords: LatLng[]): number {
  if (coords.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const xi = coords[i].lng * (Math.PI / 180) * 6378137 * Math.cos(coords[i].lat * (Math.PI / 180));
    const yi = coords[i].lat * (Math.PI / 180) * 6378137;
    const xj = coords[j].lng * (Math.PI / 180) * 6378137 * Math.cos(coords[j].lat * (Math.PI / 180));
    const yj = coords[j].lat * (Math.PI / 180) * 6378137;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2) / 1000000;
}

/**
 * Approximate distance in meters between two lat/lng points
 */
export function calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Compute center of polygon
 */
export function calculateCenter(coords: LatLng[]): LatLng {
  if (coords.length === 0) return { lat: 8.5, lng: -11.8 };
  let sumLat = 0;
  let sumLng = 0;
  coords.forEach((c) => {
    sumLat += c.lat;
    sumLng += c.lng;
  });
  return {
    lat: Number((sumLat / coords.length).toFixed(5)),
    lng: Number((sumLng / coords.length).toFixed(5)),
  };
}

/**
 * Format classification name for display
 */
export function formatChangeClass(changeClass: string): string {
  const map: Record<string, string> = {
    new_building: 'New Building',
    settlement_expansion: 'Settlement Expansion',
    new_road: 'New Road Construction',
    road_extension: 'Road Extension',
    road_widening: 'Road Widening',
    bridge_crossing: 'Bridge / Crossing',
    vegetation_loss: 'Vegetation Loss',
    vegetation_regrowth: 'Vegetation Regrowth',
    agricultural_expansion: 'Agricultural Expansion',
    excavation_mining: 'Excavation & Mining Pit',
    water_expansion: 'Water Expansion / Flooding',
    water_reduction: 'Water Reduction',
    flooding: 'Surface Inundation',
    burn_scar: 'Burn Scar',
    erosion_landslide: 'Erosion / Landslide',
    unknown_significant: 'Significant Unknown Anomaly',
  };
  return map[changeClass] || changeClass.replace(/_/g, ' ');
}

/**
 * Export Change Events to GeoJSON FeatureCollection
 */
export function exportToGeoJSON(events: ChangeEvent[], watchAreas: WatchArea[]): string {
  const features = events.map((ev) => {
    let geometry: any;
    if (ev.geometry.type === 'LineString') {
      geometry = {
        type: 'LineString',
        coordinates: ev.geometry.coordinates.map((c) => [c.lng, c.lat]),
      };
    } else if (ev.geometry.type === 'Point') {
      geometry = {
        type: 'Point',
        coordinates: [ev.geometry.centroid.lng, ev.geometry.centroid.lat],
      };
    } else {
      // Polygon: close the ring
      const coords = ev.geometry.coordinates.map((c) => [c.lng, c.lat]);
      if (
        coords.length > 0 &&
        (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])
      ) {
        coords.push(coords[0]);
      }
      geometry = {
        type: 'Polygon',
        coordinates: [coords],
      };
    }

    return {
      type: 'Feature',
      id: ev.id,
      properties: {
        eventNumber: ev.eventNumber,
        watchArea: ev.watchAreaName,
        classification: ev.classification,
        confidence: ev.confidence,
        impact: ev.impact,
        priority: ev.priority,
        detectionDate: ev.detectionDate,
        firstObserved: ev.firstObservedDate,
        lastObserved: ev.lastObservedDate,
        verificationStatus: ev.verificationStatus,
        relatedProject: ev.relatedProjectName || null,
        estimatedAreaHa: ev.estimatedAreaSqM ? (ev.estimatedAreaSqM / 10000).toFixed(2) : null,
        estimatedLengthM: ev.estimatedLengthM || null,
      },
      geometry,
    };
  });

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      name: 'GeoWatch_Change_Events_Export',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
      },
      features,
    },
    null,
    2
  );
}

/**
 * Export to CSV format
 */
export function exportToCSV(events: ChangeEvent[]): string {
  const headers = [
    'Event ID',
    'Watch Area',
    'Classification',
    'Confidence',
    'Impact',
    'Priority',
    'Detection Date',
    'First Observed',
    'Last Observed',
    'Status',
    'Related Project',
    'Est Area (ha)',
    'Est Length (m)',
  ];

  const rows = events.map((e) => [
    e.eventNumber,
    `"${e.watchAreaName}"`,
    `"${formatChangeClass(e.classification)}"`,
    `${Math.round(e.confidence * 100)}%`,
    e.impact,
    e.priority,
    e.detectionDate.substring(0, 10),
    e.firstObservedDate,
    e.lastObservedDate,
    e.verificationStatus,
    `"${e.relatedProjectName || 'None'}"`,
    e.estimatedAreaSqM ? (e.estimatedAreaSqM / 10000).toFixed(2) : '',
    e.estimatedLengthM || '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
