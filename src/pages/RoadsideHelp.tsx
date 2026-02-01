import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, AlertCircle, Info, Navigation, X, Loader2, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
    avatar_url: string | null;
  } | null;
}

declare global {
  interface Window {
    ymaps: any;
    respondToHelpRequest: (requestId: string) => Promise<void>;
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
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userLocationMarker = useRef<any>(null);
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

  const initMap = async () => {
    if (!mapContainer.current || map.current) return;

    try {
      // Получаем API ключ через edge function
      const { data, error } = await supabase.functions.invoke('get-yandex-maps-key');
      
      if (error || !data?.apiKey) {
        console.error('Error fetching Yandex Maps API key:', error);
        toast.error('Не удалось загрузить карту');
        setIsMapLoading(false);
        return;
      }

      await loadYandexMapsScript(data.apiKey);

      const ymaps = window.ymaps;
      
      const yandexMap = new ymaps.Map(mapContainer.current, {
        center: [43.2220, 76.9286], // Алматы
        zoom: 12,
        controls: [],
      }, {
        suppressMapOpenBlock: true,
      });

      // Добавляем кастомный zoom control
      const zoomControl = new ymaps.control.ZoomControl({
        options: {
          position: { right: 16, top: 200 },
          size: 'large',
        }
      });
      yandexMap.controls.add(zoomControl);

      map.current = yandexMap;
      setIsMapLoading(false);
    } catch (error) {
      console.error('Error initializing Yandex Map:', error);
      toast.error('Не удалось загрузить карту');
      setIsMapLoading(false);
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

    // Fetch profiles separately with avatar
    const enrichedData = await Promise.all(
      (data || []).map(async (request: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone_number, avatar_url')
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'help_responses'
        },
        async (payload: any) => {
          console.log('New help response:', payload);
          
          const myRequest = helpRequests.find(r => r.user_id === currentUserId);
          if (myRequest && payload.new.help_request_id === myRequest.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, phone_number')
              .eq('id', payload.new.responder_id)
              .single();
            
            const responderName = profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Водитель'
              : 'Водитель';
            
            toast.success(`${responderName} откликнулся на ваш запрос о помощи! 🚗`, {
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateMapMarkers = (requests: HelpRequest[]) => {
    if (!map.current || !window.ymaps) return;

    const ymaps = window.ymaps;

    // Remove old markers
    markersRef.current.forEach(marker => {
      map.current.geoObjects.remove(marker);
    });
    markersRef.current.clear();

    // Add new markers
    requests.forEach((request) => {
      const isOwnRequest = request.user_id === currentUserId;
      
      const name = request.profiles?.first_name 
        ? `${request.profiles.first_name} ${request.profiles.last_name || ''}`
        : 'Водитель';
      
      const phone = request.profiles?.phone_number || '';
      const avatarUrl = request.profiles?.avatar_url || '';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

      const balloonContent = `
        <div style="
          padding: 16px; 
          min-width: 280px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          ">
            <div style="
              width: 56px;
              height: 56px;
              border-radius: 50%;
              overflow: hidden;
              flex-shrink: 0;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              font-size: 20px;
            ">
              ${avatarUrl ? `<img src="${avatarUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" />` : initials}
            </div>
            <div style="flex: 1;">
              <div style="
                font-weight: 600; 
                font-size: 16px; 
                margin-bottom: 4px;
                color: #1f2937;
              ">${name}</div>
              <div style="
                color: #6b7280; 
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <span style="font-size: 14px;">📞</span>
                ${phone}
              </div>
            </div>
          </div>
          
          <div style="
            background: #f3f4f6;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
          ">
            <div style="
              color: #1f2937; 
              font-size: 14px; 
              line-height: 1.6;
            ">${request.message}</div>
          </div>
          
          ${!isOwnRequest ? `
            <button
              onclick="window.respondToHelpRequest('${request.id}')"
              style="
                width: 100%;
                padding: 12px 16px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
              "
            >
              <span style="font-size: 18px;">🚗</span>
              Откликнуться на помощь
            </button>
          ` : ''}
        </div>
      `;

      const placemark = new ymaps.Placemark(
        [request.latitude, request.longitude],
        {
          balloonContent,
          hintContent: name,
        },
        {
          preset: isOwnRequest ? 'islands#redAutoIcon' : 'islands#greenAutoIcon',
          iconColor: isOwnRequest ? '#ef4444' : '#22c55e',
        }
      );

      map.current.geoObjects.add(placemark);
      markersRef.current.set(request.id, placemark);
    });
  };

  // Глобальная функция для кнопки в popup
  window.respondToHelpRequest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Необходима авторизация');
      return;
    }

    const request = helpRequests.find(r => r.id === requestId);
    if (request && request.user_id === user.id) {
      toast.error('Вы не можете откликнуться на свой собственный запрос о помощи');
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
      toast.success('Отклик отправлен! Едьте на помощь. 🚗');
    }
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

        const { error } = await supabase
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
          toast.success('Запрос о помощи создан! 🆘');
          setMessage('');
          setShowRequestDialog(false);
          
          if (map.current) {
            map.current.setCenter(
              [position.coords.latitude, position.coords.longitude],
              16,
              { duration: 500 }
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


  const cancelMyRequest = async () => {
    const myRequest = helpRequests.find(r => r.user_id === currentUserId);
    if (!myRequest) return;

    try {
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
        setHelpRequests(prev => prev.filter(r => r.id !== myRequest.id));
      }
    } catch (err) {
      console.error('Error cancelling request:', err);
      toast.error('Произошла ошибка при отмене запроса');
    }
  };

  const myActiveRequest = helpRequests.find(r => r.user_id === currentUserId);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current && window.ymaps) {
            map.current.setCenter(
              [position.coords.latitude, position.coords.longitude],
              16,
              { duration: 500 }
            );
            
            const ymaps = window.ymaps;
            const marker = new ymaps.Placemark(
              [position.coords.latitude, position.coords.longitude],
              { balloonContent: '📍 Вы здесь' },
              { preset: 'islands#blueCircleDotIcon' }
            );
            
            map.current.geoObjects.add(marker);
            marker.balloon.open();
            
            setTimeout(() => {
              map.current.geoObjects.remove(marker);
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
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (userLocationMarker.current && map.current) {
        map.current.geoObjects.remove(userLocationMarker.current);
        userLocationMarker.current = null;
      }
      setIsTrackingLocation(false);
      toast.info('Отслеживание остановлено');
    } else {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            if (map.current && window.ymaps) {
              const ymaps = window.ymaps;
              
              if (!userLocationMarker.current) {
                userLocationMarker.current = new ymaps.Placemark(
                  [latitude, longitude],
                  { balloonContent: '📍 Ваше местоположение' },
                  { preset: 'islands#greenCircleDotIcon' }
                );
                map.current.geoObjects.add(userLocationMarker.current);
              } else {
                userLocationMarker.current.geometry.setCoordinates([latitude, longitude]);
              }
              
              if (!isTrackingLocation) {
                map.current.setCenter([latitude, longitude], 15, { duration: 500 });
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
        toast.success('Отслеживание активно 🧭');
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
      if (map.current) {
        map.current.destroy();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] px-4 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shadow-xl bg-card/95 backdrop-blur-md hover:bg-card rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold drop-shadow-md text-foreground">
          Помощь на дороге
        </h1>
      </div>

      {/* Map */}
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
        
        {/* Info card */}
        <div className="absolute top-20 left-4 z-[1001]">
          {!showInfoCard ? (
            <Button
              onClick={() => setShowInfoCard(true)}
              size="default"
              className="shadow-xl bg-card/95 backdrop-blur-md hover:bg-card/90 text-foreground rounded-xl h-11"
              variant="outline"
            >
              <Info className="h-4 w-4 mr-2" />
              Информация
            </Button>
          ) : (
            <Card className="shadow-2xl bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-md w-80 rounded-2xl border border-border/50">
              <CardHeader className="pb-3 pt-5 px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Как это работает
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-muted/50"
                    onClick={() => setShowInfoCard(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="space-y-3.5 text-sm">
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg mt-0.5">🟢</span>
                    <span className="text-muted-foreground leading-relaxed">Зелёные маркеры — водители, которым нужна помощь</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg mt-0.5">🔴</span>
                    <span className="text-muted-foreground leading-relaxed">Красные маркеры — ваш активный запрос о помощи</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg mt-0.5">📍</span>
                    <span className="text-muted-foreground leading-relaxed">Нажмите на маркер, чтобы увидеть детали и откликнуться</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 mt-16 z-[1000] flex flex-col gap-3">
          <Button
            onClick={toggleLocationTracking}
            size="icon"
            className={`shadow-xl h-12 w-12 rounded-2xl transition-all border ${
              isTrackingLocation 
                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20 shadow-[0_8px_32px_hsl(var(--primary)/0.4)]' 
                : 'bg-gradient-to-br from-card/98 to-card/95 hover:from-card hover:to-card/98 text-foreground backdrop-blur-md border-border/50'
            }`}
            variant={isTrackingLocation ? "default" : "outline"}
          >
            <Navigation className={`h-5 w-5 ${isTrackingLocation ? 'animate-pulse' : ''}`} />
          </Button>
          
          <Button
            onClick={handleLocateMe}
            size="icon"
            className="shadow-xl bg-gradient-to-br from-card/98 to-card/95 hover:from-card hover:to-card/98 backdrop-blur-md h-12 w-12 rounded-2xl border border-border/50"
            variant="outline"
          >
            <Car className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Floating action button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1100]">
          {!myActiveRequest ? (
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="shadow-2xl h-14 px-8 text-base rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  size="lg"
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Нужна помощь!
                </Button>
              </DialogTrigger>
              <DialogContent className="z-[1200] sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Запрос о помощи</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Textarea
                    placeholder="Опишите вашу проблему (например: спустило колесо, села батарея, закончился бензин...)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="resize-none rounded-xl"
                  />
                  <Button
                    onClick={handleCreateRequest}
                    disabled={isCreatingRequest || !message.trim()}
                    className="w-full h-12 rounded-xl text-base"
                  >
                    {isCreatingRequest ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Создание запроса...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-5 w-5" />
                        Отправить запрос о помощи
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Card className="shadow-2xl bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-md rounded-2xl border border-border/50 w-full max-w-md">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="whitespace-nowrap">Ваш активный запрос</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                <div className="bg-gradient-to-br from-muted/60 to-muted/40 rounded-xl p-4 border border-border/30">
                  <p className="text-sm text-foreground leading-relaxed">
                    {myActiveRequest.message}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="default"
                  onClick={cancelMyRequest}
                  className="w-full rounded-xl h-11 shadow-lg hover:shadow-xl transition-all"
                >
                  <X className="mr-2 h-4 w-4" />
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
