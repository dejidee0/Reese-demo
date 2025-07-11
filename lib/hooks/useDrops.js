import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useDrops() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drops, setDrops] = useState([]);
  const [liveDrops, setLiveDrops] = useState([]);

  useEffect(() => {
    fetchDrops();
  }, []);

  const fetchDrops = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("drops")
        .select(
          `
          *,
          drop_products (
            id,
            drop_price,
            quantity,
            products (
              id,
              name,
              slug,
              price,
              image_url,
              images
            )
          )
        `
        )
        .eq("is_active", true)
        .order("drop_date", { ascending: true });

      if (error) throw error;
      setDrops(data || []);

      // Filter live drops
      const now = new Date();
      const live =
        data?.filter((drop) => {
          const dropDate = new Date(drop.drop_date);
          return dropDate > now;
        }) || [];

      setLiveDrops(live);
    } catch (err) {
      console.error("Error fetching drops:", err.message);
      setError(err.message);
      setDrops([]);
      setLiveDrops([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilDrop = (dropDate) => {
    const now = new Date();
    const drop = new Date(dropDate);
    const diff = drop - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  return {
    drops,
    liveDrops,
    loading,
    error,
    refetch: fetchDrops,
    getTimeUntilDrop,
  };
}
