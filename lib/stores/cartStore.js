import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product, size = 'M', quantity = 1) => {
        const items = get().items
        const existingItem = items.find(
          item => item.id === product.id && item.size === size
        )
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id && item.size === size
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, size, quantity }]
          })
        }
      },
      
      removeItem: (id, size) => {
        set({
          items: get().items.filter(item => !(item.id === id && item.size === size))
        })
      },
      
      updateQuantity: (id, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, size)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === id && item.size === size
              ? { ...item, quantity }
              : item
          )
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      }
    }),
    {
      name: 'cart-store'
    }
  )
)