import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    ymaps: any;
    ymapsReady: Promise<void>;
  }
}

interface YandexMapProps {
  center?: [number, number];
  zoom?: number;
  onMapReady?: (map: any, ymaps: any) => void;
  className?: string;
}

let ymapsLoadPromise: Promise<void> | null = null;

const loadYandexMapsScript = (apiKey: string): Promise<void> => {
  if (ymapsLoadPromise) {
    return ymapsLoadPromise;
  }

  ymapsLoadPromise = new Promise((resolve, reject) => {
    if (window.ymaps && window.ymaps.ready) {
      window.ymaps.ready(resolve);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    
    script.onload = () => {
      window.ymaps.ready(resolve);
    };
    
    script.onerror = () => {
      ymapsLoadPromise = null;
      reject(new Error('Failed to load Yandex Maps API'));
    };
    
    document.head.appendChild(script);
  });

  return ymapsLoadPromise;
};

export const useYandexMaps = (apiKey: string) => {
  const isLoaded = useRef(false);
  const loadPromise = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    if (isLoaded.current) return;
    
    if (!loadPromise.current) {
      loadPromise.current = loadYandexMapsScript(apiKey);
    }
    
    await loadPromise.current;
    isLoaded.current = true;
  }, [apiKey]);

  return { load, isLoaded: isLoaded.current };
};

export const YandexMap = ({ 
  center = [43.2220, 76.9286], 
  zoom = 12, 
  onMapReady,
  className = ''
}: YandexMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!containerRef.current || mapRef.current) return;

      try {
        const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Yandex Maps API key is not configured');
          return;
        }

        await loadYandexMapsScript(apiKey);

        const map = new window.ymaps.Map(containerRef.current, {
          center,
          zoom,
          controls: ['zoomControl'],
        }, {
          suppressMapOpenBlock: true,
        });

        // Стилизация контролов
        map.controls.get('zoomControl').options.set({
          position: { right: 16, top: '50%' },
          size: 'large',
        });

        mapRef.current = map;

        if (onMapReady) {
          onMapReady(map, window.ymaps);
        }
      } catch (error) {
        console.error('Error initializing Yandex Map:', error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />;
};

export default YandexMap;
