import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Crosshair,
  Inbox,
  Scale,
  Landmark,
  History,
  Bot,
  FileCheck2,
  Cpu,
  ChevronRight,
  Radio,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'map'
  | 'watch_areas'
  | 'inbox'
  | 'projects'
  | 'assets'
  | 'timeline'
  | 'ai_analyst'
  | 'reports'
  | 'jobs_audit';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  inboxCount: number;
  criticalAlertCount: number;
  activeProjectsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  inboxCount,
  criticalAlertCount,
  activeProjectsCount,
}) => {
  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'map' as ActiveTab,
      label: 'Map Workspace',
      icon: MapIcon,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'watch_areas' as ActiveTab,
      label: 'Watch Areas',
      icon: Crosshair,
      badge: '4 Active',
    },
    {
      id: 'inbox' as ActiveTab,
      label: 'Change Inbox',
      icon: Inbox,
      badge: inboxCount > 0 ? `${inboxCount} pending` : null,
      badgeColor: criticalAlertCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      id: 'projects' as ActiveTab,
      label: 'Reality Gap',
      icon: Scale,
      badge: `${activeProjectsCount} Projects`,
    },
    {
      id: 'assets' as ActiveTab,
      label: 'Monitored Assets',
      icon: Landmark,
      badge: null,
    },
    {
      id: 'timeline' as ActiveTab,
      label: 'Temporal & Imagery',
      icon: History,
      badge: 'Sentinel-2',
    },
    {
      id: 'ai_analyst' as ActiveTab,
      label: 'AI Change Analyst',
      icon: Bot,
      badge: 'Gemini 3.8',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Evidence Reports',
      icon: FileCheck2,
      badge: null,
    },
    {
      id: 'jobs_audit' as ActiveTab,
      label: 'Jobs & Audit Log',
      icon: Cpu,
      badge: null,
    },
  ];

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none z-20">
      <div className="p-3">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
          Operations Center
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Service Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              ESA Copernicus Hub
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>STAC Resolution</span>
            <span className="text-slate-300 font-mono">10m Optical / SAR</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Security Model</span>
            <span className="text-cyan-400 font-mono">PostGIS + RLS</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
