"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Heart, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";

export function ClosetPage() {
  const [closets, setClosets] = useState([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      fetchClosets();
    }
  }, [user]);

  const fetchClosets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("closets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClosets(data || []);
    } catch (error) {
      toast.error("Error fetching closets");
    } finally {
      setLoading(false);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai-stylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
          userProfile: { tier: "member" },
        }),
      });

      const data = await response.json();
      setAiResponse(data.advice);
    } catch (error) {
      toast.error("Error getting AI advice");
    } finally {
      setAiLoading(false);
    }
  };

  const sampleOutfits = [
    {
      id: 1,
      name: "Street Chic",
      description: "Oversized hoodie with distressed jeans",
      image_url:
        "https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg",
      likes: 24,
    },
    {
      id: 2,
      name: "Minimal Flex",
      description: "Clean white tee with black joggers",
      image_url:
        "https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg",
      likes: 18,
    },
    {
      id: 3,
      name: "Urban Elite",
      description: "Designer blazer with luxury sneakers",
      image_url:
        "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
      likes: 32,
    },
    {
      id: 4,
      name: "Color Pop",
      description: "Vibrant graphic tee with dark denim",
      image_url:
        "https://images.pexels.com/photos/1637652/pexels-photo-1637652.jpeg",
      likes: 15,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Your Style Closet</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Curate your favorite looks, get AI-powered styling advice, and share
            your style with the community.
          </p>
        </motion.div>

        <Tabs defaultValue="closet" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="closet">My Closet</TabsTrigger>
            <TabsTrigger value="ai-stylist">AI Stylist</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="closet" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Outfits</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                <Plus className="w-4 h-4 mr-2" />
                Add Outfit
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg h-64 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {closets.map((closet) => (
                  <Card key={closet.id} className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-purple-600" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{closet.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {closet.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{closet.likes_count}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {closets.length === 0 && !loading && (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No outfits yet</h3>
                <p className="text-gray-600 mb-4">
                  Start curating your style collection
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                  Create Your First Outfit
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-stylist" className="space-y-8">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold">AI Style Assistant</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ask me anything about style...
                  </label>
                  <Textarea
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="What should I wear for a rooftop party? How do I style oversized hoodies? What colors work well together?"
                    className="min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleAiQuery}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="bg-gradient-to-r from-purple-600 to-orange-500"
                >
                  {aiLoading ? "Thinking..." : "Get Style Advice"}
                </Button>
              </div>

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-gray-50 rounded-lg"
                >
                  <h3 className="font-semibold mb-2">AI Stylist Says:</h3>
                  <p className="text-gray-700">{aiResponse}</p>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Community Favorites</h2>
              <Button variant="outline">Share Your Style</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleOutfits.map((outfit) => (
                <Card key={outfit.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={outfit.image_url}
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{outfit.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {outfit.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{outfit.likes}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
