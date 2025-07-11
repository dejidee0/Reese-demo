"use client";
import { motion } from "framer-motion";
import { Users, Trophy, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CommunitySection() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Style Arena",
      description:
        "Battle it out in real-time styling competitions. Vote, compete, and earn your place.",
      link: "/arena",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Tier System",
      description:
        "Level up from Guest to VIP. Unlock exclusive drops and early access.",
      link: "/dashboard",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI Stylist",
      description:
        "Get personalized styling advice powered by AI. Perfect your look every time.",
      link: "/closet",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Your Closet",
      description:
        "Curate your favorite looks, share with the community, and get inspired.",
      link: "/closet",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Join the Community</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            More than just fashion. Connect with like-minded style enthusiasts
            and level up your game.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-purple-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link href={feature.link}>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-orange-500"
            >
              Join the Community
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
