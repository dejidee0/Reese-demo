"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductManager } from "@/components/admin/product-manager";
import { OrderManager } from "@/components/admin/order-manager";
import { DropManager } from "@/components/admin/drop-manager";
import { useUserStore } from "@/lib/stores/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminDashboard() {
  const { isAdmin } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="drops">Drops</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <ProductManager />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrderManager />
            </TabsContent>

            <TabsContent value="drops" className="mt-6">
              <DropManager />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
