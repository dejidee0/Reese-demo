"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ui/product-card";
import { useProducts } from "@/lib/hooks/useProducts";

export function RelatedProducts() {
  const { products } = useProducts();
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      // Get random products for related items
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setRelatedProducts(shuffled.slice(0, 4));
    }
  }, [products]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">You Might Also Like</h2>
          <p className="text-gray-600">
            Discover more premium pieces from our collection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
