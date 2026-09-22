import React, { useState } from 'react';
import {
  Landmark,
  PlusCircle,
  MapPin,
  Crosshair,
  Building,
  Activity,
  Droplets,
  AlertTriangle,
} from 'lucide-react';
import { MonitoredAsset, WatchArea, ChangeEvent } from '../types/geowatch';
import { calculateDistanceMeters } from '../utils/geoUtils';

interface AssetsViewProps {
  assets: MonitoredAsset[];
  watchAreas: WatchArea[];
  changeEvents: ChangeEvent[];
  onOpenCreateAssetModal: () => void;
  onNavigateToTab: (tab: any) => void;
  onSelectWatchArea: (id: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  watchAreas,
  changeEvents,
  onOpenCreateAssetModal,
  onNavigateToTab,
  onSelectWatchArea,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAssets = assets.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Landmark className="w-5 h-5 text-cyan-400" />
            <span>Monitored Infrastructure Assets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Physical infrastructure and geographic objects monitored for surrounding environmental disturbance and encroachment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Asset Types</option>
            <option value="bridge">Bridges & Crossways</option>
            <option value="clinic">Health Clinics</option>
            <option value="school">Schools & Research</option>
            <option value="market">Markets & Freight Hubs</option>
            <option value="water_point">Water Points & Reservoirs</option>
          </select>

          <button
            onClick={onOpenCreateAssetModal}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Grid of Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => {
          const linkedArea = watchAreas.find((w) => w.id === asset.watchAreaId);

          // Find nearby changes within 5km
          const nearbyEvents = changeEvents.filter((ev) => {
            const dist = calculateDistanceMeters(asset.coordinates, ev.geometry.centroid);
            return dist <= 5000;
          });

          return (
            <div
              key={asset.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {asset.type}
                    </span>
                    <h3 className="font-bold text-sm text-white mt-0.5">{asset.name}</h3>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      asset.status === 'operational'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {asset.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{asset.description}</p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Watch Area:</span>
                    <span className="font-medium text-slate-200">{linkedArea?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span className="font-mono text-cyan-400">
                      {asset.coordinates.lat.toFixed(4)}°N, {asset.coordinates.lng.toFixed(4)}°W
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proximity Buffer:</span>
                    <span className="font-mono text-slate-300">5 km radius</span>
                  </div>
                </div>

                {/* Nearby Change Alerts */}
                {nearbyEvents.length > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {nearbyEvents.length} change detection{nearbyEvents.length > 1 ? 's' : ''} logged within 5 km buffer.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    if (linkedArea) onSelectWatchArea(linkedArea.id);
                    onNavigateToTab('map');
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Inspect on Map →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
