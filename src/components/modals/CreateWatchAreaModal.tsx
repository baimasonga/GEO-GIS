import React, { useState } from 'react';
import { Crosshair, X, Plus, Layers, MapPin } from 'lucide-react';
import { WatchArea, MonitoringProfile, MonitoringFrequency } from '../../types/geowatch';

interface CreateWatchAreaModalProps {
  onClose: () => void;
  onCreateWatchArea: (newArea: WatchArea) => void;
}

export const CreateWatchAreaModal: React.FC<CreateWatchAreaModalProps> = ({
  onClose,
  onCreateWatchArea,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [profile, setProfile] = useState<MonitoringProfile>('infrastructure');
  const [frequency, setFrequency] = useState<MonitoringFrequency>('weekly');
  const [minVegLossHa, setMinVegLossHa] = useState<number>(0.5);
  const [minRoadLengthM, setMinRoadLengthM] = useState<number>(150);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    // Default polygon around a newly registered sector
    const newArea: WatchArea = {
      id: `wa-${Date.now()}`,
      organizationId: 'org-sl-gov',
      name,
      code: code.toUpperCase(),
      description,
      monitoringProfile: profile,
      monitoringFrequency: frequency,
      monitoringStatus: 'active',
      areaSqKm: 142.5,
      baselineDate: '2024-10-01',
      lastObservationDate: '2025-01-20',
      nextCheckDate: '2025-01-27',
      detectedEventsCount: 0,
      highPriorityCount: 0,
      createdBy: 'Amadu Kamara',
      createdAt: new Date().toISOString(),
      center: { lat: 8.52, lng: -11.95 },
      zoom: 11,
      polygon: [
        { lat: 8.6, lng: -12.05 },
        { lat: 8.6, lng: -11.85 },
        { lat: 8.44, lng: -11.85 },
        { lat: 8.44, lng: -12.05 },
      ],
      thresholds: {
        minVegetationLossHa: Number(minVegLossHa),
        minRoadLengthM: Number(minRoadLengthM),
        minConfidence: 0.7,
      },
    };

    onCreateWatchArea(newArea);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Register New Watch Area</h3>
              <p className="text-[11px] text-slate-400">
                Define earth-observation monitoring bounds and sensitivity rules
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
                Watch Area Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bo-Kenema Transmission Corridor"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Area Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="WA-BK-05"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description & Purpose
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Tracking right-of-way clearance, settlement encroachment, and access road construction..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Monitoring Profile
              </label>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value as MonitoringProfile)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="environment">Environment & Buffer</option>
                <option value="settlement_growth">Settlement Growth</option>
                <option value="census">Census & Demographics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Cadence / Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as MonitoringFrequency)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="weekly">Weekly (Sentinel-2 Pass)</option>
                <option value="bi_weekly">Bi-weekly (Fortnightly)</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Automated Detection Trigger Thresholds
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>Min Veg. Loss:</span>
                  <span className="font-mono text-cyan-400">{minVegLossHa} ha</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={minVegLossHa}
                  onChange={(e) => setMinVegLossHa(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>Min Road Length:</span>
                  <span className="font-mono text-cyan-400">{minRoadLengthM} m</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={minRoadLengthM}
                  onChange={(e) => setMinRoadLengthM(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
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
              Register Watch Area
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
