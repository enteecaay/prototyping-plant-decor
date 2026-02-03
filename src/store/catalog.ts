import { create } from 'zustand';
import { Plant, PlantCategory, PlantVariant, CareInstruction } from '@/types';
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
  addPlant: (plant: Plant) => void;
  updatePlant: (id: string, plant: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  addPlantVariant: (plantId: string, variant: PlantVariant) => void;
  updatePlantVariant: (plantId: string, variantId: string, variant: Partial<PlantVariant>) => void;
  deletePlantVariant: (plantId: string, variantId: string) => void;
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

  addPlant: (plant) => {
    const plants = [...get().plants, plant];
    set({ plants, filteredPlants: plants });
  },

  updatePlant: (id, updates) => {
    const plants = get().plants.map((plant) =>
      plant.id === id ? { ...plant, ...updates } : plant
    );
    set({ plants, filteredPlants: plants });
  },

  deletePlant: (id) => {
    const plants = get().plants.filter((plant) => plant.id !== id);
    set({ plants, filteredPlants: plants });
  },

  addPlantVariant: (plantId, variant) => {
    const plants = get().plants.map((plant) => {
      if (plant.id === plantId) {
        return {
          ...plant,
          variants: [...(plant.variants || []), variant],
        };
      }
      return plant;
    });
    set({ plants, filteredPlants: plants });
  },

  updatePlantVariant: (plantId, variantId, updates) => {
    const plants = get().plants.map((plant) => {
      if (plant.id === plantId) {
        return {
          ...plant,
          variants: (plant.variants || []).map((variant) =>
            variant.id === variantId ? { ...variant, ...updates } : variant
          ),
        };
      }
      return plant;
    });
    set({ plants, filteredPlants: plants });
  },

  deletePlantVariant: (plantId, variantId) => {
    const plants = get().plants.map((plant) => {
      if (plant.id === plantId) {
        return {
          ...plant,
          variants: (plant.variants || []).filter((variant) => variant.id !== variantId),
        };
      }
      return plant;
    });
    set({ plants, filteredPlants: plants });
  },
}));
