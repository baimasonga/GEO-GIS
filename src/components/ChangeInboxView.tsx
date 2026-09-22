import React, { useState } from 'react';
import {
  Inbox,
  Filter,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Crosshair,
  Sliders,
  FileDown,
  Layers,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { ChangeEvent, UserRole } from '../types/geowatch';
import { formatChangeClass, exportToGeoJSON, exportToCSV } from '../utils/geoUtils';

interface ChangeInboxViewProps {
  changeEvents: ChangeEvent[];
  onSelectEvent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenVerificationModal: (event: ChangeEvent) => void;
  onOpenModelFeedbackModal: (event: ChangeEvent) => void;
  onOpenExportReportModal: (event: ChangeEvent) => void;
  onBatchUpdateStatus: (ids: string[], newStatus: any) => void;
  userRole: UserRole;
}

export const ChangeInboxView: React.FC<ChangeInboxViewProps> = ({
  changeEvents,
  onSelectEvent,
  onNavigateToTab,
  onOpenVerificationModal,
  onOpenModelFeedbackModal,
  onOpenExportReportModal,
  onBatchUpdateStatus,
  userRole,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'critical_high' | 'needs_review' | 'verification_required' | 'verified' | 'rejected'
  >('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter logic
  const filteredEvents = changeEvents.filter((ev) => {
    if (activeFilter === 'critical_high') {
      return ev.priority === 'critical' || ev.priority === 'high';
    }
    if (activeFilter === 'needs_review') {
      return ev.verificationStatus === 'candidate' || ev.verificationStatus === 'needs_review';
    }
    if (activeFilter === 'verification_required') {
      return ev.verificationStatus === 'verification_required';
    }
    if (activeFilter === 'verified') {
      return ev.verificationStatus === 'verified';
    }
    if (activeFilter === 'rejected') {
      return ev.verificationStatus === 'rejected';
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEvents.map((e) => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportBatchGeoJSON = () => {
    const subset = changeEvents.filter((e) => selectedIds.includes(e.id));
    const jsonStr = exportToGeoJSON(subset.length > 0 ? subset : filteredEvents, []);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoWatch_Change_Events_${new Date().toISOString().substring(0, 10)}.geojson`;
    a.click();
  };

  const handleExportBatchCSV = () => {
    const subset = changeEvents.filter((e) => selectedIds.includes(e.id));
    const csvStr = exportToCSV(subset.length > 0 ? subset : filteredEvents);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoWatch_Change_Events_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Inbox className="w-5 h-5 text-cyan-400" />
            <span>Change Intelligence Inbox</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized operational queue for reviewing, classifying, and verifying detected physical changes.
          </p>
        </div>

        {/* Export / Batch actions */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300">
              <span className="font-bold">{selectedIds.length} selected</span>
              <button
                onClick={() => onBatchUpdateStatus(selectedIds, 'accepted')}
                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
              >
                Batch Accept
              </button>
              <button
                onClick={() => onBatchUpdateStatus(selectedIds, 'rejected')}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
              >
                Batch Reject
              </button>
            </div>
          )}

          <button
            onClick={handleExportBatchGeoJSON}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Download GeoJSON FeatureCollection"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>GeoJSON</span>
          </button>

          <button
            onClick={handleExportBatchCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Download CSV spreadsheet"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Skill 09) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Detections ({changeEvents.length})
        </button>

        <button
          onClick={() => setActiveFilter('critical_high')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'critical_high'
              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Critical & High Priority (
          {changeEvents.filter((e) => e.priority === 'critical' || e.priority === 'high').length})
        </button>

        <button
          onClick={() => setActiveFilter('needs_review')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'needs_review'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Awaiting Review (
          {
            changeEvents.filter(
              (e) => e.verificationStatus === 'candidate' || e.verificationStatus === 'needs_review'
            ).length
          }
          )
        </button>

        <button
          onClick={() => setActiveFilter('verification_required')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'verification_required'
              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ground Verification Required (
          {changeEvents.filter((e) => e.verificationStatus === 'verification_required').length})
        </button>

        <button
          onClick={() => setActiveFilter('verified')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'verified'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Verified & Closed ({changeEvents.filter((e) => e.verificationStatus === 'verified').length})
        </button>

        <button
          onClick={() => setActiveFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'rejected'
              ? 'bg-slate-700 text-slate-200 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Rejected / False Alarm (
          {changeEvents.filter((e) => e.verificationStatus === 'rejected').length})
        </button>
      </div>

      {/* Select All Checkbox bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectedIds.length === filteredEvents.length && filteredEvents.length > 0}
            onChange={handleSelectAll}
            className="rounded accent-cyan-500 bg-slate-900 border-slate-700"
          />
          <span>Select All {filteredEvents.length} events in this view</span>
        </label>
        <span>Sorted by Priority Formula (Confidence × Impact × Unexpectedness)</span>
      </div>

      {/* Event Cards List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-xl bg-slate-900/60 border border-slate-800">
            No change events match the current filter criteria.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isSelected = selectedIds.includes(ev.id);

            return (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-cyan-950/20 border-cyan-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(ev.id)}
                    className="mt-1 rounded accent-cyan-500 bg-slate-950 border-slate-700 cursor-pointer"
                  />

                  {/* Satellite Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-800 shrink-0 relative">
                    <img
                      src={ev.afterImageUrl}
                      alt="Event after thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300 font-bold">
                      {Math.round(ev.confidence * 100)}%
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{ev.eventNumber}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          ev.priority === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : ev.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        }`}
                      >
                        {ev.priority}
                      </span>
                      <span className="text-xs text-slate-400">• {ev.watchAreaName}</span>
                    </div>

                    <h3 className="font-bold text-sm text-white">
                      {formatChangeClass(ev.classification)}
                    </h3>

                    <p className="text-xs text-slate-300 max-w-2xl leading-normal">
                      {ev.scores.explanation}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Window: {ev.firstObservedDate} → {ev.lastObservedDate}</span>
                      {ev.estimatedAreaSqM && (
                        <span className="font-mono">
                          Area: {(ev.estimatedAreaSqM / 10000).toFixed(2)} ha
                        </span>
                      )}
                      {ev.estimatedLengthM && (
                        <span className="font-mono">Length: {(ev.estimatedLengthM / 1000).toFixed(1)} km</span>
                      )}
                      {ev.relatedProjectName && (
                        <span className="text-amber-400 font-semibold">
                          Linked: {ev.relatedProjectName}
                        </span>
                      )}
                      <span className="text-slate-500">
                        Status:{' '}
                        <strong className="text-slate-300 uppercase text-[10px]">
                          {ev.verificationStatus.replace(/_/g, ' ')}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Single Item Action Buttons */}
                <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-44">
                  <button
                    onClick={() => {
                      onSelectEvent(ev.id);
                      onNavigateToTab('map');
                    }}
                    className="flex-1 md:flex-none py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Map View</span>
                  </button>

                  <button
                    onClick={() => onOpenVerificationModal(ev)}
                    className="flex-1 md:flex-none py-1.5 px-3 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verify / Ground</span>
                  </button>

                  <button
                    onClick={() => onOpenModelFeedbackModal(ev)}
                    className="flex-1 md:flex-none py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Correct Class</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
