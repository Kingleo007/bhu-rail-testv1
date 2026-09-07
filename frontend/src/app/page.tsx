"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchParcels, fetchPassport, ParcelAsset, PropertyPassport } from "@/lib/api";
import CadastralMap from "@/components/CadastralMap";
import PropertyPassportCard from "@/components/PropertyPassportCard";
import { 
  ShieldCheck, 
  Scissors, 
  Landmark, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  Database,
  Award,
  Layers,
  CheckCircle2
} from "lucide-react";

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
        handleSelectParcel(data[0].ulpin);
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to Bhu-Rail backend rail at http://localhost:8000. Ensure the backend daemon is running.");
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
      {/* 1. Official Government Hero Banner (Singapore GovTech / DoLR Style) */}
      <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 shadow-xs relative overflow-hidden">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] text-xs font-bold uppercase tracking-wider">
            <span>Official Government Digital Public Infrastructure</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#0b2545] tracking-tight">
            National Land Digital Public Infrastructure (Land DPI)
          </h1>

          <p className="text-sm text-[#334155] leading-relaxed max-w-3xl">
            A parcel-centric framework converting land from fragmented departmental records into verifiable digital assets. Exposing standardized open APIs (<strong>"Land UPI"</strong>) for identity, spatial geometry, bundle of rights, encumbrances, and lifecycle governance.
          </p>

          {/* 3 Core Services Action Cards */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/bank-simulator?ulpin=IN-HR-GGM-KDP-0101-0000"
              className="p-3 rounded-lg border border-[#cbd5e1] hover:border-[#0b2545] hover:shadow-xs transition-all bg-[#f8fafc] group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#0b2545]">
                <span className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#107c41]" />
                  <span>Land UPI Rail</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#64748b] mt-1 leading-snug">
                1-click sub-100ms title verification for commercial banks and lending institutions.
              </p>
            </Link>

            <Link
              href="/court-registry?ulpin=IN-HR-GGM-KDP-0104-0000"
              className="p-3 rounded-lg border border-[#cbd5e1] hover:border-[#0b2545] hover:shadow-xs transition-all bg-[#f8fafc] group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#0b2545]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#d9381e]" />
                  <span>Judicial Injunction</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#64748b] mt-1 leading-snug">
                Rule engine blocks transfers on court-stayed parcels in real time.
              </p>
            </Link>

            <Link
              href="/surveyor-tools?ulpin=IN-HR-GGM-KDP-0108-0000"
              className="p-3 rounded-lg border border-[#cbd5e1] hover:border-[#0b2545] hover:shadow-xs transition-all bg-[#f8fafc] group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#0b2545]">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-[#0284c7]" />
                  <span>Cadastral Subdivision</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#64748b] mt-1 leading-snug">
                Spatial polygon partitioning with mathematical area conservation.
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Backend Alert if Offline */}
      {error && (
        <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg p-3.5 text-[#991b1b] text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-[#d9381e] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Backend Rail Service Disconnected</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. Official Cadastral Search & Registry Filter */}
      <div className="bg-white border border-[#cbd5e1] p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ULPIN, Khasra Number, or Landowner Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-[#0b2545] font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#0b2545] border border-[#cbd5e1] rounded text-xs font-semibold transition-colors shadow-xs"
          >
            <RefreshCw className="w-3 h-3 text-[#0b2545]" />
            <span>Synchronize Rail</span>
          </button>
        </div>
      </div>

      {/* 3. Main Split View (GIS Map on Left, Certificate on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CadastralMap
            parcels={filteredParcels}
            selectedUlpin={selectedUlpin}
            onSelectParcel={handleSelectParcel}
          />
        </div>

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
