"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Countdown } from "@/components/ui/countdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDrops } from "@/lib/hooks/useDrops";
import Image from "next/image";

export function DropsListing() {
  const { drops, loading } = useDrops();
  const [upcomingDrops, setUpcomingDrops] = useState([]);
  const [pastDrops, setPastDrops] = useState([]);

  useEffect(() => {
    if (drops.length > 0) {
      const now = new Date();
      const upcoming = drops.filter((drop) => new Date(drop.drop_date) > now);
      const past = drops.filter((drop) => new Date(drop.drop_date) <= now);

      setUpcomingDrops(upcoming);
      setPastDrops(past);
    }
  }, [drops]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg h-96 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Exclusive Drops</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Limited releases, premium quality. Don't miss out on these exclusive
            pieces.
          </p>
        </motion.div>

        {/* Upcoming Drops */}
        {upcomingDrops.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Upcoming Drops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingDrops.map((drop, index) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={
                        drop.image_url ||
                        "https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg"
                      }
                      alt={drop.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-orange-500">
                        UPCOMING
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{drop.name}</h3>
                    <p className="text-gray-600 mb-4">{drop.description}</p>

                    <div className="mb-4">
                      <Countdown targetDate={drop.drop_date} />
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">Starting at</span>
                      <span className="text-xl font-bold">
                        ₦{drop.starting_price?.toLocaleString()}
                      </span>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500">
                      Set Reminder
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Past Drops */}
        {pastDrops.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Past Drops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastDrops.map((drop, index) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden opacity-75"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={
                        drop.image_url ||
                        "https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg"
                      }
                      alt={drop.name}
                      fill
                      className="object-cover grayscale"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">SOLD OUT</Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{drop.name}</h3>
                    <p className="text-gray-600 mb-4">{drop.description}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Dropped on{" "}
                        {new Date(drop.drop_date).toLocaleDateString()}
                      </span>
                      <span className="text-lg font-bold line-through text-gray-400">
                        ₦{drop.starting_price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
