import React, { useState } from 'react';
import {
  Cpu,
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';
import { BackgroundJob, SystemAuditLog, WatchArea } from '../types/geowatch';

interface JobsAuditViewProps {
  jobs: BackgroundJob[];
  auditLogs: SystemAuditLog[];
  watchAreas: WatchArea[];
  onTriggerJob: (jobType: string, waId: string) => void;
}

export const JobsAuditView: React.FC<JobsAuditViewProps> = ({
  jobs,
  auditLogs,
  watchAreas,
  onTriggerJob,
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'audit'>('jobs');
  const [selectedJobWa, setSelectedJobWa] = useState<string>(watchAreas[0]?.id || '');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Processing Pipelines & Security Audit Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asynchronous Copernicus differencing tasks, worker orchestration, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'jobs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pipeline Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'jobs' ? (
        <div className="space-y-6">
          {/* Trigger New Pipeline Task */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                Trigger On-Demand Differencing Job
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute automated Sentinel-2 / Sentinel-1 Differencing pass over a chosen Watch Area.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedJobWa}
                onChange={(e) => setSelectedJobWa(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                {watchAreas.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onTriggerJob('copernicus_differencing', selectedJobWa)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20 shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Launch Job</span>
              </button>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Asynchronous Background Tasks
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-mono">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Target Watch Area</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Started At</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-cyan-400">{job.jobCode || job.id}</td>
                      <td className="p-3 text-slate-200 capitalize font-sans">
                        {job.type.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3 text-slate-300 font-sans">{job.details}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            job.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : job.status === 'running'
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-slate-400 font-sans">{job.createdAt.substring(11, 19)}</td>
                      <td className="p-3 text-slate-400 font-sans">{job.executionTimeMs ? `${(job.executionTimeMs / 1000).toFixed(1)}s` : '12.4s'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Log Tab */
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Immutable Chain-of-Custody Audit Log</span>
            </h3>
            <span className="text-xs text-slate-500">Tamper-evident system activity ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details & Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-400">{log.timestamp.substring(0, 19)}</td>
                    <td className="p-3 font-sans">
                      <span className="font-semibold text-white">{log.userName}</span>{' '}
                      <span className="text-[10px] text-cyan-400 capitalize">({log.role})</span>
                    </td>
                    <td className="p-3 font-bold text-slate-200 capitalize font-sans">
                      {log.action.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{log.targetType}: {log.targetId}</td>
                    <td className="p-3 text-slate-300 font-sans max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
