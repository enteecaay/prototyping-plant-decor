import { create } from 'zustand';
import { Plant, PlantVariant, CartItem, ShoppingCart } from '@/types';

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (plant: Plant, quantity: number, variantId?: string) => void;
  removeItem: (plantId: string, variantId?: string) => void;
  updateQuantity: (plantId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,

  addItem: (plant, quantity, variantId) => {
    const { items } = get();
    const existingItem = items.find((item) => 
      item.plantId === plant.id && item.variantId === variantId
    );

    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map((item) =>
        item.plantId === plant.id && item.variantId === variantId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const variant = variantId && plant.variants
        ? plant.variants.find((v) => v.id === variantId)
        : undefined;
      
      newItems = [...items, { 
        plantId: plant.id, 
        variantId,
        quantity, 
        plant,
        variant,
      }];
    }

    set({ items: newItems, total: get().getTotal() });
  },

  removeItem: (plantId, variantId) => {
    const newItems = get().items.filter((item) => 
      !(item.plantId === plantId && item.variantId === variantId)
    );
    set({ items: newItems, total: get().getTotal() });
  },

  updateQuantity: (plantId, quantity, variantId) => {
    if (quantity <= 0) {
      get().removeItem(plantId, variantId);
      return;
    }

    const newItems = get().items.map((item) =>
      item.plantId === plantId && item.variantId === variantId
        ? { ...item, quantity } 
        : item
    );
    set({ items: newItems, total: get().getTotal() });
  },

  clearCart: () => {
    set({ items: [], total: 0 });
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => {
      const basePrice = item.plant?.price || 0;
      const variantPrice = item.variant?.price;
      const price = variantPrice !== undefined ? variantPrice : basePrice;
      return sum + price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
