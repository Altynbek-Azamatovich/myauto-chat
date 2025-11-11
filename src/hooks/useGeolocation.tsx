import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Геолокация не поддерживается вашим браузером',
        loading: false,
      });
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = 'Не удалось получить местоположение';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Доступ к геолокации запрещен';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Информация о местоположении недоступна';
          break;
        case error.TIMEOUT:
          errorMessage = 'Превышено время ожидания запроса геолокации';
          break;
      }

      setLocation({
        latitude: null,
        longitude: null,
        error: errorMessage,
        loading: false,
      });
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  const refetch = () => {
    setLocation(prev => ({ ...prev, loading: true }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setLocation({
          latitude: null,
          longitude: null,
          error: error.message,
          loading: false,
        });
      }
    );
  };

  return { ...location, refetch };
};
