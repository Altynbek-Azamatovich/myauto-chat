import { ArrowLeft, Sparkles, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Detailing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const services = [
    {
      id: 1,
      name: "Exterior Detailing",
      duration: "3-4 hours",
      price: "15,000 ₸",
      description: "Full exterior cleaning and polish"
    },
    {
      id: 2,
      name: "Interior Detailing",
      duration: "2-3 hours",
      price: "12,000 ₸",
      description: "Deep interior cleaning and conditioning"
    },
    {
      id: 3,
      name: "Full Detailing Package",
      duration: "5-6 hours",
      price: "25,000 ₸",
      description: "Complete interior and exterior detailing"
    },
    {
      id: 4,
      name: "Ceramic Coating",
      duration: "8-10 hours",
      price: "45,000 ₸",
      description: "Professional ceramic coating application"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('detailing')}</h1>
      </header>

      <div className="p-4 space-y-4">
        {services.map((service) => (
          <Card key={service.id} className="bg-card hover:bg-accent transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-base">{service.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{service.description}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    {service.price}
                  </span>
                </div>
                <Button size="sm">Book</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Detailing;