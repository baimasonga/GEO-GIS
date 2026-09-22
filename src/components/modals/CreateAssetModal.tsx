import React, { useState } from 'react';
import { Landmark, X } from 'lucide-react';
import { MonitoredAsset, WatchArea } from '../../types/geowatch';

export type AssetCategory = 'road' | 'bridge' | 'school' | 'clinic' | 'market' | 'water_point' | 'mining_pit' | 'agricultural_zone';

interface CreateAssetModalProps {
  watchAreas: WatchArea[];
  onClose: () => void;
  onCreateAsset: (asset: MonitoredAsset) => void;
}

export const CreateAssetModal: React.FC<CreateAssetModalProps> = ({
  watchAreas,
  onClose,
  onCreateAsset,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetCategory>('clinic');
  const [description, setDescription] = useState('');
  const [watchAreaId, setWatchAreaId] = useState(watchAreas[0]?.id || '');
  const [lat, setLat] = useState<number>(8.55);
  const [lng, setLng] = useState<number>(-11.95);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const wa = watchAreas.find((w) => w.id === watchAreaId);

    const newAsset: MonitoredAsset = {
      id: `asset-${Date.now()}`,
      organizationId: wa?.organizationId || 'org-sl-gov',
      name,
      type,
      description,
      coordinates: { lat: Number(lat), lng: Number(lng) },
      watchAreaId,
      status: 'operational',
    };

    onCreateAsset(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Register Monitored Infrastructure</h3>
              <p className="text-[11px] text-slate-400">
                Track surrounding land-cover disruption & buffer zone activity
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Asset Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bumbuna Substation & Water Treatment Plant"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Asset Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssetCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="clinic">Community Clinic</option>
                <option value="school">School / College</option>
                <option value="bridge">Bridge / Culvert</option>
                <option value="market">Market / Depot</option>
                <option value="water_point">Water Point / Borehole</option>
                <option value="road">Road / Corridor</option>
                <option value="mining_pit">Mining Pit / Quarry</option>
                <option value="agricultural_zone">Agricultural Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Watch Area
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Longitude (°W)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Critical municipal water reservoir and pumping infrastructure..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
              Register Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
