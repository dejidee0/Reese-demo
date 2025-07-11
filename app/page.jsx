import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { DropsSection } from '@/components/sections/drops-section'
import { CommunitySection } from '@/components/sections/community-section'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <HeroSection />
      <FeaturedProducts />
      <DropsSection />
      <CommunitySection />
    </div>
  )
}