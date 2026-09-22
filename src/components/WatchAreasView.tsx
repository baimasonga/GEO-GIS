import React, { useState } from 'react';
import {
  Crosshair,
  PlusCircle,
  Calendar,
  Layers,
  Sliders,
  Play,
  ArrowRight,
  Shield,
  FileCheck2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { WatchArea, ChangeEvent } from '../types/geowatch';

interface WatchAreasViewProps {
  watchAreas: WatchArea[];
  changeEvents: ChangeEvent[];
  onSelectWatchArea: (id: string) => void;
  onOpenCreateWatchArea: () => void;
  onNavigateToTab: (tab: any) => void;
  onTriggerInspectionJob: (wa: WatchArea) => void;
}

export const WatchAreasView: React.FC<WatchAreasViewProps> = ({
  watchAreas,
  changeEvents,
  onSelectWatchArea,
  onOpenCreateWatchArea,
  onNavigateToTab,
  onTriggerInspectionJob,
}) => {
  const [filterProfile, setFilterProfile] = useState<string>('all');

  const filteredAreas = watchAreas.filter((w) => {
    if (filterProfile === 'all') return true;
    return w.monitoringProfile === filterProfile;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            <span>Monitored Watch Areas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered geographic polygons under continuous earth-observation surveillance and change detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterProfile}
            onChange={(e) => setFilterProfile(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Monitoring Profiles</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="environment">Environment & Buffer</option>
            <option value="settlement_growth">Settlement Growth</option>
            <option value="census">Census & Demographics</option>
          </select>

          <button
            onClick={onOpenCreateWatchArea}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Watch Area</span>
          </button>
        </div>
      </div>

      {/* Grid of Watch Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAreas.map((wa) => {
          const areaEvents = changeEvents.filter((e) => e.watchAreaId === wa.id);
          const criticalEvents = areaEvents.filter((e) => e.priority === 'critical');

          return (
            <div
              key={wa.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {wa.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{wa.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 capitalize">
                    {wa.monitoringProfile.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{wa.description}</p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Total Area</div>
                    <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                      {wa.areaSqKm} km²
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Frequency</div>
                    <div className="text-xs font-bold text-cyan-400 capitalize mt-0.5">
                      {wa.monitoringFrequency}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Detections</div>
                    <div className="text-xs font-bold font-mono text-amber-300 mt-0.5">
                      {areaEvents.length}
                    </div>
                  </div>
                </div>

                {/* Threshold Rules (Skill 04 & 15) */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Vegetation Loss Trigger:</span>
                    <span className="font-mono text-slate-300">≥ {wa.thresholds.minVegetationLossHa} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Road Extent Trigger:</span>
                    <span className="font-mono text-slate-300">≥ {wa.thresholds.minRoadLengthM} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Automated Pass:</span>
                    <span className="font-mono text-cyan-400">{wa.nextCheckDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    onSelectWatchArea(wa.id);
                    onNavigateToTab('map');
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Inspect on Map</span>
                </button>

                <button
                  onClick={() => onTriggerInspectionJob(wa)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  title="Run on-demand Sentinel-2 & SAR differencing pass"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Run Detection</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
