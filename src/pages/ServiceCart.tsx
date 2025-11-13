import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import logoImage from "@/assets/logo-main.png";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const ServiceCart = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setSubmitting(true);

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

      // Create service requests for each item
      const requests = items.map(item => ({
        user_id: user.id,
        vehicle_id: vehicles[0].id,
        partner_id: item.partner_id,
        service_type: 'maintenance' as const,
        description: `Заказ услуги: ${item.name}`,
        estimated_cost: item.price * item.quantity
      }));

      const { error } = await supabase
        .from('service_requests')
        .insert(requests);

      if (error) throw error;

      toast.success('Заказ успешно оформлен!');
      clearCart();
      navigate('/service-history');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Ошибка оформления заказа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-4 py-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('cart')}</h1>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart}>
              Очистить
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted/30 p-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('emptyCart')}</h3>
                <p className="text-sm text-muted-foreground">
                  Добавьте услуги в корзину
                </p>
              </div>
              <Button onClick={() => navigate('/services')}>
                Перейти к услугам
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.category}
                    </p>
                    <p className="font-bold text-primary">
                      {(item.price * item.quantity).toLocaleString()}₸
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Separator className="my-4" />

            <Card className="p-4 bg-muted/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Итого:</span>
                <span className="text-2xl font-bold text-primary">
                  {totalPrice.toLocaleString()}₸
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? 'Оформление...' : 'Оформить заказ'}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCart;
