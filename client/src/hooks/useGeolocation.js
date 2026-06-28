import { useState, useEffect, useRef } from 'react';

export const useGeolocation = (enabled = false, options = {}) => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const successHandler = (position) => {
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      setError(null);
    };

    const errorHandler = (err) => {
      setError(err.message);
      console.warn(`Geolocation error: ${err.message}`);
    };

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    };

    // Get current position first
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, defaultOptions);

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      defaultOptions
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled, JSON.stringify(options)]);

  return { coords, error };
};

export default useGeolocation;
