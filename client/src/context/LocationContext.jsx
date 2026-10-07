import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(null);
  const [locality, setLocality] = useState('Detecting location...');
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setPermissionState('denied');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setPermissionState('granted');
        setIsLoading(false);

        // Approximate locality display
        setLocality(`Metro Area (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
      },
      (err) => {
        console.warn('[Geolocation Error]:', err.message);
        setIsLoading(false);
        setPermissionState('denied');
        setError(err.message || 'Permission denied or unable to retrieve location.');
        // Default to metropolitan coordinates if denied so app remains interactive
        setCoords({ latitude: 40.7128, longitude: -74.0060 });
        setLocality('Downtown Medical Center (Demo Coords)');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    // Attempt to check if permission already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        if (result.state === 'granted') {
          requestBrowserLocation();
        } else {
          // Fallback initial location
          setCoords({ latitude: 40.7128, longitude: -74.0060 });
          setLocality('Metropolitan Area');
        }
      }).catch(() => {
        setCoords({ latitude: 40.7128, longitude: -74.0060 });
        setLocality('Metropolitan Area');
      });
    } else {
      setCoords({ latitude: 40.7128, longitude: -74.0060 });
      setLocality('Metropolitan Area');
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        coords,
        locality,
        permissionState,
        error,
        isLoading,
        requestBrowserLocation,
        setCoords,
        setLocality
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
