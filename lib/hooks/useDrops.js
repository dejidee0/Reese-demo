import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useDropStore } from '@/lib/stores/dropStore'

export function useDrops() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { drops, setDrops, setLiveDrops } = useDropStore()

  useEffect(() => {
    fetchDrops()
    setupRealtimeSubscription()
  }, [])

  const fetchDrops = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          products (
            id,
            name,
            slug,
            price,
            image_url,
            images
          )
        `)
        .order('drop_date', { ascending: true })

      if (error) throw error
      setDrops(data || [])
      
      // Filter live drops
      const now = new Date()
      const live = data?.filter(drop => {
        const dropDate = new Date(drop.drop_date)
        return dropDate > now
      }) || []
      
      setLiveDrops(live)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('drops')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drops'
        },
        () => {
          fetchDrops()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getTimeUntilDrop = (dropDate) => {
    const now = new Date()
    const drop = new Date(dropDate)
    const diff = drop - now

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  return {
    drops,
    loading,
    error,
    refetch: fetchDrops,
    getTimeUntilDrop
  }
}