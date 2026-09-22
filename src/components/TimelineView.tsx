import React, { useState } from 'react';
import {
  History,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  Radio,
  Eye,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { ImageryScene, WatchArea } from '../types/geowatch';

interface TimelineViewProps {
  imageryScenes: ImageryScene[];
  watchAreas: WatchArea[];
  onNavigateToTab: (tab: any) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  imageryScenes,
  watchAreas,
  onNavigateToTab,
}) => {
  const [selectedSceneA, setSelectedSceneA] = useState<string>(imageryScenes[0]?.id || '');
  const [selectedSceneB, setSelectedSceneB] = useState<string>(imageryScenes[1]?.id || '');

  const sceneA = imageryScenes.find((s) => s.id === selectedSceneA) || imageryScenes[0];
  const sceneB = imageryScenes.find((s) => s.id === selectedSceneB) || imageryScenes[1];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Satellite Imagery Catalog & Temporal Observations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Normalized earth-observation imagery from Sentinel-2 MSI, Sentinel-1 SAR, and Landsat-9 for multi-date temporal differencing.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparative Inspector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Temporal Comparison Laboratory</span>
          </h2>
          <span className="text-xs text-slate-400">Align two satellite observations to analyze spectral delta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Observation A (Baseline) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Observation A (Baseline Reference)
              </span>
              <select
                value={selectedSceneA}
                onChange={(e) => setSelectedSceneA(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1"
              >
                {imageryScenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.acquisitionDate} ({s.provider})
                  </option>
                ))}
              </select>
            </div>

            <div className="h-44 rounded-lg overflow-hidden border border-slate-800 relative group">
              <img
                src={sceneA?.thumbnailUrl}
                alt="Scene A Thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-xs font-mono text-cyan-300">
                {sceneA?.product}
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Provider / Sensor:</span>
                <span className="font-semibold text-slate-200">{sceneA?.provider}</span>
              </div>
              <div className="flex justify-between">
                <span>Cloud Cover:</span>
                <span className="font-mono text-emerald-400">{sceneA?.cloudPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Resolution:</span>
                <span className="font-mono text-slate-300">{sceneA?.spatialResolution}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Score:</span>
                <span className="font-mono text-cyan-400">{sceneA?.qualityScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Observation B (Current Pass) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Observation B (Current Pass)
              </span>
              <select
                value={selectedSceneB}
                onChange={(e) => setSelectedSceneB(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1"
              >
                {imageryScenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.acquisitionDate} ({s.provider})
                  </option>
                ))}
              </select>
            </div>

            <div className="h-44 rounded-lg overflow-hidden border border-slate-800 relative group">
              <img
                src={sceneB?.thumbnailUrl}
                alt="Scene B Thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-xs font-mono text-amber-300">
                {sceneB?.product}
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Provider / Sensor:</span>
                <span className="font-semibold text-slate-200">{sceneB?.provider}</span>
              </div>
              <div className="flex justify-between">
                <span>Cloud Cover:</span>
                <span className="font-mono text-emerald-400">{sceneB?.cloudPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Resolution:</span>
                <span className="font-mono text-slate-300">{sceneB?.spatialResolution}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Score:</span>
                <span className="font-mono text-amber-400">{sceneB?.qualityScore} / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button to launch Map Workspace in Swipe Mode */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigateToTab('map')}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>Launch Interactive Swipe Comparison on Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Available Imagery Scenes Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Available Ingested Earth Observation Scenes
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-mono">
              <tr>
                <th className="p-3">Scene / Product ID</th>
                <th className="p-3">Sensor & Provider</th>
                <th className="p-3">Acquisition Date</th>
                <th className="p-3">Cloud %</th>
                <th className="p-3">Resolution</th>
                <th className="p-3">Spectral Bands</th>
                <th className="p-3">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {imageryScenes.map((scene) => (
                <tr key={scene.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">{scene.product}</td>
                  <td className="p-3 text-slate-200">{scene.provider}</td>
                  <td className="p-3">{scene.acquisitionDate}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {scene.cloudPercentage}%
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{scene.spatialResolution}</td>
                  <td className="p-3 text-[11px] text-slate-400 font-sans">{scene.bands.join(', ')}</td>
                  <td className="p-3">
                    <span className="text-cyan-300 font-bold">{scene.qualityScore}</span> / 100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
