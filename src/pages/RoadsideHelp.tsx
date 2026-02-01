import { useState, useEffect, useRef, useCallback } from "react";
import { Navigation, AlertCircle, Loader2, X, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNavigation from "@/components/BottomNavigation";
import { HelpRequestCard } from "@/components/roadside/HelpRequestCard";
import { CreateRequestDialog } from "@/components/roadside/CreateRequestDialog";
import { createSOSMarkerLayout, createSOSPlacemark } from "@/components/roadside/SOSMarker";

interface HelpRequest {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  message: string;
  status: string;
  address?: string;
  responder_id?: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    phone_number: string;
    avatar_url: string | null;
    is_verified?: boolean;
    car_brand: string | null;
    car_model: string | null;
    car_year: number | null;
    engine_volume: string | null;
    fuel_type: string | null;
  } | null;
}

declare global {
  interface Window {
    ymaps: any;
  }
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

const RoadsideHelp = () => {
  const navigate = useNavigate();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userLocationMarker = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const sosLayoutRef = useRef<any>(null);

  // Check auth and initialize
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/phone-auth');
        return;
      }
      setCurrentUserId(user.id);
      await initMap();
    };
    
    init();

    return () => {
      if (map.current) {
        map.current.destroy();
        map.current = null;
      }
    };
  }, [navigate]);

  // Fetch and subscribe to requests after map is ready
  useEffect(() => {
    if (!map.current || !currentUserId) return;
    
    fetchHelpRequests();
    const unsubscribe = subscribeToHelpRequests();
    
    return () => {
      unsubscribe?.();
    };
  }, [currentUserId, !!map.current]);

  const initMap = async () => {
    if (!mapContainer.current || map.current) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-yandex-maps-key');
      
      if (error || !data?.apiKey) {
        console.error('Error fetching Yandex Maps API key:', error);
        toast.error('Не удалось загрузить карту');
        setIsMapLoading(false);
        return;
      }

      await loadYandexMapsScript(data.apiKey);

      const ymaps = window.ymaps;
      
      // Create map with clean style (no POI)
      const yandexMap = new ymaps.Map(mapContainer.current, {
        center: [43.2220, 76.9286], // Алматы
        zoom: 13,
        controls: [],
      }, {
        suppressMapOpenBlock: true,
        // Minimal map with no POI
        yandexMapDisablePoiInteractivity: true,
      });

      // Create custom SOS marker layout
      sosLayoutRef.current = createSOSMarkerLayout(ymaps);

      // Add custom zoom control - right side, centered vertically
      const zoomControl = new ymaps.control.ZoomControl({
        options: {
          position: { right: 16, top: 'calc(50% - 60px)' },
          size: 'small',
        }
      });
      yandexMap.controls.add(zoomControl);

      map.current = yandexMap;
      setIsMapLoading(false);

      // Get user location and center map
      getUserLocation();
    } catch (error) {
      console.error('Error initializing Yandex Map:', error);
      toast.error('Не удалось загрузить карту');
      setIsMapLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserPosition(coords);
        
        if (map.current) {
          map.current.setCenter(coords, 14, { duration: 500 });
          updateUserMarker(coords);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
  };

  const updateUserMarker = (coords: [number, number]) => {
    if (!map.current || !window.ymaps) return;

    const ymaps = window.ymaps;

    if (userLocationMarker.current) {
      userLocationMarker.current.geometry.setCoordinates(coords);
    } else {
      userLocationMarker.current = new ymaps.Placemark(
        coords,
        {},
        {
          preset: 'islands#blueCircleDotIcon',
          iconColor: '#3b82f6',
        }
      );
      map.current.geoObjects.add(userLocationMarker.current);
    }
  };

  const fetchHelpRequests = async () => {
    const { data, error } = await supabase
      .from('help_requests' as any)
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching help requests:', error);
      return;
    }

    // Fetch profiles with extended fields
    const enrichedData = await Promise.all(
      (data || []).map(async (request: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone_number, avatar_url, is_verified, car_brand, car_model, car_year, engine_volume, fuel_type')
          .eq('id', request.user_id)
          .single();
        
        // Get address from coordinates
        let address = request.address;
        if (!address && window.ymaps) {
          try {
            const geocode = await window.ymaps.geocode([request.latitude, request.longitude]);
            const firstResult = geocode.geoObjects.get(0);
            if (firstResult) {
              address = firstResult.getAddressLine();
            }
          } catch (e) {
            console.error('Geocoding error:', e);
          }
        }
        
        return { ...request, profiles: profile, address };
      })
    );

    setHelpRequests(enrichedData as HelpRequest[]);
    updateMapMarkers(enrichedData as HelpRequest[]);
  };

  const subscribeToHelpRequests = () => {
    const channel = supabase
      .channel('help-requests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
        },
        (payload) => {
          console.log('Help request change:', payload);
          fetchHelpRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateMapMarkers = useCallback((requests: HelpRequest[]) => {
    if (!map.current || !window.ymaps || !sosLayoutRef.current) return;

    // Remove old markers
    markersRef.current.forEach(marker => {
      map.current.geoObjects.remove(marker);
    });
    markersRef.current.clear();

    // Add new markers
    requests.forEach((request) => {
      const firstName = request.profiles?.first_name || 'В';
      const lastInitial = request.profiles?.last_name?.[0] || '';
      const initials = firstName[0] + lastInitial;
      const hasResponder = !!request.responder_id;

      const placemark = createSOSPlacemark(
        window.ymaps,
        [request.latitude, request.longitude],
        request.profiles?.avatar_url || null,
        initials,
        hasResponder,
        () => setSelectedRequest(request),
        sosLayoutRef.current
      );

      map.current.geoObjects.add(placemark);
      markersRef.current.set(request.id, placemark);
    });
  }, []);

  const handleCreateRequest = async (message: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Необходима авторизация');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { error } = await supabase
              .from('help_requests' as any)
              .insert({
                user_id: user.id,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                message,
                status: 'active'
              });

            if (error) {
              console.error('Error creating help request:', error);
              toast.error('Не удалось создать запрос');
              reject(error);
            } else {
              toast.success('SOS-запрос создан! 🆘');
              
              if (map.current) {
                map.current.setCenter(
                  [position.coords.latitude, position.coords.longitude],
                  15,
                  { duration: 500 }
                );
              }
              resolve();
            }
          } catch (e) {
            reject(e);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Не удалось получить геолокацию');
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleHelpResponse = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Необходима авторизация');
      return;
    }

    const request = helpRequests.find(r => r.id === requestId);
    if (!request) return;

    if (request.user_id === user.id) {
      toast.error('Вы не можете откликнуться на свой запрос');
      return;
    }

    // Update request with responder
    const { error } = await supabase
      .from('help_requests' as any)
      .update({ responder_id: user.id })
      .eq('id', requestId);

    if (error) {
      console.error('Error responding to help request:', error);
      toast.error('Не удалось отправить отклик');
      return;
    }

    // Also create help_response entry
    await supabase
      .from('help_responses' as any)
      .insert({
        help_request_id: requestId,
        responder_id: user.id,
      });

    toast.success('Вы откликнулись! Маршрут построен. 🚗');
    setSelectedRequest(null);

    // Build route to the person in need
    if (map.current && window.ymaps && userPosition) {
      buildRoute(userPosition, [request.latitude, request.longitude]);
    }
  };

  const buildRoute = (from: [number, number], to: [number, number]) => {
    if (!map.current || !window.ymaps) return;

    const ymaps = window.ymaps;

    // Remove existing route
    if (routeRef.current) {
      map.current.geoObjects.remove(routeRef.current);
    }

    // Create new route
    ymaps.route([from, to], { mapStateAutoApply: true }).then((route: any) => {
      route.getPaths().options.set({
        strokeColor: '#22c55e',
        strokeWidth: 5,
        strokeStyle: 'solid',
      });
      
      map.current.geoObjects.add(route);
      routeRef.current = route;
    }).catch((error: any) => {
      console.error('Route building error:', error);
      toast.error('Не удалось построить маршрут');
    });
  };

  const cancelMyRequest = async () => {
    const myRequest = helpRequests.find(r => r.user_id === currentUserId);
    if (!myRequest) return;

    const { error } = await supabase
      .from('help_requests')
      .delete()
      .eq('id', myRequest.id)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Error cancelling request:', error);
      toast.error('Не удалось отменить запрос');
    } else {
      toast.success('Запрос отменён');
      setSelectedRequest(null);
      
      // Remove route if exists
      if (routeRef.current && map.current) {
        map.current.geoObjects.remove(routeRef.current);
        routeRef.current = null;
      }
    }
  };

  const handleLocateMe = () => {
    getUserLocation();
    toast.success('Перемещение к вашему местоположению');
  };

  const myActiveRequest = helpRequests.find(r => r.user_id === currentUserId);

  // Bottom nav height is ~80px (h-20), add safe margin
  const bottomNavOffset = 'bottom-24'; // 96px from bottom

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Map container - FULL SCREEN */}
      <div className="absolute inset-0">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Loading overlay */}
        {isMapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Загрузка карты...</span>
            </div>
          </div>
        )}

        {/* Back button - top left */}
        <div className="absolute top-4 left-4 z-[1000]">
          <Button
            onClick={() => navigate('/services')}
            size="icon"
            className="shadow-xl h-12 w-12 rounded-xl bg-card hover:bg-card/90 text-foreground border border-border/50"
            variant="outline"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Locate me button - right side, below center */}
        <div className="absolute right-4 top-1/2 mt-16 z-[1000]">
          <Button
            onClick={handleLocateMe}
            size="icon"
            className="shadow-xl h-12 w-12 rounded-xl bg-card hover:bg-card/90 text-foreground border border-border/50"
            variant="outline"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Need help button - same width as nav menu */}
        {!myActiveRequest && !selectedRequest && (
          <div className={`absolute ${bottomNavOffset} left-1/2 -translate-x-1/2 z-[1000]`}>
            <Button 
              onClick={() => setShowRequestDialog(true)}
              className="shadow-2xl h-14 text-base rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 min-w-[220px]"
              size="lg"
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              Нужна помощь!
            </Button>
          </div>
        )}
        
        {/* My active request card - above bottom nav */}
        {myActiveRequest && !selectedRequest && (
          <div className={`absolute ${bottomNavOffset} left-4 right-4 z-[1000]`}>
            <div className="bg-card rounded-2xl shadow-2xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">Ваш активный запрос</div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {myActiveRequest.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-destructive hover:bg-destructive/10"
                  onClick={cancelMyRequest}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected request bottom sheet - above bottom nav */}
      {selectedRequest && (
        <div className="fixed inset-x-0 bottom-24 z-[1001] animate-in slide-in-from-bottom duration-300 px-4">
          <HelpRequestCard
            request={{
              ...selectedRequest,
              distance: userPosition ? calculateDistance(
                userPosition,
                [selectedRequest.latitude, selectedRequest.longitude]
              ) : undefined,
              eta: userPosition ? calculateETA(
                userPosition,
                [selectedRequest.latitude, selectedRequest.longitude]
              ) : undefined,
            }}
            onHelp={handleHelpResponse}
            onClose={() => {
              if (selectedRequest.user_id === currentUserId) {
                cancelMyRequest();
              } else {
                setSelectedRequest(null);
              }
            }}
            isCurrentUser={selectedRequest.user_id === currentUserId}
          />
        </div>
      )}

      {/* Create request dialog */}
      <CreateRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        onSubmit={handleCreateRequest}
      />

      {/* Bottom navigation */}
      <BottomNavigation />
    </div>
  );
};

// Helper functions
function calculateDistance(from: [number, number], to: [number, number]): string {
  const R = 6371; // Earth's radius in km
  const dLat = (to[0] - from[0]) * Math.PI / 180;
  const dLon = (to[1] - from[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)} м`;
  }
  return `${distance.toFixed(1)} км`;
}

function calculateETA(from: [number, number], to: [number, number]): string {
  // Simple estimation: assume 30 km/h average speed in city
  const R = 6371;
  const dLat = (to[0] - from[0]) * Math.PI / 180;
  const dLon = (to[1] - from[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  const timeMinutes = Math.round((distance / 30) * 60);
  
  if (timeMinutes < 1) return '< 1 мин';
  return `${timeMinutes} мин`;
}

export default RoadsideHelp;
