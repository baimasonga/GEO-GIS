import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Crosshair,
  Sliders,
  Sparkles,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Ruler,
  PlusCircle,
  Eye,
  EyeOff,
  SplitSquareVertical,
  Play,
  Pause,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  WatchArea,
  ChangeEvent,
  MonitoredAsset,
  RealityGapProject,
  ImageryScene,
  UserRole,
} from '../types/geowatch';
import { formatChangeClass } from '../utils/geoUtils';
import { explainChangeWithGemini } from '../utils/geminiApi';

interface MapWorkspaceProps {
  watchAreas: WatchArea[];
  changeEvents: ChangeEvent[];
  assets: MonitoredAsset[];
  projects: RealityGapProject[];
  imageryScenes: ImageryScene[];
  selectedWatchAreaId?: string;
  onSelectWatchArea: (id: string) => void;
  selectedEventId?: string;
  onSelectEvent: (id: string) => void;
  onOpenCreateWatchArea: () => void;
  onOpenVerificationModal: (event: ChangeEvent) => void;
  onOpenModelFeedbackModal: (event: ChangeEvent) => void;
  onOpenExportReportModal: (event: ChangeEvent) => void;
  userRole: UserRole;
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  watchAreas,
  changeEvents,
  assets,
  projects,
  imageryScenes,
  selectedWatchAreaId,
  onSelectWatchArea,
  selectedEventId,
  onSelectEvent,
  onOpenCreateWatchArea,
  onOpenVerificationModal,
  onOpenModelFeedbackModal,
  onOpenExportReportModal,
  userRole,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    watchAreas: L.LayerGroup;
    events: L.LayerGroup;
    assets: L.LayerGroup;
  }>({
    watchAreas: L.layerGroup(),
    events: L.layerGroup(),
    assets: L.layerGroup(),
  });

  // Layer visibility toggles
  const [showWatchAreas, setShowWatchAreas] = useState(true);
  const [showDetections, setShowDetections] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [activeBasemap, setActiveBasemap] = useState<'satellite' | 'dark' | 'topo'>('satellite');

  // Swipe Split-Screen comparison mode
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [swipePosition, setSwipePosition] = useState(50); // percentage

  // Timeline scrubber
  const [timelineIndex, setTimelineIndex] = useState(1);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const timelineDates = ['2024-09-01 (Baseline)', '2024-11-15 (Q4 Check)', '2025-01-20 (Current Pass)'];

  // Distance Measurement mode
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Mouse coords
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // AI Explanation state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const selectedEvent = changeEvents.find((e) => e.id === selectedEventId);
  const selectedWatchArea = watchAreas.find((w) => w.id === selectedWatchAreaId);
  const relatedProject = selectedEvent?.relatedProjectId
    ? projects.find((p) => p.id === selectedEvent.relatedProjectId)
    : undefined;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [8.6, -11.7],
      zoom: 8,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Basemaps
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
        maxZoom: 18,
      }
    );

    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }
    );

    const topoLayer = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
        maxZoom: 17,
      }
    );

    satelliteLayer.addTo(map);

    // Store layer references
    (map as any)._geowatchLayers = {
      satellite: satelliteLayer,
      dark: darkLayer,
      topo: topoLayer,
    };

    // Layer groups for overlay
    layerGroupsRef.current.watchAreas.addTo(map);
    layerGroupsRef.current.events.addTo(map);
    layerGroupsRef.current.assets.addTo(map);

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
      });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (measuring) {
        setMeasurePoints((prev) => {
          const next = [...prev, e.latlng];
          if (next.length >= 2) {
            let total = 0;
            for (let i = 0; i < next.length - 1; i++) {
              total += next[i].distanceTo(next[i + 1]);
            }
            setMeasuredDistance(Math.round(total));
          }
          return next;
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update basemap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !(map as any)._geowatchLayers) return;
    const layers = (map as any)._geowatchLayers;

    map.removeLayer(layers.satellite);
    map.removeLayer(layers.dark);
    map.removeLayer(layers.topo);

    if (activeBasemap === 'satellite') layers.satellite.addTo(map);
    if (activeBasemap === 'dark') layers.dark.addTo(map);
    if (activeBasemap === 'topo') layers.topo.addTo(map);
  }, [activeBasemap]);

  // Render Overlays (Watch Areas, Change Events, Assets)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { watchAreas: waGroup, events: evGroup, assets: astGroup } = layerGroupsRef.current;

    // 1. Render Watch Areas
    waGroup.clearLayers();
    if (showWatchAreas) {
      watchAreas.forEach((wa) => {
        const isSelected = wa.id === selectedWatchAreaId;
        const latLngs: L.LatLngExpression[] = wa.polygon.map((p) => [p.lat, p.lng] as [number, number]);
        const poly = L.polygon(
          latLngs,
          {
            color: isSelected ? '#06b6d4' : '#38bdf8',
            weight: isSelected ? 3 : 1.5,
            fillColor: '#0284c7',
            fillOpacity: isSelected ? 0.25 : 0.1,
            dashArray: isSelected ? undefined : '4, 4',
          }
        );

        poly.bindTooltip(
          `<div class="text-xs font-semibold">${wa.name}</div><div class="text-[10px] text-cyan-300">${wa.areaSqKm} km² • ${wa.detectedEventsCount} Detections</div>`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        poly.on('click', () => {
          onSelectWatchArea(wa.id);
        });

        poly.addTo(waGroup);
      });
    }

    // 2. Render Change Events
    evGroup.clearLayers();
    if (showDetections) {
      changeEvents.forEach((ev) => {
        const isSelected = ev.id === selectedEventId;
        let color = '#f59e0b'; // amber
        if (ev.priority === 'critical') color = '#f43f5e'; // rose
        if (ev.priority === 'high') color = '#fb923c'; // orange
        if (ev.verificationStatus === 'verified') color = '#10b981'; // emerald

        if (ev.geometry.type === 'LineString') {
          const linePoints: L.LatLngExpression[] = ev.geometry.coordinates.map((c) => [c.lat, c.lng] as [number, number]);
          const line = L.polyline(
            linePoints,
            {
              color,
              weight: isSelected ? 6 : 4,
              opacity: 0.9,
              dashArray: isSelected ? undefined : '6, 3',
            }
          );
          line.bindTooltip(
            `<div class="font-bold text-xs">${ev.eventNumber}: ${formatChangeClass(ev.classification)}</div>
             <div class="text-[10px]">Confidence: ${Math.round(ev.confidence * 100)}% • ${ev.priority.toUpperCase()} Priority</div>`,
            { sticky: true }
          );
          line.on('click', () => onSelectEvent(ev.id));
          line.addTo(evGroup);
        } else {
          // Polygon
          const polyPoints: L.LatLngExpression[] = ev.geometry.coordinates.map((c) => [c.lat, c.lng] as [number, number]);
          const poly = L.polygon(
            polyPoints,
            {
              color,
              weight: isSelected ? 3 : 2,
              fillColor: color,
              fillOpacity: isSelected ? 0.45 : 0.3,
            }
          );
          poly.bindTooltip(
            `<div class="font-bold text-xs">${ev.eventNumber}: ${formatChangeClass(ev.classification)}</div>
             <div class="text-[10px]">Confidence: ${Math.round(ev.confidence * 100)}% • ${ev.priority.toUpperCase()}</div>`,
            { sticky: true }
          );
          poly.on('click', () => onSelectEvent(ev.id));
          poly.addTo(evGroup);
        }
      });
    }

    // 3. Render Assets
    astGroup.clearLayers();
    if (showAssets) {
      assets.forEach((ast) => {
        const customIcon = L.divIcon({
          className: 'custom-asset-pin',
          html: `<div class="w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-300 shadow-lg shadow-cyan-500/30">✦</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([ast.coordinates.lat, ast.coordinates.lng], { icon: customIcon });
        marker.bindTooltip(
          `<div class="text-xs font-semibold">${ast.name}</div><div class="text-[10px] text-slate-300 capitalize">${ast.type} • ${ast.status}</div>`,
          { sticky: true }
        );
        marker.addTo(astGroup);
      });
    }
  }, [
    watchAreas,
    changeEvents,
    assets,
    selectedWatchAreaId,
    selectedEventId,
    showWatchAreas,
    showDetections,
    showAssets,
  ]);

  // Pan to selected event or watch area when clicked
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedEvent) {
      map.flyTo([selectedEvent.geometry.centroid.lat, selectedEvent.geometry.centroid.lng], 13, {
        duration: 1.2,
      });
      // Reset AI analysis cache
      setAiAnalysis(selectedEvent.aiExplanation || null);
    } else if (selectedWatchArea) {
      map.flyTo([selectedWatchArea.center.lat, selectedWatchArea.center.lng], selectedWatchArea.zoom, {
        duration: 1.2,
      });
    }
  }, [selectedEventId, selectedWatchAreaId]);

  // Generate AI Explanation handler
  const handleGenerateAiExplanation = async () => {
    if (!selectedEvent) return;
    setIsGeneratingAi(true);
    try {
      const res = await explainChangeWithGemini(
        selectedEvent,
        selectedWatchArea,
        relatedProject,
        imageryScenes
      );
      setAiAnalysis(res.explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Timeline playback simulation
  useEffect(() => {
    let timer: any;
    if (isPlayingTimeline) {
      timer = setInterval(() => {
        setTimelineIndex((prev) => (prev + 1) % timelineDates.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlayingTimeline, timelineDates.length]);

  return (
    <div className="relative flex-1 flex overflow-hidden">
      {/* LEFT MAP CONTROLS & WATCH AREA QUICK PICKER */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 w-64 pointer-events-auto">
        {/* Watch Area Selector Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              Active Watch Area
            </span>
            <button
              onClick={onOpenCreateWatchArea}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <PlusCircle className="w-3 h-3" />
              New
            </button>
          </div>
          <select
            value={selectedWatchAreaId || ''}
            onChange={(e) => onSelectWatchArea(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">-- All Monitored Zones --</option>
            {watchAreas.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.areaSqKm} km²)
              </option>
            ))}
          </select>
        </div>

        {/* Layer Visibility & Basemap Selector */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Overlays & Basemap
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
            <button
              onClick={() => setActiveBasemap('satellite')}
              className={`py-1 rounded font-medium transition-colors ${
                activeBasemap === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveBasemap('dark')}
              className={`py-1 rounded font-medium transition-colors ${
                activeBasemap === 'dark' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setActiveBasemap('topo')}
              className={`py-1 rounded font-medium transition-colors ${
                activeBasemap === 'topo' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Topography
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-400" />
                Watch Area Bounds
              </span>
              <input
                type="checkbox"
                checked={showWatchAreas}
                onChange={(e) => setShowWatchAreas(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-950 border-slate-800"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/50 border border-rose-400" />
                Detected Changes ({changeEvents.length})
              </span>
              <input
                type="checkbox"
                checked={showDetections}
                onChange={(e) => setShowDetections(e.target.checked)}
                className="rounded accent-rose-500 bg-slate-950 border-slate-800"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-cyan-400" />
                Monitored Assets ({assets.length})
              </span>
              <input
                type="checkbox"
                checked={showAssets}
                onChange={(e) => setShowAssets(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-950 border-slate-800"
              />
            </label>
          </div>
        </div>

        {/* Quick Tools: Swipe Compare & Measurement */}
        <div className="flex gap-2">
          <button
            onClick={() => setSwipeEnabled(!swipeEnabled)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition-all ${
              swipeEnabled
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>{swipeEnabled ? 'Exit Swipe' : 'Swipe Compare'}</span>
          </button>

          <button
            onClick={() => {
              setMeasuring(!measuring);
              setMeasurePoints([]);
              setMeasuredDistance(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition-all ${
              measuring
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Measure distance on map"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{measuring ? 'Measuring' : 'Measure'}</span>
          </button>
        </div>

        {/* Active Measurement Result Badge */}
        {measuring && measuredDistance !== null && (
          <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs">
            Measured Distance:{' '}
            <span className="font-mono font-bold text-amber-300">
              {measuredDistance > 1000 ? `${(measuredDistance / 1000).toFixed(2)} km` : `${measuredDistance} m`}
            </span>
          </div>
        )}
      </div>

      {/* CENTER INTERACTIVE LEAFLET MAP CONTAINER */}
      <div className="flex-1 relative w-full h-full bg-slate-950">
        <div id="geowatch-map" ref={mapContainerRef} className="w-full h-full z-0" />

        {/* SWIPE OVERLAY (When Swipe Mode is Active) */}
        {swipeEnabled && (
          <div className="absolute inset-0 pointer-events-none z-[800] overflow-hidden">
            {/* Split divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_12px_#06b6d4] pointer-events-auto cursor-ew-resize flex items-center justify-center"
              style={{ left: `${swipePosition}%` }}
              onMouseDown={(e) => {
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const newPercent = Math.max(10, Math.min(90, (moveEvent.clientX / window.innerWidth) * 100));
                  setSwipePosition(newPercent);
                };
                const handleMouseUp = () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center text-xs shadow-xl font-mono select-none">
                ⇄
              </div>
            </div>

            {/* Left/Right Label Badges */}
            <div className="absolute top-4 left-72 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-semibold text-cyan-300">
              BEFORE: Oct 2024 (Sentinel-2 L2A)
            </div>
            <div className="absolute top-4 right-96 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-semibold text-amber-300">
              AFTER: Jan 2025 (Sentinel-2 L2A)
            </div>
          </div>
        )}

        {/* BOTTOM HUD: TIMELINE SCRUBBER & COORDINATES */}
        <div className="absolute bottom-3 left-4 right-4 z-[900] pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Timeline Bar */}
          <div className="pointer-events-auto p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-3">
            <button
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">{timelineDates[timelineIndex]}</span>
            </div>
            <div className="flex gap-1">
              {timelineDates.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTimelineIndex(idx)}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    idx === timelineIndex ? 'bg-cyan-400 w-8' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Scale & Lat/Lng Coordinates */}
          <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-4">
            {cursorCoords && (
              <span>
                {cursorCoords.lat.toFixed(4)}°N, {cursorCoords.lng.toFixed(4)}°W
              </span>
            )}
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">CRS: EPSG:4326 (WGS84)</span>
          </div>
        </div>
      </div>

      {/* RIGHT INTELLIGENCE PANEL (Deep Event / Watch Area Inspector) */}
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 overflow-y-auto">
        {selectedEvent ? (
          <div className="p-4 space-y-4">
            {/* Header / Event Title */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-cyan-400">{selectedEvent.eventNumber}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      selectedEvent.priority === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : selectedEvent.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                    }`}
                  >
                    {selectedEvent.priority} Priority
                  </span>
                </div>
                <h3 className="font-bold text-base text-white mt-1 leading-snug">
                  {formatChangeClass(selectedEvent.classification)}
                </h3>
                <p className="text-xs text-slate-400">{selectedEvent.watchAreaName}</p>
              </div>

              <button
                onClick={() => onSelectEvent('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Deselect event"
              >
                ✕
              </button>
            </div>

            {/* Before / After Thumbnail Comparison */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Satellite Evidence (Before vs After)</span>
                <span className="text-[10px] text-cyan-400">10m Multispectral</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-800 group">
                  <img
                    src={selectedEvent.beforeImageUrl}
                    alt="Before change"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-slate-300">
                    {selectedEvent.firstObservedDate}
                  </div>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-slate-800 group">
                  <img
                    src={selectedEvent.afterImageUrl}
                    alt="After change"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300">
                    {selectedEvent.lastObservedDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Priority & Risk Score Breakdown (Skill 10) */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Priority Engine Scoring</span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {selectedEvent.scores.priorityScore} / 100
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Confidence</div>
                  <div className="text-xs font-bold text-slate-200">{selectedEvent.scores.confidenceScore}%</div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Impact</div>
                  <div className="text-xs font-bold text-slate-200">{selectedEvent.scores.impactScore}%</div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Unexpect.</div>
                  <div className="text-xs font-bold text-slate-200">{selectedEvent.scores.unexpectednessScore}%</div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Exposure</div>
                  <div className="text-xs font-bold text-slate-200">{selectedEvent.scores.exposureScore}%</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-800/80 pt-1.5">
                "{selectedEvent.scores.explanation}"
              </p>
            </div>

            {/* Spectral Indices & Measurements */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Geospatial Metrics
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Estimated Area</span>
                <span className="font-mono font-semibold">
                  {selectedEvent.estimatedAreaSqM
                    ? `${(selectedEvent.estimatedAreaSqM / 10000).toFixed(2)} ha (${selectedEvent.estimatedAreaSqM.toLocaleString()} m²)`
                    : 'N/A'}
                </span>
              </div>
              {selectedEvent.estimatedLengthM && (
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Linear Corridor Extent</span>
                  <span className="font-mono font-semibold">
                    {(selectedEvent.estimatedLengthM / 1000).toFixed(2)} km ({selectedEvent.estimatedLengthM} m)
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Spectral Shift Notes</span>
                <span className="text-slate-300 text-right max-w-[190px] text-[11px]">
                  {selectedEvent.spectralNotes || 'Significant vegetative drop in NIR'}
                </span>
              </div>
            </div>

            {/* Reality Gap Cross-Reference (Skill 11) */}
            {relatedProject ? (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                  Reality Gap Detected: {relatedProject.name}
                </div>
                <p className="text-[11px] text-slate-300">
                  <span className="font-semibold text-slate-200">Contractor Declared:</span>{' '}
                  {relatedProject.reportedProgress}
                </p>
                <p className="text-[11px] text-slate-300">
                  <span className="font-semibold text-cyan-300">Observed Reality:</span>{' '}
                  {relatedProject.observedProgress}
                </p>
                <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                  Variance: {relatedProject.varianceMetric}
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>No declared development project correlates with this footprint.</span>
              </div>
            )}

            {/* AI Change Analyst Brief (Skill 12) */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  AI Intelligence Brief (Gemini 3.8)
                </span>
                <button
                  onClick={handleGenerateAiExplanation}
                  disabled={isGeneratingAi}
                  className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-semibold border border-purple-500/30 transition-colors disabled:opacity-50"
                >
                  {isGeneratingAi ? 'Analyzing...' : 'Re-Analyze'}
                </button>
              </div>

              {aiAnalysis ? (
                <div className="text-xs text-slate-300 space-y-1.5 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto pr-1">
                  {aiAnalysis}
                </div>
              ) : (
                <button
                  onClick={handleGenerateAiExplanation}
                  disabled={isGeneratingAi}
                  className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAi ? 'Synthesizing Satellite Evidence...' : 'Generate AI Change Brief'}</span>
                </button>
              )}
            </div>

            {/* Human Verification & Operational Actions (Skills 09, 13, 14, 16) */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Analyst Actions
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenVerificationModal(selectedEvent)}
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify / Close</span>
                </button>

                <button
                  onClick={() => onOpenModelFeedbackModal(selectedEvent)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Correct Class</span>
                </button>
              </div>

              <button
                onClick={() => onOpenExportReportModal(selectedEvent)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/80"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Evidence Dossier</span>
              </button>
            </div>
          </div>
        ) : selectedWatchArea ? (
          /* Watch Area Inspector */
          <div className="p-4 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                {selectedWatchArea.code}
              </span>
              <h3 className="font-bold text-base text-white mt-0.5">{selectedWatchArea.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedWatchArea.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Total Area</div>
                <div className="text-sm font-bold font-mono text-slate-200">{selectedWatchArea.areaSqKm} km²</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Frequency</div>
                <div className="text-sm font-bold text-cyan-400 capitalize">
                  {selectedWatchArea.monitoringFrequency}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Monitoring Status
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profile</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {selectedWatchArea.monitoringProfile.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline Date</span>
                <span className="font-mono text-slate-300">{selectedWatchArea.baselineDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Observation</span>
                <span className="font-mono text-slate-300">{selectedWatchArea.lastObservationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Scheduled Check</span>
                <span className="font-mono text-cyan-400">{selectedWatchArea.nextCheckDate}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Detections in Area ({selectedWatchArea.detectedEventsCount})
              </div>
              <div className="space-y-2">
                {changeEvents
                  .filter((e) => e.watchAreaId === selectedWatchArea.id)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev.id)}
                      className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-400">{ev.eventNumber}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1 rounded ${
                            ev.priority === 'critical'
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {ev.priority}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">
                        {formatChangeClass(ev.classification)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Selection State */
          <div className="p-6 text-center text-slate-400 flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-sm">No Geographic Object Selected</h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Click on any Watch Area polygon or Change Event geometry on the map to inspect intelligence, view before/after satellite imagery, and trigger AI analysis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
