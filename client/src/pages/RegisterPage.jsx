import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { Droplet, Lock, Mail, Phone, User, MapPin, Heart, ArrowRight, AlertCircle, Check } from 'lucide-react';

export const RegisterPage = () => {
  const [role, setRole] = useState('donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [addressLocality, setAddressLocality] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { coords, locality, requestBrowserLocation } = useLocation();
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'donor' && !bloodGroup) {
      setError('Please select your verified blood group.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName,
      email,
      password,
      phone,
      role,
      bloodGroup: role === 'donor' ? bloodGroup : undefined,
      latitude: coords ? coords.latitude : 40.7128,
      longitude: coords ? coords.longitude : -74.0060,
      addressLocality: addressLocality || locality || 'Metro District'
    };

    const res = await register(payload);
    setIsSubmitting(false);

    if (res.success) {
      if (role === 'donor') {
        navigate('/donor/dashboard');
      } else {
        navigate('/requests');
      }
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blood-600/20 border border-blood-500/50 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blood-600/30">
            <Droplet className="w-7 h-7 text-blood-500 fill-blood-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create LifeLink Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Join the verified emergency blood donor and response network.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'donor'
                ? 'bg-blood-600 text-white shadow-md shadow-blood-600/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Volunteer Donor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('requester')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'requester'
                ? 'bg-blood-600 text-white shadow-md shadow-blood-600/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hospital / Requester</span>
          </button>
        </div>

        {/* Registration Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-blood-950/80 border border-blood-600/50 flex items-start gap-2.5 text-xs text-blood-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-blood-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Jordan Lee"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.org"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Emergency Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Donor-Specific Fields */}
            {role === 'donor' && (
              <div className="pt-2 border-t border-slate-800/80 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Your Blood Group
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {bloodGroups.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setBloodGroup(group)}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          bloodGroup === group
                            ? 'bg-blood-600 text-white border-blood-500 shadow-md shadow-blood-600/30'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Locality / General Area (Safe Public Display)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={addressLocality}
                      onChange={(e) => setAddressLocality(e.target.value)}
                      placeholder="e.g. Westside Medical District"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>GPS: {locality}</span>
                    <button
                      type="button"
                      onClick={requestBrowserLocation}
                      className="text-blood-400 hover:text-blood-300 font-bold underline"
                    >
                      Update GPS from Browser
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold bg-blood-600 hover:bg-blood-500 text-white shadow-xl shadow-blood-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-blood-400 hover:text-blood-300 font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
