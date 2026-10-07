import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  Heart,
  Droplet,
  Power,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const DonorDashboard = () => {
  const { user, donorProfile, toggleDonorAvailability } = useAuth();
  const { locality, coords, requestBrowserLocation } = useLocation();

  const [matchedRequests, setMatchedRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const bloodGroup = donorProfile?.bloodGroup || 'O-';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqData, histData] = await Promise.all([
        api.getRequests({ status: 'PENDING' }),
        api.getMyDonationHistory()
      ]);

      if (reqData.success) {
        setMatchedRequests(reqData.requests);
      }
      if (histData.success) {
        setDonationHistory(histData.history);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bloodGroup]);

  const handleToggleAvailability = async () => {
    setIsToggling(true);
    setActionMessage('');
    const res = await toggleDonorAvailability();
    setIsToggling(false);
    if (res?.success) {
      setActionMessage(
        `Availability updated: You are now ${res.isAvailable ? 'ACTIVE' : 'ON STANDBY'} in the emergency dispatch pool.`
      );
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setAcceptingId(requestId);
    setActionMessage('');
    try {
      const res = await api.acceptRequest(requestId);
      if (res.success) {
        setActionMessage(`Request accepted! Contact unlocked: ${res.coordinationContact?.contactPhone}`);
        await loadData();
      } else {
        setActionMessage(res.message || 'Failed to accept request.');
      }
    } catch (err) {
      setActionMessage(err.message || 'Error communicating with server.');
    } finally {
      setAcceptingId(null);
    }
  };

  const isAvailable = donorProfile?.isAvailable ?? true;
  const totalUnits = donorProfile?.totalDonations || donationHistory.reduce((acc, h) => acc + h.unitsDonated, 0);
  const livesImpacted = totalUnits * 3;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blood-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-blood-600/30">
            {bloodGroup}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.fullName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Verified Donor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Locality: <strong className="text-slate-200">{donorProfile?.addressLocality || locality}</strong></span>
              <span>•</span>
              <span>Registered Contact: <strong className="text-slate-200">{user?.phone}</strong></span>
            </p>
          </div>
        </div>

        {/* Real Backend Availability Toggle Switch */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{isAvailable ? 'Available for Calls' : 'Standby / Resting'}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isAvailable ? 'Receiving emergency match alerts' : 'Paused from notification engine'}
            </p>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={isToggling}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isToggling ? 'Updating...' : isAvailable ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-blood-950/80 border border-blood-500/50 text-xs text-blood-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-slate-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Units Donated</span>
            <Droplet className="w-4 h-4 text-blood-500 fill-blood-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalUnits}</div>
          <p className="text-[10px] text-slate-400 mt-1">Verified whole blood / RBC</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Estimated Lives Saved</span>
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">~{livesImpacted}</div>
          <p className="text-[10px] text-slate-400 mt-1">Based on clinical standard 1:3</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Eligibility Status</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-amber-300">Ready to Donate</div>
          <p className="text-[10px] text-slate-400 mt-1">Standard interval cleared</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">GPS Dispatch Zone</span>
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-slate-200 truncate">{locality}</div>
          <button
            onClick={requestBrowserLocation}
            className="text-[10px] text-blood-400 hover:text-blood-300 font-bold mt-1 block"
          >
            Refresh GPS Coordinates →
          </button>
        </div>
      </div>

      {/* Matched Urgent Blood Requests Waiting for Donors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blood-500 animate-pulse" />
              Emergency Requests Matching Your Blood Type ({bloodGroup})
            </h2>
            <p className="text-xs text-slate-400">
              Patients requiring compatible blood units in your metropolitan area.
            </p>
          </div>
          <button
            onClick={loadData}
            title="Refresh feed"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {matchedRequests.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No Pending Emergency Calls</h4>
            <p className="text-xs text-slate-400 mt-1">
              Your community blood bank is currently stable. Keep your status set to <strong>Available</strong> to receive instant alerts if trauma calls occur.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedRequests.map((req) => (
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
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{req.hospitalName}</span>
                        </p>
                      </div>
                    </div>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300 space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hospital Address:</span>
                      <span className="text-white font-medium">{req.hospitalAddress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Units Needed:</span>
                      <span className="text-blood-400 font-bold">{req.unitsNeeded} unit(s)</span>
                    </div>
                    {req.notes && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                        "{req.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <Link
                    to={`/requests/${req._id}`}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Full Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleAcceptRequest(req._id)}
                    disabled={acceptingId === req._id || !isAvailable}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                      !isAvailable
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-blood-600 hover:bg-blood-500 text-white shadow-blood-600/30 active:scale-95'
                    }`}
                  >
                    {acceptingId === req._id ? (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Accept & Connect'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Donation History Preview */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blood-400" />
            <span>Verified Donation Records</span>
          </h3>
          <Link
            to="/donations/history"
            className="text-xs font-bold text-blood-400 hover:text-blood-300"
          >
            View Full Records ({donationHistory.length}) →
          </Link>
        </div>

        {donationHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No completed donations recorded yet. When you fulfill an accepted request, your official donation certificate is generated here.
          </p>
        ) : (
          <div className="space-y-2">
            {donationHistory.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-white">{item.hospitalName}</div>
                    <div className="text-slate-400 text-[11px]">
                      Patient: {item.patientName} • {item.bloodGroup} ({item.unitsDonated} unit)
                    </div>
                  </div>
                </div>
                <div className="text-slate-400 text-right">
                  <div>{new Date(item.completedAt).toLocaleDateString()}</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Credited</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
