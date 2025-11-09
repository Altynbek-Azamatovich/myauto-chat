import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { carBrands, getCarModels } from '@/data/car-brands';
import { carColors } from '@/data/car-colors';

interface Vehicle {
  id: string;
  brand_id: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  mileage: number;
  is_primary: boolean;
  color?: string;
}

interface CarBrand {
  id: string;
  brand_name: string;
}

export default function MyVehicles() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [carBrandsDb, setCarBrandsDb] = useState<CarBrand[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Popover states for Add dialog
  const [openAddBrand, setOpenAddBrand] = useState(false);
  const [openAddModel, setOpenAddModel] = useState(false);
  const [openAddYear, setOpenAddYear] = useState(false);
  const [openAddColor, setOpenAddColor] = useState(false);
  
  // Popover states for Edit dialog
  const [openEditBrand, setOpenEditBrand] = useState(false);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [openEditYear, setOpenEditYear] = useState(false);
  const [openEditColor, setOpenEditColor] = useState(false);
  
  const [availableModelsAdd, setAvailableModelsAdd] = useState<string[]>([]);
  const [availableModelsEdit, setAvailableModelsEdit] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    brand_name: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    mileage: 0,
    is_primary: false,
    color: '',
    customColor: '',
  });
  
  // Generate years array from 2026 to 1950 in descending order
  const years = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 2026 - i);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/phone-auth');
      return;
    }
    fetchVehicles();
    fetchBrands();
  };

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('car_brands')
      .select('*')
      .order('brand_name');

    if (!error && data) {
      setCarBrandsDb(data);
    }
  };

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

  const formatLicensePlate = (value: string) => {
    // Format: 3 digits + 3 letters + 2 digits (region)
    const clean = value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    return clean.substring(0, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand_name || !formData.model) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Find or create car brand in car_brands table
    const { data: existingBrand } = await supabase
      .from('car_brands')
      .select('id')
      .eq('brand_name', formData.brand_name)
      .maybeSingle();

    let brandId = existingBrand?.id;

    if (!brandId) {
      const { data: newBrand, error: brandError } = await supabase
        .from('car_brands')
        .insert({ brand_name: formData.brand_name })
        .select('id')
        .single();

      if (brandError) {
        toast.error(brandError.message);
        return;
      }
      brandId = newBrand.id;
    }

    const finalColor = formData.color === "Другой цвет (указать вручную)" 
      ? formData.customColor 
      : formData.color;

    const { error } = await supabase
      .from('user_vehicles')
      .insert([{ 
        user_id: user.id,
        brand_id: brandId,
        model: formData.model,
        year: formData.year,
        vin: formData.vin || null,
        license_plate: formData.license_plate || null,
        mileage: formData.mileage,
        is_primary: formData.is_primary,
        color: finalColor || null,
      }]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('vehicleAdded'));
      setIsAddDialogOpen(false);
      fetchVehicles();
      resetForm();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    // Find or create car brand
    const { data: existingBrand } = await supabase
      .from('car_brands')
      .select('id')
      .eq('brand_name', formData.brand_name)
      .maybeSingle();

    let brandId = existingBrand?.id;

    if (!brandId) {
      const { data: newBrand, error: brandError } = await supabase
        .from('car_brands')
        .insert({ brand_name: formData.brand_name })
        .select('id')
        .single();

      if (brandError) {
        toast.error(brandError.message);
        return;
      }
      brandId = newBrand.id;
    }

    const finalColor = formData.color === "Другой цвет (указать вручную)" 
      ? formData.customColor 
      : formData.color;

    const { error } = await supabase
      .from('user_vehicles')
      .update({
        brand_id: brandId,
        model: formData.model,
        year: formData.year,
        vin: formData.vin || null,
        license_plate: formData.license_plate || null,
        mileage: formData.mileage,
        is_primary: formData.is_primary,
        color: finalColor || null,
      })
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

  const openEditDialog = async (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    
    // Get brand name from brand_id
    const { data: brand } = await supabase
      .from('car_brands')
      .select('brand_name')
      .eq('id', vehicle.brand_id)
      .single();
    
    const brandName = brand?.brand_name || '';
    setAvailableModelsEdit(getCarModels(brandName));
    
    setFormData({
      brand_name: brandName,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin || '',
      license_plate: vehicle.license_plate || '',
      mileage: vehicle.mileage,
      is_primary: vehicle.is_primary,
      color: vehicle.color || '',
      customColor: '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      brand_name: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      license_plate: '',
      mileage: 0,
      is_primary: false,
      color: '',
      customColor: '',
    });
    setAvailableModelsAdd([]);
  };

  const handleBrandChange = (brandName: string, isEdit: boolean = false) => {
    const models = getCarModels(brandName);
    if (isEdit) {
      setAvailableModelsEdit(models);
    } else {
      setAvailableModelsAdd(models);
    }
    setFormData(prev => ({ ...prev, brand_name: brandName, model: '' }));
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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('addVehicle')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand */}
              <div>
                <Label>{t('brand')}</Label>
                <Popover open={openAddBrand} onOpenChange={setOpenAddBrand}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAddBrand}
                      className="w-full justify-between"
                    >
                      {formData.brand_name || t('selectBrand')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Поиск марки..." />
                      <CommandList>
                        <CommandEmpty>Марка не найдена.</CommandEmpty>
                        <CommandGroup>
                          {carBrands.map((brand) => (
                            <CommandItem
                              key={brand.name}
                              value={brand.name}
                              onSelect={(value) => {
                                handleBrandChange(value, false);
                                setOpenAddBrand(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.brand_name === brand.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {brand.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Model */}
              <div>
                <Label>{t('model')}</Label>
                <Popover open={openAddModel} onOpenChange={setOpenAddModel}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAddModel}
                      disabled={!formData.brand_name}
                      className="w-full justify-between"
                    >
                      {formData.model || "Выберите модель..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Поиск модели..." />
                      <CommandList>
                        <CommandEmpty>Модель не найдена.</CommandEmpty>
                        <CommandGroup>
                          {availableModelsAdd.map((model) => (
                            <CommandItem
                              key={model}
                              value={model}
                              onSelect={(value) => {
                                setFormData(prev => ({ ...prev, model: value }));
                                setOpenAddModel(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.model === model ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {model}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Year */}
              <div>
                <Label>{t('year')}</Label>
                <Popover open={openAddYear} onOpenChange={setOpenAddYear}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAddYear}
                      className="w-full justify-between"
                    >
                      {formData.year || "Выберите год..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Поиск года..." />
                      <CommandList>
                        <CommandEmpty>Год не найден.</CommandEmpty>
                        <CommandGroup>
                          {years.map((year) => (
                            <CommandItem
                              key={year}
                              value={year.toString()}
                              onSelect={(value) => {
                                setFormData(prev => ({ ...prev, year: parseInt(value) }));
                                setOpenAddYear(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.year === year ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {year}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Color */}
              <div>
                <Label>{t('carColor')}</Label>
                <Popover open={openAddColor} onOpenChange={setOpenAddColor}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAddColor}
                      className="w-full justify-between"
                    >
                      {formData.color || "Выберите цвет..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Поиск цвета..." />
                      <CommandList>
                        <CommandEmpty>Цвет не найден.</CommandEmpty>
                        <CommandGroup>
                          {carColors.map((color) => (
                            <CommandItem
                              key={color}
                              value={color}
                              onSelect={(value) => {
                                setFormData(prev => ({ ...prev, color: value }));
                                setOpenAddColor(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.color === color ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {color}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {formData.color === "Другой цвет (указать вручную)" && (
                  <Input
                    value={formData.customColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, customColor: e.target.value }))}
                    placeholder="Введите цвет"
                    className="mt-2"
                  />
                )}
              </div>

              {/* VIN */}
              <div>
                <Label>{t('vin')} (необязательно)</Label>
                <Input
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                  placeholder="WBAXXXXX12345678"
                  maxLength={17}
                />
              </div>

              {/* License Plate */}
              <div>
                <Label>{t('plate')}</Label>
                <Input
                  value={formData.license_plate}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_plate: formatLicensePlate(e.target.value) }))}
                  placeholder="123ABC01"
                  maxLength={8}
                />
              </div>

              {/* Mileage */}
              <div>
                <Label>{t('vehicleMileage')}</Label>
                <Input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>

              {/* Is Primary */}
              <div className="flex items-center justify-between">
                <Label>{t('isPrimary')}</Label>
                <Switch
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="flex-1">{t('save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-4 space-y-4">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">{t('noVehicles')}</p>
            <Button 
              variant="link" 
              onClick={() => setIsAddDialogOpen(true)}
              className="text-primary"
            >
              {t('addYourCar')}
            </Button>
          </div>
        ) : (
          vehicles.map((vehicle) => {
            const brand = carBrandsDb.find(b => b.id === vehicle.brand_id);
            return (
              <Card key={vehicle.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {brand?.brand_name} {vehicle.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                    {vehicle.is_primary && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full mt-1 inline-block">
                        {t('isPrimary')}
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
                  {vehicle.color && (
                    <p><span className="text-muted-foreground">{t('carColor')}:</span> {vehicle.color}</p>
                  )}
                  {vehicle.license_plate && (
                    <p><span className="text-muted-foreground">{t('plate')}:</span> {vehicle.license_plate}</p>
                  )}
                  {vehicle.vin && (
                    <p><span className="text-muted-foreground">{t('vin')}:</span> {vehicle.vin}</p>
                  )}
                  <p><span className="text-muted-foreground">{t('vehicleMileage')}:</span> {vehicle.mileage} км</p>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('edit')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Brand */}
            <div>
              <Label>{t('brand')}</Label>
              <Popover open={openEditBrand} onOpenChange={setOpenEditBrand}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openEditBrand}
                    className="w-full justify-between"
                  >
                    {formData.brand_name || t('selectBrand')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Поиск марки..." />
                    <CommandList>
                      <CommandEmpty>Марка не найдена.</CommandEmpty>
                      <CommandGroup>
                        {carBrands.map((brand) => (
                          <CommandItem
                            key={brand.name}
                            value={brand.name}
                            onSelect={(value) => {
                              handleBrandChange(value, true);
                              setOpenEditBrand(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.brand_name === brand.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {brand.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Model */}
            <div>
              <Label>{t('model')}</Label>
              <Popover open={openEditModel} onOpenChange={setOpenEditModel}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openEditModel}
                    disabled={!formData.brand_name}
                    className="w-full justify-between"
                  >
                    {formData.model || "Выберите модель..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Поиск модели..." />
                    <CommandList>
                      <CommandEmpty>Модель не найдена.</CommandEmpty>
                      <CommandGroup>
                        {availableModelsEdit.map((model) => (
                          <CommandItem
                            key={model}
                            value={model}
                            onSelect={(value) => {
                              setFormData(prev => ({ ...prev, model: value }));
                              setOpenEditModel(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.model === model ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {model}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Year */}
            <div>
              <Label>{t('year')}</Label>
              <Popover open={openEditYear} onOpenChange={setOpenEditYear}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openEditYear}
                    className="w-full justify-between"
                  >
                    {formData.year || "Выберите год..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Поиск года..." />
                    <CommandList>
                      <CommandEmpty>Год не найден.</CommandEmpty>
                      <CommandGroup>
                        {years.map((year) => (
                          <CommandItem
                            key={year}
                            value={year.toString()}
                            onSelect={(value) => {
                              setFormData(prev => ({ ...prev, year: parseInt(value) }));
                              setOpenEditYear(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.year === year ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {year}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Color */}
            <div>
              <Label>{t('carColor')}</Label>
              <Popover open={openEditColor} onOpenChange={setOpenEditColor}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openEditColor}
                    className="w-full justify-between"
                  >
                    {formData.color || "Выберите цвет..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Поиск цвета..." />
                    <CommandList>
                      <CommandEmpty>Цвет не найден.</CommandEmpty>
                      <CommandGroup>
                        {carColors.map((color) => (
                          <CommandItem
                            key={color}
                            value={color}
                            onSelect={(value) => {
                              setFormData(prev => ({ ...prev, color: value }));
                              setOpenEditColor(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.color === color ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {color}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.color === "Другой цвет (указать вручную)" && (
                <Input
                  value={formData.customColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, customColor: e.target.value }))}
                  placeholder="Введите цвет"
                  className="mt-2"
                />
              )}
            </div>

            {/* VIN */}
            <div>
              <Label>{t('vin')} (необязательно)</Label>
              <Input
                value={formData.vin}
                onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                placeholder="WBAXXXXX12345678"
                maxLength={17}
              />
            </div>

            {/* License Plate */}
            <div>
              <Label>{t('plate')}</Label>
              <Input
                value={formData.license_plate}
                onChange={(e) => setFormData(prev => ({ ...prev, license_plate: formatLicensePlate(e.target.value) }))}
                placeholder="123ABC01"
                maxLength={8}
              />
            </div>

            {/* Mileage */}
            <div>
              <Label>{t('vehicleMileage')}</Label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            {/* Is Primary */}
            <div className="flex items-center justify-between">
              <Label>{t('isPrimary')}</Label>
              <Switch
                checked={formData.is_primary}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="flex-1">{t('save')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteVehicleId} onOpenChange={() => setDeleteVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
            </AlertDialogDescription>
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
