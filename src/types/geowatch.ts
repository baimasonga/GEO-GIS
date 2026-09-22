export type UserRole =
  | 'Platform Administrator'
  | 'Organization Administrator'
  | 'Geo Analyst'
  | 'Reviewer'
  | 'Project Manager'
  | 'Viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  region: string;
  tier: 'Enterprise Government' | 'Development Bank' | 'Observer';
}

export type MonitoringProfile =
  | 'settlement_growth'
  | 'infrastructure'
  | 'environment'
  | 'census';

export type MonitoringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface WatchArea {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string;
  polygon: LatLng[];
  center: LatLng;
  zoom: number;
  areaSqKm: number;
  monitoringStatus: 'active' | 'paused' | 'archived';
  monitoringProfile: MonitoringProfile;
  monitoringFrequency: MonitoringFrequency;
  baselineDate: string;
  lastObservationDate: string;
  nextCheckDate: string;
  detectedEventsCount: number;
  highPriorityCount: number;
  createdBy: string;
  createdAt: string;
  thresholds: {
    minVegetationLossHa: number;
    minRoadLengthM: number;
    minConfidence: number;
  };
}

export interface MonitoredAsset {
  id: string;
  organizationId: string;
  watchAreaId: string;
  name: string;
  type: 'road' | 'bridge' | 'school' | 'clinic' | 'market' | 'water_point' | 'mining_pit' | 'agricultural_zone';
  coordinates: LatLng;
  description: string;
  status: 'operational' | 'under_construction' | 'degraded' | 'planned';
}

export interface ImageryScene {
  id: string;
  provider: 'Sentinel-2 MSI' | 'Sentinel-1 SAR' | 'Landsat-9 OLI-2' | 'PlanetScope 3m';
  product: string;
  acquisitionDate: string;
  cloudPercentage: number;
  spatialResolution: string;
  bands: string[];
  qualityScore: number;
  tileUrl: string;
  thumbnailUrl: string;
  ndviMapUrl?: string;
  sarBackscatterDb?: number;
}

export type ChangeClass =
  | 'new_building'
  | 'settlement_expansion'
  | 'new_road'
  | 'road_extension'
  | 'road_widening'
  | 'bridge_crossing'
  | 'vegetation_loss'
  | 'vegetation_regrowth'
  | 'agricultural_expansion'
  | 'excavation_mining'
  | 'water_expansion'
  | 'water_reduction'
  | 'flooding'
  | 'burn_scar'
  | 'erosion_landslide'
  | 'unknown_significant';

export type VerificationStatus =
  | 'candidate'
  | 'needs_review'
  | 'accepted'
  | 'verification_required'
  | 'verified'
  | 'rejected'
  | 'duplicate'
  | 'closed';

export type VerificationOutcome =
  | 'confirmed'
  | 'rejected'
  | 'partially_confirmed'
  | 'inconclusive'
  | 'revisit_required';

export interface ChangeEvent {
  id: string;
  eventNumber: string;
  organizationId: string;
  watchAreaId: string;
  watchAreaName: string;
  classification: ChangeClass;
  alternativeClasses: Array<{ class: ChangeClass; confidence: number }>;
  confidence: number; // 0 - 1
  impact: 'low' | 'moderate' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scores: {
    confidenceScore: number;
    impactScore: number;
    unexpectednessScore: number;
    exposureScore: number;
    priorityScore: number;
    explanation: string;
  };
  geometry: {
    type: 'Polygon' | 'LineString' | 'Point';
    coordinates: LatLng[];
    centroid: LatLng;
  };
  detectionDate: string;
  firstObservedDate: string;
  lastObservedDate: string;
  estimatedAreaSqM?: number;
  estimatedLengthM?: number;
  realityClassification: 'expected' | 'unexpected' | 'missing_expected';
  relatedProjectId?: string;
  relatedProjectName?: string;
  nearbyAssets: string[];
  verificationStatus: VerificationStatus;
  verificationOutcome?: VerificationOutcome;
  verificationType?: 'Desktop Review' | 'Document Evidence' | 'Ground-Truth GPS Survey';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  assignedTo?: string;
  aiExplanation?: string;
  spectralNotes?: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  evidence: Array<{
    id: string;
    type: 'satellite' | 'ground_photo' | 'report' | 'field_gps';
    title: string;
    timestamp: string;
    author: string;
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    performedBy: string;
    role: string;
    timestamp: string;
    notes?: string;
  }>;
}

export type DiscrepancyStatus =
  | 'consistent'
  | 'broadly_consistent'
  | 'insufficient_imagery'
  | 'possible_discrepancy'
  | 'significant_discrepancy'
  | 'verification_required';

export interface RealityGapProject {
  id: string;
  organizationId: string;
  watchAreaId: string;
  watchAreaName: string;
  name: string;
  code: string;
  contractor: string;
  sector: 'Transportation' | 'Mining & Energy' | 'Urban & Social' | 'Agriculture & Water' | 'Environment';
  budgetUSD: number;
  plannedStartDate: string;
  expectedCompletionDate: string;
  reportedProgress: string; // e.g. "14.0 km completed paving"
  observedProgress: string; // e.g. "8.7 km sub-base visible"
  varianceMetric: string; // e.g. "-5.3 km unobserved"
  discrepancyStatus: DiscrepancyStatus;
  discrepancyConfidence: number;
  lastAuditedDate: string;
  auditNotes: string;
  milestones: Array<{
    id: string;
    title: string;
    reportedCompleted: boolean;
    observedEvidence: string;
    varianceFlag: boolean;
  }>;
}

export interface ModelFeedbackRecord {
  id: string;
  changeEventId: string;
  originalModel: string;
  modelVersion: string;
  originalClass: ChangeClass;
  originalConfidence: number;
  humanCorrectedClass: ChangeClass;
  reviewerConfidence: number;
  reason: string;
  reviewerName: string;
  timestamp: string;
}

export interface BackgroundJob {
  id: string;
  jobCode: string;
  type:
    | 'imagery_discovery'
    | 'cloud_filtering'
    | 'sar_coherence'
    | 'ndvi_differencing'
    | 'morphological_detection'
    | 'ml_inference'
    | 'evidence_package_gen';
  requestedBy: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  executionTimeMs?: number;
  details: string;
  outputSummary?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  targetType: 'WatchArea' | 'ChangeEvent' | 'Project' | 'Verification' | 'Policy' | 'ModelFeedback';
  targetId: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
  eventId?: string;
}
