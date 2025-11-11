import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: ServiceFilters) => void;
  placeholder?: string;
}

export interface ServiceFilters {
  category?: string;
  priceRange: [number, number];
  rating?: number;
  sortBy: 'price_asc' | 'price_desc' | 'rating' | 'name';
}

const ServiceSearch = ({ onSearch, onFilterChange, placeholder }: ServiceSearchProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ServiceFilters>({
    priceRange: [0, 100000],
    sortBy: 'name'
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterUpdate = (key: keyof ServiceFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder || t('search')}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Фильтры</SheetTitle>
            <SheetDescription>
              Настройте параметры поиска
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterUpdate('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="maintenance">Техобслуживание</SelectItem>
                  <SelectItem value="repair">Ремонт</SelectItem>
                  <SelectItem value="detailing">Детейлинг</SelectItem>
                  <SelectItem value="wash">Мойка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Диапазон цен: {filters.priceRange[0]}₸ - {filters.priceRange[1]}₸</Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => handleFilterUpdate('priceRange', value)}
                max={100000}
                step={1000}
                className="w-full"
              />
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <Label>Минимальный рейтинг</Label>
              <Select
                value={filters.rating?.toString()}
                onValueChange={(value) => handleFilterUpdate('rating', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Любой рейтинг" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Любой рейтинг</SelectItem>
                  <SelectItem value="3">3+ звезды</SelectItem>
                  <SelectItem value="4">4+ звезды</SelectItem>
                  <SelectItem value="4.5">4.5+ звезды</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Сортировка</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterUpdate('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
                  <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ServiceSearch;
