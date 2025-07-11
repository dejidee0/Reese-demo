import { create } from 'zustand'

export const useDropStore = create((set, get) => ({
  drops: [],
  liveDrops: [],
  
  setDrops: (drops) => set({ drops }),
  setLiveDrops: (liveDrops) => set({ liveDrops }),
  
  addDrop: (drop) => {
    const drops = get().drops
    set({ drops: [...drops, drop] })
  },
  
  updateDrop: (id, updates) => {
    set({
      drops: get().drops.map(drop =>
        drop.id === id ? { ...drop, ...updates } : drop
      )
    })
  },
  
  getActiveDrop: () => {
    const now = new Date()
    return get().drops.find(drop => {
      const dropDate = new Date(drop.drop_date)
      return dropDate > now
    })
  }
}))