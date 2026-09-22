import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { MapWorkspace } from './components/MapWorkspace';
import { WatchAreasView } from './components/WatchAreasView';
import { ChangeInboxView } from './components/ChangeInboxView';
import { RealityGapView } from './components/RealityGapView';
import { AssetsView } from './components/AssetsView';
import { TimelineView } from './components/TimelineView';
import { AiAnalystView } from './components/AiAnalystView';
import { ReportsView } from './components/ReportsView';
import { JobsAuditView } from './components/JobsAuditView';

import { VerificationModal } from './components/modals/VerificationModal';
import { ModelFeedbackModal } from './components/modals/ModelFeedbackModal';
import { CreateWatchAreaModal } from './components/modals/CreateWatchAreaModal';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { CreateAssetModal } from './components/modals/CreateAssetModal';

import {
  WatchArea,
  ChangeEvent,
  RealityGapProject,
  MonitoredAsset,
  ImageryScene,
  BackgroundJob,
  SystemAuditLog,
  UserRole,
  VerificationStatus,
  ChangeClass,
  Organization,
  UserProfile,
  NotificationItem,
} from './types/geowatch';

import {
  INITIAL_ORGANIZATIONS,
  CURRENT_USER,
  INITIAL_WATCH_AREAS,
  INITIAL_CHANGE_EVENTS,
  INITIAL_REALITY_GAP_PROJECTS,
  INITIAL_ASSETS,
  INITIAL_IMAGERY_SCENES,
  INITIAL_BACKGROUND_JOBS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentOrg, setCurrentOrg] = useState<Organization>(INITIAL_ORGANIZATIONS[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary Domain Data
  const [watchAreas, setWatchAreas] = useState<WatchArea[]>(INITIAL_WATCH_AREAS);
  const [changeEvents, setChangeEvents] = useState<ChangeEvent[]>(INITIAL_CHANGE_EVENTS);
  const [projects, setProjects] = useState<RealityGapProject[]>(INITIAL_REALITY_GAP_PROJECTS);
  const [assets, setAssets] = useState<MonitoredAsset[]>(INITIAL_ASSETS);
  const [imageryScenes] = useState<ImageryScene[]>(INITIAL_IMAGERY_SCENES);
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>(INITIAL_BACKGROUND_JOBS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Selection
  const [selectedWatchAreaId, setSelectedWatchAreaId] = useState<string>(INITIAL_WATCH_AREAS[0]?.id || 'wa-makeni-kabala');
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_CHANGE_EVENTS[0]?.id || 'ce-2025-019');

  // Modal States
  const [activeVerificationEvent, setActiveVerificationEvent] = useState<ChangeEvent | null>(null);
  const [activeFeedbackEvent, setActiveFeedbackEvent] = useState<ChangeEvent | null>(null);
  const [isCreateWatchAreaOpen, setIsCreateWatchAreaOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Log Audit Action Helper
  const logAudit = (action: string, targetType: SystemAuditLog['targetType'], targetId: string, details: string) => {
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      targetType,
      targetId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handlers
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role: newRole }));
    showToast(`Role switched to ${newRole}`);
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleSelectEventFromNotif = (eventId: string) => {
    handleSelectEvent(eventId);
    setActiveTab('map');
  };

  const handleSelectWatchArea = (id: string) => {
    setSelectedWatchAreaId(id);
    const firstEv = changeEvents.find((e) => e.watchAreaId === id);
    if (firstEv) {
      setSelectedEventId(firstEv.id);
    }
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    const ev = changeEvents.find((e) => e.id === id);
    if (ev) {
      setSelectedWatchAreaId(ev.watchAreaId);
    }
  };

  const handleSubmitVerification = (
    eventId: string,
    status: VerificationStatus,
    notes: string,
    groundPhotoUrl?: string
  ) => {
    setChangeEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updatedEvidence = groundPhotoUrl
            ? [
                ...e.evidence,
                {
                  id: `evd-${Date.now()}`,
                  type: 'ground_photo' as const,
                  title: 'Analyst Uploaded Ground Photo',
                  timestamp: new Date().toISOString(),
                  author: currentUser.name,
                },
              ]
            : e.evidence;

          return {
            ...e,
            verificationStatus: status,
            verificationNotes: notes,
            verifiedBy: currentUser.name,
            verifiedAt: new Date().toISOString(),
            evidence: updatedEvidence,
          };
        }
        return e;
      })
    );

    const ev = changeEvents.find((e) => e.id === eventId);
    logAudit(
      'Verification Status Updated',
      'ChangeEvent',
      ev?.eventNumber || eventId,
      `Event ${ev?.eventNumber || eventId} marked as '${status}'. Notes: ${notes}`
    );
    showToast(`Event ${ev?.eventNumber} verification updated: ${status.replace(/_/g, ' ')}`);
  };

  const handleSubmitFeedback = (
    eventId: string,
    correctedClass: ChangeClass,
    reason: string
  ) => {
    setChangeEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            classification: correctedClass,
            spectralNotes: `Class corrected by ${currentUser.name}: ${reason}`,
          };
        }
        return e;
      })
    );

    const ev = changeEvents.find((e) => e.id === eventId);
    logAudit(
      'Model Classification Corrected',
      'ModelFeedback',
      ev?.eventNumber || eventId,
      `Event ${ev?.eventNumber || eventId} reclassified to '${correctedClass}'. Rationale: ${reason}`
    );
    showToast(`Model classification corrected to: ${correctedClass.replace(/_/g, ' ')}`);
  };

  const handleBatchUpdateStatus = (ids: string[], newStatus: VerificationStatus) => {
    setChangeEvents((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, verificationStatus: newStatus } : e))
    );
    logAudit(
      'Batch Triage Executed',
      'ChangeEvent',
      `${ids.length} events`,
      `Batch updated ${ids.length} change detections to '${newStatus}'`
    );
    showToast(`Batch updated ${ids.length} change detections to ${newStatus}`);
  };

  const handleRequestBackCheck = (project: RealityGapProject) => {
    logAudit(
      'Ground Back-Check Dispatched',
      'Project',
      project.code,
      `Dispatched ground GPS survey team for project ${project.code} (${project.name}). Discrepancy metric: ${project.varianceMetric}`
    );
    showToast(`Ground-truth back-check dispatched for ${project.name}`);
  };

  const handleCreateWatchArea = (newArea: WatchArea) => {
    setWatchAreas((prev) => [newArea, ...prev]);
    logAudit(
      'Watch Area Registered',
      'WatchArea',
      newArea.code,
      `Registered new watch area: ${newArea.name} (${newArea.code})`
    );
    showToast(`Registered Watch Area: ${newArea.name}`);
    setSelectedWatchAreaId(newArea.id);
  };

  const handleCreateProject = (newProject: RealityGapProject) => {
    setProjects((prev) => [newProject, ...prev]);
    logAudit(
      'Capital Project Registered for Audit',
      'Project',
      newProject.code,
      `Registered project for Reality Gap audit: ${newProject.name}`
    );
    showToast(`Registered Project: ${newProject.name}`);
  };

  const handleCreateAsset = (newAsset: MonitoredAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
    logAudit(
      'Infrastructure Asset Monitored',
      'WatchArea',
      newAsset.id,
      `Registered infrastructure asset: ${newAsset.name} (${newAsset.type})`
    );
    showToast(`Registered Asset: ${newAsset.name}`);
  };

  const handleTriggerJob = (jobType: string, waId: string) => {
    const wa = watchAreas.find((w) => w.id === waId);
    const newJob: BackgroundJob = {
      id: `job-${Date.now().toString().slice(-4)}`,
      jobCode: `JOB-${Date.now().toString().slice(-4)}`,
      type: 'ndvi_differencing',
      requestedBy: currentUser.name,
      status: 'running',
      progress: 35,
      createdAt: new Date().toISOString(),
      details: `Copernicus MSI spectral differencing over ${wa?.name || 'Corridor'}`,
      outputSummary: 'Processing 10m Sentinel-2 bands B04, B08 against 30-day baseline...',
    };

    setBackgroundJobs((prev) => [newJob, ...prev]);
    logAudit(
      'Processing Pipeline Triggered',
      'WatchArea',
      wa?.code || waId,
      `Triggered ${jobType} differencing pipeline over ${wa?.name}`
    );
    showToast(`Launched Copernicus Differencing Job for ${wa?.name}`);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setBackgroundJobs((current) =>
        current.map((j) =>
          j.id === newJob.id
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                executionTimeMs: 24500,
                completedAt: new Date().toISOString(),
                outputSummary: 'Completed: 0 unhandled anomalies; cloud threshold passed at 1.8%.',
              }
            : j
        )
      );
      showToast(`Job ${newJob.jobCode} completed successfully.`);
    }, 3200);
  };

  const pendingInboxCount = changeEvents.filter(
    (e) => e.verificationStatus === 'candidate' || e.verificationStatus === 'needs_review'
  ).length;

  const criticalAlertCount = changeEvents.filter((e) => e.priority === 'critical').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Operational Command Bar */}
      <Navbar
        organizations={INITIAL_ORGANIZATIONS}
        currentOrg={currentOrg}
        onSelectOrg={setCurrentOrg}
        currentUser={currentUser}
        onChangeRole={handleRoleChange}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSelectEventFromNotif={handleSelectEventFromNotif}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Main Container with Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          inboxCount={pendingInboxCount}
          criticalAlertCount={criticalAlertCount}
          activeProjectsCount={projects.length}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'overview' && (
            <OverviewView
              watchAreas={watchAreas}
              changeEvents={changeEvents}
              projects={projects}
              jobs={backgroundJobs}
              onNavigateToTab={setActiveTab}
              onSelectEvent={handleSelectEvent}
              onSelectWatchArea={handleSelectWatchArea}
            />
          )}

          {activeTab === 'map' && (
            <MapWorkspace
              watchAreas={watchAreas}
              changeEvents={changeEvents}
              assets={assets}
              projects={projects}
              imageryScenes={imageryScenes}
              selectedWatchAreaId={selectedWatchAreaId}
              onSelectWatchArea={handleSelectWatchArea}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              onOpenCreateWatchArea={() => setIsCreateWatchAreaOpen(true)}
              onOpenVerificationModal={(ev) => setActiveVerificationEvent(ev)}
              onOpenModelFeedbackModal={(ev) => setActiveFeedbackEvent(ev)}
              onOpenExportReportModal={(ev) => {
                setSelectedEventId(ev.id);
                setActiveTab('reports');
              }}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'watch_areas' && (
            <WatchAreasView
              watchAreas={watchAreas}
              changeEvents={changeEvents}
              onSelectWatchArea={handleSelectWatchArea}
              onOpenCreateWatchArea={() => setIsCreateWatchAreaOpen(true)}
              onNavigateToTab={setActiveTab}
              onTriggerInspectionJob={(wa) => handleTriggerJob('copernicus_differencing', wa.id)}
            />
          )}

          {activeTab === 'inbox' && (
            <ChangeInboxView
              changeEvents={changeEvents}
              onSelectEvent={handleSelectEvent}
              onNavigateToTab={setActiveTab}
              onOpenVerificationModal={(ev) => setActiveVerificationEvent(ev)}
              onOpenModelFeedbackModal={(ev) => setActiveFeedbackEvent(ev)}
              onOpenExportReportModal={(ev) => {
                setSelectedEventId(ev.id);
                setActiveTab('reports');
              }}
              onBatchUpdateStatus={handleBatchUpdateStatus}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'projects' && (
            <RealityGapView
              projects={projects}
              watchAreas={watchAreas}
              onOpenCreateProjectModal={() => setIsCreateProjectOpen(true)}
              onRequestBackCheck={handleRequestBackCheck}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsView
              assets={assets}
              watchAreas={watchAreas}
              changeEvents={changeEvents}
              onOpenCreateAssetModal={() => setIsCreateAssetOpen(true)}
              onNavigateToTab={setActiveTab}
              onSelectWatchArea={handleSelectWatchArea}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              imageryScenes={imageryScenes}
              watchAreas={watchAreas}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'ai_analyst' && (
            <AiAnalystView
              watchAreas={watchAreas}
              changeEvents={changeEvents}
              projects={projects}
              onSelectEvent={handleSelectEvent}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              changeEvents={changeEvents}
              projects={projects}
              watchAreas={watchAreas}
              onSelectEvent={handleSelectEvent}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'jobs_audit' && (
            <JobsAuditView
              jobs={backgroundJobs}
              auditLogs={auditLogs}
              watchAreas={watchAreas}
              onTriggerJob={handleTriggerJob}
            />
          )}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[3000] px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-semibold text-cyan-300 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      {activeVerificationEvent && (
        <VerificationModal
          event={activeVerificationEvent}
          onClose={() => setActiveVerificationEvent(null)}
          onSubmitVerification={handleSubmitVerification}
        />
      )}

      {activeFeedbackEvent && (
        <ModelFeedbackModal
          event={activeFeedbackEvent}
          onClose={() => setActiveFeedbackEvent(null)}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {isCreateWatchAreaOpen && (
        <CreateWatchAreaModal
          onClose={() => setIsCreateWatchAreaOpen(false)}
          onCreateWatchArea={handleCreateWatchArea}
        />
      )}

      {isCreateProjectOpen && (
        <CreateProjectModal
          watchAreas={watchAreas}
          onClose={() => setIsCreateProjectOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {isCreateAssetOpen && (
        <CreateAssetModal
          watchAreas={watchAreas}
          onClose={() => setIsCreateAssetOpen(false)}
          onCreateAsset={handleCreateAsset}
        />
      )}
    </div>
  );
}
