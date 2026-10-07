import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  Heart,
  Hospital,
  ShieldCheck,
  User
} from 'lucide-react';

export const DonationHistoryPage = () => {
  const { user, donorProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getMyDonationHistory();
        if (res.success) {
          setHistory(res.history);
        }
      } catch (err) {
        console.warn('Error fetching donation history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalUnits = history.reduce((acc, h) => acc + h.unitsDonated, 0);
  const livesImpacted = totalUnits * 3;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header & Lifesaver Badge Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blood-950/20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blood-600 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-blood-600/40 shrink-0">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Lifesaver Certificate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.fullName}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Blood Group: <strong className="text-blood-400 font-mono text-sm">{donorProfile?.bloodGroup || 'O-'}</strong> • Registered Volunteer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-center px-2">
              <span className="text-2xl font-black text-white">{totalUnits}</span>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Units Given</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-center px-2">
              <span className="text-2xl font-black text-emerald-400">~{livesImpacted}</span>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Lives Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* History Records List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blood-500" />
          <span>Donation Activity Log</span>
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-5 rounded-2xl animate-pulse h-24"></div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center border border-slate-800">
            <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Donation History Logged Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Once you respond to an emergency blood request and the transfusion is marked completed, the clinical hospital credits your verified log here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blood-600/20 border border-blood-500/30 text-blood-400 flex items-center justify-center shrink-0">
                    <Droplet className="w-6 h-6 fill-blood-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{record.hospitalName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {record.unitsDonated} Unit ({record.bloodGroup})
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Recipient / Case: <strong className="text-slate-300">{record.patientName}</strong>
                    </p>
                    {record.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">"{record.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1 sm:justify-end">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(record.completedAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Clinical Verification ID: {record._id.slice(-6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
