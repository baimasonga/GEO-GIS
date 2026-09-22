import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  MapPin,
  Upload,
  FileCheck2,
  X,
} from 'lucide-react';
import { ChangeEvent, VerificationStatus } from '../../types/geowatch';
import { formatChangeClass } from '../../utils/geoUtils';

interface VerificationModalProps {
  event: ChangeEvent;
  onClose: () => void;
  onSubmitVerification: (
    eventId: string,
    status: VerificationStatus,
    notes: string,
    groundPhotoUrl?: string
  ) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  event,
  onClose,
  onSubmitVerification,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus>('verified');
  const [analystNotes, setAnalystNotes] = useState('');
  const [groundPhotoUrl, setGroundPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitVerification(event.id, selectedStatus, analystNotes, groundPhotoUrl || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Human Verification & Ground-Truth Review
              </h3>
              <p className="text-[11px] text-slate-400">
                {event.eventNumber} • {formatChangeClass(event.classification)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Verification Outcome
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('verified')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  selectedStatus === 'verified'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verify & Close</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('verification_required')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  selectedStatus === 'verification_required'
                    ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Dispatch Ground GPS</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('rejected')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  selectedStatus === 'rejected'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-md shadow-rose-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Reject (False)</span>
              </button>
            </div>
          </div>

          {/* Centroid coordinates preview */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>Target Coordinates:</span>
            <span className="font-mono text-cyan-400 font-bold">
              {event.geometry.centroid.lat.toFixed(5)}°N, {event.geometry.centroid.lng.toFixed(5)}°W
            </span>
          </div>

          {/* Analyst Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Verification Notes & Evidentiary Rationale
            </label>
            <textarea
              required
              rows={3}
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="e.g. Confirmed clearing and earthmoving machinery visible on 10m Sentinel-2 pass; cross-referenced with local watershed boundary..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Optional Ground Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Field Ground Photo URL (Optional)
            </label>
            <input
              type="url"
              value={groundPhotoUrl}
              onChange={(e) => setGroundPhotoUrl(e.target.value)}
              placeholder="https://... (Geotagged smartphone or drone evidence photo)"
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
            >
              Confirm Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
