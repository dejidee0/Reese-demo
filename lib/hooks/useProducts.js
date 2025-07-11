import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getProduct = async (slug) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching product:', err)
      return null
    }
  }

  const getFeaturedProducts = () => {
    return products.filter(product => product.is_featured)
  }

  const getProductsByCategory = (categoryId) => {
    return products.filter(product => product.category_id === categoryId)
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getProduct,
    getFeaturedProducts,
    getProductsByCategory
  }
}