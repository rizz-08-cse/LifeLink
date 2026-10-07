import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import {
  Users,
  Search,
  MapPin,
  ShieldCheck,
  Droplet,
  Heart,
  RefreshCw,
  Power,
  Navigation
} from 'lucide-react';

export const DonorDirectoryPage = () => {
  const { coords, locality, requestBrowserLocation } = useLocation();

  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [radiusKm, setRadiusKm] = useState(25);
  const [useNearbyGeo, setUseNearbyGeo] = useState(true);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      if (useNearbyGeo && coords) {
        // Geospatial Proximity Search via $geoNear
        const params = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          maxDistanceKm: radiusKm,
          onlyAvailable: 'false'
        };
        if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;

        const res = await api.searchNearbyDonors(params);
        if (res.success) {
          setDonors(res.donors);
        }
      } else {
        // Standard directory query
        const params = {};
        if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
        const res = await api.getDonorsDirectory(params);
        if (res.success) {
          setDonors(res.donors);
        }
      }
    } catch (err) {
      console.warn('Error fetching donors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroupFilter, radiusKm, useNearbyGeo, coords]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blood-600/20 text-blood-400 border border-blood-500/40 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Verified Volunteer Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Donor Directory & Proximity Search
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Locate registered blood donors in your area. Matches use MongoDB geospatial indexing with strict medical privacy protection.
            </p>
          </div>

          {/* GPS Proximity Mode Switch */}
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => {
                setUseNearbyGeo(true);
                if (!coords) requestBrowserLocation();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                useNearbyGeo
                  ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Nearby GPS ({radiusKm}km)</span>
            </button>

            <button
              onClick={() => setUseNearbyGeo(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                !useNearbyGeo
                  ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Registered
            </button>
          </div>
        </div>

        {/* Privacy Notice Alert */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Healthcare Privacy Guarantee:</strong> Exact donor GPS coordinates and personal numbers are concealed. Only approximate distance and locality are visible publicly.
            </span>
          </div>
          <span className="text-[11px] text-blood-400 font-mono">HIPAA & GDPR Aligned</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Blood Type Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Group:
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

          {/* Distance Radius Selector */}
          {useNearbyGeo && (
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Radius:</span>
              {[10, 25, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    radiusKm === r
                      ? 'bg-blood-600 text-white border-blood-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse h-44"></div>
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Droplet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Donors Found Within Filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try expanding the search radius or selecting other blood types.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {donors.map((donor) => (
            <div
              key={donor._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blood-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blood-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blood-600/30">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{donor.donorName}</span>
                        {donor.isVerified && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Verified"></span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{donor.locality}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      donor.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {donor.isAvailable ? 'Available' : 'Resting'}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Proximity:</span>
                    <span className="text-blood-400 font-bold">{donor.distanceDisplay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Donations:</span>
                    <span className="text-white font-medium">{donor.totalDonations} verified units</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">Contact unlocks on request accept</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
