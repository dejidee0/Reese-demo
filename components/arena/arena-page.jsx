"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";
import Image from "next/image";

export function ArenaPage() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const { user, addPoints } = useUserStore();

  useEffect(() => {
    fetchBattles();
    if (user) {
      fetchUserVotes();
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
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
      toast.success("Vote recorded! +10 points");
    } catch (error) {
      toast.error("Error recording vote");
    }
  };

  const getVotePercentage = (votesA, votesB, choice) => {
    const total = votesA + votesB;
    if (total === 0) return 0;
    return choice === "a" ? (votesA / total) * 100 : (votesB / total) * 100;
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
            looks and earn points.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold">24</h3>
            <p className="text-gray-600">Active Battles</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-2xl font-bold">1,247</h3>
            <p className="text-gray-600">Total Voters</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-2xl font-bold">2.5K</h3>
            <p className="text-gray-600">Votes Cast</p>
          </div>
        </div>

        {/* Battles */}
        <div className="space-y-8">
          {battles.map((battle, index) => (
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
                    <h2 className="text-2xl font-bold mb-2">{battle.title}</h2>
                    <p className="text-gray-600">{battle.description}</p>
                  </div>
                  {battle.ends_at && (
                    <Badge>
                      Ends {new Date(battle.ends_at).toLocaleDateString()}
                    </Badge>
                  )}
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
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {battle.outfit_a_description}
                    </p>
                    <Button
                      onClick={() => handleVote(battle.id, "a")}
                      disabled={userVotes[battle.id]}
                      className={`w-full ${
                        userVotes[battle.id] === "a"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gradient-to-r from-purple-600 to-orange-500"
                      }`}
                    >
                      {userVotes[battle.id] === "a" ? "✓ Voted" : "Vote A"}
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
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {battle.outfit_b_description}
                    </p>
                    <Button
                      onClick={() => handleVote(battle.id, "b")}
                      disabled={userVotes[battle.id]}
                      className={`w-full ${
                        userVotes[battle.id] === "b"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gradient-to-r from-purple-600 to-orange-500"
                      }`}
                    >
                      {userVotes[battle.id] === "b" ? "✓ Voted" : "Vote B"}
                    </Button>
                  </div>
                </div>

                {/* Vote Results */}
                {userVotes[battle.id] && (
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
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-orange-500 h-2 rounded-full transition-all duration-300"
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
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getVotePercentage(
                            battle.votes_a,
                            battle.votes_b,
                            "b"
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
