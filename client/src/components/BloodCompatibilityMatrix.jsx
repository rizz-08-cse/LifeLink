import React, { useState } from 'react';

const COMPATIBILITY_DATA = {
  'O-': {
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    title: 'Universal RBC Donor',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Vital in trauma emergencies when the patient blood type is unknown.'
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    title: 'High Demand Universal Positive',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Most common blood type; compatible with all positive blood recipients.'
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    title: 'A-Negative Donor',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Crucial for A- and AB- patients.'
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    title: 'A-Positive Recipient/Donor',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Second most common blood group globally.'
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    title: 'Rare B-Negative',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Present in less than 2% of the global population.'
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    title: 'B-Positive Donor',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'High clinical demand across surgical and oncology departments.'
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    title: 'Rarest Blood Group (<1%)',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Universal platelet and plasma donor.'
  },
  'AB+': {
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    title: 'Universal RBC Recipient',
    badge: 'bg-blood-500/20 text-blood-300 border-blood-500/40',
    description: 'Can receive red blood cells from any blood type in emergency transfusions.'
  }
};

export const BloodCompatibilityMatrix = () => {
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const data = COMPATIBILITY_DATA[selectedGroup];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blood-500"></span>
            Medical Blood Compatibility Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Interactive ABO/Rh medical compatibility rules applied in LifeLink matching algorithms.
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${data.badge} font-medium`}>
          {data.title}
        </span>
      </div>

      {/* Blood Group Selectors */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
        {bloodGroups.map((group) => {
          const isSelected = group === selectedGroup;
          return (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`py-2 px-3 rounded-xl font-bold text-sm transition-all duration-200 border ${
                isSelected
                  ? 'bg-blood-600 text-white border-blood-500 shadow-lg shadow-blood-600/30 scale-105'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>

      {/* Selected Blood Group Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Can Donate To */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="text-emerald-400">↑</span>
            <span>{selectedGroup} can donate RBC to:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.canGiveTo.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Can Receive From */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="text-blue-400">↓</span>
            <span>{selectedGroup} can receive RBC from:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.canReceiveFrom.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
        <span>💡 {data.description}</span>
        <span className="text-blood-400 font-mono text-[11px]">Real-Time Verified</span>
      </div>
    </div>
  );
};
