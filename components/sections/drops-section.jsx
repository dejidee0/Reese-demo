"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Countdown } from "@/components/ui/countdown";
import { Button } from "@/components/ui/button";
import { useDrops } from "@/lib/hooks/useDrops";
import Link from "next/link";
import Image from "next/image";

export function DropsSection() {
  const { drops, loading } = useDrops();
  const [nextDrop, setNextDrop] = useState(null);

  useEffect(() => {
    if (drops.length > 0) {
      const now = new Date();
      const upcomingDrop = drops.find((drop) => new Date(drop.drop_date) > now);
      setNextDrop(upcomingDrop);
    }
  }, [drops]);

  if (loading || !nextDrop) {
    return null;
  }

  return (
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Next Drop</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get ready for the next exclusive release. Limited quantities,
            unlimited style.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Drop Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square rounded-lg overflow-hidden"
          >
            <Image
              src={
                nextDrop.image_url ||
                nextDrop.products?.[0]?.image_url ||
                "https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg"
              }
              alt={nextDrop.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                UPCOMING DROP
              </span>
            </div>
          </motion.div>

          {/* Drop Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-3xl font-bold mb-2">{nextDrop.name}</h3>
              <p className="text-gray-400 text-lg">{nextDrop.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Drop Date</h4>
              <Countdown
                targetDate={nextDrop.drop_date}
                onComplete={() => {
                  // Refresh drops when countdown completes
                  window.location.reload();
                }}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Starting Price</span>
                <span className="text-2xl font-bold">
                  ₦{nextDrop.starting_price?.toLocaleString() || "TBA"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Limited Quantity</span>
                <span className="text-lg font-semibold">
                  {nextDrop.quantity || "Exclusive"}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href={`/drop/${nextDrop.id}`}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-orange-500"
                >
                  Set Reminder
                </Button>
              </Link>
              <Link href="/drop">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  View All Drops
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
