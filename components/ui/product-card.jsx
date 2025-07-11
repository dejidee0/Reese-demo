"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cartStore";
import Link from "next/link";
import Image from "next/image";

export function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const images = product.images || [product.image_url];
  const primaryImage = images[0] || product.image_url;
  const hoverImage = images[1] || primaryImage;

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />
          {hoverImage !== primaryImage && (
            <Image
              src={hoverImage}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Overlay Actions */}
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white p-2"
                onClick={handleLike}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white p-2"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_featured && (
              <span className="bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                FEATURED
              </span>
            )}
            {product.is_new && (
              <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </span>
            )}
            {product.discount_percentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{product.discount_percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.original_price &&
                product.original_price > product.price && (
                  <span className="text-gray-400 line-through text-sm">
                    ₦{product.original_price.toLocaleString()}
                  </span>
                )}
              <span className="text-lg font-bold">
                ₦{product.price.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">
                {product.rating || 4.5}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
