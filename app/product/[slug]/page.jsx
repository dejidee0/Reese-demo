import { ProductDetails } from '@/components/product/product-details'
import { RelatedProducts } from '@/components/product/related-products'

async function getProduct(slug) {
  // This would normally be a server component fetching data
  // For now, we'll handle it in the client component
  return null
}

export default async function ProductPage({ params }) {
  return (
    <div className="min-h-screen bg-white">
      <ProductDetails slug={params.slug} />
      <RelatedProducts />
    </div>
  )
}