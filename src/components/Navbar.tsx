import React, { useState } from 'react';
import {
  Globe2,
  Building2,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  ChevronDown,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { Organization, UserProfile, UserRole, NotificationItem } from '../types/geowatch';

interface NavbarProps {
  organizations: Organization[];
  currentOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  currentUser: UserProfile;
  onChangeRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onSelectEventFromNotif?: (eventId: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const ROLES: UserRole[] = [
  'Geo Analyst',
  'Reviewer',
  'Platform Administrator',
  'Organization Administrator',
  'Project Manager',
  'Viewer',
];

export const Navbar: React.FC<NavbarProps> = ({
  organizations,
  currentOrg,
  onSelectOrg,
  currentUser,
  onChangeRole,
  notifications,
  onMarkNotificationRead,
  onSelectEventFromNotif,
  onSearch,
  searchQuery,
}) => {
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Workspace */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Globe2 className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-mono">GeoWatch</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PROD v1.2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Geospatial Change Intelligence & Verification</p>
          </div>
        </div>

        {/* Organization Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium max-w-[170px] truncate">{currentOrg.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showOrgMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-72 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Organization Workspace
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrg(org);
                    setShowOrgMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-800/80 transition-colors ${
                    org.id === currentOrg.id ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{org.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {org.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{org.region} • {org.tier}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Watch Areas, Change Events (e.g. CE-2025-019), projects, assets..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Right Controls: Role Switcher & Notifications */}
      <div className="flex items-center gap-3">
        {/* Operational Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Sentinel Pipeline Live</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <span className="text-xs font-semibold text-slate-200">System Alerts & Notifications</span>
                <span className="text-[10px] text-cyan-400">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No active alerts</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.eventId && onSelectEventFromNotif) {
                          onSelectEventFromNotif(n.eventId);
                          setShowNotifs(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer transition-colors hover:bg-slate-800/60 flex items-start gap-2.5 ${
                        !n.read ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {n.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : n.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-200 text-[11px] leading-tight">{n.title}</p>
                          <span className="text-[9px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">{n.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-[11px]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-200 leading-none">{currentUser.name}</div>
              <div className="text-[9px] text-cyan-400 font-medium leading-none mt-1">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-slate-800">
                <p className="text-[11px] font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.email}</p>
              </div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Simulate Role Permissions
              </div>
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onChangeRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                    currentUser.role === r ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span>{r}</span>
                  {currentUser.role === r && <Shield className="w-3 h-3 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
