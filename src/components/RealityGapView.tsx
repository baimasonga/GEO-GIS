import React, { useState } from 'react';
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { RealityGapProject, WatchArea } from '../types/geowatch';

interface RealityGapViewProps {
  projects: RealityGapProject[];
  watchAreas: WatchArea[];
  onOpenCreateProjectModal: () => void;
  onRequestBackCheck: (project: RealityGapProject) => void;
  onNavigateToTab: (tab: any) => void;
}

export const RealityGapView: React.FC<RealityGapViewProps> = ({
  projects,
  watchAreas,
  onOpenCreateProjectModal,
  onRequestBackCheck,
  onNavigateToTab,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-cyan-400" />
            <span>Reality Gap & Project Verification Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Independent geospatial auditing comparing declared contractor progress reports against physical earth-observation signatures.
          </p>
        </div>

        <button
          onClick={onOpenCreateProjectModal}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Monitored Project</span>
        </button>
      </div>

      {/* Two-Column: Project List & Selected Reality Gap Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Projects */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Monitored Capital Projects ({projects.length})
          </div>

          {projects.map((proj) => {
            const isSelected = proj.id === selectedProject?.id;
            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">{proj.code}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      proj.discrepancyStatus === 'significant_discrepancy'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : proj.discrepancyStatus === 'possible_discrepancy'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {proj.discrepancyStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mt-1">{proj.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{proj.contractor}</p>

                <div className="mt-2 text-xs font-mono font-semibold text-rose-400">
                  {proj.varianceMetric}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Project Audit Dossier */}
        {selectedProject && (
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{selectedProject.code}</span>
                    <span className="text-xs text-slate-400">• Sector: {selectedProject.sector}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedProject.name}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Contractor: <strong className="text-white">{selectedProject.contractor}</strong> • Watch Area:{' '}
                    <strong className="text-cyan-300">{selectedProject.watchAreaName}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onRequestBackCheck(selectedProject)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20 shrink-0"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Request Field Back-Check</span>
                </button>
              </div>

              {/* Reality Gap Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reported Reality */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>1. Declared Contractor Reality</span>
                    <span className="text-[10px] text-slate-500">Self-Reported</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {selectedProject.reportedProgress}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Source: Monthly Interim Payment Certificate & Contractor Site Ledger.
                  </p>
                </div>

                {/* Observed Reality */}
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                    <span>2. Observed Satellite Reality</span>
                    <span className="text-[10px] text-cyan-300 font-mono">Sentinel-2 / SAR</span>
                  </div>
                  <div className="text-sm font-bold text-cyan-300">
                    {selectedProject.observedProgress}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Confidence: {Math.round(selectedProject.discrepancyConfidence * 100)}% based on multispectral & SAR backscatter.
                  </p>
                </div>
              </div>

              {/* Variance Metric Alert Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  selectedProject.discrepancyStatus === 'significant_discrepancy'
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    Reality Gap Variance: {selectedProject.varianceMetric}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {selectedProject.auditNotes}
                  </p>
                </div>
              </div>

              {/* Milestones Audit Breakdown */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Declared vs Observed Milestones
                </h3>

                <div className="space-y-2">
                  {selectedProject.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{m.title}</span>
                          {m.varianceFlag ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Discrepancy Flag
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Consistent
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <span className="text-slate-300 font-medium">Satellite Evidence:</span>{' '}
                          {m.observedEvidence}
                        </div>
                      </div>

                      <div className="text-right text-[11px] shrink-0 font-mono">
                        {m.reportedCompleted ? (
                          <span className="text-emerald-400 font-semibold">Declared Done</span>
                        ) : (
                          <span className="text-slate-500">In Progress</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump to Map */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigateToTab('map')}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-2 border border-slate-700"
                >
                  <span>Inspect Project Corridor on Satellite Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
