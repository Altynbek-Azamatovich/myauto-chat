import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  brand_id: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  mileage: number;
  is_primary: boolean;
}

export default function MyVehicles() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    brand_id: '00000000-0000-0000-0000-000000000000',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    mileage: 0,
    is_primary: false,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });

    if (!error && data) {
      setVehicles(data);
    }
  };

  const brand_id_placeholder = '00000000-0000-0000-0000-000000000000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_vehicles')
      .insert([{ ...formData, user_id: user.id }]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('vehicleAdded'));
      setIsAddDialogOpen(false);
      fetchVehicles();
      setFormData({
        brand_id: '00000000-0000-0000-0000-000000000000',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        license_plate: '',
        mileage: 0,
        is_primary: false,
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const { error } = await supabase
      .from('user_vehicles')
      .update(formData)
      .eq('id', editingVehicle.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('vehicleUpdated'));
      setIsEditDialogOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    }
  };

  const handleDelete = async () => {
    if (!deleteVehicleId) return;

    const { error } = await supabase
      .from('user_vehicles')
      .delete()
      .eq('id', deleteVehicleId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('vehicleDeleted'));
      setDeleteVehicleId(null);
      fetchVehicles();
    }
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand_id: vehicle.brand_id,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin || '',
      license_plate: vehicle.license_plate || '',
      mileage: vehicle.mileage,
      is_primary: vehicle.is_primary,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">{t('myVehicles')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addVehicle')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('brand')}</Label>
                <Input
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t.profile.model}</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t.profile.year}</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>{t.profile.vin}</Label>
                <Input
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                />
              </div>
              <div>
                <Label>{t.profile.licensePlate}</Label>
                <Input
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                />
              </div>
              <div>
                <Label>{t.profile.mileage}</Label>
                <Input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t.profile.isPrimary}</Label>
                <Switch
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                />
              </div>
              <Button type="submit" className="w-full">{t.profile.save}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-4 space-y-4">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">{t.profile.noVehicles}</p>
            <p className="text-sm text-muted-foreground">{t.profile.addFirstVehicle}</p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{vehicle.model}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                  {vehicle.is_primary && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full mt-1 inline-block">
                      {t.profile.isPrimary}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(vehicle)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteVehicleId(vehicle.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                {vehicle.license_plate && (
                  <p><span className="text-muted-foreground">{t.profile.licensePlate}:</span> {vehicle.license_plate}</p>
                )}
                {vehicle.vin && (
                  <p><span className="text-muted-foreground">{t.profile.vin}:</span> {vehicle.vin}</p>
                )}
                <p><span className="text-muted-foreground">{t.profile.mileage}:</span> {vehicle.mileage} км</p>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.edit}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>{t.profile.brand}</Label>
              <Input
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t.profile.model}</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t.profile.year}</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>{t.profile.vin}</Label>
              <Input
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.profile.licensePlate}</Label>
              <Input
                value={formData.license_plate}
                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.profile.mileage}</Label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t.profile.isPrimary}</Label>
              <Switch
                checked={formData.is_primary}
                onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
              />
            </div>
            <Button type="submit" className="w-full">{t.profile.save}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteVehicleId} onOpenChange={() => setDeleteVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.profile.deleteConfirm}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.profile.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.profile.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
