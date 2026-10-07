import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { AlertTriangle, CheckCircle2, HeartHandshake, X } from 'lucide-react';

export const EmergencyAlertModal = () => {
  const { activeAlerts, dismissAlert } = useSocket();
  const navigate = useNavigate();

  if (!activeAlerts || activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-3 pointer-events-none">
      {activeAlerts.map((alert) => {
        const isEmergency = alert.type === 'EMERGENCY';
        const isAccepted = alert.type === 'ACCEPTED';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all transform translate-y-0 animate-in fade-in duration-300 ${
              isEmergency
                ? 'bg-blood-950/95 border-blood-500 shadow-blood-950/80'
                : isAccepted
                ? 'bg-blue-950/95 border-blue-500 shadow-blue-950/80'
                : 'bg-emerald-950/95 border-emerald-500 shadow-emerald-950/80'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isEmergency
                    ? 'bg-blood-600/30 border-blood-500 text-blood-400'
                    : isAccepted
                    ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                    : 'bg-emerald-600/30 border-emerald-500 text-emerald-400'
                }`}
              >
                {isEmergency ? (
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                ) : isAccepted ? (
                  <HeartHandshake className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-white">
                    {alert.type}
                  </span>
                  <span className="text-[10px] text-slate-400">Just Now</span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                  {alert.title}
                </h4>

                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {alert.message}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  {alert.data?._id && (
                    <button
                      onClick={() => {
                        navigate(`/requests/${alert.data._id}`);
                        dismissAlert(alert.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow"
                    >
                      View Details & Respond
                    </button>
                  )}
                  {alert.data?.requestId && (
                    <button
                      onClick={() => {
                        navigate(`/requests/${alert.data.requestId}`);
                        dismissAlert(alert.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow"
                    >
                      Open Request Tracker
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
