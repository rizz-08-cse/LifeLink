import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { BloodRadar } from '../components/BloodRadar';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  ArrowLeft,
  Share2
} from 'lucide-react';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, donorProfile, isAuthenticated } = useAuth();
  const { joinRequestRoom, socket } = useSocket();

  const [request, setRequest] = useState(null);
  const [compatibleGroups, setCompatibleGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchRequest = async () => {
    try {
      const res = await api.getRequestById(id);
      if (res.success) {
        setRequest(res.request);
        setCompatibleGroups(res.compatibleGroups);
      } else {
        setError(res.message || 'Request not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load request details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    joinRequestRoom(id);

    // Real-time listener for status update in this specific request room
    if (socket) {
      const handleStatusUpdate = (data) => {
        if (data.requestId === id) {
          console.log('[Socket] Request updated in real-time:', data);
          fetchRequest();
          setToastMessage(`Real-time update: Request marked as ${data.status}`);
          setTimeout(() => setToastMessage(''), 5000);
        }
      };

      socket.on('request_status_updated', handleStatusUpdate);

      return () => {
        socket.off('request_status_updated', handleStatusUpdate);
      };
    }
  }, [id, socket]);

  // Handle Donor Accepting Request
  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await api.acceptRequest(id);
      if (res.success) {
        setRequest(res.request);
        setToastMessage('You have accepted this emergency request. Contact coordination unlocked below.');
      } else {
        setError(res.message || 'Unable to accept request.');
      }
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Requester/Admin Marking as Fulfilled
  const handleFulfill = async () => {
    setIsProcessing(true);
    try {
      const res = await api.fulfillRequest(id);
      if (res.success) {
        setRequest(res.request);
        setToastMessage('Donation marked fulfilled! Donor has been credited in history.');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Cancelling
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;
    setIsProcessing(true);
    try {
      const res = await api.cancelRequest(id);
      if (res.success) {
        setRequest(res.request);
        setToastMessage('Request has been cancelled.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blood-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="glass-panel p-8 rounded-3xl max-w-md mx-auto text-center border border-slate-800 my-12">
        <AlertTriangle className="w-10 h-10 text-blood-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Request Unavailable</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Could not find the requested emergency entry.'}</p>
        <Link to="/requests" className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white">
          Back to Request Board
        </Link>
      </div>
    );
  }

  const isOwner = user?._id && request.requester?._id && user._id === request.requester._id;
  const isAdmin = user?.role === 'admin';
  const isDonor = user?.role === 'donor';
  const isCompatible = donorProfile?.bloodGroup && compatibleGroups.includes(donorProfile.bloodGroup);
  const isAcceptedByMe =
    donorProfile &&
    request.acceptedByDonor &&
    request.acceptedByDonor._id === donorProfile._id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back button & Action toast */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={request.status} />
          <UrgencyBadge urgency={request.urgency} />
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-blood-950 border border-blood-500 text-xs text-blood-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Request Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blood-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-blood-600/30 shrink-0">
              {request.bloodGroup}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{request.patientName}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{request.hospitalName}</span>
              </p>
            </div>
          </div>

          <div className="text-right sm:self-start">
            <span className="text-xs text-slate-400 block">Units Needed</span>
            <span className="text-2xl font-black text-blood-400">{request.unitsNeeded} unit(s)</span>
          </div>
        </div>

        {/* Live Status Tracking Progression Bar */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Real-Time Request Lifecycle
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Step 1: Pending */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                request.status === 'PENDING'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>1. Matching</span>
              </div>
              <p className="text-[10px] text-slate-500">Geospatial broadcast active</p>
            </div>

            {/* Step 2: Accepted */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                request.status === 'ACCEPTED'
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 font-bold'
                  : request.status === 'FULFILLED'
                  ? 'bg-slate-950/60 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span>2. Connected</span>
              </div>
              <p className="text-[10px] text-slate-500">Donor verified & dispatched</p>
            </div>

            {/* Step 3: Fulfilled */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                request.status === 'FULFILLED'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span>3. Fulfilled</span>
              </div>
              <p className="text-[10px] text-slate-500">Transfusion recorded</p>
            </div>
          </div>
        </div>

        {/* Hospital & Clinical Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <span className="font-bold text-slate-300 block text-xs uppercase tracking-wider">
              Hospital Location
            </span>
            <div className="flex items-start gap-2 text-slate-200">
              <MapPin className="w-4 h-4 text-blood-500 shrink-0 mt-0.5" />
              <span>{request.hospitalAddress}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <span className="font-bold text-slate-300 block text-xs uppercase tracking-wider">
              Direct Contact Line
            </span>
            <div className="flex items-start gap-2 text-slate-200">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-mono text-sm">{request.contactPhone}</span>
            </div>
          </div>
        </div>

        {request.notes && (
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong className="text-white block mb-1">Medical Staff Notes:</strong>
            <p className="italic">"{request.notes}"</p>
          </div>
        )}

        {/* Biologically Compatible Blood Types */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Biologically Compatible Donor Blood Types for {request.bloodGroup}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {compatibleGroups.map((g) => (
              <span
                key={g}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  donorProfile?.bloodGroup === g
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {g} {donorProfile?.bloodGroup === g ? '(You)' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Connected Donor Channel (When Accepted) */}
        {request.status === 'ACCEPTED' && request.acceptedByDonor && (
          <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Donor Connected & Active</span>
              </h4>
              <span className="text-[10px] text-blue-300 font-mono">Mutual Contact Unlocked</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Donor Name:</span>
                <span className="text-white font-bold">{request.acceptedByDonor?.user?.fullName || 'Verified Donor'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Emergency Phone:</span>
                <a
                  href={`tel:${request.acceptedByDonor?.user?.phone}`}
                  className="text-emerald-400 font-bold font-mono hover:underline"
                >
                  {request.acceptedByDonor?.user?.phone || 'On File'}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registered Blood Type:</span>
                <span className="text-blood-400 font-bold">{request.acceptedByDonor?.bloodGroup || request.bloodGroup}</span>
              </div>
            </div>
          </div>
        )}

        {/* Radar Scanner Visual when Status is Pending */}
        {request.status === 'PENDING' && (
          <div className="py-2">
            <BloodRadar
              bloodGroup={request.bloodGroup}
              matchesCount={3}
              radiusKm={25}
            />
          </div>
        )}

        {/* Real Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Donor Response Action */}
          {request.status === 'PENDING' && isDonor && (
            <button
              onClick={handleAccept}
              disabled={isProcessing || !isCompatible}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${
                isCompatible
                  ? 'bg-blood-600 hover:bg-blood-500 text-white shadow-blood-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>
                {isProcessing
                  ? 'Processing...'
                  : isCompatible
                  ? 'I Can Donate (Accept Request)'
                  : `Incompatible Blood Type (${donorProfile?.bloodGroup})`}
              </span>
            </button>
          )}

          {/* Requester / Admin Fulfill Action */}
          {(isOwner || isAdmin) && request.status === 'ACCEPTED' && (
            <button
              onClick={handleFulfill}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Donation as Fulfilled</span>
            </button>
          )}

          {/* Requester / Admin Cancel Action */}
          {(isOwner || isAdmin) && request.status !== 'FULFILLED' && request.status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
