import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      tier: 'guest',
      points: 0,
      isAdmin: false,
      
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setTier: (tier) => set({ tier }),
      setPoints: (points) => set({ points }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      
      addPoints: (amount) => {
        const currentPoints = get().points
        set({ points: currentPoints + amount })
      },
      
      logout: () => set({ 
        user: null, 
        profile: null, 
        tier: 'guest', 
        points: 0,
        isAdmin: false 
      })
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        tier: state.tier,
        points: state.points,
        isAdmin: state.isAdmin
      })
    }
  )
)