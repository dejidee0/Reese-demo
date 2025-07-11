"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Clock,
  Plus,
  Eye,
  Vote,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";
import Image from "next/image";

export function ArenaPage() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [votingLoading, setVotingLoading] = useState({});
  const [stats, setStats] = useState({
    totalBattles: 0,
    totalVotes: 0,
    userVotes: 0,
    userPoints: 0,
  });
  const [newBattle, setNewBattle] = useState({
    title: "",
    description: "",
    image_a_url: "",
    image_b_url: "",
    outfit_a_description: "",
    outfit_b_description: "",
    ends_at: "",
  });
  const { user, addPoints, isAdmin, points } = useUserStore();

  useEffect(() => {
    fetchBattles();
    if (user) {
      fetchUserVotes();
      fetchUserStats();
    }
  }, [user]);

  const fetchBattles = async () => {
    try {
      const { data, error } = await supabase
        .from("battles")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBattles(data || []);

      // Calculate total stats
      const totalVotes =
        data?.reduce(
          (sum, battle) => sum + battle.votes_a + battle.votes_b,
          0
        ) || 0;
      setStats((prev) => ({
        ...prev,
        totalBattles: data?.length || 0,
        totalVotes,
      }));
    } catch (error) {
      console.error("Error fetching battles:", error);
      toast.error("Error fetching battles");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from("battle_votes")
        .select("battle_id, choice")
        .eq("user_id", user.id);

      if (error) throw error;

      const votes = {};
      data.forEach((vote) => {
        votes[vote.battle_id] = vote.choice;
      });
      setUserVotes(votes);
      setStats((prev) => ({ ...prev, userVotes: data.length }));
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  };

  const fetchUserStats = async () => {
    setStats((prev) => ({ ...prev, userPoints: points }));
  };

  const handleCreateBattle = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Only admins can create battles");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("battles")
        .insert({
          ...newBattle,
          votes_a: 0,
          votes_b: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setBattles((prev) => [data, ...prev]);
      setNewBattle({
        title: "",
        description: "",
        image_a_url: "",
        image_b_url: "",
        outfit_a_description: "",
        outfit_b_description: "",
        ends_at: "",
      });
      setIsCreateDialogOpen(false);
      toast.success("Battle created successfully!");
      fetchBattles(); // Refresh to update stats
    } catch (error) {
      console.error("Error creating battle:", error);
      toast.error("Error creating battle");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBattle((prev) => ({ ...prev, [name]: value }));
  };

  const handleVote = async (battleId, choice) => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    if (userVotes[battleId]) {
      toast.error("You have already voted on this battle");
      return;
    }

    setVotingLoading((prev) => ({ ...prev, [battleId]: true }));

    try {
      // Insert vote
      const { error: voteError } = await supabase.from("battle_votes").insert({
        battle_id: battleId,
        user_id: user.id,
        choice,
      });

      if (voteError) throw voteError;

      // Update battle vote count
      const battle = battles.find((b) => b.id === battleId);
      const updateField = choice === "a" ? "votes_a" : "votes_b";
      const newCount = battle[updateField] + 1;

      const { error: updateError } = await supabase
        .from("battles")
        .update({ [updateField]: newCount })
        .eq("id", battleId);

      if (updateError) throw updateError;

      // Update local state
      setBattles(
        battles.map((b) =>
          b.id === battleId ? { ...b, [updateField]: newCount } : b
        )
      );

      setUserVotes({ ...userVotes, [battleId]: choice });

      // Award points
      addPoints(10);
      setStats((prev) => ({
        ...prev,
        userVotes: prev.userVotes + 1,
        userPoints: prev.userPoints + 10,
      }));

      toast.success("Vote recorded! +10 points earned");
    } catch (error) {
      console.error("Error recording vote:", error);
      toast.error("Error recording vote");
    } finally {
      setVotingLoading((prev) => ({ ...prev, [battleId]: false }));
    }
  };

  const getVotePercentage = (votesA, votesB, choice) => {
    const total = votesA + votesB;
    if (total === 0) return 0;
    return choice === "a" ? (votesA / total) * 100 : (votesB / total) * 100;
  };

  const isBattleExpired = (endsAt) => {
    if (!endsAt) return false;
    return new Date(endsAt) < new Date();
  };

  const getTimeRemaining = (endsAt) => {
    if (!endsAt) return null;
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-4xl font-bold mb-4">Style Arena</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Battle it out in real-time styling competitions. Vote on the best
            looks and earn points to level up your status.
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Active Battles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.totalBattles}
              </div>
              <p className="text-sm text-gray-600">Live competitions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Total Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalVotes.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Community engagement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Vote className="w-5 h-5 text-green-500" />
                Your Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.userVotes}
              </div>
              <p className="text-sm text-gray-600">Battles participated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Points Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.userPoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">From arena voting</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-8 text-center">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Battle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Style Battle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateBattle} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Battle Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={newBattle.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Street vs Formal"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ends_at">End Date</Label>
                      <Input
                        id="ends_at"
                        name="ends_at"
                        type="datetime-local"
                        value={newBattle.ends_at}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newBattle.description}
                      onChange={handleInputChange}
                      placeholder="Describe the battle..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="image_a_url">Option A Image URL</Label>
                      <Input
                        id="image_a_url"
                        name="image_a_url"
                        value={newBattle.image_a_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image-a.jpg"
                        required
                      />
                      <Label htmlFor="outfit_a_description" className="mt-2">
                        Option A Description
                      </Label>
                      <Textarea
                        id="outfit_a_description"
                        name="outfit_a_description"
                        value={newBattle.outfit_a_description}
                        onChange={handleInputChange}
                        placeholder="Describe outfit A..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_b_url">Option B Image URL</Label>
                      <Input
                        id="image_b_url"
                        name="image_b_url"
                        value={newBattle.image_b_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image-b.jpg"
                        required
                      />
                      <Label htmlFor="outfit_b_description" className="mt-2">
                        Option B Description
                      </Label>
                      <Textarea
                        id="outfit_b_description"
                        name="outfit_b_description"
                        value={newBattle.outfit_b_description}
                        onChange={handleInputChange}
                        placeholder="Describe outfit B..."
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Create Battle
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
        )}

        {/* Battles */}
        <div className="space-y-8">
          {battles.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No active battles</h3>
              <p className="text-gray-600">
                Check back soon for new style competitions!
              </p>
            </div>
          ) : (
            battles.map((battle, index) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {battle.title}
                      </h2>
                      <p className="text-gray-600">{battle.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {battle.ends_at && (
                        <Badge
                          variant={
                            isBattleExpired(battle.ends_at)
                              ? "destructive"
                              : "default"
                          }
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeRemaining(battle.ends_at)}
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{battle.votes_a + battle.votes_b} votes</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option A */}
                    <div className="text-center">
                      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={battle.image_a_url}
                          alt="Option A"
                          fill
                          className="object-cover"
                        />
                        {userVotes[battle.id] === "a" && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
                              Your Vote
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {battle.outfit_a_description}
                      </p>
                      <Button
                        onClick={() => handleVote(battle.id, "a")}
                        disabled={
                          userVotes[battle.id] ||
                          votingLoading[battle.id] ||
                          isBattleExpired(battle.ends_at)
                        }
                        className={`w-full ${
                          userVotes[battle.id] === "a"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gradient-to-r from-purple-600 to-orange-500"
                        }`}
                      >
                        {votingLoading[battle.id]
                          ? "Voting..."
                          : userVotes[battle.id] === "a"
                          ? "✓ Voted"
                          : userVotes[battle.id]
                          ? "Already Voted"
                          : isBattleExpired(battle.ends_at)
                          ? "Battle Ended"
                          : "Vote A"}
                      </Button>
                    </div>

                    {/* Option B */}
                    <div className="text-center">
                      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={battle.image_b_url}
                          alt="Option B"
                          fill
                          className="object-cover"
                        />
                        {userVotes[battle.id] === "b" && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
                              Your Vote
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {battle.outfit_b_description}
                      </p>
                      <Button
                        onClick={() => handleVote(battle.id, "b")}
                        disabled={
                          userVotes[battle.id] ||
                          votingLoading[battle.id] ||
                          isBattleExpired(battle.ends_at)
                        }
                        className={`w-full ${
                          userVotes[battle.id] === "b"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gradient-to-r from-purple-600 to-orange-500"
                        }`}
                      >
                        {votingLoading[battle.id]
                          ? "Voting..."
                          : userVotes[battle.id] === "b"
                          ? "✓ Voted"
                          : userVotes[battle.id]
                          ? "Already Voted"
                          : isBattleExpired(battle.ends_at)
                          ? "Battle Ended"
                          : "Vote B"}
                      </Button>
                    </div>
                  </div>

                  {/* Vote Results */}
                  {(userVotes[battle.id] ||
                    isBattleExpired(battle.ends_at)) && (
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Option A</span>
                        <span className="text-sm text-gray-600">
                          {battle.votes_a} votes (
                          {getVotePercentage(
                            battle.votes_a,
                            battle.votes_b,
                            "a"
                          ).toFixed(1)}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${getVotePercentage(
                              battle.votes_a,
                              battle.votes_b,
                              "a"
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Option B</span>
                        <span className="text-sm text-gray-600">
                          {battle.votes_b} votes (
                          {getVotePercentage(
                            battle.votes_a,
                            battle.votes_b,
                            "b"
                          ).toFixed(1)}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${getVotePercentage(
                              battle.votes_a,
                              battle.votes_b,
                              "b"
                            )}%`,
                          }}
                        />
                      </div>

                      {/* Winner announcement */}
                      {isBattleExpired(battle.ends_at) && (
                        <div className="text-center mt-4">
                          <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-4">
                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                            <p className="font-semibold">
                              {battle.votes_a > battle.votes_b
                                ? "Option A Wins!"
                                : battle.votes_b > battle.votes_a
                                ? "Option B Wins!"
                                : "It's a Tie!"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
