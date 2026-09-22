import React, { useState } from 'react';
import { Sliders, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { ChangeEvent, ChangeClass } from '../../types/geowatch';
import { formatChangeClass } from '../../utils/geoUtils';

interface ModelFeedbackModalProps {
  event: ChangeEvent;
  onClose: () => void;
  onSubmitFeedback: (
    eventId: string,
    correctedClass: ChangeClass,
    reason: string
  ) => void;
}

export const ModelFeedbackModal: React.FC<ModelFeedbackModalProps> = ({
  event,
  onClose,
  onSubmitFeedback,
}) => {
  const [correctedClass, setCorrectedClass] = useState<ChangeClass>(event.classification);
  const [reason, setReason] = useState('');

  const allClasses: ChangeClass[] = [
    'settlement_expansion',
    'new_road',
    'road_extension',
    'road_widening',
    'bridge_crossing',
    'vegetation_loss',
    'vegetation_regrowth',
    'agricultural_expansion',
    'excavation_mining',
    'water_expansion',
    'water_reduction',
    'flooding',
    'burn_scar',
    'erosion_landslide',
    'unknown_significant',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback(event.id, correctedClass, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Correct Classification & Retraining Feedback
              </h3>
              <p className="text-[11px] text-slate-400">
                {event.eventNumber} • Current Model: {formatChangeClass(event.classification)}
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
              Select Correct Physical Class
            </label>
            <select
              value={correctedClass}
              onChange={(e) => setCorrectedClass(e.target.value as ChangeClass)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {allClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {formatChangeClass(cls)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Feedback Reason & Error Mode Diagnosis
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Spectral signature indicated settlement expansion due to high SWIR reflection, but high-res optical reveals seasonal agricultural slash-and-burn..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            This correction will be appended to the active active-learning dataset and flagged for next scheduled model fine-tuning.
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
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
