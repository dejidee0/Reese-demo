"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Gift, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/lib/stores/userStore";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function ReferralsPage() {
  const { user } = useUserStore();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
  });

  useEffect(() => {
    if (user) {
      generateReferralCode();
      fetchReferrals();
    }
  }, [user]);

  const generateReferralCode = () => {
    // Generate a simple referral code based on user ID
    const code = `RB${user.id.slice(-8).toUpperCase()}`;
    setReferralCode(code);
  };

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data || []);

      // Calculate stats
      const totalReferrals = data?.length || 0;
      const totalEarned =
        data?.reduce((sum, ref) => sum + (ref.reward_amount || 0), 0) || 0;
      const pendingRewards =
        data?.filter((ref) => ref.status === "pending").length || 0;

      setStats({ totalReferrals, totalEarned, pendingRewards });
    } catch (error) {
      toast.error("Error fetching referrals");
    }
  };

  const copyReferralLink = async () => {
    if (typeof window === "undefined") return;

    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareReferral = async () => {
    if (typeof window === "undefined") return;

    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    const shareData = {
      title: "Join ReeseBlanks",
      text: "Check out this amazing streetwear brand! Use my referral code for exclusive benefits.",
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      copyReferralLink();
    }
  };

  const referralBenefits = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "₦5,000 Bonus",
      description: "For every friend who makes their first purchase",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "10% Commission",
      description: "On all future purchases by your referrals",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Exclusive Access",
      description: "Unlock VIP status faster with successful referrals",
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
          <h1 className="text-4xl font-bold mb-4">Refer & Earn</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share ReeseBlanks with your friends and earn rewards for every
            successful referral.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalReferrals}
              </div>
              <p className="text-sm text-gray-600">Friends referred</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ₦{stats.totalEarned.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">In referral rewards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Pending Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.pendingRewards}
              </div>
              <p className="text-sm text-gray-600">Awaiting first purchase</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/register?ref=${referralCode}`
                    : `https://reeseblank.com/register?ref=${referralCode}`
                }
                readOnly
                className="flex-1"
              />
              <Button onClick={copyReferralLink} variant="outline">
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={shareReferral}
                className="bg-gradient-to-r from-purple-600 to-orange-500"
              >
                Share
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Share this link with friends to earn rewards when they sign up and
              make their first purchase.
            </p>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Referral Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {referralBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-orange-50"
                >
                  <div className="mb-3 flex justify-center text-purple-600">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        Referral #{referral.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ₦{referral.reward_amount.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm ${
                          referral.status === "completed"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {referral.status === "completed" ? "Paid" : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No referrals yet</p>
                <p className="text-sm text-gray-500">
                  Start sharing your referral link to earn rewards!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
