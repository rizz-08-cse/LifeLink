import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  Users,
  Activity,
  Droplet,
  Heart,
  TrendingUp,
  Clock,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setData(res.stats);
      }
    } catch (err) {
      console.warn('Error fetching admin statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleVerify = async (userId) => {
    try {
      const res = await api.toggleUserVerification(userId);
      if (res.success) {
        setToastMessage(res.message);
        await fetchStats();
        setTimeout(() => setToastMessage(''), 4000);
      }
    } catch (err) {
      console.warn('Verification toggle error:', err);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blood-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { users, requests, bloodGroupDistribution, totalUnitsDonated, recentRequests, recentDonations } = data || {
    users: { total: 0, donors: 0, availableDonors: 0 },
    requests: { total: 0, pending: 0, fulfilled: 0, fulfillmentRate: 0 },
    bloodGroupDistribution: [],
    totalUnitsDonated: 0,
    recentRequests: [],
    recentDonations: []
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            LifeLink Clinical Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform metrics, hospital coordination throughput, and inventory telemetry.
          </p>
        </div>

        <button
          onClick={fetchStats}
          title="Refresh metrics"
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors self-start sm:self-auto flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Donors</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {users.availableDonors} <span className="text-xs text-slate-500 font-normal">/ {users.donors} total</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-medium mt-1">Ready for emergency dispatch</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pending Requests</span>
            <Activity className="w-4 h-4 text-blood-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blood-400">
            {requests.pending}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Currently matching in network</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Fulfillment Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            {requests.fulfillmentRate}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{requests.fulfilled} of {requests.total} completed</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Units Provided</span>
            <Droplet className="w-4 h-4 text-blood-500 fill-blood-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {totalUnitsDonated}
          </div>
          <p className="text-[10px] text-emerald-400 font-medium mt-1">~{totalUnitsDonated * 3} lives touched</p>
        </div>
      </div>

      {/* Blood Group Distribution Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Droplet className="w-4 h-4 text-blood-500" />
          <span>Active Donor Pool by Blood Group</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => {
            const found = bloodGroupDistribution.find((b) => b._id === group);
            const count = found ? found.count : 0;
            const available = found ? found.available : 0;

            return (
              <div
                key={group}
                className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center flex flex-col justify-between"
              >
                <div className="text-lg font-black text-blood-400">{group}</div>
                <div className="my-1">
                  <div className="text-xl font-bold text-white">{count}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">{available} available</div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-blood-500 h-full rounded-full"
                    style={{ width: `${Math.min(count * 20, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent System Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blood Requests */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blood-400" />
            <span>Recent Emergency Requests</span>
          </h3>

          <div className="space-y-2">
            {recentRequests.slice(0, 5).map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blood-600 text-white font-bold flex items-center justify-center shrink-0">
                    {req.bloodGroup}
                  </span>
                  <div>
                    <div className="font-bold text-white">{req.patientName}</div>
                    <div className="text-slate-400 text-[11px] truncate max-w-[160px] sm:max-w-none">
                      {req.hospitalName} ({req.unitsNeeded} unit)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transfusion Logs */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recent Transfusion Records</span>
          </h3>

          <div className="space-y-2">
            {recentDonations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No donations completed yet.</p>
            ) : (
              recentDonations.slice(0, 5).map((d) => (
                <div
                  key={d._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <div>
                      <div className="font-bold text-white">{d.hospitalName}</div>
                      <div className="text-slate-400 text-[11px]">
                        Donor: {d.donorUser?.fullName || 'Verified'} • Patient: {d.patientName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(d.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
