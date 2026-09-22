import React, { useState } from 'react';
import { Scale, X, Plus } from 'lucide-react';
import { RealityGapProject, WatchArea } from '../../types/geowatch';

interface CreateProjectModalProps {
  watchAreas: WatchArea[];
  onClose: () => void;
  onCreateProject: (project: RealityGapProject) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  watchAreas,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contractor, setContractor] = useState('');
  const [sector, setSector] = useState<'Transportation' | 'Mining & Energy' | 'Urban & Social' | 'Agriculture & Water' | 'Environment'>('Transportation');
  const [watchAreaId, setWatchAreaId] = useState(watchAreas[0]?.id || '');
  const [reportedProgress, setReportedProgress] = useState('');
  const [observedProgress, setObservedProgress] = useState('');
  const [varianceMetric, setVarianceMetric] = useState('');
  const [auditNotes, setAuditNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const wa = watchAreas.find((w) => w.id === watchAreaId);

    const newProj: RealityGapProject = {
      id: `proj-${Date.now()}`,
      organizationId: wa?.organizationId || 'org-sl-gov',
      name,
      code: code.toUpperCase(),
      sector,
      contractor,
      watchAreaId,
      watchAreaName: wa?.name || 'Monitored Sector',
      budgetUSD: 14500000,
      plannedStartDate: '2024-06-01',
      expectedCompletionDate: '2026-03-31',
      lastAuditedDate: new Date().toISOString().substring(0, 10),
      reportedProgress: reportedProgress || '65% civil works completed as per monthly payment certificate',
      observedProgress: observedProgress || '28% cleared alignment visible on 10m Sentinel-2 MSI pass',
      discrepancyStatus: 'significant_discrepancy',
      discrepancyConfidence: 0.89,
      varianceMetric: varianceMetric || '-37% execution variance',
      auditNotes: auditNotes || 'Satellite differencing indicates no active work across 12km of declared cleared sector.',
      milestones: [
        {
          id: 'm-1',
          title: 'Primary Clearing & Sub-base Groundwork',
          reportedCompleted: true,
          observedEvidence: 'Partial alignment clearing visible; no gravel sub-base detected.',
          varianceFlag: true,
        },
      ],
    };

    onCreateProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Register Monitored Capital Project</h3>
              <p className="text-[11px] text-slate-400">
                Setup Reality Gap audit tracking comparing contractor declarations to satellite signatures
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Project Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bo-Tiwai Feeder Road Rehabilitation"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Project Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PRJ-BT-2025"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Contractor / Executing Entity
              </label>
              <input
                type="text"
                required
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                placeholder="e.g. West African Infrastructure Consortium"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Link to Watch Area
              </label>
              <select
                value={watchAreaId}
                onChange={(e) => setWatchAreaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {watchAreas.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Declared Contractor Progress Description
            </label>
            <input
              type="text"
              required
              value={reportedProgress}
              onChange={(e) => setReportedProgress(e.target.value)}
              placeholder="e.g. 50% drainage culverts installed; 15km sub-base laid"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Initial Satellite Observation Rationale
            </label>
            <textarea
              rows={2}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="e.g. Sentinel-2 NIR band demonstrates dense canopy intact over western 6km; zero heavy equipment track signatures found."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
            >
              Register Monitored Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
