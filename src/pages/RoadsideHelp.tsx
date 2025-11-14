import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, AlertCircle, Info, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import L from 'leaflet';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface HelpRequest {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  message: string;
  status: string;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    phone_number: string;
  } | null;
}

const RoadsideHelp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userLocationMarker = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    checkAuthAndInit();
  }, []);

  const checkAuthAndInit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/phone-auth');
      return;
    }
    setCurrentUserId(user.id);
    await initMap();
    await fetchHelpRequests();
    subscribeToHelpRequests();
  };

  const initMap = () => {
    if (!mapContainer.current || map.current) return;

    try {
      // Initialize Leaflet map
      const leafletMap = L.map(mapContainer.current, {
        zoomControl: false, // Отключаем стандартный контрол зума
        attributionControl: false, // Убираем надпись Leaflet
      }).setView([43.2220, 76.9286], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(leafletMap);

      // Добавляем контрол зума справа по центру
      const zoomControl = L.control.zoom({
        position: 'topright'
      });
      
      leafletMap.addControl(zoomControl);
      
      // Применяем стили для позиционирования по центру справа
      setTimeout(() => {
        const zoomElement = document.querySelector('.leaflet-control-zoom') as HTMLElement;
        if (zoomElement) {
          zoomElement.style.top = '50%';
          zoomElement.style.transform = 'translateY(-50%)';
          zoomElement.style.marginTop = '-80px'; // Смещаем вверх чтобы не перекрывать другие кнопки
          zoomElement.style.marginRight = '16px';
        }
      }, 100);

      map.current = leafletMap;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Не удалось загрузить карту');
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

    // Fetch profiles separately
    const enrichedData = await Promise.all(
      (data || []).map(async (request: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone_number')
          .eq('id', request.user_id)
          .single();
        
        return { ...request, profiles: profile };
      })
    );

    setHelpRequests(enrichedData as any);
    updateMapMarkers(enrichedData as any);
  };

  const subscribeToHelpRequests = () => {
    const channel = supabase
      .channel('help-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: 'status=eq.active'
        },
        () => {
          fetchHelpRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateMapMarkers = (requests: HelpRequest[]) => {
    if (!map.current) return;

    // Remove old markers
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current.clear();

    // Add new markers
    requests.forEach((request) => {
      const isOwnRequest = request.user_id === currentUserId;
      
      // Create custom icon
      const iconHtml = `
        <div style="
          width: 40px;
          height: 40px;
          background: ${isOwnRequest ? '#ef4444' : '#22c55e'};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        ">🚗</div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([request.latitude, request.longitude], {
        icon: customIcon,
      }).addTo(map.current!);

      const name = request.profiles?.first_name 
        ? `${request.profiles.first_name} ${request.profiles.last_name || ''}`
        : 'Водитель';

      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>${name}</strong><br/>
          ${request.message}
        </div>
      `);

      marker.on('click', () => showRequestDetails(request));

      markersRef.current.set(request.id, marker);
    });
  };

  const showRequestDetails = (request: HelpRequest) => {
    const name = request.profiles?.first_name 
      ? `${request.profiles.first_name} ${request.profiles.last_name || ''}`
      : 'Водитель';
    
    toast.info(`${name}: ${request.message}`, {
      duration: 5000,
      action: request.user_id !== currentUserId ? {
        label: 'Помочь',
        onClick: () => respondToRequest(request.id)
      } : undefined
    });
  };

  const handleCreateRequest = async () => {
    if (!message.trim()) {
      toast.error('Пожалуйста, опишите проблему');
      return;
    }

    setIsCreatingRequest(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Необходима авторизация');
          setIsCreatingRequest(false);
          return;
        }

        const { data, error } = await supabase
          .from('help_requests' as any)
          .insert({
            user_id: user.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            message: message.trim(),
            status: 'active'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating help request:', error);
          toast.error('Не удалось создать запрос');
        } else {
          toast.success('Запрос о помощи создан');
          setMessage('');
          setShowRequestDialog(false);
          
          if (map.current) {
            map.current.setView(
              [position.coords.latitude, position.coords.longitude],
              15,
              { animate: true, duration: 1 }
            );
          }
        }
        
        setIsCreatingRequest(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Не удалось получить геолокацию');
        setIsCreatingRequest(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  const respondToRequest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Необходима авторизация');
      return;
    }

    const { error } = await supabase
      .from('help_responses' as any)
      .insert({
        help_request_id: requestId,
        responder_id: user.id,
      });

    if (error) {
      if (error.code === '23505') {
        toast.info('Вы уже откликнулись на этот запрос');
      } else {
        console.error('Error responding to help request:', error);
        toast.error('Не удалось отправить отклик');
      }
    } else {
      toast.success('Отклик отправлен! Едьте на помощь.');
    }
  };

  const cancelMyRequest = async () => {
    const myRequest = helpRequests.find(r => r.user_id === currentUserId);
    if (!myRequest) return;

    const { error } = await supabase
      .from('help_requests' as any)
      .update({ status: 'cancelled' })
      .eq('id', myRequest.id);

    if (error) {
      console.error('Error cancelling request:', error);
      toast.error('Не удалось отменить запрос');
    } else {
      toast.success('Запрос отменён');
    }
  };

  const myActiveRequest = helpRequests.find(r => r.user_id === currentUserId);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            map.current.setView(
              [position.coords.latitude, position.coords.longitude],
              15,
              { animate: true, duration: 1 }
            );
            
            // Добавляем временный маркер на текущей позиции
            const marker = L.marker([position.coords.latitude, position.coords.longitude])
              .addTo(map.current)
              .bindPopup('Вы здесь')
              .openPopup();
            
            setTimeout(() => {
              marker.remove();
            }, 3000);
          }
        },
        () => {
          toast.error('Не удалось определить местоположение');
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error('Геолокация не поддерживается');
    }
  };

  const toggleLocationTracking = () => {
    if (isTrackingLocation) {
      // Остановить отслеживание
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (userLocationMarker.current && map.current) {
        map.current.removeLayer(userLocationMarker.current);
        userLocationMarker.current = null;
      }
      setIsTrackingLocation(false);
      toast.info('Отслеживание местоположения остановлено');
    } else {
      // Начать отслеживание
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            if (map.current) {
              // Создаем или обновляем маркер
              if (!userLocationMarker.current) {
                const icon = L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                });
                
                userLocationMarker.current = L.marker([latitude, longitude], { icon })
                  .addTo(map.current)
                  .bindPopup('📍 Ваше местоположение');
              } else {
                userLocationMarker.current.setLatLng([latitude, longitude]);
              }
              
              // Центрируем карту на первом обновлении
              if (!isTrackingLocation) {
                map.current.setView([latitude, longitude], 15, { animate: true });
              }
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Не удалось отследить местоположение');
            setIsTrackingLocation(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
          }
        );
        
        watchIdRef.current = watchId;
        setIsTrackingLocation(true);
        toast.success('Отслеживание местоположения активно');
      } else {
        toast.error('Геолокация не поддерживается');
      }
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Header - полностью прозрачный с тенью для читаемости */}
      <div className="absolute top-0 left-0 right-0 z-[1001] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shadow-lg bg-background/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold drop-shadow-lg">Помощь на дороге</h1>
        </div>
      </div>

      {/* Map - на весь экран */}
      <div className="absolute inset-0">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Информационная кнопка/карточка - левый верхний угол */}
        <div className="absolute top-20 left-4 z-[1001]">
          {!showInfoCard ? (
            <Button
              onClick={() => setShowInfoCard(true)}
              variant="outline"
              size="sm"
              className="shadow-lg bg-card/95 backdrop-blur hover:bg-card"
            >
              <Info className="h-4 w-4 mr-2" />
              Информация
            </Button>
          ) : (
            <Card className="shadow-lg bg-card/95 backdrop-blur w-80">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Как это работает
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowInfoCard(false)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>🟢 Зелёные маркеры - другие водители</li>
                  <li>🔴 Красный маркер - тем кому нужна помощь</li>
                  <li>🔵 Синий маркер - мой маркер о помощи</li>
                  <li>Нажмите на маркер для деталей</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Кнопки навигации - справа по центру (ниже zoom контролов) */}
        <div className="absolute right-4 top-1/2 translate-y-2 z-[1000] flex flex-col gap-2">
          {/* Кнопка отслеживания местоположения */}
          <Button
            onClick={toggleLocationTracking}
            size="icon"
            className={`shadow-lg ${isTrackingLocation ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-card/90'}`}
            variant={isTrackingLocation ? "default" : "outline"}
          >
            <Navigation className="h-5 w-5" />
          </Button>
          
          {/* Кнопка моей геолокации (одноразово) */}
          <Button
            onClick={handleLocateMe}
            size="icon"
            className="shadow-lg bg-card hover:bg-card/90"
            variant="outline"
          >
            <MapPin className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Floating action button - внизу по центру */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1100]">
          {!myActiveRequest ? (
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button className="shadow-lg h-14 px-8 text-base">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Нужна помощь
                </Button>
              </DialogTrigger>
              <DialogContent className="z-[1200]">
                <DialogHeader>
                  <DialogTitle>Запрос о помощи</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Опишите вашу проблему (например: спустило колесо, села батарея...)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleCreateRequest}
                    disabled={isCreatingRequest || !message.trim()}
                    className="w-full"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {isCreatingRequest ? 'Создание...' : 'Отправить запрос'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Card className="shadow-lg bg-card/95 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ваш активный запрос</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{myActiveRequest.message}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={cancelMyRequest}
                  className="w-full"
                >
                  Отменить запрос
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadsideHelp;
