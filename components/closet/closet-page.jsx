"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Heart,
  Plus,
  Sparkles,
  Camera,
  Share2,
  Trash2,
  Edit,
  Lock,
  Unlock,
  Users,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";
import Image from "next/image";

export function ClosetPage() {
  const [closets, setClosets] = useState([]);
  const [communityClosets, setCommunityClosets] = useState([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [stats, setStats] = useState({
    totalOutfits: 0,
    publicOutfits: 0,
    totalLikes: 0,
    communityOutfits: 0,
  });
  const [newOutfit, setNewOutfit] = useState({
    name: "",
    description: "",
    image_url: "",
    is_public: false,
  });
  const { user, tier } = useUserStore();

  useEffect(() => {
    if (user) {
      fetchClosets();
      fetchCommunityClosets();
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

      // Calculate stats
      const totalOutfits = data?.length || 0;
      const publicOutfits = data?.filter((c) => c.is_public).length || 0;
      const totalLikes =
        data?.reduce((sum, c) => sum + (c.likes_count || 0), 0) || 0;

      setStats((prev) => ({
        ...prev,
        totalOutfits,
        publicOutfits,
        totalLikes,
      }));
    } catch (error) {
      console.error("Error fetching closets:", error);
      toast.error("Error fetching your outfits");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityClosets = async () => {
    try {
      const { data, error } = await supabase
        .from("closets")
        .select(
          `
          *,
          profiles (
            first_name,
            last_name,
            tier
          )
        `
        )
        .eq("is_public", true)
        .neq("user_id", user?.id || "")
        .order("likes_count", { ascending: false })
        .limit(12);

      if (error) throw error;
      setCommunityClosets(data || []);
      setStats((prev) => ({ ...prev, communityOutfits: data?.length || 0 }));
    } catch (error) {
      console.error("Error fetching community closets:", error);
    }
  };

  const handleCreateOutfit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("closets")
        .insert({
          ...newOutfit,
          user_id: user.id,
          likes_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setClosets((prev) => [data, ...prev]);
      setNewOutfit({
        name: "",
        description: "",
        image_url: "",
        is_public: false,
      });
      setIsCreateDialogOpen(false);
      toast.success("Outfit created successfully!");

      // Award points for creating outfit
      if (newOutfit.is_public) {
        toast.success("Bonus: +25 points for sharing with community!");
      }

      fetchClosets(); // Refresh stats
    } catch (error) {
      console.error("Error creating outfit:", error);
      toast.error("Error creating outfit");
    }
  };

  const handleEditOutfit = async (e) => {
    e.preventDefault();
    if (!editingOutfit) return;

    try {
      const { error } = await supabase
        .from("closets")
        .update({
          name: editingOutfit.name,
          description: editingOutfit.description,
          image_url: editingOutfit.image_url,
          is_public: editingOutfit.is_public,
        })
        .eq("id", editingOutfit.id);

      if (error) throw error;

      setClosets((prev) =>
        prev.map((c) => (c.id === editingOutfit.id ? editingOutfit : c))
      );
      setIsEditDialogOpen(false);
      setEditingOutfit(null);
      toast.success("Outfit updated successfully!");
      fetchClosets(); // Refresh stats
    } catch (error) {
      console.error("Error updating outfit:", error);
      toast.error("Error updating outfit");
    }
  };

  const handleDeleteOutfit = async (id) => {
    if (!confirm("Are you sure you want to delete this outfit?")) return;

    try {
      const { error } = await supabase.from("closets").delete().eq("id", id);

      if (error) throw error;
      setClosets((prev) => prev.filter((c) => c.id !== id));
      toast.success("Outfit deleted");
      fetchClosets(); // Refresh stats
    } catch (error) {
      console.error("Error deleting outfit:", error);
      toast.error("Error deleting outfit");
    }
  };

  const handleLikeOutfit = async (outfitId) => {
    if (!user) {
      toast.error("Please login to like outfits");
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("closet_likes")
        .select("id")
        .eq("closet_id", outfitId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("closet_likes")
          .delete()
          .eq("closet_id", outfitId)
          .eq("user_id", user.id);

        // Decrease like count
        const { error } = await supabase
          .from("closets")
          .update({ likes_count: supabase.sql`likes_count - 1` })
          .eq("id", outfitId);

        if (error) throw error;
        toast.success("Outfit unliked");
      } else {
        // Like
        await supabase
          .from("closet_likes")
          .insert({ closet_id: outfitId, user_id: user.id });

        // Increase like count
        const { error } = await supabase
          .from("closets")
          .update({ likes_count: supabase.sql`likes_count + 1` })
          .eq("id", outfitId);

        if (error) throw error;
        toast.success("Outfit liked!");
      }

      fetchCommunityClosets(); // Refresh community closets
    } catch (error) {
      console.error("Error liking outfit:", error);
      toast.error("Error updating like");
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
          userProfile: { tier: tier || "guest" },
        }),
      });

      const data = await response.json();
      setAiResponse(
        data.advice || "Sorry, I couldn't process your request right now."
      );
    } catch (error) {
      console.error("Error getting AI advice:", error);
      setAiResponse(
        "I'm having trouble connecting right now. Try asking about specific pieces or styling tips!"
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewOutfit((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingOutfit((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openEditDialog = (outfit) => {
    setEditingOutfit({ ...outfit });
    setIsEditDialogOpen(true);
  };

  const aiSuggestions = [
    "What should I wear for a rooftop party?",
    "How do I style oversized hoodies?",
    "What colors work well together?",
    "How to dress for a job interview?",
    "What's trending in streetwear?",
    "How to layer clothes for winter?",
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

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Your Outfits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalOutfits}
              </div>
              <p className="text-sm text-gray-600">Total created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Public Outfits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.publicOutfits}
              </div>
              <p className="text-sm text-gray-600">Shared with community</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Total Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.totalLikes}
              </div>
              <p className="text-sm text-gray-600">Community appreciation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                AI Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {aiResponse ? "1+" : "0"}
              </div>
              <p className="text-sm text-gray-600">Style advice received</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="closet" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="closet">My Closet</TabsTrigger>
            <TabsTrigger value="ai-stylist">AI Stylist</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="closet" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Outfits</h2>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Outfit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Outfit</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateOutfit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Outfit Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newOutfit.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Street Chic"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newOutfit.description}
                        onChange={handleInputChange}
                        placeholder="Describe your outfit..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        name="image_url"
                        value={newOutfit.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_public"
                        name="is_public"
                        checked={newOutfit.is_public}
                        onChange={handleInputChange}
                      />
                      <Label htmlFor="is_public">
                        Share with community (+25 bonus points)
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Create Outfit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
                  <Card
                    key={closet.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square relative">
                      {closet.image_url ? (
                        <Image
                          src={closet.image_url}
                          alt={closet.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-purple-600" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {closet.is_public ? (
                          <Badge className="bg-green-500">
                            <Unlock className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Lock className="w-3 h-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{closet.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {closet.description}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm">
                            {closet.likes_count || 0}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(closet)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOutfit(closet.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-orange-500"
                >
                  Create Your First Outfit
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-stylist" className="space-y-8">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="w-8 h-8 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-bold">AI Style Assistant</h2>
                  <p className="text-sm text-gray-600">
                    Get personalized styling advice powered by AI
                  </p>
                </div>
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

                <div className="flex flex-wrap gap-2 mb-4">
                  <p className="text-sm text-gray-600 w-full mb-2">
                    Quick suggestions:
                  </p>
                  {aiSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setAiQuery(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
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
                  className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg border"
                >
                  <div className="flex items-start gap-3">
                    <Bot className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">AI Stylist Says:</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {aiResponse}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Community Favorites</h2>
                <p className="text-gray-600">
                  Discover amazing outfits from the ReeseBlanks community
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Share Your Style
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {communityClosets.map((outfit) => (
                <Card
                  key={outfit.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={outfit.image_url}
                      alt={outfit.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/70 text-white">
                        {outfit.profiles?.tier?.toUpperCase() || "MEMBER"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{outfit.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      by {outfit.profiles?.first_name}{" "}
                      {outfit.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {outfit.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">
                          {outfit.likes_count || 0}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLikeOutfit(outfit.id)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {communityClosets.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No community outfits yet
                </h3>
                <p className="text-gray-600">
                  Be the first to share your style with the community!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Outfit</DialogTitle>
            </DialogHeader>
            {editingOutfit && (
              <form onSubmit={handleEditOutfit} className="space-y-4">
                <div>
                  <Label htmlFor="edit_name">Outfit Name</Label>
                  <Input
                    id="edit_name"
                    name="name"
                    value={editingOutfit.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    name="description"
                    value={editingOutfit.description}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_image_url">Image URL</Label>
                  <Input
                    id="edit_image_url"
                    name="image_url"
                    value={editingOutfit.image_url}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_public"
                    name="is_public"
                    checked={editingOutfit.is_public}
                    onChange={handleEditInputChange}
                  />
                  <Label htmlFor="edit_is_public">Share with community</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Update Outfit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
