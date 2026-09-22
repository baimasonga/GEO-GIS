import React from 'react';
import {
  Crosshair,
  AlertTriangle,
  Scale,
  CheckCircle2,
  TrendingUp,
  Radio,
  FileCheck2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  WatchArea,
  ChangeEvent,
  RealityGapProject,
  BackgroundJob,
} from '../types/geowatch';
import { formatChangeClass } from '../utils/geoUtils';

interface OverviewViewProps {
  watchAreas: WatchArea[];
  changeEvents: ChangeEvent[];
  projects: RealityGapProject[];
  jobs: BackgroundJob[];
  onNavigateToTab: (tab: any) => void;
  onSelectEvent: (id: string) => void;
  onSelectWatchArea: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  watchAreas,
  changeEvents,
  projects,
  jobs,
  onNavigateToTab,
  onSelectEvent,
  onSelectWatchArea,
}) => {
  const totalMonitoredArea = watchAreas.reduce((sum, w) => sum + w.areaSqKm, 0);
  const criticalEvents = changeEvents.filter((e) => e.priority === 'critical');
  const highEvents = changeEvents.filter((e) => e.priority === 'high');
  const awaitingReview = changeEvents.filter(
    (e) => e.verificationStatus === 'candidate' || e.verificationStatus === 'needs_review'
  );
  const verificationRequired = changeEvents.filter(
    (e) => e.verificationStatus === 'verification_required'
  );
  const verifiedCount = changeEvents.filter((e) => e.verificationStatus === 'verified').length;

  const discrepancyProjects = projects.filter(
    (p) => p.discrepancyStatus === 'significant_discrepancy' || p.discrepancyStatus === 'possible_discrepancy'
  );

  // Group events by class
  const classCounts: Record<string, number> = {};
  changeEvents.forEach((e) => {
    classCounts[e.classification] = (classCounts[e.classification] || 0) + 1;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/20 p-6 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
              Operational Command
            </span>
            <span className="text-xs text-slate-400">
              European Space Agency Sentinel-2 & Sentinel-1 Active Ingestion
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Geospatial Change Intelligence & Reality Gap Operations
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Continuous earth-observation monitoring across registered infrastructure corridors, protected watersheds, and urban expansion sectors. Compare reported contractor milestones against verified satellite reality.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => onNavigateToTab('map')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Crosshair className="w-4 h-4" />
              <span>Launch Interactive Map</span>
            </button>
            <button
              onClick={() => onNavigateToTab('inbox')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2 border border-slate-700"
            >
              <span>Review Change Inbox ({awaitingReview.length + verificationRequired.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Watch Areas
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {watchAreas.length}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">
            {totalMonitoredArea.toFixed(1)} km² monitored
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Change Detections
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {changeEvents.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {verifiedCount} confirmed & closed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            Critical Alerts
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
            {criticalEvents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            + {highEvents.length} high priority
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Awaiting Review
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
            {awaitingReview.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Needs analyst triage
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
            Reality Gap Cases
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono mt-1">
            {discrepancyProjects.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Reported vs Observed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
            Ground Verification
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-1">
            {verificationRequired.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Action required
          </div>
        </div>
      </div>

      {/* CORE TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent High-Priority Change Events (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Priority Change Intelligence Feed</span>
            </h2>
            <button
              onClick={() => onNavigateToTab('inbox')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All in Inbox →
            </button>
          </div>

          <div className="space-y-3">
            {changeEvents.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 shrink-0 relative">
                    <img
                      src={ev.afterImageUrl}
                      alt="Change preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0.5 left-0.5 px-1 rounded bg-slate-950/80 text-[8px] font-mono text-cyan-300 font-bold">
                      {Math.round(ev.confidence * 100)}%
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{ev.eventNumber}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          ev.priority === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {ev.priority}
                      </span>
                      <span className="text-[10px] text-slate-500">• {ev.watchAreaName}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-100 mt-1">
                      {formatChangeClass(ev.classification)}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {ev.scores.explanation}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                      <span>Detected: {ev.detectionDate.substring(0, 10)}</span>
                      {ev.estimatedAreaSqM && (
                        <span>Area: {(ev.estimatedAreaSqM / 10000).toFixed(2)} ha</span>
                      )}
                      {ev.estimatedLengthM && (
                        <span>Length: {(ev.estimatedLengthM / 1000).toFixed(1)} km</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onSelectEvent(ev.id);
                      onNavigateToTab('map');
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect on Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reality Gap Flagged Cases Section */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Active Reality Gap Discrepancies</span>
              </h2>
              <button
                onClick={() => onNavigateToTab('projects')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                All Projects →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">{proj.code}</span>
                      <h4 className="font-bold text-xs text-slate-100 mt-0.5">{proj.name}</h4>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        proj.discrepancyStatus === 'significant_discrepancy'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {proj.discrepancyStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="text-[11px] text-slate-400">
                      <span className="text-slate-300 font-medium">Declared:</span> {proj.reportedProgress}
                    </p>
                    <p className="text-[11px] text-cyan-300 font-medium">
                      <span>Observed:</span> {proj.observedProgress}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-400">{proj.varianceMetric}</span>
                    <button
                      onClick={() => onNavigateToTab('projects')}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 font-semibold"
                    >
                      Audit Reality Gap →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Change Taxonomy & Satellite Pipeline Health */}
        <div className="space-y-6">
          {/* Change Classification Distribution */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Change Detections by Taxonomy
            </h3>
            <div className="space-y-2">
              {Object.entries(classCounts).map(([cls, count]) => {
                const pct = Math.round((count / changeEvents.length) * 100);
                return (
                  <div key={cls} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{formatChangeClass(cls)}</span>
                      <span className="font-mono text-cyan-400 font-bold">{count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automated Ingestion Pipeline Status (Skill 15) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Earth Observation Pipeline</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">AUTOMATED</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Sentinel-2 Optical (10m)</div>
                  <div className="text-[10px] text-slate-500">Multispectral B2, B3, B4, B8, B11</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Active (5-day)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Sentinel-1 Radar (SAR C-Band)</div>
                  <div className="text-[10px] text-slate-500">Cloud Penetration & Soil Roughness</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Active (6-day)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Landsat-9 OLI-2 (15/30m)</div>
                  <div className="text-[10px] text-slate-500">Thermal IR & 40-year Historical Baseline</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  Standby
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('timeline')}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspect Satellite Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
