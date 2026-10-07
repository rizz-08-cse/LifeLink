import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import {
  Heart,
  Droplet,
  MapPin,
  ShieldAlert,
  User,
  LogOut,
  Power,
  PlusCircle,
  Activity
} from 'lucide-react';

export const Navbar = () => {
  const { user, donorProfile, isAuthenticated, logout, toggleDonorAvailability } = useAuth();
  const { locality, requestBrowserLocation, isLoading: isLocLoading } = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blood-600/20 border border-blood-500/50 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blood-600/30">
            <Droplet className="w-5 h-5 text-blood-500 fill-blood-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">Life<span className="text-blood-500">Link</span></span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blood-500/10 text-blood-400 border border-blood-500/20 font-mono">
                LIVE
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 font-medium">Emergency Blood Coordination</p>
          </div>
        </Link>

        {/* Location GPS indicator (Interactive) */}
        <button
          onClick={requestBrowserLocation}
          title="Click to refresh browser GPS location"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
        >
          <MapPin className={`w-3.5 h-3.5 text-blood-400 ${isLocLoading ? 'animate-spin' : ''}`} />
          <span className="truncate max-w-[180px]">{locality || 'Locating GPS...'}</span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/requests"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
          >
            Emergency Requests
          </Link>
          <Link
            to="/donors"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
          >
            Find Donors
          </Link>
          {user?.role === 'donor' && (
            <Link
              to="/donor/dashboard"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              Donor Hub
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 transition-colors"
            >
              Admin Center
            </Link>
          )}
        </nav>

        {/* Action Controls / Auth Status */}
        <div className="flex items-center gap-2.5">
          {/* Quick Create Request Button */}
          <Link
            to="/requests/create"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blood-600 hover:bg-blood-500 text-white shadow-md shadow-blood-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Blood</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Donor Availability Quick Toggle */}
              {user?.role === 'donor' && donorProfile && (
                <button
                  onClick={toggleDonorAvailability}
                  title={`Status: ${donorProfile.isAvailable ? 'Available' : 'Standby'} (Click to toggle)`}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    donorProfile.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{donorProfile.isAvailable ? 'Available' : 'Standby'}</span>
                </button>
              )}

              {/* User Menu / Avatar */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <Link
                  to={user.role === 'donor' ? '/donor/dashboard' : user.role === 'admin' ? '/admin' : '/requests'}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                    {donorProfile?.bloodGroup || user.fullName.charAt(0)}
                  </div>
                  <span className="hidden xl:inline-block text-xs font-medium text-slate-300">
                    {user.fullName.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
              >
                Join as Donor
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
