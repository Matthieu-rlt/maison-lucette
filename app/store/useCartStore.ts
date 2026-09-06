import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  isOpen: boolean;
  isSearchOpen: boolean;
  toastMessage: string | null;
  total: number;
  items: any[];
  wishlist: any[];
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  showToast: (message: string) => void;
  addItem: (item: any) => void;
  removeItem: (index: number) => void;
  addToWishlist: (item: any) => void;
  removeFromWishlist: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isSearchOpen: false,
      toastMessage: null,
      total: 0,
      items: [],
      wishlist: [],
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),
      
      showToast: (message) => {
        set({ toastMessage: message });
        setTimeout(() => {
          set({ toastMessage: null });
        }, 3000);
      },
      
      addItem: (item) => {
        set((state) => ({
          items: [...state.items, item],
          total: state.total + Number(item.price),
          isOpen: true 
        }));
        get().showToast(`Ajouté au panier : ${item.title}`);
      },

      removeItem: (index) => set((state) => {
        const itemToRemove = state.items[index];
        const newItems = state.items.filter((_, i) => i !== index);
        return {
          items: newItems,
          total: Math.max(0, state.total - Number(itemToRemove.price))
        };
      }),

      addToWishlist: (item) => {
        set((state) => {
          if (state.wishlist.some((i) => i.slug === item.slug)) return state;
          return { wishlist: [...state.wishlist, item] };
        });
        get().showToast(`Ajouté aux favoris : ${item.title}`);
      },

      removeFromWishlist: (slug) => {
        set((state) => ({
          wishlist: state.wishlist.filter((i) => i.slug !== slug)
        }));
        get().showToast(`Retiré des favoris`);
      },

      isInWishlist: (slug) => get().wishlist.some((i) => i.slug === slug),
    }),
    {
      name: 'maison-lucette-cart-storage',
    }
  )
);