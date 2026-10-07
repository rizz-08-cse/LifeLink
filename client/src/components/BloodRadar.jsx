import React from 'react';

export const BloodRadar = ({
  radiusKm = 25,
  matchesCount = 3,
  bloodGroup = 'A+',
  isScanning = false
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 glass-panel rounded-2xl overflow-hidden border border-slate-800">
      {/* Radar Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Concentric distance rings */}
        <div className="absolute inset-0 rounded-full border border-blood-500/20"></div>
        <div className="absolute inset-8 rounded-full border border-blood-500/25"></div>
        <div className="absolute inset-16 rounded-full border border-blood-500/30"></div>
        <div className="absolute inset-24 rounded-full border border-blood-500/40"></div>

        {/* Crosshair axes */}
        <div className="absolute w-full h-[1px] bg-blood-500/20"></div>
        <div className="absolute h-full w-[1px] bg-blood-500/20"></div>

        {/* Radar Sweep Line */}
        <div
          className="absolute inset-0 rounded-full origin-center animate-radar-sweep pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, rgba(220, 38, 38, 0.4) 0deg, rgba(220, 38, 38, 0) 60deg, transparent 60deg)'
          }}
        ></div>

        {/* Center Target (Hospital / Requester GPS) */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-blood-600 flex items-center justify-center shadow-lg shadow-blood-600/50 animate-pulse">
          <span className="text-[10px] font-black text-white">{bloodGroup}</span>
        </div>

        {/* Simulated Nearby Donor Blips around the radius */}
        {matchesCount > 0 && (
          <>
            {/* Blip 1: ~2km */}
            <div className="absolute top-20 left-24 w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80 animate-ping"></div>
            <div className="absolute top-20 left-24 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></div>

            {/* Blip 2: ~4km */}
            <div className="absolute bottom-16 right-20 w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80 animate-ping" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute bottom-16 right-20 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></div>

            {/* Blip 3: ~7km */}
            <div className="absolute top-14 right-20 w-3 h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80 animate-ping" style={{ animationDelay: '1.2s' }}></div>
            <div className="absolute top-14 right-20 w-3 h-3 rounded-full bg-emerald-500 border border-white"></div>
          </>
        )}

        {/* Distance Range Indicators */}
        <span className="absolute top-2 text-[10px] text-blood-400 font-mono tracking-wider">{radiusKm} km</span>
        <span className="absolute top-10 text-[9px] text-slate-500 font-mono">{Math.round(radiusKm * 0.6)} km</span>
        <span className="absolute top-18 text-[9px] text-slate-500 font-mono">{Math.round(radiusKm * 0.3)} km</span>
      </div>

      {/* Radar Status Footer */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-sm font-semibold text-white">
            {matchesCount > 0 ? `${matchesCount} Compatible Donors Detected` : 'Scanning for Compatible Donors...'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Geospatial 2dsphere scan active within {radiusKm} km radius
        </p>
      </div>
    </div>
  );
};
