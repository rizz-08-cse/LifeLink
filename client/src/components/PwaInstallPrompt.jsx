import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone display mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed in this session
      if (!sessionStorage.getItem('lifelink_pwa_dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not standalone, show prompt after 3 seconds
    if (isAppleDevice && !sessionStorage.getItem('lifelink_pwa_dismissed')) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('lifelink_pwa_dismissed', 'true');
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Floating Bottom / Top Install Banner */}
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-bounce-short">
        <div className="glass-panel p-4 rounded-2xl border border-blood-500/40 shadow-2xl shadow-blood-950/80 bg-slate-900/95 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-blood-600/20 border border-blood-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-blood-500" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Install LifeLink
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blood-500/20 text-blood-400 font-mono">PWA</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                Install for instant emergency blood alerts, offline support, and 1-tap launch on your device.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blood-600 hover:bg-blood-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-blood-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-slate-700 bg-slate-900 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blood-600/20 border border-blood-500 mx-auto flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-blood-400" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Install LifeLink on iOS</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Apple Safari does not support automated 1-click install prompts, but you can install in 2 quick steps:
            </p>

            <div className="bg-slate-950/70 p-4 rounded-xl text-left text-xs space-y-3 mb-6 border border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blood-400 bg-blood-950 px-2 py-0.5 rounded">1</span>
                <span>Tap the <strong>Share button</strong> (square with arrow pointing up) at the bottom of Safari.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blood-400 bg-blood-950 px-2 py-0.5 rounded">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-blood-600 text-white hover:bg-blood-500 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
