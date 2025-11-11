import { useState } from "react";
import { ArrowLeft, MapPin, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const RoadsideHelp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [locationShared, setLocationShared] = useState(false);

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationShared(true);
          toast.success(t('roadHelp') + " - Location shared!");
        },
        () => {
          toast.error("Unable to get location");
        }
      );
    }
  };

  const handleSendHelp = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (!locationShared) {
      toast.error("Please share your location first");
      return;
    }
    toast.success("Help request sent!");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('roadHelp')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleShareLocation}
              variant={locationShared ? "secondary" : "default"}
              className="w-full"
            >
              {locationShared ? "Location Shared ✓" : "Share My Location"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Request Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your problem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSendHelp} className="w-full">
              Send Help Request
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Active Helpers Nearby
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              3 drivers online in your area
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoadsideHelp;