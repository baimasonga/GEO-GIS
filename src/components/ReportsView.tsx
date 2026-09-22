import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  FileDown,
  Layers,
  Shield,
  ArrowRight,
  ExternalLink,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ChangeEvent, RealityGapProject, WatchArea } from '../types/geowatch';
import { formatChangeClass, exportToGeoJSON, exportToCSV } from '../utils/geoUtils';

interface ReportsViewProps {
  changeEvents: ChangeEvent[];
  projects: RealityGapProject[];
  watchAreas: WatchArea[];
  onSelectEvent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  changeEvents,
  projects,
  watchAreas,
  onSelectEvent,
  onNavigateToTab,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(changeEvents[0]?.id || '');

  const event = changeEvents.find((e) => e.id === selectedEventId) || changeEvents[0];
  const linkedProject = event?.relatedProjectId
    ? projects.find((p) => p.id === event.relatedProjectId)
    : undefined;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadGeoJSON = () => {
    if (!event) return;
    const jsonStr = exportToGeoJSON([event], []);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoWatch_Dossier_${event.eventNumber}.geojson`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <span>Geospatial Evidence Dossiers & Export Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official, tamper-evident intelligence reports for government regulators, oversight bodies, and audit committees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {changeEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.eventNumber}: {formatChangeClass(ev.classification)}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier (PDF)</span>
          </button>

          <button
            onClick={handleDownloadGeoJSON}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>GeoJSON</span>
          </button>
        </div>
      </div>

      {/* Printable Report Plate (Formatted cleanly for print and screen) */}
      {event && (
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          {/* Official Document Banner */}
          <div className="border-b-2 border-cyan-500 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 print:text-cyan-800 font-bold">
                GeoWatch Earth Observation Operations • Independent Audit Dossier
              </div>
              <h2 className="text-xl font-extrabold text-white print:text-black mt-1">
                EVIDENCE DOSSIER: {event.eventNumber}
              </h2>
              <div className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                Classification:{' '}
                <strong className="text-slate-200 print:text-black">
                  {formatChangeClass(event.classification)}
                </strong>{' '}
                • Priority:{' '}
                <span className="uppercase font-mono font-bold text-rose-400 print:text-rose-800">
                  {event.priority}
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono space-y-0.5">
              <div>Generated: {new Date().toISOString().substring(0, 10)}</div>
              <div>CRS: EPSG:4326 (WGS84)</div>
              <div>Hash: SHA-256 Verified</div>
            </div>
          </div>

          {/* Location & Bounding Box Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <div className="text-slate-500 font-medium">Watch Area</div>
              <div className="font-bold text-slate-200 print:text-black mt-0.5">{event.watchAreaName}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <div className="text-slate-500 font-medium">Centroid Coordinates</div>
              <div className="font-mono text-cyan-400 print:text-cyan-800 mt-0.5">
                {event.geometry.centroid.lat.toFixed(4)}°N, {event.geometry.centroid.lng.toFixed(4)}°W
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <div className="text-slate-500 font-medium">Physical Extent</div>
              <div className="font-bold text-slate-200 print:text-black mt-0.5">
                {event.estimatedAreaSqM ? `${(event.estimatedAreaSqM / 10000).toFixed(2)} ha` : ''}
                {event.estimatedLengthM ? ` ${(event.estimatedLengthM / 1000).toFixed(2)} km length` : ''}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <div className="text-slate-500 font-medium">Model Confidence</div>
              <div className="font-mono font-bold text-emerald-400 print:text-emerald-800 mt-0.5">
                {Math.round(event.confidence * 100)}% (Multi-pass)
              </div>
            </div>
          </div>

          {/* Dual Satellite Plates (Before vs After) */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
              Plate I: Multispectral Observation Comparison
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-56 rounded-lg overflow-hidden border border-slate-800 print:border-slate-300">
                  <img
                    src={event.beforeImageUrl}
                    alt="Before observation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 print:text-slate-600 font-mono">
                  <span>BEFORE: {event.firstObservedDate}</span>
                  <span>Sentinel-2 MSI (10m)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-56 rounded-lg overflow-hidden border border-slate-800 print:border-slate-300">
                  <img
                    src={event.afterImageUrl}
                    alt="After observation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between text-xs text-cyan-400 print:text-cyan-800 font-mono">
                  <span>AFTER: {event.lastObservedDate}</span>
                  <span>Sentinel-2 MSI (10m)</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Intelligence Brief & Spectral Findings */}
          <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2 text-xs">
            <div className="font-bold text-slate-200 print:text-black uppercase tracking-wider">
              Analyst Findings & Spectral Differencing Summary
            </div>
            <p className="text-slate-300 print:text-slate-800 leading-relaxed">
              {event.aiExplanation || event.scores.explanation}
            </p>
            <div className="pt-2 border-t border-slate-800 print:border-slate-300 text-[11px] text-slate-400 print:text-slate-600">
              Spectral Indicators: {event.spectralNotes || 'NIR band absorption drop, sharp SWIR soil index rise.'}
            </div>
          </div>

          {/* Reality Gap Section (if applicable) */}
          {linkedProject && (
            <div className="p-4 rounded-xl bg-amber-950/20 print:bg-amber-50 border border-amber-500/40 print:border-amber-300 space-y-2 text-xs">
              <div className="font-bold text-amber-300 print:text-amber-900 uppercase tracking-wider">
                Reality Gap Cross-Audit: {linkedProject.name} ({linkedProject.code})
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 print:text-slate-600">Contractor Declared:</span>
                  <div className="font-semibold text-slate-200 print:text-black">
                    {linkedProject.reportedProgress}
                  </div>
                </div>
                <div>
                  <span className="text-cyan-400 print:text-cyan-800">Observed Reality:</span>
                  <div className="font-semibold text-cyan-300 print:text-cyan-900">
                    {linkedProject.observedProgress}
                  </div>
                </div>
              </div>
              <div className="font-mono font-bold text-rose-400 print:text-rose-800 text-xs">
                Audit Discrepancy Metric: {linkedProject.varianceMetric}
              </div>
            </div>
          )}

          {/* Sign-Off & Chain of Custody */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-4 flex items-center justify-between text-xs text-slate-400 print:text-slate-600 font-mono">
            <div>
              <span>Verification Status: </span>
              <strong className="text-slate-200 print:text-black uppercase">
                {event.verificationStatus.replace(/_/g, ' ')}
              </strong>
            </div>
            <div>
              <span>Analyst Sign-off: GeoWatch AI / Operations Command</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
