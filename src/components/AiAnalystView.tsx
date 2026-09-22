import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  Shield,
  Layers,
  Crosshair,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { WatchArea, ChangeEvent, RealityGapProject } from '../types/geowatch';
import { askTheMapWithGemini } from '../utils/geminiApi';

interface AiAnalystViewProps {
  watchAreas: WatchArea[];
  changeEvents: ChangeEvent[];
  projects: RealityGapProject[];
  onSelectEvent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  timestamp: string;
}

export const AiAnalystView: React.FC<AiAnalystViewProps> = ({
  watchAreas,
  changeEvents,
  projects,
  onSelectEvent,
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello, I am the **GeoWatch AI Geospatial Intelligence Analyst**, powered by Google Gemini 3.8.

I have direct access to your active Watch Areas (${watchAreas.length} registered), detected Change Events (${changeEvents.length} logged), and Project Reality Gap audits.

You can ask me to:
- Explain specific physical anomalies and spectral shifts.
- Cross-reference contractor declarations against satellite observations.
- Summarize multi-date environmental changes across any sector.
- Identify unpermitted land-use changes or priority verification targets.

How can I assist your geospatial analysis today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQueries = [
    'Where has vegetation loss or mining excavation accelerated?',
    'Which roads appeared after October 2024 without registered projects?',
    'Summarize Makeni-Kabala Highway reality gap and contractor discrepancy.',
    'Which Change Events require urgent ground-truth verification?',
  ];

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const contextSummary = {
        activeWatchAreasCount: watchAreas.length,
        totalAreaSqKm: watchAreas.reduce((a, b) => a + b.areaSqKm, 0),
        pendingInboxCount: changeEvents.filter((e) => e.verificationStatus !== 'verified').length,
        criticalEvents: changeEvents.filter((e) => e.priority === 'critical').map((e) => ({
          id: e.id,
          number: e.eventNumber,
          class: e.classification,
          area: e.watchAreaName,
          confidence: e.confidence,
        })),
        projectsRealityGap: projects.map((p) => ({
          code: p.code,
          name: p.name,
          status: p.discrepancyStatus,
          variance: p.varianceMetric,
        })),
      };

      const res = await askTheMapWithGemini(query, contextSummary);

      const aiMsg: Message = {
        role: 'assistant',
        content: res.answer,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred while synthesizing intelligence from satellite models.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <span>AI Change Analyst & Ask the Map</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                Gemini 3.8-Flash
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Grounded in Sentinel-2, Sentinel-1 SAR & registered field reality data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('map')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Map Workspace</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 max-w-3xl ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white font-bold text-xs'
                  : 'bg-purple-600/30 border border-purple-500/40 text-purple-300'
              }`}
            >
              {m.role === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">{m.content}</div>
              <div
                className={`text-[10px] flex items-center justify-between pt-1 ${
                  m.role === 'user' ? 'text-cyan-200' : 'text-slate-500'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.source && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-purple-400">
                    Engine: {m.source}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3.5 max-w-2xl">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Querying earth-observation metadata & synthesizing reality gap metrics...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Queries & Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md space-y-3 shrink-0">
        {/* Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">
            Suggested Queries:
          </span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask the Map a question (e.g. 'Show areas where road construction is lagging declared reports')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-600/25 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Query</span>
          </button>
        </form>
      </div>
    </div>
  );
};
