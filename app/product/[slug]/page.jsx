import { ProductDetails } from "@/components/product/product-details";
import { RelatedProducts } from "@/components/product/related-products";

export const metadata = {
  title: "Product Details - ReeseBlanks",
  description: "Premium streetwear product details",
};

export default function ProductPage({ params }) {
  return (
    <div className="min-h-screen bg-white">
      <ProductDetails slug={params.slug} />
      <RelatedProducts />
    </div>
  );
}
