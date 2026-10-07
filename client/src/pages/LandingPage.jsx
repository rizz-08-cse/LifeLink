import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { BloodCompatibilityMatrix } from '../components/BloodCompatibilityMatrix';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  Heart,
  Droplet,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Search,
  Users,
  Building2
} from 'lucide-react';

export const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { locality, coords, requestBrowserLocation } = useLocation();
  const navigate = useNavigate();

  const [urgentRequests, setUrgentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.getRequests({ status: 'PENDING' });
        if (data.success) {
          setUrgentRequests(data.requests.slice(0, 4));
        }
      } catch (err) {
        console.warn('Failed to load urgent requests:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-12 glass-panel border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950">
        {/* Decorative background glow & medical grid */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blood-600/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blood-900/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Emergency Alert Ticker */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blood-950/80 text-blood-400 border border-blood-500/30 mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blood-500"></span>
            <span>Real-time Emergency Blood Coordination Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Seconds Count. <br />
            <span className="bg-gradient-to-r from-blood-400 via-blood-500 to-rose-400 bg-clip-text text-transparent">
              Connecting Donors to Critical Need.
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            LifeLink delivers instant, location-aware matching between volunteer blood donors and hospital emergency units. Powered by MongoDB geospatial search, real-time Socket alerts, and verified biological compatibility.
          </p>

          {/* Quick Call to Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/requests/create"
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-blood-600 hover:bg-blood-500 text-white shadow-xl shadow-blood-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Droplet className="w-4 h-4 fill-white" />
              <span>Request Blood Now</span>
            </Link>

            <Link
              to="/donors"
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-blood-400" />
              <span>Find Nearby Donors</span>
            </Link>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Register as a Donor →
              </Link>
            )}
          </div>

          {/* Locality Status & Key Pillars */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blood-500" />
              <span>Current GPS: <strong className="text-slate-200">{locality}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy Protected (No raw GPS public exposure)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sub-second Socket.IO Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Urgent Requests Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blood-500 animate-pulse" />
              Active Emergency Requests
            </h2>
            <p className="text-xs text-slate-400">Real-time patient requests pending compatible donor match.</p>
          </div>
          <Link
            to="/requests"
            className="text-xs font-bold text-blood-400 hover:text-blood-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse h-36"></div>
            ))}
          </div>
        ) : urgentRequests.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
            <Droplet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No active emergency requests in this area.</p>
            <p className="text-xs text-slate-500 mt-1">All hospital blood banks are currently supplied.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentRequests.map((req) => (
              <div
                key={req._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blood-500/40 transition-all flex flex-col justify-between"
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

                  <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                    {req.notes || `${req.unitsNeeded} unit(s) of ${req.bloodGroup} blood required immediately.`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Units: <strong className="text-white">{req.unitsNeeded}</strong></span>
                    <StatusBadge status={req.status} />
                  </div>
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blood-600 hover:bg-blood-500 text-white transition-colors"
                  >
                    View & Respond
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Medical Compatibility Matrix */}
      <section>
        <BloodCompatibilityMatrix />
      </section>

      {/* How LifeLink Works */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
        <h3 className="text-xl font-bold text-white text-center mb-2">How LifeLink Saves Lives</h3>
        <p className="text-xs text-slate-400 text-center max-w-xl mx-auto mb-8">
          Eliminating bureaucratic delay through direct, encrypted proximity matching between verified citizens and clinical responders.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-blood-600/20 text-blood-500 border border-blood-500/40 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">1. Browser GPS Detection</h4>
            <p className="text-xs text-slate-400">
              Requester submits hospital location with 1 tap. Backend executes 2dsphere proximity search without exposing exact donor coordinates publicly.
            </p>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">2. Real-Time Socket Dispatch</h4>
            <p className="text-xs text-slate-400">
              Only compatible, available donors within the radius receive immediate audio/visual alert pings across desktop, tablet, and mobile PWA.
            </p>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">3. Direct Coordination</h4>
            <p className="text-xs text-slate-400">
              Donor accepts with 1 tap. Emergency contact channels unlock instantly, request status updates across the network, and donation history is recorded.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
