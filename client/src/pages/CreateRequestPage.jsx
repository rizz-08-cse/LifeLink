import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { BloodRadar } from '../components/BloodRadar';
import {
  AlertTriangle,
  Building2,
  Droplet,
  MapPin,
  Phone,
  User,
  FileText,
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export const CreateRequestPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { coords, locality, requestBrowserLocation } = useLocation();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState('CRITICAL');
  const [hospitalName, setHospitalName] = useState('Metropolitan Trauma Center');
  const [hospitalAddress, setHospitalAddress] = useState('500 Healthcare Blvd, Floor 4 ICU');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+1 (555) 911-0021');
  const [notes, setNotes] = useState('Patient scheduled for urgent transfusion. Compatible donors requested immediately.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdRequestData, setCreatedRequestData] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const payload = {
      patientName,
      bloodGroup,
      unitsNeeded: Number(unitsNeeded),
      urgency,
      hospitalName,
      hospitalAddress,
      latitude: coords ? coords.latitude : 40.7128,
      longitude: coords ? coords.longitude : -74.0060,
      contactPhone,
      notes
    };

    try {
      const res = await api.createRequest(payload);
      setIsSubmitting(false);

      if (res.success) {
        setCreatedRequestData(res);
        // Show radar for 2.5 seconds then navigate to tracking page
        setTimeout(() => {
          navigate(`/requests/${res.request._id}`);
        }, 2200);
      } else {
        setError(res.message || 'Failed to dispatch request.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Server connection error');
    }
  };

  if (createdRequestData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white">Emergency Request Dispatched!</h2>
          <p className="text-xs text-slate-300">
            Real-time emergency broadcast sent to {createdRequestData.potentialMatchesCount || 3} compatible donors in the {locality} radius.
          </p>

          <BloodRadar
            bloodGroup={bloodGroup}
            matchesCount={createdRequestData.potentialMatchesCount || 3}
            radiusKm={25}
          />

          <p className="text-xs text-blood-400 font-mono animate-pulse">
            Transferring to live request tracker...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8 pb-16">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blood-600/20 text-blood-400 border border-blood-500/40 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Real-time Clinical Dispatch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Create Emergency Blood Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Broadcast urgent patient transfusion requirements directly to available registered donors in the vicinity.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-blood-950/80 border border-blood-600 text-xs text-blood-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-blood-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Details & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Patient Identifier / Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Liam Parker (Trauma ICU)"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Units Required
              </label>
              <div className="relative">
                <Droplet className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Blood Group Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Required Blood Group
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setBloodGroup(group)}
                  className={`py-2.5 rounded-xl text-sm font-black border transition-all ${
                    bloodGroup === group
                      ? 'bg-blood-600 text-white border-blood-500 shadow-md shadow-blood-600/30 scale-105'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Clinical Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CRITICAL', label: 'CRITICAL', sub: 'Immediate (< 2 hrs)', color: 'border-blood-600 bg-blood-950/40 text-blood-400' },
                { id: 'URGENT', label: 'URGENT', sub: 'Within 24 hrs', color: 'border-amber-500 bg-amber-950/30 text-amber-300' },
                { id: 'STANDARD', label: 'STANDARD', sub: 'Scheduled Care', color: 'border-slate-700 bg-slate-900 text-slate-300' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setUrgency(item.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    urgency === item.id
                      ? `${item.color} shadow-lg ring-1 ring-white/20 font-bold`
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">{item.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hospital Info & Location */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital / Clinical Facility Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. St. Jude Regional Hospital"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital Address / Ward / Room Landmark
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  placeholder="e.g. 100 Main Street, Emergency Ward 3B"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>Hospital GPS: <strong className="text-slate-300">{locality}</strong></span>
                <button
                  type="button"
                  onClick={requestBrowserLocation}
                  className="text-blood-400 hover:text-blood-300 font-bold underline"
                >
                  Sync Hospital GPS from Browser
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Direct Emergency Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 911-0021"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Clinical Notes / Specific Request
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Whole blood or packed RBC preferred"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl text-sm font-bold bg-blood-600 hover:bg-blood-500 text-white shadow-xl shadow-blood-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Droplet className="w-4 h-4 fill-white" />
                <span>Publish Emergency Blood Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
