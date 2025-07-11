import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name,
            slug
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err.message);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (slug) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name,
            slug
          )
        `
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching product:", err.message);
      return null;
    }
  };

  const getFeaturedProducts = () => {
    return products.filter((product) => product.is_featured);
  };

  const getProductsByCategory = (categorySlug) => {
    return products.filter(
      (product) =>
        product.categories && product.categories.slug === categorySlug
    );
  };

  const searchProducts = (query) => {
    if (!query) return products;

    const lowercaseQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        (product.categories &&
          product.categories.name.toLowerCase().includes(lowercaseQuery))
    );
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getProduct,
    getFeaturedProducts,
    getProductsByCategory,
    searchProducts,
  };
}
