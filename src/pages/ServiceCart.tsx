import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { SwipeableItem } from "@/components/SwipeableItem";

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

      toast.success(t('orderSuccess'));
      clearCart();
      navigate('/service-history');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || t('orderError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <Logo size="md" />

        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-4 py-4 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">{t('cart')}</h1>
          {items.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearCart}
              className="text-muted-foreground"
            >
              {t('clear')}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium mb-1">{t('emptyCart')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('addServicesToCart')}
            </p>
            <Button onClick={() => navigate('/services')} variant="outline" className="rounded-xl">
              {t('goToServices')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <SwipeableItem
                key={item.id}
                onDelete={() => removeFromCart(item.id)}
              >
                <div className="p-4 bg-muted/20 rounded-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 rounded-lg"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 rounded-lg"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-semibold text-sm mt-3">
                    {(item.price * item.quantity).toLocaleString()}₸
                  </p>
                </div>
              </SwipeableItem>
            ))}

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('total')}:</span>
                <span className="text-xl font-bold">
                  {totalPrice.toLocaleString()}₸
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      {items.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-4 py-3 bg-background/80 backdrop-blur-xl">
          <Button
            className="w-full h-12 rounded-xl font-semibold"
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting ? t('processing') : t('checkout')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceCart;