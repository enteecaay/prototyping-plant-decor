import { create } from 'zustand';
import { Plant, PlantCategory } from '@/types';
import { MOCK_PLANTS, PLANT_CATEGORIES } from '@/mock-data';

interface CatalogStore {
  plants: Plant[];
  categories: PlantCategory[];
  filteredPlants: Plant[];
  selectedCategory: string | null;
  searchQuery: string;
  setPlants: (plants: Plant[]) => void;
  setCategories: (categories: PlantCategory[]) => void;
  filterByCategory: (categoryId: string | null) => void;
  searchPlants: (query: string) => void;
  getPlantById: (id: string) => Plant | undefined;
  getAllPlants: () => Plant[];
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  plants: MOCK_PLANTS,
  categories: PLANT_CATEGORIES,
  filteredPlants: MOCK_PLANTS,
  selectedCategory: null,
  searchQuery: '',

  setPlants: (plants) => {
    set({ plants, filteredPlants: plants });
  },

  setCategories: (categories) => {
    set({ categories });
  },

  filterByCategory: (categoryId) => {
    const { plants, searchQuery } = get();
    let filtered = plants;

    if (categoryId) {
      filtered = filtered.filter((plant) => plant.category.id === categoryId);
    }

    // Apply search filter as well
    if (searchQuery) {
      filtered = filtered.filter(
        (plant) =>
          plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    set({ selectedCategory: categoryId, filteredPlants: filtered });
  },

  searchPlants: (query) => {
    const { plants, selectedCategory } = get();
    let filtered = plants;

    if (query) {
      filtered = filtered.filter(
        (plant) =>
          plant.name.toLowerCase().includes(query.toLowerCase()) ||
          plant.scientificName.toLowerCase().includes(query.toLowerCase()) ||
          plant.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((plant) => plant.category.id === selectedCategory);
    }

    set({ searchQuery: query, filteredPlants: filtered });
  },

  getPlantById: (id) => {
    return get().plants.find((plant) => plant.id === id);
  },

  getAllPlants: () => {
    return get().plants;
  },
}));
