import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Matching Donors
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-400"></span>
          Donor Connected
        </span>
      );
    case 'FULFILLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400"></span>
          Donation Fulfilled
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
          {status}
        </span>
      );
  }
};

export const UrgencyBadge = ({ urgency }) => {
  switch (urgency) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blood-600 text-white animate-pulse-fast shadow-lg shadow-blood-600/30">
          <span className="mr-1">🚨</span> CRITICAL
        </span>
      );
    case 'URGENT':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          URGENT NEED
        </span>
      );
    case 'STANDARD':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          STANDARD
        </span>
      );
  }
};
