import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ServiceType = 'maintenance' | 'repair' | 'tire_change' | 'oil_change' | 'other' | 'inspection';

interface ServiceRecord {
  id: string;
  vehicle_id: string;
  service_type: ServiceType;
  service_date: string;
  service_provider?: string;
  cost?: number;
  description?: string;
  notes?: string;
  mileage_at_service?: number;
  next_service_date?: string;
}

interface Vehicle {
  id: string;
  model: string;
  year: number;
}

export default function ServiceHistory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: 'maintenance' as ServiceType,
    service_date: new Date().toISOString().split('T')[0],
    service_provider: '',
    cost: '',
    description: '',
    notes: '',
    mileage_at_service: '',
    next_service_date: '',
  });

  useEffect(() => {
    fetchVehicles();
    fetchServices();
  }, []);

  const fetchVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_vehicles')
      .select('id, model, year')
      .eq('user_id', user.id);

    if (!error && data) {
      setVehicles(data);
      if (data.length > 0 && !formData.vehicle_id) {
        setFormData({ ...formData, vehicle_id: data[0].id });
      }
    }
  };

  const fetchServices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: vehiclesData } = await supabase
      .from('user_vehicles')
      .select('id')
      .eq('user_id', user.id);

    if (vehiclesData) {
      const vehicleIds = vehiclesData.map(v => v.id);
      const { data, error } = await supabase
        .from('service_history')
        .select('*')
        .in('vehicle_id', vehicleIds)
        .order('service_date', { ascending: false });

      if (!error && data) {
        setServices(data);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceData = {
      vehicle_id: formData.vehicle_id,
      service_type: formData.service_type,
      service_date: formData.service_date,
      service_provider: formData.service_provider || null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      description: formData.description || null,
      notes: formData.notes || null,
      mileage_at_service: formData.mileage_at_service ? parseInt(formData.mileage_at_service) : null,
      next_service_date: formData.next_service_date || null,
    };

    const { error } = await supabase
      .from('service_history')
      .insert([serviceData]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('serviceAdded'));
      setIsAddDialogOpen(false);
      fetchServices();
      resetForm();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const serviceData = {
      vehicle_id: formData.vehicle_id,
      service_type: formData.service_type,
      service_date: formData.service_date,
      service_provider: formData.service_provider || null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      description: formData.description || null,
      notes: formData.notes || null,
      mileage_at_service: formData.mileage_at_service ? parseInt(formData.mileage_at_service) : null,
      next_service_date: formData.next_service_date || null,
    };

    const { error } = await supabase
      .from('service_history')
      .update(serviceData)
      .eq('id', editingService.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('serviceUpdated'));
      setIsEditDialogOpen(false);
      setEditingService(null);
      fetchServices();
    }
  };

  const handleDelete = async () => {
    if (!deleteServiceId) return;

    const { error } = await supabase
      .from('service_history')
      .delete()
      .eq('id', deleteServiceId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('serviceDeleted'));
      setDeleteServiceId(null);
      fetchServices();
    }
  };

  const openEditDialog = (service: ServiceRecord) => {
    setEditingService(service);
    setFormData({
      vehicle_id: service.vehicle_id,
      service_type: service.service_type,
      service_date: service.service_date,
      service_provider: service.service_provider || '',
      cost: service.cost?.toString() || '',
      description: service.description || '',
      notes: service.notes || '',
      mileage_at_service: service.mileage_at_service?.toString() || '',
      next_service_date: service.next_service_date || '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: vehicles[0]?.id || '',
      service_type: 'maintenance',
      service_date: new Date().toISOString().split('T')[0],
      service_provider: '',
      cost: '',
      description: '',
      notes: '',
      mileage_at_service: '',
      next_service_date: '',
    });
  };

  const getServiceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      maintenance: t('maintenance'),
      repair: t('repair'),
      tire_change: t('tireService'),
      oil_change: t('oilChangeService'),
      other: t('other'),
      inspection: t('diagnostics'),
    };
    return types[type] || type;
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
        <h1 className="text-lg font-semibold">{t('serviceHistoryTitle')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="rounded-full hover:bg-muted/30 hover:text-foreground" disabled={vehicles.length === 0}>
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('addService')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('selectVehicle')}</Label>
                <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.model} ({vehicle.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('serviceType')}</Label>
                <Select value={formData.service_type} onValueChange={(value: ServiceType) => setFormData({ ...formData, service_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
                    <SelectItem value="repair">{t('repair')}</SelectItem>
                    <SelectItem value="inspection">{t('diagnostics')}</SelectItem>
                    <SelectItem value="tire_change">{t('tireService')}</SelectItem>
                    <SelectItem value="oil_change">{t('oilChangeService')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('serviceDate')}</Label>
                <Input
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('serviceProvider')}</Label>
                <Input
                  value={formData.service_provider}
                  onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('cost')}</Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('mileageAtService')}</Label>
                <Input
                  type="number"
                  value={formData.mileage_at_service}
                  onChange={(e) => setFormData({ ...formData, mileage_at_service: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('notes')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('nextServiceDate')}</Label>
                <Input
                  type="date"
                  value={formData.next_service_date}
                  onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">{t('save')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-4 space-y-4">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">{t('noVehicles')}</p>
            <p className="text-sm text-muted-foreground">{t('addFirstVehicle')}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">{t('noServiceHistory')}</p>
            <p className="text-sm text-muted-foreground">{t('addFirstService')}</p>
          </div>
        ) : (
          services.map((service) => {
            const vehicle = vehicles.find(v => v.id === service.vehicle_id);
            return (
              <Card key={service.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{getServiceTypeLabel(service.service_type)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle?.model} ({vehicle?.year})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(service.service_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(service)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteServiceId(service.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {service.service_provider && (
                    <p><span className="text-muted-foreground">{t('serviceProvider')}:</span> {service.service_provider}</p>
                  )}
                  {service.cost && (
                    <p><span className="text-muted-foreground">{t('cost')}:</span> {service.cost} ₸</p>
                  )}
                  {service.mileage_at_service && (
                    <p><span className="text-muted-foreground">{t('vehicleMileage')}:</span> {service.mileage_at_service} км</p>
                  )}
                  {service.description && (
                    <p><span className="text-muted-foreground">{t('description')}:</span> {service.description}</p>
                  )}
                  {service.next_service_date && (
                    <p><span className="text-muted-foreground">{t('nextServiceDate')}:</span> {new Date(service.next_service_date).toLocaleDateString()}</p>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('edit')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>{t('selectVehicle')}</Label>
              <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} ({vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('serviceType')}</Label>
              <Select value={formData.service_type} onValueChange={(value: ServiceType) => setFormData({ ...formData, service_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
                  <SelectItem value="repair">{t('repair')}</SelectItem>
                  <SelectItem value="inspection">{t('diagnostics')}</SelectItem>
                  <SelectItem value="tire_change">{t('tireService')}</SelectItem>
                  <SelectItem value="oil_change">{t('oilChangeService')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('serviceDate')}</Label>
              <Input
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t('serviceProvider')}</Label>
              <Input
                value={formData.service_provider}
                onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('cost')}</Label>
              <Input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('mileageAtService')}</Label>
              <Input
                type="number"
                value={formData.mileage_at_service}
                onChange={(e) => setFormData({ ...formData, mileage_at_service: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('nextServiceDate')}</Label>
              <Input
                type="date"
                value={formData.next_service_date}
                onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">{t('save')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
