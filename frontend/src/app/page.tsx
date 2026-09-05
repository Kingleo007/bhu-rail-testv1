"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchParcels, fetchPassport, ParcelAsset, PropertyPassport } from "@/lib/api";
import CadastralMap from "@/components/CadastralMap";
import PropertyPassportCard from "@/components/PropertyPassportCard";
import { ShieldCheck, Scissors, Landmark, Search, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [parcels, setParcels] = useState<ParcelAsset[]>([]);
  const [selectedUlpin, setSelectedUlpin] = useState<string | null>(null);
  const [passport, setPassport] = useState<PropertyPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [passportLoading, setPassportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchParcels();
      setParcels(data);
      if (data.length > 0 && !selectedUlpin) {
        // Default select first parcel
        handleSelectParcel(data[0].ulpin);
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to Bhu-Rail backend rail at http://localhost:8000. Ensure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParcel = async (ulpin: string) => {
    setSelectedUlpin(ulpin);
    try {
      setPassportLoading(true);
      const pp = await fetchPassport(ulpin);
      setPassport(pp);
    } catch (err) {
      console.error(err);
    } finally {
      setPassportLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredParcels = parcels.filter((p) =>
    p.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.spatial.survey_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.rights.some(r => r.holder_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: DPI Rail Proposition */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/80 text-emerald-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Digital Public Infrastructure (DPI) Rail</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Universal Land Rail for India
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Converting fragmented land records into canonical, verifiable digital assets. Exposing standardized open APIs (<strong>"Land UPI"</strong>) for identity, spatial geometry, bundle of rights, encumbrances, and lifecycle governance.
          </p>

          {/* 3 Quick Launch Demo Buttons */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/court-registry?ulpin=IN-HR-GGM-KDP-0104-0000"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700/80 text-rose-200 text-xs font-semibold transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Killer Demo 1: Fraud Prevention (Court Stay)</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400 ml-1" />
            </Link>

            <Link
              href="/surveyor-tools?ulpin=IN-HR-GGM-KDP-0108-0000"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-700/80 text-blue-200 text-xs font-semibold transition-all shadow-sm"
            >
              <Scissors className="w-4 h-4 text-blue-400" />
              <span>Killer Demo 2: Spatial Subdivision (10,000 m²)</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 ml-1" />
            </Link>

            <Link
              href="/bank-simulator?ulpin=IN-HR-GGM-KDP-0101-0000"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-200 text-xs font-semibold transition-all shadow-sm"
            >
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>Killer Demo 3: "Land UPI" Title Check (80ms)</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Backend connection warning if offline */}
      {error && (
        <div className="bg-amber-950/60 border border-amber-800/80 rounded-xl p-4 text-amber-200 text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block">Backend Rail Offline or Unreachable</strong>
            <span>{error}</span>
            <div className="pt-1">
              Start the backend via <code className="bg-amber-900/60 px-2 py-0.5 rounded font-mono text-[11px]">uvicorn app.main:app --reload --port 8000</code> in the <code className="font-mono text-[11px]">backend/</code> folder.
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ULPIN, Survey/Khasra No, or Owner Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync DPI Rail</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Cadastral Map, Right = Property Passport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cadastral GIS Vector Map */}
        <div className="lg:col-span-7 space-y-3">
          <CadastralMap
            parcels={filteredParcels}
            selectedUlpin={selectedUlpin}
            onSelectParcel={handleSelectParcel}
          />
        </div>

        {/* Canonical Property Passport */}
        <div className="lg:col-span-5">
          <PropertyPassportCard
            passport={passport}
            loading={passportLoading}
          />
        </div>
      </div>
    </div>
  );
}
