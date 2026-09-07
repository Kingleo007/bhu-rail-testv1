"use client";

import { useEffect, useState } from "react";
import { ParcelAsset } from "@/lib/api";
import { MapPin, Compass, Layers, Maximize2, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

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
      <div className="w-full h-[540px] bg-white rounded-lg flex items-center justify-center text-slate-500 border border-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-[#0b2545] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-700">Loading Cadastral Vector GIS Layer...</span>
        </div>
      </div>
    );
  }

  // WGS84 Geodesic Coordinates to Canvas mapping
  const minLng = 77.0808;
  const maxLng = 77.0848;
  const minLat = 28.4107;
  const maxLat = 28.4135;

  const svgWidth = 720;
  const svgHeight = 490;

  const projectCoords = (coords: number[][]) => {
    return coords
      .map(([lng, lat]) => {
        const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
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
        fill: "rgba(0, 112, 224, 0.22)",
        stroke: "#0070e0",
        strokeWidth: 3.5,
      };
    }
    if (hasDispute) {
      return {
        fill: "rgba(217, 56, 30, 0.18)",
        stroke: "#d9381e",
        strokeWidth: 2.2,
      };
    }
    if (hasMortgage) {
      return {
        fill: "rgba(217, 119, 6, 0.16)",
        stroke: "#d97706",
        strokeWidth: 2,
      };
    }
    if (isSubdivided) {
      return {
        fill: "rgba(100, 116, 139, 0.12)",
        stroke: "#64748b",
        strokeWidth: 1.5,
      };
    }
    return {
      fill: "rgba(16, 124, 65, 0.16)",
      stroke: "#107c41",
      strokeWidth: 2,
    };
  };

  return (
    <div className="bg-white rounded-lg border border-[#cbd5e1] shadow-sm overflow-hidden flex flex-col h-[540px]">
      {/* Official Gov GIS Header Bar */}
      <div className="bg-[#f8fafc] border-b border-[#cbd5e1] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#107c41]"></div>
          <div>
            <span className="font-bold text-xs text-[#0b2545] tracking-tight uppercase">
              Official Cadastral Vector Map (Revenue Survey Sheet No. 4)
            </span>
            <div className="text-[10px] text-slate-500 font-medium">
              Village: Kadarpur (Code: 004) • Tehsil: Sohna • District: Gurugram (Haryana)
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-[#cbd5e1]">
          <span>CRS: <strong className="text-[#0b2545]">EPSG:4326 (WGS84)</strong></span>
        </div>
      </div>

      {/* Main Map Viewer Area */}
      <div className="relative flex-1 bg-[#fdfefe] flex items-center justify-center p-2 overflow-hidden">
        {/* Cartographic Legend (GovTech Floating Box) */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm border border-[#cbd5e1] p-3 rounded-lg shadow-sm text-[11px] space-y-1.5 min-w-[190px]">
          <div className="text-[10px] font-bold uppercase text-[#0b2545] border-b border-slate-200 pb-1 mb-1 tracking-wider">
            Statutory Cadastre Status
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-emerald-100 border-2 border-[#107c41]"></span>
            <span className="text-slate-700 font-medium">Freehold Title (Clear)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-amber-100 border-2 border-[#d97706]"></span>
            <span className="text-slate-700 font-medium">Bank Charge Hypothecated</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-rose-100 border-2 border-[#d9381e]"></span>
            <span className="text-slate-700 font-medium">Judicial Injunction / Stay</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-blue-100 border-2 border-[#0070e0]"></span>
            <span className="text-slate-900 font-bold">Selected Parcel Asset</span>
          </div>
        </div>

        {/* High-Precision SVG Cadastral Map */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[440px] drop-shadow-sm select-none"
        >
          {/* Subtle Survey Grid */}
          <defs>
            <pattern id="survey-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#survey-grid)" />

          {/* Render All Cadastral Polygons */}
          {parcels.map((p) => {
            const style = getParcelStyle(p);
            const pointsStr = projectCoords(p.geometry.coordinates[0]);

            const centroidLng = p.spatial.centroid[0];
            const centroidLat = p.spatial.centroid[1];
            const cx = ((centroidLng - minLng) / (maxLng - minLng)) * svgWidth;
            const cy = svgHeight - ((centroidLat - minLat) / (maxLat - minLat)) * svgHeight;

            return (
              <g
                key={p.ulpin}
                onClick={() => onSelectParcel(p.ulpin)}
                className="cursor-pointer transition-all duration-150 group"
              >
                <polygon
                  points={pointsStr}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeLinejoin="round"
                  className="hover:opacity-80 transition-opacity"
                />
                
                {/* Parcel Tag */}
                <rect
                  x={cx - 36}
                  y={cy - 14}
                  width="72"
                  height="26"
                  rx="4"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  className="drop-shadow-xs"
                />
                <text
                  x={cx}
                  y={cy - 2}
                  textAnchor="middle"
                  fill="#0b2545"
                  fontSize="11"
                  fontWeight="bold"
                  className="pointer-events-none font-mono"
                >
                  Khasra {p.spatial.survey_number}
                </text>
                <text
                  x={cx}
                  y={cy + 9}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8.5"
                  fontWeight="600"
                  className="pointer-events-none font-mono"
                >
                  {p.spatial.area_sq_meters.toLocaleString()} m²
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Official Footer Coordinate & Telemetry Bar */}
      <div className="bg-[#f8fafc] border-t border-[#cbd5e1] px-4 py-2 flex items-center justify-between text-[11px] text-[#475569]">
        <div className="flex items-center space-x-3">
          <span>Click any parcel boundary polygon to inspect official Property Passport.</span>
        </div>
        <div className="font-mono text-slate-700">
          Total Mapped Parcels: <strong className="text-[#0b2545]">{parcels.length}</strong> • Precision: <strong className="text-[#107c41]">±0.05m</strong>
        </div>
      </div>
    </div>
  );
}
