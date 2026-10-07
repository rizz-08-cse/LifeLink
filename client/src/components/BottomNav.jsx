import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, AlertCircle, Users, Activity, PlusCircle, ShieldCheck } from 'lucide-react';

export const BottomNav = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
              isActive ? 'text-blood-500 font-bold' : 'text-slate-400 font-medium hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink
          to="/requests"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
              isActive ? 'text-blood-500 font-bold' : 'text-slate-400 font-medium hover:text-slate-200'
            }`
          }
        >
          <AlertCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Requests</span>
        </NavLink>

        {/* Center Prominent Action: Request Blood */}
        <NavLink
          to="/requests/create"
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-blood-600 text-white flex items-center justify-center shadow-lg shadow-blood-600/50 border-4 border-slate-950 active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold text-blood-400 mt-0.5">Emergency</span>
        </NavLink>

        <NavLink
          to="/donors"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
              isActive ? 'text-blood-500 font-bold' : 'text-slate-400 font-medium hover:text-slate-200'
            }`
          }
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Donors</span>
        </NavLink>

        {user?.role === 'admin' ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 font-medium hover:text-slate-200'
              }`
            }
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Admin</span>
          </NavLink>
        ) : user?.role === 'donor' ? (
          <NavLink
            to="/donor/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                isActive ? 'text-blood-500 font-bold' : 'text-slate-400 font-medium hover:text-slate-200'
              }`
            }
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Donor Hub</span>
          </NavLink>
        ) : (
          <NavLink
            to={isAuthenticated ? "/requests" : "/login"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                isActive ? 'text-blood-500 font-bold' : 'text-slate-400 font-medium hover:text-slate-200'
              }`
            }
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{isAuthenticated ? "Activity" : "Sign In"}</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};
