import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Users, MessageSquare, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

declare global {
  interface Window {
    ymaps3: any;
  }
}

const RoadsideHelp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [message, setMessage] = usePersistedState("roadside_help_message", "");
  const [locationShared, setLocationShared] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeHelpers, setActiveHelpers] = useState(0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const helpersMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initMap = async () => {
      await window.ymaps3.ready;
      
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapControls, YMapMarker } = window.ymaps3;
      const { YMapZoomControl } = await window.ymaps3.import('@yandex/ymaps3-controls@0.0.1');

      // Initialize Yandex Map
      const ymap = new YMap(mapContainer.current, {
        location: {
          center: [76.9286, 43.2220], // Almaty, Kazakhstan
          zoom: 12,
        },
      });

      ymap.addChild(new YMapDefaultSchemeLayer());
      ymap.addChild(new YMapDefaultFeaturesLayer());

      // Add zoom control
      const controls = new YMapControls({ position: 'right' });
      controls.addChild(new YMapZoomControl());
      ymap.addChild(controls);

      map.current = ymap;

      // Simulate nearby helpers (demo data)
      const helpers = [
        { lng: 76.9286 + 0.01, lat: 43.2220 + 0.01, name: 'Водитель 1' },
        { lng: 76.9286 - 0.015, lat: 43.2220 + 0.005, name: 'Водитель 2' },
        { lng: 76.9286 + 0.005, lat: 43.2220 - 0.012, name: 'Водитель 3' },
      ];

      helpers.forEach((helper) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'helper-marker';
        markerElement.style.cssText = 'width: 30px; height: 30px; background: #22c55e; border-radius: 50%; border: 2px solid white; cursor: pointer;';
        markerElement.title = helper.name;

        const helperMarker = new YMapMarker(
          {
            coordinates: [helper.lng, helper.lat],
          },
          markerElement
        );

        ymap.addChild(helperMarker);
        helpersMarkersRef.current.push(helperMarker);
      });

      setActiveHelpers(helpers.length);
    };

    initMap();

    return () => {
      helpersMarkersRef.current.forEach(m => {
        try {
          map.current?.removeChild(m);
        } catch (e) {
          // ignore cleanup errors
        }
      });
    };
  }, []);

  const handleShareLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(coords);
          setLocationShared(true);
          
          if (map.current) {
            map.current.setLocation({
              center: coords,
              zoom: 15,
              duration: 2000
            });

            // Add or update user marker
            if (marker.current) {
              map.current.removeChild(marker.current);
            }
            
            const { YMapMarker } = window.ymaps3;
            const markerElement = document.createElement('div');
            markerElement.style.cssText = 'width: 35px; height: 35px; background: #ef4444; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);';
            
            marker.current = new YMapMarker(
              {
                coordinates: coords,
              },
              markerElement
            );

            map.current.addChild(marker.current);
          }
          
          toast.success(t('locationShared'));
        },
        () => {
          toast.error("Не удалось получить локацию");
        }
      );
    }
  };

  const handleSendHelp = async () => {
    if (!message.trim()) {
      toast.error("Пожалуйста, введите сообщение");
      return;
    }
    if (!locationShared || !userLocation) {
      toast.error("Пожалуйста, поделитесь локацией");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Пожалуйста, войдите в систему');
        navigate('/phone-auth');
        return;
      }

      // Get user's vehicles
      const { data: vehicles } = await supabase
        .from('user_vehicles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!vehicles || vehicles.length === 0) {
        toast.error('Добавьте автомобиль в профиль');
        navigate('/my-vehicles');
        return;
      }

      // Create help request as service request
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          vehicle_id: vehicles[0].id,
          partner_id: 'roadside-help-system',
          service_type: 'maintenance' as const,
          description: `Помощь на дороге: ${message}\nЛокация: ${userLocation[1]}, ${userLocation[0]}`,
          estimated_cost: 0
        });

      if (error) throw error;

      toast.success(t('helpRequestSent'));
      setMessage("");
    } catch (error: any) {
      console.error('Help request error:', error);
      toast.error(error.message || t('requestError'));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('roadHelp')}</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Map */}
        <Card className="overflow-hidden">
          <div ref={mapContainer} className="h-[300px] w-full" />
          <CardContent className="pt-4">
            <Button 
              onClick={handleShareLocation}
              variant={locationShared ? "secondary" : "default"}
              className="w-full"
              size="lg"
            >
              <MapPin className="h-5 w-5 mr-2" />
              {locationShared ? t('locationShared') + ' ✓' : t('shareMyLocation')}
            </Button>
          </CardContent>
        </Card>

        {/* Request Help Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t('requestHelp')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('describeProblem')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button onClick={handleSendHelp} className="w-full" size="lg">
              <Send className="h-5 w-5 mr-2" />
              {t('sendHelpRequest')}
            </Button>
          </CardContent>
        </Card>

        {/* Active Helpers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              {t('activeHelpersNearby')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                <span className="text-2xl font-bold text-primary">{activeHelpers}</span>
              </div>
              <p className="text-muted-foreground">
                {t('driversOnline')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Зеленые маркеры на карте — доступные водители
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoadsideHelp;
