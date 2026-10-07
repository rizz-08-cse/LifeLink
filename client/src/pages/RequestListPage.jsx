import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  AlertCircle,
  Building2,
  Droplet,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  Users
} from 'lucide-react';

export const RequestListPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.getRequests(params);
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.warn('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [bloodGroupFilter, urgencyFilter, statusFilter]);

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(q) ||
      r.hospitalName.toLowerCase().includes(q) ||
      r.hospitalAddress.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <AlertCircle className="w-7 h-7 text-blood-500 animate-pulse" />
            <span>Emergency Request Board</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time feed of patient blood requirements across hospital networks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/requests/create"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blood-600 hover:bg-blood-500 text-white shadow-lg shadow-blood-600/30 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </Link>

          <button
            onClick={fetchRequests}
            title="Refresh"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, hospital, or address..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING', 'ACCEPTED', 'FULFILLED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                  statusFilter === s
                    ? 'bg-blood-600 text-white border-blood-500 shadow-md shadow-blood-600/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Blood group quick pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Blood Type:
          </span>
          <button
            onClick={() => setBloodGroupFilter('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              bloodGroupFilter === ''
                ? 'bg-white text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            ANY
          </button>
          {bloodGroups.map((g) => (
            <button
              key={g}
              onClick={() => setBloodGroupFilter(bloodGroupFilter === g ? '' : g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
                bloodGroupFilter === g
                  ? 'bg-blood-600 text-white border-blood-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse h-40"></div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Droplet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Matching Blood Requests Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your blood type or status filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blood-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blood-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blood-600/30">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{req.patientName}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{req.hospitalName}</span>
                      </p>
                    </div>
                  </div>
                  <UrgencyBadge urgency={req.urgency} />
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300 space-y-1 mb-4">
                  <div className="text-slate-400 truncate">📍 {req.hospitalAddress}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Required:</span>
                    <span className="text-blood-400 font-bold">{req.unitsNeeded} unit(s)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <StatusBadge status={req.status} />
                <Link
                  to={`/requests/${req._id}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blood-600 hover:bg-blood-500 text-white transition-colors"
                >
                  Track & Respond →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
