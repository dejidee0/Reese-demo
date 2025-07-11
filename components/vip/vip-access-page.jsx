"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Star, Zap, Gift, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/lib/stores/userStore";
import { useProducts } from "@/lib/hooks/useProducts";
import { ProductCard } from "@/components/ui/product-card";
import Link from "next/link";

export function VipAccessPage() {
  const { user, tier, points } = useUserStore();
  const { products } = useProducts();
  const [vipProducts, setVipProducts] = useState([]);
  const [exclusiveDeals, setExclusiveDeals] = useState([]);

  useEffect(() => {
    // Filter VIP-only products (featured products for demo)
    const vipOnly = products.filter((p) => p.is_featured).slice(0, 6);
    setVipProducts(vipOnly);

    // Mock exclusive deals
    setExclusiveDeals([
      {
        id: 1,
        title: "30% off all hoodies",
        code: "VIP30",
        expires: "2024-02-15",
      },
      {
        id: 2,
        title: "Free shipping on orders over ₦25,000",
        code: "VIPSHIP",
        expires: "2024-02-20",
      },
      {
        id: 3,
        title: "Early access to Neon Nights drop",
        code: "VIPEARLY",
        expires: "2024-02-10",
      },
    ]);
  }, [products]);

  const isVip = tier === "vip";
  const pointsNeeded = 5000 - points;

  const vipBenefits = [
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Early Drop Access",
      description: "Get first dibs on limited releases",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Exclusive Products",
      description: "VIP-only items and colorways",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Priority Support",
      description: "24/7 dedicated customer service",
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Special Discounts",
      description: "Exclusive deals and coupon codes",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              VIP Access
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Exclusive benefits, early access, and premium experiences for our
            most valued members.
          </p>
        </motion.div>

        {/* VIP Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isVip
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                    : "bg-gray-300"
                }`}
              >
                {isVip ? (
                  <Crown className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isVip ? "VIP Member" : "VIP Access Locked"}
                </h2>
                <p className="text-gray-600">
                  {isVip
                    ? "Welcome to the exclusive VIP experience"
                    : `${pointsNeeded} more points needed to unlock VIP`}
                </p>
              </div>
            </div>
            {!isVip && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {points.toLocaleString()} / 5,000
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-orange-500 h-2 rounded-full"
                    style={{ width: `${(points / 5000) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vipBenefits.map((benefit, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-lg ${
                  isVip
                    ? "bg-gradient-to-br from-purple-50 to-orange-50"
                    : "bg-gray-50 opacity-50"
                }`}
              >
                <div
                  className={`mb-3 flex justify-center ${
                    isVip ? "text-purple-600" : "text-gray-400"
                  }`}
                >
                  {benefit.icon}
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {isVip ? (
          <>
            {/* Exclusive Deals */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">Exclusive Deals</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exclusiveDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="border-l-4 border-l-purple-500"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{deal.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 rounded p-2 mb-2">
                        <code className="text-sm font-mono">{deal.code}</code>
                      </div>
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(deal.expires).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* VIP Products */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Unlock className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold">VIP Exclusive Products</h2>
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-orange-500">
                  VIP Only
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vipProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Lock className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Unlock VIP Access</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Earn points by shopping, voting in battles, and engaging with the
              community to unlock exclusive VIP benefits.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/arena">
                <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                  Earn Points in Arena
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Shop Products</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
