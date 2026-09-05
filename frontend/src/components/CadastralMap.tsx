"use client";

import { useEffect, useState } from "react";
import { ParcelAsset } from "@/lib/api";

interface CadastralMapProps {
  parcels: ParcelAsset[];
  selectedUlpin: string | null;
  onSelectParcel: (ulpin: string) => void;
}

export default function CadastralMap({
  parcels,
  selectedUlpin,
  onSelectParcel,
}: CadastralMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[520px] bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Initializing Cadastral GIS Engine...</span>
        </div>
      </div>
    );
  }

  // Interactive SVG-based High-Performance Cadastral Canvas
  // Maps real geographic coordinates (lat 28.411 - 28.4132, lng 77.081 - 77.0845)
  // to normalized SVG canvas coordinates.
  const minLng = 77.0808;
  const maxLng = 77.0848;
  const minLat = 28.4107;
  const maxLat = 28.4135;

  const svgWidth = 720;
  const svgHeight = 500;

  const projectCoords = (coords: number[][]) => {
    return coords
      .map(([lng, lat]) => {
        const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
        // Invert Y for SVG
        const y = svgHeight - ((lat - minLat) / (maxLat - minLat)) * svgHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const getParcelStyle = (p: ParcelAsset) => {
    const isSelected = selectedUlpin === p.ulpin;
    const hasDispute = p.disputes.some((d) => d.injunction_freeze_transfers);
    const hasMortgage = p.encumbrances.some((e) => e.is_active);
    const isSubdivided = p.status === "SUBDIVIDED";

    if (isSelected) {
      return {
        fill: "rgba(59, 130, 246, 0.45)",
        stroke: "#3b82f6",
        strokeWidth: 3.5,
        badgeBg: "bg-blue-500 text-white",
      };
    }
    if (hasDispute) {
      return {
        fill: "rgba(239, 68, 68, 0.35)",
        stroke: "#ef4444",
        strokeWidth: 2,
        badgeBg: "bg-rose-500 text-white",
      };
    }
    if (hasMortgage) {
      return {
        fill: "rgba(245, 158, 11, 0.35)",
        stroke: "#f59e0b",
        strokeWidth: 2,
        badgeBg: "bg-amber-500 text-white",
      };
    }
    if (isSubdivided) {
      return {
        fill: "rgba(148, 163, 184, 0.2)",
        stroke: "#94a3b8",
        strokeWidth: 1.5,
        badgeBg: "bg-slate-500 text-white",
      };
    }
    return {
      fill: "rgba(16, 185, 129, 0.35)",
      stroke: "#10b981",
      strokeWidth: 2,
      badgeBg: "bg-emerald-500 text-white",
    };
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Map Header & Controls */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Kadarpur Village Cadastre (EPSG:4326)
          </h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Tehsil Sohna • District Gurugram • Haryana Pilot
        </p>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-lg shadow-lg text-[11px] space-y-1.5">
        <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-1">
          DPI Layer Legend
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-emerald-500/50 border border-emerald-500"></span>
          <span className="text-slate-300">Clean Freehold Title</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-amber-500/50 border border-amber-500"></span>
          <span className="text-slate-300">Bank Mortgaged Lien</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-rose-500/50 border border-rose-500"></span>
          <span className="text-slate-300 font-medium">Court Stay / Injunction</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-blue-500/50 border border-blue-500"></span>
          <span className="text-slate-300">Selected Asset</span>
        </div>
      </div>

      {/* SVG Vector Map Rendering */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[460px] drop-shadow-lg select-none"
        >
          {/* Subtle Cadastral Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Render All Cadastral Polygons */}
          {parcels.map((p) => {
            const style = getParcelStyle(p);
            const pointsStr = projectCoords(p.geometry.coordinates[0]);

            // Calculate approximate SVG centroid for label
            const centroidLng = p.spatial.centroid[0];
            const centroidLat = p.spatial.centroid[1];
            const cx = ((centroidLng - minLng) / (maxLng - minLng)) * svgWidth;
            const cy = svgHeight - ((centroidLat - minLat) / (maxLat - minLat)) * svgHeight;

            return (
              <g
                key={p.ulpin}
                onClick={() => onSelectParcel(p.ulpin)}
                className="cursor-pointer transition-all duration-200 hover:opacity-90 group"
              >
                <polygon
                  points={pointsStr}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeLinejoin="round"
                  className="transition-all duration-200"
                />
                
                {/* Parcel Label */}
                <text
                  x={cx}
                  y={cy - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-md"
                >
                  Plot {p.spatial.survey_number}
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontWeight="medium"
                  className="pointer-events-none drop-shadow-sm"
                >
                  {p.spatial.area_sq_meters.toLocaleString()} m²
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom status bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div>Click any cadastral plot to view its Canonical Property Passport</div>
        <div className="font-mono text-emerald-400">Total Active Parcels: {parcels.length}</div>
      </div>
    </div>
  );
}
